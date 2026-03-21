import { Command } from 'commander';
import { handleToggleStar } from '../handlers/toggle-star.js';
import { FileSystemService } from '../services/file-system-service.js';
import { withErrorHandling } from '../utils/cli-helpers.js';

export function register(program: Command): void {
  program
    .command('star <slug>')
    .description('Star or unstar a scenario')
    .option('--unstar', 'Remove star from scenario')
    .action(
      withErrorHandling(
        async (slug: string, opts: { unstar?: boolean }, cmd: Command) => {
          const cwd = cmd.parent?.opts()['cwd'] ?? process.cwd();
          const fs = new FileSystemService(cwd);
          const result = await handleToggleStar(
            { scenarioSlug: slug, starred: !opts.unstar },
            fs
          );
          console.log(JSON.stringify(result));
        }
      )
    );
}
