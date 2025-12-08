/**
 * dashboard command - Start the HarshJudge dashboard server
 *
 * This command uses the DashboardServer from @harshjudge/ux
 * to serve the dashboard at a configurable port.
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DashboardServer } from '@harshjudge/ux/server/DashboardServer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface DashboardOptions {
  port: number;
  open: boolean;
}

/**
 * Open URL in default browser (cross-platform)
 */
async function openBrowser(url: string): Promise<void> {
  try {
    const { platform } = await import('os');
    const { exec } = await import('child_process');

    const os = platform();
    let command: string;

    if (os === 'darwin') {
      command = `open "${url}"`;
    } else if (os === 'win32') {
      command = `start "" "${url}"`;
    } else {
      command = `xdg-open "${url}"`;
    }

    exec(command, (err) => {
      if (err) {
        console.log(`  💡 Could not open browser automatically. Please visit: ${url}`);
      }
    });
  } catch {
    console.log(`  💡 Could not open browser automatically. Please visit: ${url}`);
  }
}

/**
 * Get the path to the built dashboard assets
 */
function getDashboardDistPath(): string {
  // When CLI is installed, UX dist is at ../ux/dist relative to cli
  // In monorepo development, it's at ../../ux/dist from cli/dist/commands/
  const possiblePaths = [
    join(__dirname, '../../ux/dist'),           // Installed structure
    join(__dirname, '../../../ux/dist'),        // Development structure
    join(__dirname, '../../../../ux/dist'),     // Alternative structure
  ];

  // Return the most likely path for monorepo development
  return possiblePaths[1] as string;
}

/**
 * Main dashboard command handler
 */
export async function dashboardCommand(options: DashboardOptions): Promise<void> {
  const port = options.port;
  const distPath = getDashboardDistPath();

  const server = new DashboardServer({
    port,
    projectPath: process.cwd(),
    distPath,
  });

  try {
    const actualPort = await server.start();
    const url = server.getUrl();

    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🔍 HarshJudge Dashboard                         ║
║                                                   ║
║   Local:   ${url.padEnd(35)}║
║                                                   ║
║   Press Ctrl+C to stop                            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
`);

    if (options.open) {
      await openBrowser(url);
    }

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('\n\n  Shutting down dashboard server...');
      await server.stop();
      console.log('  Server stopped. Goodbye! 👋\n');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes('EADDRINUSE') || message.includes('already in use')) {
      throw new Error(`Port ${port} is already in use. Try: harshjudge dashboard --port ${port + 1}`);
    }

    throw err;
  }
}
