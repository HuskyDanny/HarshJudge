#!/usr/bin/env node
/**
 * HarshJudge CLI - Unified command-line interface for HarshJudge
 *
 * Commands:
 *   init       - Initialize HarshJudge in a project
 *   dashboard  - Start the dashboard server
 *   status     - Show project status
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initCommand } from './commands/init.js';
import { dashboardCommand } from './commands/dashboard.js';
import { statusCommand } from './commands/status.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const program = new Command();

program
  .name('harshjudge')
  .description('AI-native E2E testing orchestration for Claude Code')
  .version(getVersion(), '-v, --version', 'Display version number');

// init command
program
  .command('init')
  .description('Initialize HarshJudge in the current project')
  .option('-n, --name <name>', 'Project name')
  .option('-u, --url <url>', 'Base URL of the application')
  .option('--skip-skills', 'Skip copying skills to .claude/skills/')
  .action(async (options) => {
    try {
      await initCommand(options);
      process.exit(0);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// dashboard command
program
  .command('dashboard')
  .description('Start the HarshJudge dashboard server')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (options) => {
    try {
      await dashboardCommand({
        port: parseInt(options.port, 10),
        open: options.open,
      });
      // Dashboard keeps running, don't exit
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// status command
program
  .command('status')
  .description('Show HarshJudge project status')
  .option('-j, --json', 'Output as JSON')
  .action(async (options) => {
    try {
      await statusCommand(options);
      process.exit(0);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
