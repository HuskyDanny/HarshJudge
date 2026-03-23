import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { handleCompleteRun } from '../../src/handlers/complete-run.js';
import { FileSystemService } from '../../src/services/file-system-service.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('handleCompleteRun (advanced)', () => {
  let fs: FileSystemService;
  const runId = 'test-run-id';

  beforeEach(() => {
    vol.reset();
    vol.mkdirSync(
      `/project/.harshJudge/scenarios/login-test/runs/${runId}/evidence`,
      { recursive: true }
    );
    vol.writeFileSync(
      '/project/.harshJudge/scenarios/login-test/scenario.md',
      '# Test'
    );
    vol.writeFileSync(
      '/project/.harshJudge/scenarios/login-test/meta.yaml',
      'totalRuns: 0\npassCount: 0\nfailCount: 0\nlastRun: null\nlastResult: null\navgDuration: 0'
    );
    fs = new FileSystemService('/project');
  });

  describe('completeStep workflow integration', () => {
    it('allows completeRun when result.json has status=running (from completeStep)', async () => {
      const inProgressResult = {
        runId,
        scenarioSlug: 'login-test',
        status: 'running',
        startedAt: '2024-01-15T10:00:00.000Z',
        steps: [
          {
            id: '01',
            status: 'pass',
            duration: 1000,
            error: null,
            evidenceFiles: ['screenshot.png'],
            summary: 'Navigated to login page successfully',
          },
          {
            id: '02',
            status: 'pass',
            duration: 500,
            error: null,
            evidenceFiles: [],
            summary: 'Entered credentials',
          },
        ],
      };
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
        JSON.stringify(inProgressResult)
      );

      const result = await handleCompleteRun(
        { runId, status: 'pass', duration: 1500 },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.updatedMeta.totalRuns).toBe(1);

      const finalResult = JSON.parse(
        vol.readFileSync(
          `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
          'utf-8'
        ) as string
      );
      expect(finalResult.status).toBe('pass');
      expect(finalResult.startedAt).toBe('2024-01-15T10:00:00.000Z');
      expect(finalResult.completedAt).toBeDefined();
      expect(finalResult.duration).toBe(1500);
      expect(finalResult.steps).toHaveLength(2);
      expect(finalResult.steps[0].summary).toBe(
        'Navigated to login page successfully'
      );
    });

    it('uses steps from in-progress result.json when no steps provided in params', async () => {
      const inProgressResult = {
        runId,
        scenarioSlug: 'login-test',
        status: 'running',
        startedAt: '2024-01-15T10:00:00.000Z',
        steps: [
          {
            id: '01',
            status: 'pass',
            duration: 1000,
            error: null,
            evidenceFiles: ['a.png'],
          },
          {
            id: '02',
            status: 'fail',
            duration: 500,
            error: 'Button not found',
            evidenceFiles: [],
          },
        ],
      };
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
        JSON.stringify(inProgressResult)
      );

      const result = await handleCompleteRun(
        {
          runId,
          status: 'fail',
          duration: 1500,
          failedStep: '02',
          errorMessage: 'Button not found',
        },
        fs
      );

      expect(result.success).toBe(true);

      const finalResult = JSON.parse(
        vol.readFileSync(
          `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
          'utf-8'
        ) as string
      );
      expect(finalResult.steps).toHaveLength(2);
      expect(finalResult.steps[0].evidenceFiles).toContain('a.png');
      expect(finalResult.steps[1].error).toBe('Button not found');
    });

    it('rejects completeRun when result.json has status=pass (truly completed)', async () => {
      const completedResult = {
        runId,
        scenarioSlug: 'login-test',
        status: 'pass',
        startedAt: '2024-01-15T10:00:00.000Z',
        completedAt: '2024-01-15T10:01:00.000Z',
        duration: 60000,
        steps: [],
      };
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
        JSON.stringify(completedResult)
      );

      await expect(
        handleCompleteRun({ runId, status: 'pass', duration: 1000 }, fs)
      ).rejects.toThrow('already completed');
    });
  });

  describe('status derivation from step results', () => {
    it('overrides --status fail with pass when all steps passed', async () => {
      const inProgressResult = {
        runId,
        scenarioSlug: 'login-test',
        status: 'running',
        startedAt: '2024-01-15T10:00:00.000Z',
        steps: [
          {
            id: '01',
            status: 'pass',
            duration: 1000,
            error: null,
            evidenceFiles: [],
          },
          {
            id: '02',
            status: 'pass',
            duration: 500,
            error: null,
            evidenceFiles: [],
          },
        ],
      };
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
        JSON.stringify(inProgressResult)
      );

      const result = await handleCompleteRun(
        { runId, status: 'fail', duration: 1500 },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('mismatch');

      const finalResult = JSON.parse(
        vol.readFileSync(
          `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
          'utf-8'
        ) as string
      );
      expect(finalResult.status).toBe('pass');
    });

    it('overrides --status pass with fail when any step failed', async () => {
      const inProgressResult = {
        runId,
        scenarioSlug: 'login-test',
        status: 'running',
        startedAt: '2024-01-15T10:00:00.000Z',
        steps: [
          {
            id: '01',
            status: 'pass',
            duration: 1000,
            error: null,
            evidenceFiles: [],
          },
          {
            id: '02',
            status: 'fail',
            duration: 500,
            error: 'Button not found',
            evidenceFiles: [],
          },
        ],
      };
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
        JSON.stringify(inProgressResult)
      );

      const result = await handleCompleteRun(
        { runId, status: 'pass', duration: 1500 },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('mismatch');

      const finalResult = JSON.parse(
        vol.readFileSync(
          `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
          'utf-8'
        ) as string
      );
      expect(finalResult.status).toBe('fail');
    });

    it('does not warn when --status matches derived status', async () => {
      const inProgressResult = {
        runId,
        scenarioSlug: 'login-test',
        status: 'running',
        startedAt: '2024-01-15T10:00:00.000Z',
        steps: [
          {
            id: '01',
            status: 'pass',
            duration: 1000,
            error: null,
            evidenceFiles: [],
          },
          {
            id: '02',
            status: 'pass',
            duration: 500,
            error: null,
            evidenceFiles: [],
          },
        ],
      };
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
        JSON.stringify(inProgressResult)
      );

      const result = await handleCompleteRun(
        { runId, status: 'pass', duration: 1500 },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('trusts --status when no steps have been recorded', async () => {
      const result = await handleCompleteRun(
        { runId, status: 'fail', duration: 500 },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.warning).toBeUndefined();

      const finalResult = JSON.parse(
        vol.readFileSync(
          `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
          'utf-8'
        ) as string
      );
      expect(finalResult.status).toBe('fail');
    });

    it('updates meta.yaml with derived status (not --status) on mismatch', async () => {
      const inProgressResult = {
        runId,
        scenarioSlug: 'login-test',
        status: 'running',
        startedAt: '2024-01-15T10:00:00.000Z',
        steps: [
          {
            id: '01',
            status: 'pass',
            duration: 1000,
            error: null,
            evidenceFiles: [],
          },
        ],
      };
      vol.writeFileSync(
        `/project/.harshJudge/scenarios/login-test/runs/${runId}/result.json`,
        JSON.stringify(inProgressResult)
      );

      const result = await handleCompleteRun(
        { runId, status: 'fail', duration: 1000 },
        fs
      );

      expect(result.updatedMeta.passCount).toBe(1);
      expect(result.updatedMeta.failCount).toBe(0);

      const meta = vol.readFileSync(
        '/project/.harshJudge/scenarios/login-test/meta.yaml',
        'utf-8'
      ) as string;
      expect(meta).toContain('passCount: 1');
      expect(meta).toContain('failCount: 0');
      expect(meta).toContain('lastResult: pass');
    });
  });

  describe('edge cases', () => {
    it('creates meta.yaml if it does not exist', async () => {
      vol.unlinkSync('/project/.harshJudge/scenarios/login-test/meta.yaml');

      const result = await handleCompleteRun(
        { runId, status: 'pass', duration: 1000 },
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
        { runId, status: 'pass', duration: 0 },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.updatedMeta.avgDuration).toBe(0);
    });

    it('handles run across multiple scenarios', async () => {
      vol.mkdirSync(
        '/project/.harshJudge/scenarios/other-scenario/runs/other-run/evidence',
        { recursive: true }
      );

      const result = await handleCompleteRun(
        { runId, status: 'pass', duration: 1000 },
        fs
      );

      expect(result.success).toBe(true);
    });

    it('preserves non-stats fields in meta.yaml when updating', async () => {
      const fullMeta = `title: Login Test Scenario
slug: login-test
starred: true
tags:
  - auth
  - critical
estimatedDuration: 60
steps:
  - id: '01'
    title: Navigate to login page
    file: 01-navigate-to-login-page.md
  - id: '02'
    title: Enter credentials
    file: 02-enter-credentials.md
totalRuns: 0
passCount: 0
failCount: 0
lastRun: null
lastResult: null
avgDuration: 0`;
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/login-test/meta.yaml',
        fullMeta
      );

      const result = await handleCompleteRun(
        { runId, status: 'pass', duration: 2000 },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.updatedMeta.totalRuns).toBe(1);
      expect(result.updatedMeta.passCount).toBe(1);

      const updatedMeta = vol.readFileSync(
        '/project/.harshJudge/scenarios/login-test/meta.yaml',
        'utf-8'
      ) as string;

      expect(updatedMeta).toContain('title: Login Test Scenario');
      expect(updatedMeta).toContain('slug: login-test');
      expect(updatedMeta).toContain('starred: true');
      expect(updatedMeta).toContain('- auth');
      expect(updatedMeta).toContain('- critical');
      expect(updatedMeta).toContain('estimatedDuration: 60');
      expect(updatedMeta).toContain("id: '01'");
      expect(updatedMeta).toContain('title: Navigate to login page');
      expect(updatedMeta).toContain('totalRuns: 1');
      expect(updatedMeta).toContain('passCount: 1');
      expect(updatedMeta).toContain('failCount: 0');
      expect(updatedMeta).toContain('avgDuration: 2000');
      expect(updatedMeta).toContain('lastResult: pass');
    });
  });
});
