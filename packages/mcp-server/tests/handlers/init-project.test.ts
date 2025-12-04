import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { handleInitProject } from '../../src/handlers/init-project.js';
import { FileSystemService } from '../../src/services/file-system-service.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('handleInitProject', () => {
  let fs: FileSystemService;

  beforeEach(() => {
    vol.reset();
    vol.mkdirSync('/project', { recursive: true });
    fs = new FileSystemService('/project');
  });

  describe('successful initialization', () => {
    it('creates .harshJudge directory structure', async () => {
      const result = await handleInitProject(
        {
          projectName: 'Test Project',
          baseUrl: 'http://localhost:3000',
        },
        fs
      );

      expect(result.success).toBe(true);
      expect(vol.existsSync('/project/.harshJudge')).toBe(true);
      expect(vol.existsSync('/project/.harshJudge/scenarios')).toBe(true);
      expect(vol.existsSync('/project/.harshJudge/config.yaml')).toBe(true);
      expect(vol.existsSync('/project/.harshJudge/.gitignore')).toBe(true);
    });

    it('returns correct paths', async () => {
      const result = await handleInitProject(
        { projectName: 'Test Project' },
        fs
      );

      expect(result.projectPath).toBe('.harshJudge');
      expect(result.configPath).toBe('.harshJudge/config.yaml');
      expect(result.scenariosPath).toBe('.harshJudge/scenarios');
    });

    it('writes config.yaml with correct content', async () => {
      await handleInitProject(
        {
          projectName: 'My App',
          baseUrl: 'http://localhost:8080',
        },
        fs
      );

      const configContent = vol.readFileSync(
        '/project/.harshJudge/config.yaml',
        'utf-8'
      ) as string;

      expect(configContent).toContain('projectName: My App');
      expect(configContent).toContain('baseUrl: http://localhost:8080');
      expect(configContent).toContain("version: '1.0'");
      expect(configContent).toContain('createdAt:');
    });

    it('writes config with empty baseUrl when not provided', async () => {
      await handleInitProject({ projectName: 'Test' }, fs);

      const configContent = vol.readFileSync(
        '/project/.harshJudge/config.yaml',
        'utf-8'
      ) as string;

      expect(configContent).toContain("baseUrl: ''");
    });

    it('writes .gitignore with correct content', async () => {
      await handleInitProject({ projectName: 'Test' }, fs);

      const gitignore = vol.readFileSync(
        '/project/.harshJudge/.gitignore',
        'utf-8'
      ) as string;

      expect(gitignore).toContain('# HarshJudge');
      expect(gitignore).toContain('scenarios/*/runs/*/evidence/*.png');
      expect(gitignore).toContain('scenarios/*/runs/*/evidence/*.html');
    });
  });

  describe('error handling', () => {
    it('throws error if .harshJudge already exists', async () => {
      vol.mkdirSync('/project/.harshJudge', { recursive: true });

      await expect(
        handleInitProject({ projectName: 'Test' }, fs)
      ).rejects.toThrow('already initialized');
    });

    it('throws validation error if projectName is missing', async () => {
      await expect(handleInitProject({}, fs)).rejects.toThrow();
    });

    it('throws validation error if projectName is empty', async () => {
      await expect(
        handleInitProject({ projectName: '' }, fs)
      ).rejects.toThrow();
    });

    it('throws validation error if projectName is too long', async () => {
      const longName = 'a'.repeat(101);
      await expect(
        handleInitProject({ projectName: longName }, fs)
      ).rejects.toThrow();
    });

    it('throws validation error if baseUrl is invalid', async () => {
      await expect(
        handleInitProject(
          { projectName: 'Test', baseUrl: 'not-a-url' },
          fs
        )
      ).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('accepts valid baseUrl with https', async () => {
      const result = await handleInitProject(
        {
          projectName: 'Test',
          baseUrl: 'https://example.com',
        },
        fs
      );

      expect(result.success).toBe(true);
    });

    it('accepts projectName with special characters', async () => {
      const result = await handleInitProject(
        { projectName: 'My App (v2.0) - Testing' },
        fs
      );

      expect(result.success).toBe(true);
    });
  });
});
