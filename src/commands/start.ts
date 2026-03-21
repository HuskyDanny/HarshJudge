import { Command } from 'commander';
import { handleStartRun } from '../handlers/start-run.js';
import { FileSystemService } from '../services/file-system-service.js';
import { withErrorHandling } from '../utils/cli-helpers.js';

export function register(program: Command): void {
  program
    .command('start <slug>')
    .description('Start a new test run for a scenario')
    .action(
      withErrorHandling(async (slug: string, _opts: unknown, cmd: Command) => {
        const cwd = cmd.parent?.opts()['cwd'] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const result = await handleStartRun({ scenarioSlug: slug }, fs);
        console.log(JSON.stringify(result));
      })
    );
}
