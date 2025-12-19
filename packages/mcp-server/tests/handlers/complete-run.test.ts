import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { handleCompleteRun } from '../../src/handlers/complete-run.js';
import { FileSystemService } from '../../src/services/file-system-service.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('handleCompleteRun', () => {
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
    // Initial meta.yaml
    vol.writeFileSync(
      '/project/.harshJudge/scenarios/login-test/meta.yaml',
      'totalRuns: 0\npassCount: 0\nfailCount: 0\nlastRun: null\nlastResult: null\navgDuration: 0'
    );
    fs = new FileSystemService('/project');
  });

  describe('successful run completion', () => {
    it('writes result.json', async () => {
      const result = await handleCompleteRun(
        {
          runId,
          status: 'pass',
          duration: 1500,
        },
        fs
      );

      expect(result.success).toBe(true);
      const resultPath = `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`;
      expect(vol.existsSync(resultPath)).toBe(true);

      const resultData = JSON.parse(vol.readFileSync(resultPath, 'utf-8') as string);
      expect(resultData.runId).toBe(runId);
      expect(resultData.status).toBe('pass');
      expect(resultData.duration).toBe(1500);
      expect(resultData.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('updates meta.yaml with pass result', async () => {
      await handleCompleteRun(
        {
          runId,
          status: 'pass',
          duration: 2000,
        },
        fs
      );

      const meta = vol.readFileSync(
        '/project/.harshJudge/scenarios/login-test/meta.yaml',
        'utf-8'
      ) as string;

      expect(meta).toContain('totalRuns: 1');
      expect(meta).toContain('passCount: 1');
      expect(meta).toContain('failCount: 0');
      expect(meta).toContain('lastResult: pass');
      expect(meta).toContain('avgDuration: 2000');
    });

    it('updates meta.yaml with fail result', async () => {
      await handleCompleteRun(
        {
          runId,
          status: 'fail',
          duration: 1000,
          failedStep: '03', // v2: zero-padded string
          errorMessage: 'Element not found',
        },
        fs
      );

      const meta = vol.readFileSync(
        '/project/.harshJudge/scenarios/login-test/meta.yaml',
        'utf-8'
      ) as string;

      expect(meta).toContain('totalRuns: 1');
      expect(meta).toContain('passCount: 0');
      expect(meta).toContain('failCount: 1');
      expect(meta).toContain('lastResult: fail');
    });

    it('returns updated statistics', async () => {
      const result = await handleCompleteRun(
        {
          runId,
          status: 'pass',
          duration: 3000,
        },
        fs
      );

      expect(result.updatedMeta.totalRuns).toBe(1);
      expect(result.updatedMeta.passCount).toBe(1);
      expect(result.updatedMeta.failCount).toBe(0);
      expect(result.updatedMeta.avgDuration).toBe(3000);
    });

    it('returns correct resultPath', async () => {
      const result = await handleCompleteRun(
        {
          runId,
          status: 'pass',
          duration: 1000,
        },
        fs
      );

      expect(result.resultPath).toContain(`runs/${runId}/result.json`);
    });

    it('writes failedStep and errorMessage to result.json', async () => {
      await handleCompleteRun(
        {
          runId,
          status: 'fail',
          duration: 500,
          failedStep: '02', // v2: zero-padded string
          errorMessage: 'Timeout waiting for element',
        },
        fs
      );

      const resultPath = `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`;
      const resultData = JSON.parse(vol.readFileSync(resultPath, 'utf-8') as string);

      expect(resultData.failedStep).toBe('02'); // v2: string
      expect(resultData.errorMessage).toBe('Timeout waiting for element');
    });

    it('collects step evidence from per-step directories (v2)', async () => {
      // Add evidence files in v2 per-step structure
      vol.mkdirSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/step-01/evidence`,
        { recursive: true }
      );
      vol.mkdirSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/step-02/evidence`,
        { recursive: true }
      );
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/step-01/evidence/screenshot.png`,
        'binary data'
      );
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/step-01/evidence/screenshot.meta.json`,
        '{}'
      );
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/step-02/evidence/log.txt`,
        'log data'
      );

      await handleCompleteRun(
        {
          runId,
          status: 'pass',
          duration: 1000,
        },
        fs
      );

      const resultPath = `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`;
      const resultData = JSON.parse(vol.readFileSync(resultPath, 'utf-8') as string);

      // v2: steps array contains evidence files per step
      expect(resultData.steps).toHaveLength(2);
      expect(resultData.steps[0].id).toBe('01');
      expect(resultData.steps[0].evidenceFiles).toContain('screenshot.png');
      expect(resultData.steps[1].id).toBe('02');
      expect(resultData.steps[1].evidenceFiles).toContain('log.txt');
    });
  });

  describe('statistics accumulation', () => {
    it('calculates running average duration', async () => {
      // Set up initial meta with 2 runs averaging 1000ms
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/login-test/meta.yaml',
        'totalRuns: 2\npassCount: 2\nfailCount: 0\nlastRun: null\nlastResult: pass\navgDuration: 1000'
      );

      const result = await handleCompleteRun(
        {
          runId,
          status: 'pass',
          duration: 2500, // Third run: (1000*2 + 2500) / 3 = 1500
        },
        fs
      );

      expect(result.updatedMeta.totalRuns).toBe(3);
      expect(result.updatedMeta.avgDuration).toBe(1500);
    });

    it('accumulates pass count', async () => {
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/login-test/meta.yaml',
        'totalRuns: 5\npassCount: 3\nfailCount: 2\nlastRun: null\nlastResult: fail\navgDuration: 1000'
      );

      const result = await handleCompleteRun(
        {
          runId,
          status: 'pass',
          duration: 1000,
        },
        fs
      );

      expect(result.updatedMeta.totalRuns).toBe(6);
      expect(result.updatedMeta.passCount).toBe(4);
      expect(result.updatedMeta.failCount).toBe(2);
    });

    it('accumulates fail count', async () => {
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/login-test/meta.yaml',
        'totalRuns: 5\npassCount: 3\nfailCount: 2\nlastRun: null\nlastResult: pass\navgDuration: 1000'
      );

      const result = await handleCompleteRun(
        {
          runId,
          status: 'fail',
          duration: 1000,
        },
        fs
      );

      expect(result.updatedMeta.totalRuns).toBe(6);
      expect(result.updatedMeta.passCount).toBe(3);
      expect(result.updatedMeta.failCount).toBe(3);
    });
  });

  describe('error handling', () => {
    it('throws error if project not initialized', async () => {
      vol.reset();
      vol.mkdirSync('/project', { recursive: true });
      const freshFs = new FileSystemService('/project');

      await expect(
        handleCompleteRun(
          { runId: 'test', status: 'pass', duration: 1000 },
          freshFs
        )
      ).rejects.toThrow('not initialized');
    });

    it('throws error if run does not exist', async () => {
      await expect(
        handleCompleteRun(
          { runId: 'nonexistent-run', status: 'pass', duration: 1000 },
          fs
        )
      ).rejects.toThrow('does not exist');
    });

    it('throws error if run is already completed', async () => {
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
        JSON.stringify({ status: 'pass' })
      );

      await expect(
        handleCompleteRun(
          { runId, status: 'pass', duration: 1000 },
          fs
        )
      ).rejects.toThrow('already completed');
    });

    it('throws validation error if runId is missing', async () => {
      await expect(
        handleCompleteRun({ status: 'pass', duration: 1000 }, fs)
      ).rejects.toThrow();
    });

    it('throws validation error if status is invalid', async () => {
      await expect(
        handleCompleteRun(
          { runId, status: 'invalid', duration: 1000 },
          fs
        )
      ).rejects.toThrow();
    });

    it('throws validation error if duration is negative', async () => {
      await expect(
        handleCompleteRun(
          { runId, status: 'pass', duration: -100 },
          fs
        )
      ).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('creates meta.yaml if it does not exist', async () => {
      // Remove the meta.yaml
      vol.unlinkSync('/project/.harshJudge/scenarios/login-test/meta.yaml');

      const result = await handleCompleteRun(
        {
          runId,
          status: 'pass',
          duration: 1000,
        },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.updatedMeta.totalRuns).toBe(1);
      expect(
        vol.existsSync('/project/.harshJudge/scenarios/login-test/meta.yaml')
      ).toBe(true);
    });

    it('handles zero duration', async () => {
      const result = await handleCompleteRun(
        {
          runId,
          status: 'pass',
          duration: 0,
        },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.updatedMeta.avgDuration).toBe(0);
    });

    it('handles run across multiple scenarios', async () => {
      // Create another scenario
      vol.mkdirSync('/project/.harshJudge/scenarios/other-scenario/runs/other-run/evidence', {
        recursive: true,
      });

      const result = await handleCompleteRun(
        {
          runId,
          status: 'pass',
          duration: 1000,
        },
        fs
      );

      expect(result.success).toBe(true);
    });
  });
});
