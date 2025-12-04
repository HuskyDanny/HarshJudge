import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { handleStartRun } from '../../src/handlers/start-run.js';
import { FileSystemService } from '../../src/services/file-system-service.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

// Mock nanoid for predictable IDs in tests
vi.mock('nanoid', () => ({
  nanoid: () => 'test-run-id',
}));

describe('handleStartRun', () => {
  let fs: FileSystemService;

  beforeEach(() => {
    vol.reset();
    // Create initialized project with a scenario
    vol.mkdirSync('/project/.harshJudge/scenarios/login-test', { recursive: true });
    vol.writeFileSync(
      '/project/.harshJudge/scenarios/login-test/scenario.md',
      '---\nid: login-test\ntitle: Login Test\n---\n# Test'
    );
    vol.writeFileSync(
      '/project/.harshJudge/scenarios/login-test/meta.yaml',
      'totalRuns: 0\npassCount: 0\nfailCount: 0'
    );
    fs = new FileSystemService('/project');
  });

  describe('successful run start', () => {
    it('creates run directory with evidence subdirectory', async () => {
      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(result.success).toBe(true);
      expect(result.runId).toBe('test-run-id');
      expect(
        vol.existsSync('/project/.harshJudge/scenarios/login-test/runs/test-run-id')
      ).toBe(true);
      expect(
        vol.existsSync(
          '/project/.harshJudge/scenarios/login-test/runs/test-run-id/evidence'
        )
      ).toBe(true);
    });

    it('returns correct paths', async () => {
      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(result.runPath).toBe(
        '.harshJudge/scenarios/login-test/runs/test-run-id'
      );
      expect(result.evidencePath).toBe(
        '.harshJudge/scenarios/login-test/runs/test-run-id/evidence'
      );
    });

    it('returns run number 1 for first run', async () => {
      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(result.runNumber).toBe(1);
    });

    it('increments run number for subsequent runs', async () => {
      // Create existing runs
      vol.mkdirSync(
        '/project/.harshJudge/scenarios/login-test/runs/existing-run-1',
        { recursive: true }
      );
      vol.mkdirSync(
        '/project/.harshJudge/scenarios/login-test/runs/existing-run-2',
        { recursive: true }
      );

      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(result.runNumber).toBe(3);
    });

    it('returns valid ISO timestamp for startedAt', async () => {
      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(result.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      // Verify it's a valid date
      const date = new Date(result.startedAt);
      expect(date.toString()).not.toBe('Invalid Date');
    });

    it('creates runs directory if it does not exist', async () => {
      expect(
        vol.existsSync('/project/.harshJudge/scenarios/login-test/runs')
      ).toBe(false);

      await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(
        vol.existsSync('/project/.harshJudge/scenarios/login-test/runs')
      ).toBe(true);
    });
  });

  describe('error handling', () => {
    it('throws error if project not initialized', async () => {
      vol.reset();
      vol.mkdirSync('/project', { recursive: true });
      const freshFs = new FileSystemService('/project');

      await expect(
        handleStartRun({ scenarioSlug: 'test' }, freshFs)
      ).rejects.toThrow('not initialized');
    });

    it('throws error if scenario does not exist', async () => {
      await expect(
        handleStartRun({ scenarioSlug: 'nonexistent' }, fs)
      ).rejects.toThrow('does not exist');
    });

    it('includes scenario slug in error message when not found', async () => {
      await expect(
        handleStartRun({ scenarioSlug: 'my-missing-scenario' }, fs)
      ).rejects.toThrow('my-missing-scenario');
    });

    it('throws validation error if scenarioSlug is missing', async () => {
      await expect(handleStartRun({}, fs)).rejects.toThrow();
    });

    it('throws validation error if scenarioSlug has invalid characters', async () => {
      await expect(
        handleStartRun({ scenarioSlug: 'Invalid_Slug!' }, fs)
      ).rejects.toThrow();
    });

    it('throws validation error if scenarioSlug has uppercase', async () => {
      await expect(
        handleStartRun({ scenarioSlug: 'Invalid-Slug' }, fs)
      ).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('works with scenario that has hyphens and numbers in slug', async () => {
      vol.mkdirSync('/project/.harshJudge/scenarios/test-123-scenario', {
        recursive: true,
      });
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/test-123-scenario/scenario.md',
        '# Test'
      );

      const result = await handleStartRun(
        { scenarioSlug: 'test-123-scenario' },
        fs
      );

      expect(result.success).toBe(true);
    });

    it('handles scenario with many existing runs', async () => {
      // Create 50 existing runs
      for (let i = 1; i <= 50; i++) {
        vol.mkdirSync(
          `/project/.harshJudge/scenarios/login-test/runs/run-${i}`,
          { recursive: true }
        );
      }

      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(result.runNumber).toBe(51);
    });

    it('only counts directories in runs folder, not files', async () => {
      vol.mkdirSync('/project/.harshJudge/scenarios/login-test/runs/run-1', {
        recursive: true,
      });
      // Create a file that should be ignored
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/login-test/runs/.gitkeep',
        ''
      );

      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(result.runNumber).toBe(2); // Only the directory counts
    });
  });
});
