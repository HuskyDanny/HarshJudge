import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { handleGetStatus } from '../../src/handlers/get-status.js';
import { FileSystemService } from '../../src/services/file-system-service.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('handleGetStatus', () => {
  let fs: FileSystemService;

  beforeEach(() => {
    vol.reset();
    // Create initialized project
    vol.mkdirSync('/project/.harshJudge/scenarios', { recursive: true });
    vol.writeFileSync(
      '/project/.harshJudge/config.yaml',
      'projectName: Test Project\nbaseUrl: http://localhost:3000\nversion: "1.0"\ncreatedAt: "2025-12-04T00:00:00Z"'
    );
    fs = new FileSystemService('/project');
  });

  describe('project-level status', () => {
    it('returns project status with no scenarios', async () => {
      const result = await handleGetStatus({}, fs);

      // Type guard for ProjectStatus
      expect('projectName' in result).toBe(true);
      if ('projectName' in result) {
        expect(result.projectName).toBe('Test Project');
        expect(result.scenarioCount).toBe(0);
        expect(result.passing).toBe(0);
        expect(result.failing).toBe(0);
        expect(result.neverRun).toBe(0);
        expect(result.scenarios).toEqual([]);
      }
    });

    it('returns correct counts for multiple scenarios', async () => {
      // Create scenarios with different states
      createScenario('passing-test', 'Passing Test', ['test'], {
        totalRuns: 5,
        passCount: 5,
        failCount: 0,
        lastRun: '2025-12-04T10:00:00Z',
        lastResult: 'pass',
        avgDuration: 1000,
      });

      createScenario('failing-test', 'Failing Test', ['test'], {
        totalRuns: 3,
        passCount: 1,
        failCount: 2,
        lastRun: '2025-12-04T09:00:00Z',
        lastResult: 'fail',
        avgDuration: 2000,
      });

      createScenario('never-run-test', 'Never Run Test', ['test'], {
        totalRuns: 0,
        passCount: 0,
        failCount: 0,
        lastRun: null,
        lastResult: null,
        avgDuration: 0,
      });

      const result = await handleGetStatus({}, fs);

      if ('projectName' in result) {
        expect(result.scenarioCount).toBe(3);
        expect(result.passing).toBe(1);
        expect(result.failing).toBe(1);
        expect(result.neverRun).toBe(1);
      }
    });

    it('returns scenario summaries with correct data', async () => {
      createScenario('login-flow', 'User Login Flow', ['auth', 'critical'], {
        totalRuns: 10,
        passCount: 8,
        failCount: 2,
        lastRun: '2025-12-04T12:00:00Z',
        lastResult: 'pass',
        avgDuration: 1500,
      });

      const result = await handleGetStatus({}, fs);

      if ('projectName' in result) {
        expect(result.scenarios).toHaveLength(1);
        const scenario = result.scenarios[0];
        expect(scenario.slug).toBe('login-flow');
        expect(scenario.title).toBe('User Login Flow');
        expect(scenario.tags).toEqual(['auth', 'critical']);
        expect(scenario.lastResult).toBe('pass');
        expect(scenario.lastRun).toContain('2025-12-04T12:00:00');
        expect(scenario.totalRuns).toBe(10);
        expect(scenario.passRate).toBe(80); // 8/10 = 80%
      }
    });

    it('calculates pass rate correctly', async () => {
      createScenario('test-1', 'Test 1', [], {
        totalRuns: 3,
        passCount: 1,
        failCount: 2,
        lastRun: null,
        lastResult: 'fail',
        avgDuration: 0,
      });

      const result = await handleGetStatus({}, fs);

      if ('projectName' in result) {
        expect(result.scenarios[0].passRate).toBe(33); // 1/3 ≈ 33%
      }
    });

    it('handles scenario without meta.yaml', async () => {
      // Create scenario without meta.yaml
      vol.mkdirSync('/project/.harshJudge/scenarios/no-meta', { recursive: true });
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/no-meta/scenario.md',
        '---\nid: no-meta\ntitle: No Meta Scenario\ntags: []\nestimatedDuration: 60\n---\n\n# Content'
      );

      const result = await handleGetStatus({}, fs);

      if ('projectName' in result) {
        expect(result.scenarios).toHaveLength(1);
        expect(result.scenarios[0].totalRuns).toBe(0);
        expect(result.neverRun).toBe(1);
      }
    });
  });

  describe('scenario-level status', () => {
    it('returns scenario detail', async () => {
      createScenario('login-test', 'Login Test', ['auth'], {
        totalRuns: 5,
        passCount: 4,
        failCount: 1,
        lastRun: '2025-12-04T10:00:00Z',
        lastResult: 'pass',
        avgDuration: 2000,
      });

      const result = await handleGetStatus({ scenarioSlug: 'login-test' }, fs);

      // Type guard for ScenarioDetail
      expect('content' in result).toBe(true);
      if ('content' in result) {
        expect(result.slug).toBe('login-test');
        expect(result.title).toBe('Login Test');
        expect(result.tags).toEqual(['auth']);
        expect(result.meta.totalRuns).toBe(5);
        expect(result.meta.passCount).toBe(4);
      }
    });

    it('returns scenario content without frontmatter', async () => {
      createScenario('test', 'Test', [], {
        totalRuns: 0,
        passCount: 0,
        failCount: 0,
        lastRun: null,
        lastResult: null,
        avgDuration: 0,
      });

      const result = await handleGetStatus({ scenarioSlug: 'test' }, fs);

      if ('content' in result) {
        expect(result.content).not.toContain('---');
        expect(result.content).toContain('# Test Content');
      }
    });

    it('returns recent runs sorted by completion time', async () => {
      createScenario('test', 'Test', [], {
        totalRuns: 2,
        passCount: 1,
        failCount: 1,
        lastRun: '2025-12-04T12:00:00Z',
        lastResult: 'pass',
        avgDuration: 1000,
      });

      // Create runs
      vol.mkdirSync('/project/.harshJudge/scenarios/test/runs/run-1', { recursive: true });
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/test/runs/run-1/result.json',
        JSON.stringify({
          runId: 'run-1',
          status: 'fail',
          duration: 1500,
          completedAt: '2025-12-04T10:00:00Z',
          errorMessage: 'Test failed',
        })
      );

      vol.mkdirSync('/project/.harshJudge/scenarios/test/runs/run-2', { recursive: true });
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/test/runs/run-2/result.json',
        JSON.stringify({
          runId: 'run-2',
          status: 'pass',
          duration: 1000,
          completedAt: '2025-12-04T12:00:00Z',
          errorMessage: null,
        })
      );

      const result = await handleGetStatus({ scenarioSlug: 'test' }, fs);

      if ('content' in result) {
        expect(result.recentRuns).toHaveLength(2);
        // Most recent first
        expect(result.recentRuns[0].id).toBe('run-2');
        expect(result.recentRuns[0].status).toBe('pass');
        expect(result.recentRuns[1].id).toBe('run-1');
        expect(result.recentRuns[1].status).toBe('fail');
        expect(result.recentRuns[1].errorMessage).toBe('Test failed');
      }
    });

    it('limits recent runs to 10', async () => {
      createScenario('many-runs', 'Many Runs', [], {
        totalRuns: 15,
        passCount: 15,
        failCount: 0,
        lastRun: '2025-12-04T15:00:00Z',
        lastResult: 'pass',
        avgDuration: 1000,
      });

      // Create 15 runs
      for (let i = 1; i <= 15; i++) {
        vol.mkdirSync(`/project/.harshJudge/scenarios/many-runs/runs/run-${i}`, {
          recursive: true,
        });
        vol.writeFileSync(
          `/project/.harshJudge/scenarios/many-runs/runs/run-${i}/result.json`,
          JSON.stringify({
            runId: `run-${i}`,
            status: 'pass',
            duration: 1000,
            completedAt: `2025-12-04T${String(i).padStart(2, '0')}:00:00Z`,
            errorMessage: null,
          })
        );
      }

      const result = await handleGetStatus({ scenarioSlug: 'many-runs' }, fs);

      if ('content' in result) {
        expect(result.recentRuns).toHaveLength(10);
      }
    });

    it('returns empty recentRuns if no runs directory', async () => {
      createScenario('no-runs', 'No Runs', [], {
        totalRuns: 0,
        passCount: 0,
        failCount: 0,
        lastRun: null,
        lastResult: null,
        avgDuration: 0,
      });

      const result = await handleGetStatus({ scenarioSlug: 'no-runs' }, fs);

      if ('content' in result) {
        expect(result.recentRuns).toEqual([]);
      }
    });
  });

  describe('error handling', () => {
    it('throws error if project not initialized', async () => {
      vol.reset();
      vol.mkdirSync('/project', { recursive: true });
      const freshFs = new FileSystemService('/project');

      await expect(handleGetStatus({}, freshFs)).rejects.toThrow('not initialized');
    });

    it('throws error if scenario does not exist', async () => {
      await expect(
        handleGetStatus({ scenarioSlug: 'nonexistent' }, fs)
      ).rejects.toThrow('does not exist');
    });

    it('includes scenario slug in error message', async () => {
      await expect(
        handleGetStatus({ scenarioSlug: 'missing-scenario' }, fs)
      ).rejects.toThrow('missing-scenario');
    });
  });

  // Helper function to create a scenario
  function createScenario(
    slug: string,
    title: string,
    tags: string[],
    meta: {
      totalRuns: number;
      passCount: number;
      failCount: number;
      lastRun: string | null;
      lastResult: 'pass' | 'fail' | null;
      avgDuration: number;
    }
  ) {
    const scenarioPath = `/project/.harshJudge/scenarios/${slug}`;
    vol.mkdirSync(scenarioPath, { recursive: true });

    vol.writeFileSync(
      `${scenarioPath}/scenario.md`,
      `---
id: ${slug}
title: ${title}
tags: [${tags.join(', ')}]
estimatedDuration: 60
---

# Test Content
This is the test content.
`
    );

    const lastRunValue = meta.lastRun ? `'${meta.lastRun}'` : 'null';
    vol.writeFileSync(
      `${scenarioPath}/meta.yaml`,
      `totalRuns: ${meta.totalRuns}
passCount: ${meta.passCount}
failCount: ${meta.failCount}
lastRun: ${lastRunValue}
lastResult: ${meta.lastResult}
avgDuration: ${meta.avgDuration}`
    );
  }
});
