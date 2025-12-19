import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Use dynamic imports to avoid hoisting issues
const mockReadFile = vi.fn();
const mockReaddir = vi.fn();
const mockStat = vi.fn();

vi.mock('fs/promises', () => ({
  readFile: mockReadFile,
  readdir: mockReaddir,
  stat: mockStat,
  default: {
    readFile: mockReadFile,
    readdir: mockReaddir,
    stat: mockStat,
  },
}));

// Import after mocking
const { DataService } = await import('../../src/services/DataService');

describe('DataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getProjects', () => {
    it('returns empty array when .harshJudge does not exist', async () => {
      mockStat.mockRejectedValue(new Error('ENOENT'));
      const service = new DataService('.');

      const result = await service.getProjects();

      expect(result).toEqual([]);
    });

    it('returns project when .harshJudge exists with config', async () => {
      // stat succeeds for .harshJudge
      mockStat.mockImplementation(async (path: string) => {
        if (path.includes('.harshJudge')) {
          return { isDirectory: () => true };
        }
        throw new Error('ENOENT');
      });

      // readFile returns config
      mockReadFile.mockImplementation(async (path: string) => {
        if (path.includes('config.yaml')) {
          return `projectName: "Test App"\nbaseUrl: "http://localhost:3000"`;
        }
        throw new Error('ENOENT');
      });

      // readdir returns empty scenarios
      mockReaddir.mockImplementation(async () => {
        return [];
      });

      const service = new DataService('.');
      const result = await service.getProjects();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test App');
      expect(result[0].scenarioCount).toBe(0);
      expect(result[0].overallStatus).toBe('never_run');
    });
  });

  describe('getScenarios', () => {
    it('returns empty array when scenarios directory does not exist', async () => {
      mockStat.mockRejectedValue(new Error('ENOENT'));
      const service = new DataService('.');

      const result = await service.getScenarios('./.harshJudge');

      expect(result).toEqual([]);
    });

    it('returns scenarios with correct summary data', async () => {
      mockStat.mockResolvedValue({ isDirectory: () => true });

      // Mock readdir to return scenario directories with withFileTypes
      mockReaddir.mockImplementation(async (path: string) => {
        if (path.endsWith('scenarios')) {
          return [
            { name: 'login', isDirectory: () => true },
          ];
        }
        return [];
      });

      mockReadFile.mockImplementation(async (path: string) => {
        if (path.includes('scenario.md')) {
          return `---\ntitle: Login Test\ntags: [auth, critical]\n---\n# Steps`;
        }
        if (path.includes('meta.yaml')) {
          return `totalRuns: 5\npassCount: 4\nfailCount: 1\nlastResult: pass\nlastRun: "2025-01-02T10:00:00Z"\navgDuration: 3000`;
        }
        throw new Error('ENOENT');
      });

      const service = new DataService('.');
      const result = await service.getScenarios('./.harshJudge');

      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('login');
      expect(result[0].title).toBe('Login Test');
      expect(result[0].tags).toEqual(['auth', 'critical']);
      expect(result[0].passRate).toBe(80);
    });

    it('handles missing meta.yaml gracefully', async () => {
      mockStat.mockResolvedValue({ isDirectory: () => true });

      mockReaddir.mockImplementation(async () => {
        return [{ name: 'login', isDirectory: () => true }];
      });

      mockReadFile.mockImplementation(async (path: string) => {
        if (path.includes('scenario.md')) {
          return `---\ntitle: Login Test\ntags: []\n---\n# Steps`;
        }
        throw new Error('ENOENT');
      });

      const service = new DataService('.');
      const result = await service.getScenarios('./.harshJudge');

      expect(result).toHaveLength(1);
      expect(result[0].totalRuns).toBe(0);
      expect(result[0].lastResult).toBeNull();
    });
  });

  describe('getScenarioDetail', () => {
    it('returns null when scenario does not exist', async () => {
      mockStat.mockRejectedValue(new Error('ENOENT'));
      const service = new DataService('.');

      const result = await service.getScenarioDetail('./.harshJudge', 'nonexistent');

      expect(result).toBeNull();
    });

    it('returns scenario detail with runs', async () => {
      mockStat.mockResolvedValue({ isDirectory: () => true });

      mockReadFile.mockImplementation(async (path: string) => {
        if (path.includes('scenario.md')) {
          return `---\ntitle: Login Test\ntags: [auth]\n---\n# Overview\nTest login flow.`;
        }
        if (path.includes('meta.yaml')) {
          return `totalRuns: 2\npassCount: 1\nfailCount: 1\nlastResult: pass\nlastRun: "2025-01-01"\navgDuration: 3000`;
        }
        if (path.includes('result.json')) {
          return JSON.stringify({
            runId: 'abc123',
            status: 'pass',
            duration: 3000,
            completedAt: '2025-01-01T10:00:00Z',
            failedStep: null,
            errorMessage: null,
          });
        }
        throw new Error('ENOENT');
      });

      mockReaddir.mockImplementation(async (path: string) => {
        if (path.includes('runs') && !path.includes('abc123')) {
          return [{ name: 'abc123', isDirectory: () => true }];
        }
        return [];
      });

      const service = new DataService('.');
      const result = await service.getScenarioDetail('./.harshJudge', 'login');

      expect(result).not.toBeNull();
      expect(result!.slug).toBe('login');
      expect(result!.title).toBe('Login Test');
      expect(result!.content).toContain('Test login flow.');
      expect(result!.meta.totalRuns).toBe(2);
      expect(result!.recentRuns).toHaveLength(1);
      expect(result!.recentRuns[0].id).toBe('abc123');
    });
  });

  describe('getRunDetail', () => {
    it('returns null when run does not exist', async () => {
      mockStat.mockRejectedValue(new Error('ENOENT'));
      const service = new DataService('.');

      const result = await service.getRunDetail('./.harshJudge', 'login', 'nonexistent');

      expect(result).toBeNull();
    });

    it('returns run detail with evidence paths (v1 flat structure)', async () => {
      mockStat.mockResolvedValue({ isDirectory: () => true });

      mockReadFile.mockImplementation(async (path: string) => {
        if (path.includes('result.json')) {
          return JSON.stringify({
            runId: 'abc123',
            status: 'pass',
            duration: 3000,
            completedAt: '2025-01-01T10:00:00Z',
            failedStep: null,
            errorMessage: null,
          });
        }
        throw new Error('ENOENT');
      });

      // First call with withFileTypes: run dir (no step-* dirs = v1)
      // Second call without withFileTypes: evidence dir
      let readdirCallCount = 0;
      mockReaddir.mockImplementation(async (_path: string, options?: { withFileTypes?: boolean }) => {
        readdirCallCount++;
        if (options?.withFileTypes) {
          // First call: check for step-* directories (none = v1 structure)
          return [];
        }
        // Second call: list evidence files
        return ['step-01-screenshot.png', 'step-01-screenshot.meta.json', 'step-02-screenshot.png'];
      });

      const service = new DataService('.');
      const result = await service.getRunDetail('./.harshJudge', 'login', 'abc123');

      expect(result).not.toBeNull();
      expect(result!.runId).toBe('abc123');
      expect(result!.result!.status).toBe('pass');
      // Should only include actual evidence files, not .meta.json
      expect(result!.evidencePaths).toHaveLength(2);
    });

    it('returns run detail with evidence paths (v2 per-step structure)', async () => {
      mockStat.mockResolvedValue({ isDirectory: () => true });

      mockReadFile.mockImplementation(async (path: string) => {
        if (path.includes('result.json')) {
          return JSON.stringify({
            runId: 'abc123',
            status: 'pass',
            duration: 3000,
            completedAt: '2025-01-01T10:00:00Z',
            failedStep: null,
            errorMessage: null,
          });
        }
        throw new Error('ENOENT');
      });

      mockReaddir.mockImplementation(async (_path: string, options?: { withFileTypes?: boolean }) => {
        if (options?.withFileTypes) {
          // Return step directories with Dirent-like objects
          return [
            { name: 'step-01', isDirectory: () => true },
            { name: 'step-02', isDirectory: () => true },
            { name: 'result.json', isDirectory: () => false },
          ];
        }
        // Return evidence files for each step directory
        return ['before.png', 'after.png'];
      });

      const service = new DataService('.');
      const result = await service.getRunDetail('./.harshJudge', 'login', 'abc123');

      expect(result).not.toBeNull();
      expect(result!.runId).toBe('abc123');
      // 2 steps * 2 files each = 4 evidence files
      expect(result!.evidencePaths).toHaveLength(4);
    });

    it('handles missing result.json gracefully', async () => {
      mockStat.mockResolvedValue({ isDirectory: () => true });
      mockReadFile.mockRejectedValue(new Error('ENOENT'));

      mockReaddir.mockImplementation(async (_path: string, options?: { withFileTypes?: boolean }) => {
        if (options?.withFileTypes) {
          // No step-* dirs = v1 structure
          return [];
        }
        return ['step-01.png'];
      });

      const service = new DataService('.');
      const result = await service.getRunDetail('./.harshJudge', 'login', 'abc123');

      expect(result).not.toBeNull();
      expect(result!.result).toBeNull();
      expect(result!.evidencePaths).toHaveLength(1);
    });
  });
});
