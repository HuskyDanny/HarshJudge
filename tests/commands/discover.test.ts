import { describe, it, expect, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { buildTree, searchFiles } from '../../src/commands/discover.js';

const tmpBase = `/tmp/hj-discover-test-${Date.now()}`;

async function createTestStructure(base: string) {
  const hj = join(base, '.harshJudge');

  // config.yaml
  await mkdir(hj, { recursive: true });
  await writeFile(
    join(hj, 'config.yaml'),
    'projectName: My Project\nbaseUrl: http://localhost\nversion: 1\ncreatedAt: 2024-01-01\n'
  );

  // prd.md
  await writeFile(
    join(hj, 'prd.md'),
    '# PRD\nThis is the product requirements document.\n'
  );

  // scenarios/login-flow
  const scenarioDir = join(hj, 'scenarios', 'login-flow');
  const stepsDir = join(scenarioDir, 'steps');
  const runDir = join(scenarioDir, 'runs', 'abc123');
  const evidenceDir = join(runDir, 'step-01', 'evidence');

  await mkdir(stepsDir, { recursive: true });
  await mkdir(evidenceDir, { recursive: true });

  await writeFile(
    join(scenarioDir, 'meta.yaml'),
    'title: Login Flow\nslug: login-flow\nstarred: true\ntags: [auth]\nsteps: []\ntotalRuns: 5\npassCount: 4\nfailCount: 1\nlastRun: 2024-01-10\nlastResult: pass\navgDuration: 1200\n'
  );

  await writeFile(
    join(stepsDir, '01-navigate.md'),
    '# Navigate\nGo to the login page.\n'
  );
  await writeFile(
    join(stepsDir, '02-submit.md'),
    '# Submit\nFill and submit the form.\n'
  );

  await writeFile(
    join(runDir, 'result.json'),
    JSON.stringify({ status: 'pass', duration: 1234, runId: 'abc123' })
  );
  await writeFile(join(evidenceDir, 'screenshot.png'), 'fake-png-data');

  // scenarios/checkout — minimal, to test multi-scenario
  const checkoutDir = join(hj, 'scenarios', 'checkout');
  await mkdir(join(checkoutDir, 'steps'), { recursive: true });
  await mkdir(join(checkoutDir, 'runs'), { recursive: true });
  await writeFile(
    join(checkoutDir, 'meta.yaml'),
    'title: Checkout\nslug: checkout\nstarred: false\ntags: []\nsteps: []\ntotalRuns: 2\npassCount: 1\nfailCount: 1\nlastRun: 2024-01-09\nlastResult: fail\navgDuration: 800\n'
  );
}

afterEach(async () => {
  await rm(tmpBase, { recursive: true, force: true });
});

describe('buildTree', () => {
  it('returns tree with scenario metadata from meta.yaml', async () => {
    const base = join(tmpBase, 'test-basic');
    await createTestStructure(base);

    const result = await buildTree(base);

    // Top-level shape
    expect(result).toHaveProperty('root');
    expect(result).toHaveProperty('tree');

    // config.yaml metadata at root
    expect(result.tree['config.yaml']).toMatchObject({
      projectName: 'My Project',
    });

    // scenarios directory exists
    expect(result.tree).toHaveProperty('scenarios/');

    // login-flow scenario has metadata extracted
    const loginFlow = result.tree['scenarios/']['login-flow/'];
    expect(loginFlow).toBeDefined();
    expect(loginFlow['meta.yaml']).toMatchObject({
      title: 'Login Flow',
      starred: true,
      totalRuns: 5,
      lastResult: 'pass',
    });

    // steps listed
    expect(loginFlow['steps/']).toHaveProperty('01-navigate.md');
    expect(loginFlow['steps/']).toHaveProperty('02-submit.md');

    // runs listed
    expect(loginFlow['runs/']).toHaveProperty('abc123/');
    const run = loginFlow['runs/']['abc123/'];
    expect(run['result.json']).toMatchObject({
      status: 'pass',
      duration: 1234,
    });
  });

  it('returns subtree when path is specified', async () => {
    const base = join(tmpBase, 'test-subtree');
    await createTestStructure(base);

    const result = await buildTree(base, 'scenarios/login-flow');

    expect(result.root).toContain('scenarios/login-flow');
    // Top-level keys of the subtree are the login-flow contents
    expect(result.tree).toHaveProperty('meta.yaml');
    expect(result.tree).toHaveProperty('steps/');
    expect(result.tree).toHaveProperty('runs/');
    // Should NOT contain checkout scenario
    expect(result.tree).not.toHaveProperty('checkout/');
  });

  it('handles scenarios with no runs gracefully', async () => {
    const base = join(tmpBase, 'test-no-runs');
    await createTestStructure(base);

    const result = await buildTree(base, 'scenarios/checkout');
    expect(result.tree).toHaveProperty('meta.yaml');
    expect(result.tree['meta.yaml']).toMatchObject({
      title: 'Checkout',
      starred: false,
    });
    // runs/ directory exists but is empty
    expect(result.tree['runs/']).toBeDefined();
    expect(Object.keys(result.tree['runs/']).length).toBe(0);
  });
});

describe('searchFiles', () => {
  it('finds pattern matches in YAML files', async () => {
    const base = join(tmpBase, 'test-search-yaml');
    await createTestStructure(base);

    // "fail" appears in checkout/meta.yaml (lastResult: fail, failCount: 1)
    const result = await searchFiles(base, 'fail');

    expect(result).toHaveProperty('matches');
    expect(Array.isArray(result.matches)).toBe(true);
    expect(result.matches.length).toBeGreaterThan(0);

    const files = result.matches.map((m: any) => m.file);
    // At least one match from checkout meta.yaml
    expect(files.some((f: string) => f.includes('checkout'))).toBe(true);
  });

  it('finds pattern matches in JSON files', async () => {
    const base = join(tmpBase, 'test-search-json');
    await createTestStructure(base);

    // "abc123" appears in result.json
    const result = await searchFiles(base, 'abc123');

    expect(result.matches.length).toBeGreaterThan(0);
    const files = result.matches.map((m: any) => m.file);
    expect(files.some((f: string) => f.endsWith('result.json'))).toBe(true);
  });

  it('finds pattern matches in md files', async () => {
    const base = join(tmpBase, 'test-search-md');
    await createTestStructure(base);

    // "Navigate" appears in 01-navigate.md
    const result = await searchFiles(base, 'navigate');

    expect(result.matches.length).toBeGreaterThan(0);
    const files = result.matches.map((m: any) => m.file);
    expect(files.some((f: string) => f.includes('navigate'))).toBe(true);
  });

  it('is case-insensitive', async () => {
    const base = join(tmpBase, 'test-search-case');
    await createTestStructure(base);

    const lower = await searchFiles(base, 'login');
    const upper = await searchFiles(base, 'LOGIN');

    expect(lower.matches.length).toBe(upper.matches.length);
    expect(lower.matches.length).toBeGreaterThan(0);
  });

  it('restricts search to subfolder when subPath is provided', async () => {
    const base = join(tmpBase, 'test-search-subpath');
    await createTestStructure(base);

    // Only search within login-flow
    const result = await searchFiles(base, 'pass', 'scenarios/login-flow');

    expect(result.matches.length).toBeGreaterThan(0);
    // All matches should be under login-flow
    result.matches.forEach((m: any) => {
      expect(m.file).toContain('login-flow');
    });
  });

  it('returns empty matches when pattern not found', async () => {
    const base = join(tmpBase, 'test-search-empty');
    await createTestStructure(base);

    const result = await searchFiles(base, 'zzz-this-will-not-match-anything');
    expect(result.matches).toEqual([]);
  });

  it('each match has file and match properties', async () => {
    const base = join(tmpBase, 'test-search-shape');
    await createTestStructure(base);

    const result = await searchFiles(base, 'login');
    expect(result.matches.length).toBeGreaterThan(0);
    for (const m of result.matches) {
      expect(m).toHaveProperty('file');
      expect(m).toHaveProperty('match');
      expect(typeof m.file).toBe('string');
      expect(typeof m.match).toBe('string');
    }
  });
});
