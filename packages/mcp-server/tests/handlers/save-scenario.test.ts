import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { handleSaveScenario } from '../../src/handlers/save-scenario.js';
import { FileSystemService } from '../../src/services/file-system-service.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('handleSaveScenario', () => {
  let fs: FileSystemService;

  beforeEach(() => {
    vol.reset();
    // Create initialized project structure
    vol.mkdirSync('/project/.harshJudge/scenarios', { recursive: true });
    fs = new FileSystemService('/project');
  });

  describe('successful scenario creation', () => {
    it('creates scenario directory and files', async () => {
      const result = await handleSaveScenario(
        {
          slug: 'login-test',
          title: 'Login Test',
          content: '# Steps\n1. Go to login page',
        },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.slug).toBe('login-test');
      expect(result.isNew).toBe(true);
      expect(vol.existsSync('/project/.harshJudge/scenarios/login-test')).toBe(true);
      expect(vol.existsSync('/project/.harshJudge/scenarios/login-test/scenario.md')).toBe(true);
      expect(vol.existsSync('/project/.harshJudge/scenarios/login-test/meta.yaml')).toBe(true);
    });

    it('returns correct paths', async () => {
      const result = await handleSaveScenario(
        {
          slug: 'my-scenario',
          title: 'My Scenario',
          content: '# Content',
        },
        fs
      );

      expect(result.scenarioPath).toBe('.harshJudge/scenarios/my-scenario/scenario.md');
      expect(result.metaPath).toBe('.harshJudge/scenarios/my-scenario/meta.yaml');
    });

    it('writes scenario.md with correct frontmatter', async () => {
      await handleSaveScenario(
        {
          slug: 'test-scenario',
          title: 'Test Scenario Title',
          content: '# Overview\nThis is the content.',
          tags: ['auth', 'critical'],
          estimatedDuration: 120,
        },
        fs
      );

      const content = vol.readFileSync(
        '/project/.harshJudge/scenarios/test-scenario/scenario.md',
        'utf-8'
      ) as string;

      expect(content).toContain('id: test-scenario');
      expect(content).toContain('title: Test Scenario Title');
      expect(content).toContain('tags: [auth, critical]');
      expect(content).toContain('estimatedDuration: 120');
      expect(content).toContain('# Overview');
      expect(content).toContain('This is the content.');
    });

    it('writes scenario with default tags and estimatedDuration', async () => {
      await handleSaveScenario(
        {
          slug: 'minimal-scenario',
          title: 'Minimal',
          content: 'Minimal content',
        },
        fs
      );

      const content = vol.readFileSync(
        '/project/.harshJudge/scenarios/minimal-scenario/scenario.md',
        'utf-8'
      ) as string;

      expect(content).toContain('tags: []');
      expect(content).toContain('estimatedDuration: 60');
    });

    it('writes meta.yaml with correct initial values', async () => {
      await handleSaveScenario(
        {
          slug: 'test-meta',
          title: 'Test Meta',
          content: 'Content',
        },
        fs
      );

      const metaContent = vol.readFileSync(
        '/project/.harshJudge/scenarios/test-meta/meta.yaml',
        'utf-8'
      ) as string;

      expect(metaContent).toContain('totalRuns: 0');
      expect(metaContent).toContain('passCount: 0');
      expect(metaContent).toContain('failCount: 0');
      expect(metaContent).toContain('lastRun: null');
      expect(metaContent).toContain('lastResult: null');
      expect(metaContent).toContain('avgDuration: 0');
    });
  });

  describe('duplicate slug handling', () => {
    it('appends -2 suffix when slug exists', async () => {
      vol.mkdirSync('/project/.harshJudge/scenarios/my-test', { recursive: true });

      const result = await handleSaveScenario(
        {
          slug: 'my-test',
          title: 'My Test',
          content: '# Content',
        },
        fs
      );

      expect(result.slug).toBe('my-test-2');
      expect(result.isNew).toBe(true);
      expect(vol.existsSync('/project/.harshJudge/scenarios/my-test-2')).toBe(true);
    });

    it('appends -3 suffix when slug and slug-2 exist', async () => {
      vol.mkdirSync('/project/.harshJudge/scenarios/duplicate', { recursive: true });
      vol.mkdirSync('/project/.harshJudge/scenarios/duplicate-2', { recursive: true });

      const result = await handleSaveScenario(
        {
          slug: 'duplicate',
          title: 'Duplicate Test',
          content: 'Content',
        },
        fs
      );

      expect(result.slug).toBe('duplicate-3');
    });

    it('handles multiple consecutive duplicates', async () => {
      vol.mkdirSync('/project/.harshJudge/scenarios/series', { recursive: true });
      vol.mkdirSync('/project/.harshJudge/scenarios/series-2', { recursive: true });
      vol.mkdirSync('/project/.harshJudge/scenarios/series-3', { recursive: true });
      vol.mkdirSync('/project/.harshJudge/scenarios/series-4', { recursive: true });

      const result = await handleSaveScenario(
        {
          slug: 'series',
          title: 'Series Test',
          content: 'Content',
        },
        fs
      );

      expect(result.slug).toBe('series-5');
    });
  });

  describe('error handling', () => {
    it('throws error if project not initialized', async () => {
      vol.reset();
      vol.mkdirSync('/project', { recursive: true });
      const freshFs = new FileSystemService('/project');

      await expect(
        handleSaveScenario(
          { slug: 'test', title: 'Test', content: 'Content' },
          freshFs
        )
      ).rejects.toThrow('not initialized');
    });

    it('throws validation error if slug is missing', async () => {
      await expect(
        handleSaveScenario({ title: 'Test', content: 'Content' }, fs)
      ).rejects.toThrow();
    });

    it('throws validation error if title is missing', async () => {
      await expect(
        handleSaveScenario({ slug: 'test', content: 'Content' }, fs)
      ).rejects.toThrow();
    });

    it('throws validation error if content is missing', async () => {
      await expect(
        handleSaveScenario({ slug: 'test', title: 'Test' }, fs)
      ).rejects.toThrow();
    });

    it('throws validation error if slug has invalid characters', async () => {
      await expect(
        handleSaveScenario(
          { slug: 'Invalid_Slug!', title: 'Test', content: 'Content' },
          fs
        )
      ).rejects.toThrow('Slug must be lowercase');
    });

    it('throws validation error if slug has uppercase', async () => {
      await expect(
        handleSaveScenario(
          { slug: 'Invalid-Slug', title: 'Test', content: 'Content' },
          fs
        )
      ).rejects.toThrow('Slug must be lowercase');
    });

    it('throws validation error if title is empty', async () => {
      await expect(
        handleSaveScenario({ slug: 'test', title: '', content: 'Content' }, fs)
      ).rejects.toThrow();
    });

    it('throws validation error if content is empty', async () => {
      await expect(
        handleSaveScenario({ slug: 'test', title: 'Test', content: '' }, fs)
      ).rejects.toThrow();
    });

    it('throws validation error if title is too long', async () => {
      const longTitle = 'a'.repeat(201);
      await expect(
        handleSaveScenario(
          { slug: 'test', title: longTitle, content: 'Content' },
          fs
        )
      ).rejects.toThrow();
    });

    it('throws validation error if estimatedDuration is negative', async () => {
      await expect(
        handleSaveScenario(
          {
            slug: 'test',
            title: 'Test',
            content: 'Content',
            estimatedDuration: -10,
          },
          fs
        )
      ).rejects.toThrow();
    });

    it('throws validation error if estimatedDuration is zero', async () => {
      await expect(
        handleSaveScenario(
          {
            slug: 'test',
            title: 'Test',
            content: 'Content',
            estimatedDuration: 0,
          },
          fs
        )
      ).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('accepts slug with numbers and hyphens', async () => {
      const result = await handleSaveScenario(
        {
          slug: 'test-123-scenario',
          title: 'Test',
          content: 'Content',
        },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.slug).toBe('test-123-scenario');
    });

    it('handles empty tags array', async () => {
      const result = await handleSaveScenario(
        {
          slug: 'empty-tags',
          title: 'Empty Tags',
          content: 'Content',
          tags: [],
        },
        fs
      );

      expect(result.success).toBe(true);
      const content = vol.readFileSync(
        '/project/.harshJudge/scenarios/empty-tags/scenario.md',
        'utf-8'
      ) as string;
      expect(content).toContain('tags: []');
    });

    it('handles single tag', async () => {
      await handleSaveScenario(
        {
          slug: 'single-tag',
          title: 'Single Tag',
          content: 'Content',
          tags: ['critical'],
        },
        fs
      );

      const content = vol.readFileSync(
        '/project/.harshJudge/scenarios/single-tag/scenario.md',
        'utf-8'
      ) as string;
      expect(content).toContain('tags: [critical]');
    });

    it('handles large content', async () => {
      const largeContent = '# Large\n' + 'Line\n'.repeat(1000);
      const result = await handleSaveScenario(
        {
          slug: 'large-content',
          title: 'Large Content',
          content: largeContent,
        },
        fs
      );

      expect(result.success).toBe(true);
      const savedContent = vol.readFileSync(
        '/project/.harshJudge/scenarios/large-content/scenario.md',
        'utf-8'
      ) as string;
      expect(savedContent).toContain(largeContent);
    });
  });
});
