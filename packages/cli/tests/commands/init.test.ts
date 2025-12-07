/**
 * Tests for init command
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { initCommand } from '../../src/commands/init.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('init command', () => {
  beforeEach(() => {
    vol.reset();
    // Set up an empty directory as CWD
    vol.mkdirSync('/test-project', { recursive: true });
    vi.spyOn(process, 'cwd').mockReturnValue('/test-project');
  });

  it('creates .harshJudge directory structure', async () => {
    await initCommand({ name: 'Test Project', url: 'http://localhost:3000', skipSkills: true });

    expect(vol.existsSync('/test-project/.harshJudge')).toBe(true);
    expect(vol.existsSync('/test-project/.harshJudge/scenarios')).toBe(true);
    expect(vol.existsSync('/test-project/.harshJudge/config.yaml')).toBe(true);
    expect(vol.existsSync('/test-project/.harshJudge/.gitignore')).toBe(true);
  });

  it('writes correct config.yaml content', async () => {
    await initCommand({ name: 'My App', url: 'http://localhost:8080', skipSkills: true });

    const configContent = vol.readFileSync('/test-project/.harshJudge/config.yaml', 'utf-8') as string;
    expect(configContent).toContain('projectName: My App');
    expect(configContent).toContain('baseUrl: http://localhost:8080');
    expect(configContent).toContain('version:');
    expect(configContent).toContain('createdAt:');
  });

  it('skips initialization if .harshJudge already exists', async () => {
    // Create existing directory
    vol.mkdirSync('/test-project/.harshJudge', { recursive: true });
    vol.writeFileSync('/test-project/.harshJudge/config.yaml', 'projectName: Existing\n');

    await initCommand({ name: 'New Project', skipSkills: true });

    // Should not overwrite
    const configContent = vol.readFileSync('/test-project/.harshJudge/config.yaml', 'utf-8') as string;
    expect(configContent).toContain('projectName: Existing');
  });

  it('uses default values when options not provided', async () => {
    // Create package.json for project name detection
    vol.writeFileSync('/test-project/package.json', JSON.stringify({ name: 'my-package' }));

    await initCommand({ skipSkills: true });

    const configContent = vol.readFileSync('/test-project/.harshJudge/config.yaml', 'utf-8') as string;
    expect(configContent).toContain('projectName: my-package');
    expect(configContent).toContain('baseUrl: http://localhost:3000');
  });
});
