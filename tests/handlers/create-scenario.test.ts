import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { handleCreateScenario } from '../../src/handlers/create-scenario.js';
import { FileSystemService } from '../../src/services/file-system-service.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('handleCreateScenario', () => {
  let fs: FileSystemService;

  beforeEach(() => {
    vol.reset();
    // Initialize project
    vol.mkdirSync('/project/.harshJudge/scenarios', { recursive: true });
    fs = new FileSystemService('/project');
  });

  describe('successful scenario creation', () => {
    it('creates scenario directory structure', async () => {
      const result = await handleCreateScenario(
        {
          slug: 'login-flow',
          title: 'User Login Flow',
          steps: [
            {
              title: 'Navigate to login',
              actions: 'Go to /login',
              expectedOutcome: 'Form visible',
            },
            {
              title: 'Enter credentials',
              actions: 'Fill form',
              expectedOutcome: 'Fields populated',
            },
          ],
        },
        fs
      );

      expect(result.success).toBe(true);
      expect(vol.existsSync('/project/.harshJudge/scenarios/login-flow/meta.yaml')).toBe(
        true
      );
      expect(
        vol.existsSync('/project/.harshJudge/scenarios/login-flow/steps/01-navigate-to-login.md')
      ).toBe(true);
      expect(
        vol.existsSync('/project/.harshJudge/scenarios/login-flow/steps/02-enter-credentials.md')
      ).toBe(true);
    });

    it('returns correct file paths', async () => {
      const result = await handleCreateScenario(
        {
          slug: 'test',
          title: 'Test Scenario',
          steps: [
            {
              title: 'Step one',
              actions: 'Do something',
              expectedOutcome: 'Something happens',
            },
          ],
        },
        fs
      );

      expect(result.slug).toBe('test');
      expect(result.scenarioPath).toContain('scenarios/test');
      expect(result.metaPath).toContain('meta.yaml');
      expect(result.stepsPath).toContain('steps');
      expect(result.stepFiles).toHaveLength(1);
      expect(result.isNew).toBe(true);
    });

    it('generates correct meta.yaml', async () => {
      await handleCreateScenario(
        {
          slug: 'test',
          title: 'Test Title',
          steps: [
            {
              title: 'First step',
              actions: 'Action 1',
              expectedOutcome: 'Outcome 1',
            },
            {
              title: 'Second step',
              actions: 'Action 2',
              expectedOutcome: 'Outcome 2',
            },
          ],
          tags: ['smoke', 'auth'],
          estimatedDuration: 120,
          starred: true,
        },
        fs
      );

      const metaContent = vol.readFileSync(
        '/project/.harshJudge/scenarios/test/meta.yaml',
        'utf-8'
      ) as string;

      expect(metaContent).toContain('title: Test Title');
      expect(metaContent).toContain('slug: test');
      expect(metaContent).toContain('starred: true');
      expect(metaContent).toContain('smoke');
      expect(metaContent).toContain('auth');
      expect(metaContent).toContain('estimatedDuration: 120');
      expect(metaContent).toContain("id: '01'");
      expect(metaContent).toContain('title: First step');
      expect(metaContent).toContain("id: '02'");
    });

    it('generates step files with correct content', async () => {
      await handleCreateScenario(
        {
          slug: 'test',
          title: 'Test',
          steps: [
            {
              title: 'Navigate to page',
              description: 'Open the browser and navigate',
              preconditions: 'App is running',
              actions: '1. Open browser\n2. Go to /login',
              expectedOutcome: 'Login page is visible',
            },
          ],
        },
        fs
      );

      const stepContent = vol.readFileSync(
        '/project/.harshJudge/scenarios/test/steps/01-navigate-to-page.md',
        'utf-8'
      ) as string;

      expect(stepContent).toContain('# Step 01: Navigate to page');
      expect(stepContent).toContain('Open the browser and navigate');
      expect(stepContent).toContain('App is running');
      expect(stepContent).toContain('1. Open browser');
      expect(stepContent).toContain('Login page is visible');
      expect(stepContent).toContain('```javascript');
    });

    it('handles default values for optional fields', async () => {
      const result = await handleCreateScenario(
        {
          slug: 'minimal',
          title: 'Minimal Scenario',
          steps: [
            {
              title: 'Single step',
              actions: 'Do something',
              expectedOutcome: 'Done',
            },
          ],
        },
        fs
      );

      expect(result.success).toBe(true);

      const metaContent = vol.readFileSync(
        '/project/.harshJudge/scenarios/minimal/meta.yaml',
        'utf-8'
      ) as string;

      expect(metaContent).toContain('starred: false');
      expect(metaContent).toContain('estimatedDuration: 60');
    });

    it('creates multiple step files with correct IDs', async () => {
      const result = await handleCreateScenario(
        {
          slug: 'multi',
          title: 'Multi Step',
          steps: Array.from({ length: 5 }, (_, i) => ({
            title: `Step ${i + 1}`,
            actions: `Action ${i + 1}`,
            expectedOutcome: `Outcome ${i + 1}`,
          })),
        },
        fs
      );

      expect(result.stepFiles).toHaveLength(5);
      expect(vol.existsSync('/project/.harshJudge/scenarios/multi/steps/01-step-1.md')).toBe(
        true
      );
      expect(vol.existsSync('/project/.harshJudge/scenarios/multi/steps/05-step-5.md')).toBe(
        true
      );
    });
  });

  describe('updating existing scenario', () => {
    it('sets isNew to false when scenario exists', async () => {
      // Create initial scenario
      vol.mkdirSync('/project/.harshJudge/scenarios/existing/steps', { recursive: true });
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/existing/meta.yaml',
        'title: Existing\ntotalRuns: 5\npassCount: 3\nfailCount: 2\n'
      );

      const result = await handleCreateScenario(
        {
          slug: 'existing',
          title: 'Updated Scenario',
          steps: [
            {
              title: 'New step',
              actions: 'Action',
              expectedOutcome: 'Outcome',
            },
          ],
        },
        fs
      );

      expect(result.isNew).toBe(false);
    });

    it('preserves statistics when updating', async () => {
      // Create initial scenario with stats
      vol.mkdirSync('/project/.harshJudge/scenarios/existing/steps', { recursive: true });
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/existing/meta.yaml',
        'title: Old\ntotalRuns: 10\npassCount: 8\nfailCount: 2\navgDuration: 5000\n'
      );

      await handleCreateScenario(
        {
          slug: 'existing',
          title: 'Updated',
          steps: [
            {
              title: 'Step',
              actions: 'Action',
              expectedOutcome: 'Outcome',
            },
          ],
        },
        fs
      );

      const metaContent = vol.readFileSync(
        '/project/.harshJudge/scenarios/existing/meta.yaml',
        'utf-8'
      ) as string;

      expect(metaContent).toContain('totalRuns: 10');
      expect(metaContent).toContain('passCount: 8');
      expect(metaContent).toContain('failCount: 2');
    });
  });

  describe('error handling', () => {
    it('throws error if project not initialized', async () => {
      vol.reset();
      vol.mkdirSync('/project', { recursive: true });
      const freshFs = new FileSystemService('/project');

      await expect(
        handleCreateScenario(
          {
            slug: 'test',
            title: 'Test',
            steps: [{ title: 'S', actions: 'A', expectedOutcome: 'O' }],
          },
          freshFs
        )
      ).rejects.toThrow('not initialized');
    });

    it('throws validation error if slug is invalid', async () => {
      await expect(
        handleCreateScenario(
          {
            slug: 'Invalid Slug!',
            title: 'Test',
            steps: [{ title: 'S', actions: 'A', expectedOutcome: 'O' }],
          },
          fs
        )
      ).rejects.toThrow();
    });

    it('throws validation error if steps array is empty', async () => {
      await expect(
        handleCreateScenario(
          {
            slug: 'test',
            title: 'Test',
            steps: [],
          },
          fs
        )
      ).rejects.toThrow();
    });

    it('throws validation error if step is missing required fields', async () => {
      await expect(
        handleCreateScenario(
          {
            slug: 'test',
            title: 'Test',
            steps: [{ title: 'Step' }], // Missing actions and expectedOutcome
          },
          fs
        )
      ).rejects.toThrow();
    });
  });

  describe('slug generation', () => {
    it('handles step titles with special characters', async () => {
      const result = await handleCreateScenario(
        {
          slug: 'test',
          title: 'Test',
          steps: [
            {
              title: 'Login with Email & Password!',
              actions: 'Fill form',
              expectedOutcome: 'Done',
            },
          ],
        },
        fs
      );

      expect(result.stepFiles[0]).toContain('01-login-with-email-password.md');
    });

    it('handles step titles with multiple spaces', async () => {
      const result = await handleCreateScenario(
        {
          slug: 'test',
          title: 'Test',
          steps: [
            {
              title: 'Step   with   spaces',
              actions: 'Action',
              expectedOutcome: 'Outcome',
            },
          ],
        },
        fs
      );

      expect(result.stepFiles[0]).toContain('01-step-with-spaces.md');
    });
  });
});
