import { Command } from 'commander';
import { handleGetStatus } from '../handlers/get-status.js';
import { FileSystemService } from '../services/file-system-service.js';
import { withErrorHandling } from '../utils/cli-helpers.js';

export function register(program: Command): void {
  program
    .command('status [slug]')
    .description('Get project or scenario status')
    .option('--starred-only', 'Show only starred scenarios')
    .action(
      withErrorHandling(
        async (
          slug: string | undefined,
          opts: { starredOnly?: boolean },
          cmd: Command
        ) => {
          const cwd = cmd.parent?.opts()['cwd'] ?? process.cwd();
          const fs = new FileSystemService(cwd);
          const result = await handleGetStatus(
            { scenarioSlug: slug, starredOnly: opts.starredOnly },
            fs
          );
          console.log(JSON.stringify(result));
        }
      )
    );
}
