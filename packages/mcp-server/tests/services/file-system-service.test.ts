import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { FileSystemService, generateStepMarkdown } from '../../src/services/file-system-service.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('FileSystemService', () => {
  let fs: FileSystemService;

  beforeEach(() => {
    vol.reset();
    fs = new FileSystemService('/test');
  });

  describe('ensureDir()', () => {
    it('creates a directory', async () => {
      await fs.ensureDir('mydir');
      expect(vol.existsSync('/test/mydir')).toBe(true);
    });

    it('creates nested directories recursively', async () => {
      await fs.ensureDir('a/b/c/d');
      expect(vol.existsSync('/test/a/b/c/d')).toBe(true);
    });

    it('does not throw if directory already exists', async () => {
      vol.mkdirSync('/test/existing', { recursive: true });
      await expect(fs.ensureDir('existing')).resolves.not.toThrow();
    });
  });

  describe('exists()', () => {
    it('returns true if path exists', async () => {
      vol.mkdirSync('/test/exists', { recursive: true });
      expect(await fs.exists('exists')).toBe(true);
    });

    it('returns false if path does not exist', async () => {
      expect(await fs.exists('nonexistent')).toBe(false);
    });

    it('returns true for files', async () => {
      vol.mkdirSync('/test', { recursive: true });
      vol.writeFileSync('/test/file.txt', 'content');
      expect(await fs.exists('file.txt')).toBe(true);
    });
  });

  describe('writeFile()', () => {
    it('writes content to a file', async () => {
      await fs.writeFile('output.txt', 'hello world');
      expect(vol.readFileSync('/test/output.txt', 'utf-8')).toBe('hello world');
    });

    it('creates parent directories if they do not exist', async () => {
      await fs.writeFile('deep/nested/file.txt', 'content');
      expect(vol.existsSync('/test/deep/nested/file.txt')).toBe(true);
      expect(vol.readFileSync('/test/deep/nested/file.txt', 'utf-8')).toBe('content');
    });

    it('overwrites existing files', async () => {
      vol.mkdirSync('/test', { recursive: true });
      vol.writeFileSync('/test/overwrite.txt', 'old');
      await fs.writeFile('overwrite.txt', 'new');
      expect(vol.readFileSync('/test/overwrite.txt', 'utf-8')).toBe('new');
    });
  });

  describe('readFile()', () => {
    it('reads file content as string', async () => {
      vol.mkdirSync('/test', { recursive: true });
      vol.writeFileSync('/test/read.txt', 'test content');
      const content = await fs.readFile('read.txt');
      expect(content).toBe('test content');
    });
  });

  describe('writeYaml()', () => {
    it('writes object as YAML', async () => {
      await fs.writeYaml('config.yaml', { name: 'test', count: 42 });
      const content = vol.readFileSync('/test/config.yaml', 'utf-8');
      expect(content).toContain('name: test');
      expect(content).toContain('count: 42');
    });

    it('creates parent directories', async () => {
      await fs.writeYaml('subdir/config.yaml', { key: 'value' });
      expect(vol.existsSync('/test/subdir/config.yaml')).toBe(true);
    });
  });

  describe('readYaml()', () => {
    it('reads and parses YAML file', async () => {
      vol.mkdirSync('/test', { recursive: true });
      vol.writeFileSync('/test/data.yaml', 'name: hello\ncount: 10\n');
      const data = await fs.readYaml<{ name: string; count: number }>('data.yaml');
      expect(data.name).toBe('hello');
      expect(data.count).toBe(10);
    });
  });

  describe('writeJson()', () => {
    it('writes object as formatted JSON', async () => {
      await fs.writeJson('data.json', { key: 'value', num: 123 });
      const content = vol.readFileSync('/test/data.json', 'utf-8');
      const parsed = JSON.parse(content);
      expect(parsed.key).toBe('value');
      expect(parsed.num).toBe(123);
    });
  });

  describe('readJson()', () => {
    it('reads and parses JSON file', async () => {
      vol.mkdirSync('/test', { recursive: true });
      vol.writeFileSync('/test/data.json', '{"a": 1, "b": "two"}');
      const data = await fs.readJson<{ a: number; b: string }>('data.json');
      expect(data.a).toBe(1);
      expect(data.b).toBe('two');
    });
  });

  describe('listDirs()', () => {
    it('lists subdirectories', async () => {
      vol.mkdirSync('/test/parent/dir1', { recursive: true });
      vol.mkdirSync('/test/parent/dir2', { recursive: true });
      vol.writeFileSync('/test/parent/file.txt', 'ignored');

      const dirs = await fs.listDirs('parent');
      expect(dirs).toContain('dir1');
      expect(dirs).toContain('dir2');
      expect(dirs).not.toContain('file.txt');
    });
  });

  // ============================================================
  // Step File Operations (v2)
  // ============================================================

  describe('ensureStepsDir()', () => {
    it('creates steps directory for scenario', async () => {
      await fs.ensureStepsDir('login-flow');
      expect(vol.existsSync('/test/.harshJudge/scenarios/login-flow/steps')).toBe(true);
    });
  });

  describe('writeStepFile()', () => {
    it('writes step file with correct path', async () => {
      const content = '# Step 01: Navigate';
      const path = await fs.writeStepFile('login-flow', '01', 'navigate', content);
      expect(path).toBe('.harshJudge/scenarios/login-flow/steps/01-navigate.md');
      expect(vol.readFileSync('/test/.harshJudge/scenarios/login-flow/steps/01-navigate.md', 'utf-8')).toBe(content);
    });
  });

  describe('readStepFile()', () => {
    it('reads step file content', async () => {
      vol.mkdirSync('/test/.harshJudge/scenarios/login-flow/steps', { recursive: true });
      vol.writeFileSync('/test/.harshJudge/scenarios/login-flow/steps/01-navigate.md', '# Step content');
      const content = await fs.readStepFile('login-flow', '01-navigate.md');
      expect(content).toBe('# Step content');
    });
  });

  describe('listStepFiles()', () => {
    it('lists step files sorted', async () => {
      vol.mkdirSync('/test/.harshJudge/scenarios/login-flow/steps', { recursive: true });
      vol.writeFileSync('/test/.harshJudge/scenarios/login-flow/steps/02-submit.md', '');
      vol.writeFileSync('/test/.harshJudge/scenarios/login-flow/steps/01-navigate.md', '');
      vol.writeFileSync('/test/.harshJudge/scenarios/login-flow/steps/10-verify.md', '');

      const files = await fs.listStepFiles('login-flow');
      expect(files).toEqual(['01-navigate.md', '02-submit.md', '10-verify.md']);
    });

    it('returns empty array if steps dir does not exist', async () => {
      const files = await fs.listStepFiles('nonexistent');
      expect(files).toEqual([]);
    });

    it('filters out non-step files', async () => {
      vol.mkdirSync('/test/.harshJudge/scenarios/login-flow/steps', { recursive: true });
      vol.writeFileSync('/test/.harshJudge/scenarios/login-flow/steps/01-navigate.md', '');
      vol.writeFileSync('/test/.harshJudge/scenarios/login-flow/steps/readme.md', '');
      vol.writeFileSync('/test/.harshJudge/scenarios/login-flow/steps/notes.txt', '');

      const files = await fs.listStepFiles('login-flow');
      expect(files).toEqual(['01-navigate.md']);
    });
  });

  describe('getStepsPath()', () => {
    it('returns correct steps path', () => {
      const path = fs.getStepsPath('login-flow');
      expect(path).toBe('.harshJudge/scenarios/login-flow/steps');
    });
  });
});

describe('generateStepMarkdown', () => {
  it('generates step markdown with all sections', () => {
    const step = {
      id: '01',
      title: 'Navigate to Login Page',
      description: 'Navigate to the login page and verify it loads.',
      preconditions: '- Application is running\n- User is logged out',
      actions: '1. Navigate to /login\n2. Wait for page load',
      expectedOutcome: '- Login form is visible\n- No errors displayed',
    };

    const markdown = generateStepMarkdown(step);

    expect(markdown).toContain('# Step 01: Navigate to Login Page');
    expect(markdown).toContain('## Description');
    expect(markdown).toContain('Navigate to the login page and verify it loads.');
    expect(markdown).toContain('## Preconditions');
    expect(markdown).toContain('- Application is running');
    expect(markdown).toContain('## Actions');
    expect(markdown).toContain('1. Navigate to /login');
    expect(markdown).toContain('**Playwright:**');
    expect(markdown).toContain('```javascript');
    expect(markdown).toContain('## Expected Outcome');
    expect(markdown).toContain('- Login form is visible');
  });

  it('includes Playwright code placeholder', () => {
    const step = {
      id: '02',
      title: 'Enter Credentials',
      description: 'Enter user credentials',
      preconditions: 'Login page is loaded',
      actions: 'Type username and password',
      expectedOutcome: 'Fields are filled',
    };

    const markdown = generateStepMarkdown(step);
    expect(markdown).toContain('// Add Playwright code here');
  });
});
