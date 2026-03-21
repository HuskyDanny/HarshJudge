import { Command } from 'commander';
import { handleRecordEvidence } from '../handlers/record-evidence.js';
import { FileSystemService } from '../services/file-system-service.js';
import { withErrorHandling } from '../utils/cli-helpers.js';

export function register(program: Command): void {
  program
    .command('evidence <runId>')
    .description('Record evidence for a test run step')
    .option('--step <n>', 'Step number')
    .option(
      '--type <type>',
      'Evidence type (screenshot, db_snapshot, console_log, etc.)'
    )
    .option('--name <name>', 'Evidence name')
    .option('--data <data>', 'Evidence data or file path')
    .action(
      withErrorHandling(
        async (
          runId: string,
          opts: { step?: string; type?: string; name?: string; data?: string },
          cmd: Command
        ) => {
          const cwd = cmd.parent?.opts()['cwd'] ?? process.cwd();
          const fs = new FileSystemService(cwd);
          const result = await handleRecordEvidence(
            {
              runId,
              step: parseInt(opts.step ?? '1', 10),
              type: opts.type,
              name: opts.name,
              data: opts.data,
            },
            fs
          );
          console.log(JSON.stringify(result));
        }
      )
    );
}
