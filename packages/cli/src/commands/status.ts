/**
 * status command - Show HarshJudge project status
 *
 * Reads .harshJudge/ directory and displays:
 * - Project initialization status
 * - Scenario count and breakdown
 * - Pass/fail statistics
 */

import { readFile, readdir, access } from 'fs/promises';
import { join } from 'path';
import yaml from 'js-yaml';
import type { ScenarioMeta } from '@harshjudge/shared';

interface StatusOptions {
  json?: boolean;
}

interface HarshJudgeConfig {
  projectName: string;
  baseUrl: string;
  version: string;
  createdAt: string;
}

interface ProjectStatus {
  initialized: boolean;
  projectName: string | null;
  baseUrl: string | null;
  scenarioCount: number;
  passing: number;
  failing: number;
  neverRun: number;
  totalRuns: number;
  lastRun: string | null;
}

/**
 * Check if a path exists
 */
async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read config.yaml from .harshJudge/
 */
async function readConfig(basePath: string): Promise<HarshJudgeConfig | null> {
  const configPath = join(basePath, '.harshJudge/config.yaml');
  try {
    const content = await readFile(configPath, 'utf-8');
    return yaml.load(content) as HarshJudgeConfig;
  } catch {
    return null;
  }
}

/**
 * Read all scenario meta.yaml files
 */
async function readScenarioMetas(basePath: string): Promise<ScenarioMeta[]> {
  const scenariosPath = join(basePath, '.harshJudge/scenarios');

  if (!(await exists(scenariosPath))) {
    return [];
  }

  const entries = await readdir(scenariosPath, { withFileTypes: true });
  const metas: ScenarioMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const metaPath = join(scenariosPath, entry.name, 'meta.yaml');
    try {
      const content = await readFile(metaPath, 'utf-8');
      const meta = yaml.load(content) as ScenarioMeta;
      metas.push(meta);
    } catch {
      // Scenario without meta.yaml, skip
    }
  }

  return metas;
}

/**
 * Calculate project status from metas
 */
function calculateStatus(config: HarshJudgeConfig | null, metas: ScenarioMeta[]): ProjectStatus {
  const status: ProjectStatus = {
    initialized: config !== null,
    projectName: config?.projectName ?? null,
    baseUrl: config?.baseUrl ?? null,
    scenarioCount: metas.length,
    passing: 0,
    failing: 0,
    neverRun: 0,
    totalRuns: 0,
    lastRun: null,
  };

  let latestRunDate: Date | null = null;

  for (const meta of metas) {
    status.totalRuns += meta.totalRuns;

    if (meta.lastResult === 'pass') {
      status.passing++;
    } else if (meta.lastResult === 'fail') {
      status.failing++;
    } else {
      status.neverRun++;
    }

    if (meta.lastRun) {
      const runDate = new Date(meta.lastRun);
      if (!latestRunDate || runDate > latestRunDate) {
        latestRunDate = runDate;
        status.lastRun = meta.lastRun;
      }
    }
  }

  return status;
}

/**
 * Format relative time
 */
function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString();
}

/**
 * Display status in terminal
 */
function displayStatus(status: ProjectStatus): void {
  if (!status.initialized) {
    console.log(`
⚠️  HarshJudge not initialized in this directory.

Run 'harshjudge init' to get started.
`);
    return;
  }

  const passRate = status.scenarioCount > 0
    ? Math.round((status.passing / status.scenarioCount) * 100)
    : 0;

  // Status indicator
  let statusIcon = '⚪';
  let statusText = 'No tests run';
  if (status.passing > 0 && status.failing === 0) {
    statusIcon = '✅';
    statusText = 'All passing';
  } else if (status.failing > 0) {
    statusIcon = '❌';
    statusText = `${status.failing} failing`;
  } else if (status.neverRun > 0 && status.neverRun === status.scenarioCount) {
    statusIcon = '⚪';
    statusText = 'No tests run';
  }

  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   🔍 HarshJudge Status                                            ║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║   Project:     ${(status.projectName ?? 'Unknown').padEnd(50)}║
║   Base URL:    ${(status.baseUrl ?? 'Not set').padEnd(50)}║
║                                                                   ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║   ${statusIcon} Status:      ${statusText.padEnd(50)}║
║                                                                   ║
║   Scenarios:   ${String(status.scenarioCount).padEnd(50)}║
║     ✅ Passing:  ${String(status.passing).padEnd(48)}║
║     ❌ Failing:  ${String(status.failing).padEnd(48)}║
║     ⚪ Never run: ${String(status.neverRun).padEnd(47)}║
║                                                                   ║
║   Total runs:  ${String(status.totalRuns).padEnd(50)}║
║   Pass rate:   ${(passRate + '%').padEnd(50)}║
║   Last run:    ${(status.lastRun ? formatRelativeTime(status.lastRun) : 'Never').padEnd(50)}║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);
}

/**
 * Main status command handler
 */
export async function statusCommand(options: StatusOptions): Promise<void> {
  const basePath = process.cwd();

  // Read config and metas
  const config = await readConfig(basePath);
  const metas = await readScenarioMetas(basePath);

  // Calculate status
  const status = calculateStatus(config, metas);

  // Output
  if (options.json) {
    console.log(JSON.stringify(status, null, 2));
  } else {
    displayStatus(status);
  }
}
