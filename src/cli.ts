#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { register as registerInit } from './commands/init.js';
import { register as registerCreate } from './commands/create.js';
import { register as registerStar } from './commands/star.js';
import { register as registerStatus } from './commands/status.js';
import { register as registerStart } from './commands/start.js';
import { register as registerEvidence } from './commands/evidence.js';
import { register as registerCompleteStep } from './commands/complete-step.js';
import { register as registerCompleteRun } from './commands/complete-run.js';
import { register as registerDashboard } from './commands/dashboard.js';
import { register as registerDiscover } from './commands/discover.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8')
);

const program = new Command();
program
  .name('harshjudge')
  .description('AI-native E2E testing orchestration CLI')
  .version(pkg.version)
  .option('--cwd <path>', 'Working directory override');

registerInit(program);
registerCreate(program);
registerStar(program);
registerStatus(program);
registerStart(program);
registerEvidence(program);
registerCompleteStep(program);
registerCompleteRun(program);
registerDashboard(program);
registerDiscover(program);

program.parse();
