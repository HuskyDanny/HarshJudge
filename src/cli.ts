#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// Commands will be registered in Tasks 6-9

program.parse();
