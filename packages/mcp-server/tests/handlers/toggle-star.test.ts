import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { handleToggleStar } from '../../src/handlers/toggle-star.js';
import { FileSystemService } from '../../src/services/file-system-service.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('handleToggleStar', () => {
  let fs: FileSystemService;

  beforeEach(() => {
    vol.reset();
    // Initialize project with a scenario
    vol.mkdirSync('/project/.harshJudge/scenarios/test-scenario', { recursive: true });
    vol.writeFileSync(
      '/project/.harshJudge/scenarios/test-scenario/meta.yaml',
      'title: Test\nslug: test-scenario\nstarred: false\ntotalRuns: 0\npassCount: 0\nfailCount: 0\n'
    );
    fs = new FileSystemService('/project');
  });

  describe('toggling', () => {
    it('toggles starred from false to true', async () => {
      const result = await handleToggleStar(
        {
          scenarioSlug: 'test-scenario',
        },
        fs
      );

      expect(result.success).toBe(true);
      expect(result.starred).toBe(true);
      expect(result.slug).toBe('test-scenario');

      // Verify meta.yaml was updated
      const metaContent = vol.readFileSync(
        '/project/.harshJudge/scenarios/test-scenario/meta.yaml',
        'utf-8'
      ) as string;
      expect(metaContent).toContain('starred: true');
    });

    it('toggles starred from true to false', async () => {
      // Set starred to true first
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/test-scenario/meta.yaml',
        'title: Test\nslug: test-scenario\nstarred: true\ntotalRuns: 0\npassCount: 0\nfailCount: 0\n'
      );

      const result = await handleToggleStar(
        {
          scenarioSlug: 'test-scenario',
        },
        fs
      );

      expect(result.starred).toBe(false);
    });

    it('toggles multiple times correctly', async () => {
      const result1 = await handleToggleStar({ scenarioSlug: 'test-scenario' }, fs);
      expect(result1.starred).toBe(true);

      const result2 = await handleToggleStar({ scenarioSlug: 'test-scenario' }, fs);
      expect(result2.starred).toBe(false);

      const result3 = await handleToggleStar({ scenarioSlug: 'test-scenario' }, fs);
      expect(result3.starred).toBe(true);
    });
  });

  describe('explicit setting', () => {
    it('sets starred to true explicitly', async () => {
      const result = await handleToggleStar(
        {
          scenarioSlug: 'test-scenario',
          starred: true,
        },
        fs
      );

      expect(result.starred).toBe(true);
    });

    it('sets starred to false explicitly', async () => {
      // Start with starred: true
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/test-scenario/meta.yaml',
        'title: Test\nslug: test-scenario\nstarred: true\ntotalRuns: 0\npassCount: 0\nfailCount: 0\n'
      );

      const result = await handleToggleStar(
        {
          scenarioSlug: 'test-scenario',
          starred: false,
        },
        fs
      );

      expect(result.starred).toBe(false);
    });

    it('setting same value is idempotent', async () => {
      // Set to true twice
      await handleToggleStar({ scenarioSlug: 'test-scenario', starred: true }, fs);
      const result = await handleToggleStar(
        { scenarioSlug: 'test-scenario', starred: true },
        fs
      );

      expect(result.starred).toBe(true);
    });
  });

  describe('error handling', () => {
    it('throws error if project not initialized', async () => {
      vol.reset();
      vol.mkdirSync('/project', { recursive: true });
      const freshFs = new FileSystemService('/project');

      await expect(
        handleToggleStar({ scenarioSlug: 'test' }, freshFs)
      ).rejects.toThrow('not initialized');
    });

    it('throws error if scenario does not exist', async () => {
      await expect(
        handleToggleStar({ scenarioSlug: 'nonexistent' }, fs)
      ).rejects.toThrow('does not exist');
    });

    it('throws error if scenario has no meta.yaml', async () => {
      vol.mkdirSync('/project/.harshJudge/scenarios/no-meta', { recursive: true });
      // No meta.yaml created

      await expect(handleToggleStar({ scenarioSlug: 'no-meta' }, fs)).rejects.toThrow(
        'no meta.yaml'
      );
    });

    it('throws validation error if scenarioSlug is invalid', async () => {
      await expect(
        handleToggleStar({ scenarioSlug: 'Invalid Slug!' }, fs)
      ).rejects.toThrow();
    });
  });

  describe('preserves other meta fields', () => {
    it('preserves statistics and other fields when toggling', async () => {
      vol.writeFileSync(
        '/project/.harshJudge/scenarios/test-scenario/meta.yaml',
        'title: My Test\nslug: test-scenario\nstarred: false\ntotalRuns: 10\npassCount: 8\nfailCount: 2\navgDuration: 5000\n'
      );

      await handleToggleStar({ scenarioSlug: 'test-scenario' }, fs);

      const metaContent = vol.readFileSync(
        '/project/.harshJudge/scenarios/test-scenario/meta.yaml',
        'utf-8'
      ) as string;

      expect(metaContent).toContain('title: My Test');
      expect(metaContent).toContain('totalRuns: 10');
      expect(metaContent).toContain('passCount: 8');
      expect(metaContent).toContain('starred: true');
    });
  });
});
