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

// V2 meta.yaml format with steps
const V2_META_YAML = `title: Login Test
slug: login-test
starred: false
tags:
  - auth
  - smoke
estimatedDuration: 60
steps:
  - id: '01'
    title: Navigate to login
    file: 01-navigate-to-login.md
  - id: '02'
    title: Enter credentials
    file: 02-enter-credentials.md
  - id: '03'
    title: Submit form
    file: 03-submit-form.md
totalRuns: 0
passCount: 0
failCount: 0
avgDuration: 0
`;

// Legacy v1 meta.yaml without steps
const V1_META_YAML = `totalRuns: 5
passCount: 3
failCount: 2
title: Old Format
slug: login-test
`;

describe('handleStartRun', () => {
  let fs: FileSystemService;

  beforeEach(() => {
    vol.reset();
    // Create initialized project with a v2 scenario
    vol.mkdirSync('/project/.harshJudge/scenarios/login-test/steps', { recursive: true });
    vol.writeFileSync('/project/.harshJudge/scenarios/login-test/meta.yaml', V2_META_YAML);
    vol.writeFileSync(
      '/project/.harshJudge/scenarios/login-test/steps/01-navigate-to-login.md',
      '# Step 01: Navigate to login'
    );
    vol.writeFileSync(
      '/project/.harshJudge/scenarios/login-test/steps/02-enter-credentials.md',
      '# Step 02: Enter credentials'
    );
    vol.writeFileSync(
      '/project/.harshJudge/scenarios/login-test/steps/03-submit-form.md',
      '# Step 03: Submit form'
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

  describe('step information (v2)', () => {
    it('returns scenario slug and title', async () => {
      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(result.scenarioSlug).toBe('login-test');
      expect(result.scenarioTitle).toBe('Login Test');
    });

    it('returns steps array from meta.yaml', async () => {
      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(result.steps).toHaveLength(3);
      expect(result.steps[0]).toEqual({
        id: '01',
        title: 'Navigate to login',
        file: '01-navigate-to-login.md',
      });
      expect(result.steps[1]).toEqual({
        id: '02',
        title: 'Enter credentials',
        file: '02-enter-credentials.md',
      });
      expect(result.steps[2]).toEqual({
        id: '03',
        title: 'Submit form',
        file: '03-submit-form.md',
      });
    });

    it('returns empty steps array for v1 meta.yaml without steps', async () => {
      // Override with v1 meta.yaml
      vol.writeFileSync('/project/.harshJudge/scenarios/login-test/meta.yaml', V1_META_YAML);

      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      expect(result.steps).toEqual([]);
      expect(result.scenarioTitle).toBe('Old Format');
    });

    it('includes step info needed for orchestration', async () => {
      const result = await handleStartRun({ scenarioSlug: 'login-test' }, fs);

      // Verify all fields needed for step orchestration are present
      for (const step of result.steps) {
        expect(step.id).toBeDefined();
        expect(step.title).toBeDefined();
        expect(step.file).toBeDefined();
      }
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

    it('throws error if scenario has no meta.yaml', async () => {
      vol.mkdirSync('/project/.harshJudge/scenarios/no-meta', { recursive: true });
      // No meta.yaml created

      await expect(
        handleStartRun({ scenarioSlug: 'no-meta' }, fs)
      ).rejects.toThrow('no meta.yaml');
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
        '/project/.harshJudge/scenarios/test-123-scenario/meta.yaml',
        'title: Test 123\nslug: test-123-scenario\n'
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

    it('handles scenario with many steps', async () => {
      const manyStepsMeta = `title: Big Test
slug: big-test
steps:
${Array.from({ length: 20 }, (_, i) => `  - id: '${String(i + 1).padStart(2, '0')}'
    title: Step ${i + 1}
    file: ${String(i + 1).padStart(2, '0')}-step-${i + 1}.md`).join('\n')}
`;
      vol.mkdirSync('/project/.harshJudge/scenarios/big-test', { recursive: true });
      vol.writeFileSync('/project/.harshJudge/scenarios/big-test/meta.yaml', manyStepsMeta);

      const result = await handleStartRun({ scenarioSlug: 'big-test' }, fs);

      expect(result.steps).toHaveLength(20);
      expect(result.steps[19].id).toBe('20');
    });
  });
});
