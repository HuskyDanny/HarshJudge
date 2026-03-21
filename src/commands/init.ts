import { Command } from 'commander';
import { handleInitProject } from '../handlers/init-project.js';
import { FileSystemService } from '../services/file-system-service.js';
import { withErrorHandling } from '../utils/cli-helpers.js';

export function register(program: Command): void {
  program
    .command('init <name>')
    .description('Initialize a HarshJudge project in the current directory')
    .option('--base-url <url>', 'Base URL for the application under test')
    .action(
      withErrorHandling(
        async (name: string, opts: { baseUrl?: string }, cmd: Command) => {
          const cwd = cmd.parent?.opts()['cwd'] ?? process.cwd();
          const fs = new FileSystemService(cwd);
          const result = await handleInitProject(
            { projectName: name, baseUrl: opts.baseUrl },
            fs
          );
          console.log(JSON.stringify(result));
        }
      )
    );
}
