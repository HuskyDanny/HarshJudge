import { Command } from 'commander';
import { handleCompleteStep } from '../handlers/complete-step.js';
import { FileSystemService } from '../services/file-system-service.js';
import { withErrorHandling } from '../utils/cli-helpers.js';

export function register(program: Command): void {
  program
    .command('complete-step <runId>')
    .description('Complete a single step in a test run')
    .option('--step <id>', 'Step ID (zero-padded, e.g. 01)')
    .option('--status <status>', 'Step status (pass, fail, skipped)')
    .requiredOption('--duration <ms>', 'Step duration in milliseconds')
    .option('--error <msg>', 'Error message if step failed')
    .option('--summary <text>', 'Step summary')
    .action(
      withErrorHandling(
        async (
          runId: string,
          opts: {
            step?: string;
            status?: string;
            duration: string;
            error?: string;
            summary?: string;
          },
          cmd: Command
        ) => {
          const cwd = cmd.parent?.opts()['cwd'] ?? process.cwd();
          const fs = new FileSystemService(cwd);
          const result = await handleCompleteStep(
            {
              runId,
              stepId: opts.step,
              status: opts.status,
              duration: parseInt(opts.duration, 10),
              error: opts.error,
              summary: opts.summary,
            },
            fs
          );
          console.log(JSON.stringify(result));
        }
      )
    );
}
