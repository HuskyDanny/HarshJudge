import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { handleRecordEvidence } from '../../src/handlers/record-evidence.js';
import { FileSystemService } from '../../src/services/file-system-service.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('handleRecordEvidence', () => {
  let fs: FileSystemService;
  const runId = 'test-run-id';

  beforeEach(() => {
    vol.reset();
    // Create initialized project with scenario and active run
    vol.mkdirSync(`/project/.harshJudge/scenarios/login-test/runs/${runId}/evidence`, {
      recursive: true,
    });
    vol.writeFileSync(
      '/project/.harshJudge/scenarios/login-test/scenario.md',
      '# Test'
    );
    fs = new FileSystemService('/project');
  });

  describe('successful evidence recording', () => {
    it('writes text evidence file', async () => {
      const result = await handleRecordEvidence(
        {
          runId,
          step: 1,
          type: 'console_log',
          name: 'app-logs',
          data: 'Log line 1\nLog line 2',
        },
        fs
      );

      expect(result.success).toBe(true);
      expect(
        vol.existsSync(
          `/project/.harshJudge/scenarios/login-test/runs/${runId}/evidence/step-01-app-logs.txt`
        )
      ).toBe(true);
    });

    it('writes screenshot from file path', async () => {
      // Create a mock screenshot file
      const screenshotPath = '/tmp/playwright-screenshot.png';
      const screenshotData = 'fake png data';
      vol.mkdirSync('/tmp', { recursive: true });
      vol.writeFileSync(screenshotPath, screenshotData);

      const result = await handleRecordEvidence(
        {
          runId,
          step: 2,
          type: 'screenshot',
          name: 'login-page',
          data: screenshotPath,
        },
        fs
      );

      expect(result.success).toBe(true);
      const filePath = `/project/.harshJudge/scenarios/login-test/runs/${runId}/evidence/step-02-login-page.png`;
      expect(vol.existsSync(filePath)).toBe(true);

      // Verify content was copied from the file
      const content = vol.readFileSync(filePath);
      expect(content.toString()).toBe('fake png data');
    });

    it('throws error if screenshot data is not a file path', async () => {
      await expect(
        handleRecordEvidence(
          {
            runId,
            step: 2,
            type: 'screenshot',
            name: 'login-page',
            data: 'not-a-file-path',
          },
          fs
        )
      ).rejects.toThrow('must be an absolute file path');
    });

    it('writes metadata file', async () => {
      await handleRecordEvidence(
        {
          runId,
          step: 1,
          type: 'console_log',
          name: 'test',
          data: 'log data',
          metadata: { url: 'http://localhost:3000' },
        },
        fs
      );

      const metaPath = `/project/.harshJudge/scenarios/login-test/runs/${runId}/evidence/step-01-test.meta.json`;
      expect(vol.existsSync(metaPath)).toBe(true);

      const meta = JSON.parse(vol.readFileSync(metaPath, 'utf-8') as string);
      expect(meta.runId).toBe(runId);
      expect(meta.step).toBe(1);
      expect(meta.type).toBe('console_log');
      expect(meta.name).toBe('test');
      expect(meta.metadata.url).toBe('http://localhost:3000');
      expect(meta.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('returns correct file paths', async () => {
      const result = await handleRecordEvidence(
        {
          runId,
          step: 3,
          type: 'html_snapshot',
          name: 'page',
          data: '<html></html>',
        },
        fs
      );

      expect(result.filePath).toContain('step-03-page.html');
      expect(result.metaPath).toContain('step-03-page.meta.json');
    });

    it('returns correct file size for text', async () => {
      const data = 'Hello World!';
      const result = await handleRecordEvidence(
        {
          runId,
          step: 1,
          type: 'console_log',
          name: 'test',
          data,
        },
        fs
      );

      expect(result.fileSize).toBe(Buffer.byteLength(data, 'utf-8'));
    });

    it('returns correct file size for screenshot from file', async () => {
      const originalData = 'binary content here';
      const screenshotPath = '/tmp/test-screenshot.png';
      vol.mkdirSync('/tmp', { recursive: true });
      vol.writeFileSync(screenshotPath, originalData);

      const result = await handleRecordEvidence(
        {
          runId,
          step: 1,
          type: 'screenshot',
          name: 'test',
          data: screenshotPath,
        },
        fs
      );

      expect(result.fileSize).toBe(originalData.length);
    });

    it('pads step number correctly', async () => {
      await handleRecordEvidence(
        {
          runId,
          step: 5,
          type: 'console_log',
          name: 'test',
          data: 'data',
        },
        fs
      );

      expect(
        vol.existsSync(
          `/project/.harshJudge/scenarios/login-test/runs/${runId}/evidence/step-05-test.txt`
        )
      ).toBe(true);
    });

    it('handles all evidence types', async () => {
      // Create a mock screenshot file for the screenshot type
      const screenshotPath = '/tmp/all-types-screenshot.png';
      vol.mkdirSync('/tmp', { recursive: true });
      vol.writeFileSync(screenshotPath, 'binary data');

      const types = [
        { type: 'screenshot', ext: 'png', data: screenshotPath },
        { type: 'db_snapshot', ext: 'json', data: '{"key": "value"}' },
        { type: 'console_log', ext: 'txt', data: 'log output' },
        { type: 'network_log', ext: 'json', data: '{"requests": []}' },
        { type: 'html_snapshot', ext: 'html', data: '<html></html>' },
        { type: 'custom', ext: 'json', data: '{"custom": true}' },
      ];

      for (const { type, ext, data } of types) {
        const result = await handleRecordEvidence(
          {
            runId,
            step: 1,
            type,
            name: `${type}-test`,
            data,
          },
          fs
        );

        expect(result.success).toBe(true);
        expect(result.filePath).toContain(`.${ext}`);
      }
    });
  });

  describe('error handling', () => {
    it('throws error if project not initialized', async () => {
      vol.reset();
      vol.mkdirSync('/project', { recursive: true });
      const freshFs = new FileSystemService('/project');

      await expect(
        handleRecordEvidence(
          {
            runId: 'test',
            step: 1,
            type: 'console_log',
            name: 'test',
            data: 'data',
          },
          freshFs
        )
      ).rejects.toThrow('not initialized');
    });

    it('throws error if run does not exist', async () => {
      await expect(
        handleRecordEvidence(
          {
            runId: 'nonexistent-run',
            step: 1,
            type: 'console_log',
            name: 'test',
            data: 'data',
          },
          fs
        )
      ).rejects.toThrow('does not exist');
    });

    it('throws error if run is already completed', async () => {
      // Mark run as completed
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
        JSON.stringify({ status: 'pass' })
      );

      await expect(
        handleRecordEvidence(
          {
            runId,
            step: 1,
            type: 'console_log',
            name: 'test',
            data: 'data',
          },
          fs
        )
      ).rejects.toThrow('already completed');
    });

    it('throws validation error if runId is missing', async () => {
      await expect(
        handleRecordEvidence(
          {
            step: 1,
            type: 'console_log',
            name: 'test',
            data: 'data',
          },
          fs
        )
      ).rejects.toThrow();
    });

    it('throws validation error if step is not positive', async () => {
      await expect(
        handleRecordEvidence(
          {
            runId,
            step: 0,
            type: 'console_log',
            name: 'test',
            data: 'data',
          },
          fs
        )
      ).rejects.toThrow();
    });

    it('throws validation error if type is invalid', async () => {
      await expect(
        handleRecordEvidence(
          {
            runId,
            step: 1,
            type: 'invalid_type',
            name: 'test',
            data: 'data',
          },
          fs
        )
      ).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('handles large step numbers', async () => {
      const result = await handleRecordEvidence(
        {
          runId,
          step: 99,
          type: 'console_log',
          name: 'test',
          data: 'data',
        },
        fs
      );

      expect(result.filePath).toContain('step-99-');
    });

    it('handles empty metadata', async () => {
      const result = await handleRecordEvidence(
        {
          runId,
          step: 1,
          type: 'console_log',
          name: 'test',
          data: 'data',
        },
        fs
      );

      expect(result.success).toBe(true);
    });

    it('finds run across multiple scenarios', async () => {
      // Create another scenario
      vol.mkdirSync('/project/.harshJudge/scenarios/other-scenario/runs/other-run/evidence', {
        recursive: true,
      });

      const result = await handleRecordEvidence(
        {
          runId,
          step: 1,
          type: 'console_log',
          name: 'test',
          data: 'data',
        },
        fs
      );

      expect(result.success).toBe(true);
    });
  });
});
