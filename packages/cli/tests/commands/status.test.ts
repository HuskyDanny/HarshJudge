/**
 * Tests for status command
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { vol } from 'memfs';
import { statusCommand } from '../../src/commands/status.js';

// Mock fs/promises with memfs
vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('status command', () => {
  beforeEach(() => {
    vol.reset();
    vol.mkdirSync('/test-project', { recursive: true });
    vi.spyOn(process, 'cwd').mockReturnValue('/test-project');
  });

  it('shows uninitialized message when .harshJudge does not exist', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await statusCommand({});

    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls.flat().join('\n');
    expect(output).toContain('not initialized');

    consoleSpy.mockRestore();
  });

  it('reads project config and displays status', async () => {
    // Set up .harshJudge directory
    vol.mkdirSync('/test-project/.harshJudge/scenarios', { recursive: true });
    vol.writeFileSync('/test-project/.harshJudge/config.yaml', `
projectName: Test App
baseUrl: http://localhost:3000
version: "1.0"
createdAt: "2025-12-07T00:00:00Z"
`);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await statusCommand({});

    const output = consoleSpy.mock.calls.flat().join('\n');
    expect(output).toContain('Test App');
    expect(output).toContain('http://localhost:3000');

    consoleSpy.mockRestore();
  });

  it('counts scenarios and their status', async () => {
    // Set up .harshJudge with scenarios
    vol.mkdirSync('/test-project/.harshJudge/scenarios/login-flow', { recursive: true });
    vol.mkdirSync('/test-project/.harshJudge/scenarios/checkout', { recursive: true });

    vol.writeFileSync('/test-project/.harshJudge/config.yaml', `
projectName: Test App
baseUrl: http://localhost:3000
version: "1.0"
createdAt: "2025-12-07T00:00:00Z"
`);

    vol.writeFileSync('/test-project/.harshJudge/scenarios/login-flow/meta.yaml', `
totalRuns: 5
passCount: 4
failCount: 1
lastRun: "2025-12-07T10:00:00Z"
lastResult: pass
avgDuration: 3000
`);

    vol.writeFileSync('/test-project/.harshJudge/scenarios/checkout/meta.yaml', `
totalRuns: 2
passCount: 0
failCount: 2
lastRun: "2025-12-07T09:00:00Z"
lastResult: fail
avgDuration: 5000
`);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await statusCommand({});

    const output = consoleSpy.mock.calls.flat().join('\n');
    expect(output).toContain('2'); // 2 scenarios
    expect(output).toContain('failing');

    consoleSpy.mockRestore();
  });

  it('outputs JSON when --json flag is used', async () => {
    vol.mkdirSync('/test-project/.harshJudge/scenarios', { recursive: true });
    vol.writeFileSync('/test-project/.harshJudge/config.yaml', `
projectName: JSON Test
baseUrl: http://localhost:8080
version: "1.0"
createdAt: "2025-12-07T00:00:00Z"
`);

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await statusCommand({ json: true });

    const output = consoleSpy.mock.calls[0]?.[0] ?? '';
    const parsed = JSON.parse(output);

    expect(parsed.initialized).toBe(true);
    expect(parsed.projectName).toBe('JSON Test');
    expect(parsed.scenarioCount).toBe(0);

    consoleSpy.mockRestore();
  });
});
