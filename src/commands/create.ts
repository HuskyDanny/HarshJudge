import { Command } from 'commander';
import { handleCreateScenario } from '../handlers/create-scenario.js';
import { FileSystemService } from '../services/file-system-service.js';
import { withErrorHandling } from '../utils/cli-helpers.js';

export function register(program: Command): void {
  program
    .command('create <slug>')
    .description('Create a new test scenario')
    .requiredOption('--title <title>', 'Scenario title')
    .requiredOption('--steps <json>', 'Steps as a JSON string')
    .option('--tags <tags>', 'Comma-separated list of tags')
    .option('--estimated-duration <seconds>', 'Estimated duration in seconds')
    .option('--starred', 'Mark scenario as starred')
    .action(
      withErrorHandling(
        async (
          slug: string,
          opts: {
            title: string;
            steps: string;
            tags?: string;
            estimatedDuration?: string;
            starred?: boolean;
          },
          cmd: Command
        ) => {
          const cwd = cmd.parent?.opts()['cwd'] ?? process.cwd();
          const fs = new FileSystemService(cwd);
          const tags = opts.tags
            ? opts.tags.split(',').map((t) => t.trim())
            : undefined;
          const result = await handleCreateScenario(
            {
              slug,
              title: opts.title,
              steps: JSON.parse(opts.steps),
              tags,
              estimatedDuration: opts.estimatedDuration
                ? parseInt(opts.estimatedDuration, 10)
                : undefined,
              starred: opts.starred,
            },
            fs
          );
          console.log(JSON.stringify(result));
        }
      )
    );
}
