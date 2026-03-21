import { Command } from 'commander';
import { handleOpenDashboard } from '../handlers/open-dashboard.js';
import { handleCloseDashboard } from '../handlers/close-dashboard.js';
import { handleGetDashboardStatus } from '../handlers/get-dashboard-status.js';
import { FileSystemService } from '../services/file-system-service.js';
import { withErrorHandling } from '../utils/cli-helpers.js';

export function register(program: Command): void {
  const dashboard = program
    .command('dashboard')
    .description('Manage the HarshJudge dashboard server');

  dashboard
    .command('open')
    .description('Start or reconnect to the dashboard server')
    .option('--port <n>', 'Port to run the dashboard on')
    .option('--no-browser', 'Do not open browser automatically')
    .action(
      withErrorHandling(
        async (opts: { port?: string; browser?: boolean }, cmd: Command) => {
          const cwd = cmd.parent?.parent?.opts()['cwd'] ?? process.cwd();
          const fs = new FileSystemService(cwd);
          const result = await handleOpenDashboard(
            {
              port: opts.port ? parseInt(opts.port, 10) : undefined,
              openBrowser: opts.browser !== false,
              projectPath: cwd,
            },
            fs
          );
          console.log(JSON.stringify(result));
        }
      )
    );

  dashboard
    .command('close')
    .description('Stop the dashboard server')
    .action(
      withErrorHandling(async (_opts: unknown, cmd: Command) => {
        const cwd = cmd.parent?.parent?.opts()['cwd'] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const result = await handleCloseDashboard({ projectPath: cwd }, fs);
        console.log(JSON.stringify(result));
      })
    );

  dashboard
    .command('status')
    .description('Get the current dashboard status')
    .action(
      withErrorHandling(async (_opts: unknown, cmd: Command) => {
        const cwd = cmd.parent?.parent?.opts()['cwd'] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const result = await handleGetDashboardStatus({ projectPath: cwd }, fs);
        console.log(JSON.stringify(result));
      })
    );
}
