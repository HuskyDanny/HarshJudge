import { Command } from 'commander';
import { handleCompleteRun } from '../handlers/complete-run.js';
import { FileSystemService } from '../services/file-system-service.js';
import { withErrorHandling } from '../utils/cli-helpers.js';

export function register(program: Command): void {
  program
    .command('complete-run <runId>')
    .description('Complete a test run and update scenario statistics')
    .option('--status <status>', 'Run status (pass, fail)')
    .requiredOption('--duration <ms>', 'Run duration in milliseconds')
    .option('--failed-step <id>', 'ID of the failed step')
    .option('--error <msg>', 'Error message')
    .option('--steps <json>', 'Steps as a JSON string')
    .action(
      withErrorHandling(
        async (
          runId: string,
          opts: {
            status?: string;
            duration: string;
            failedStep?: string;
            error?: string;
            steps?: string;
          },
          cmd: Command
        ) => {
          const cwd = cmd.parent?.opts()['cwd'] ?? process.cwd();
          const fs = new FileSystemService(cwd);
          const result = await handleCompleteRun(
            {
              runId,
              status: opts.status,
              duration: parseInt(opts.duration, 10),
              failedStep: opts.failedStep,
              errorMessage: opts.error,
              steps: opts.steps ? JSON.parse(opts.steps) : undefined,
            },
            fs
          );
          console.log(JSON.stringify(result));
        }
      )
    );
}
