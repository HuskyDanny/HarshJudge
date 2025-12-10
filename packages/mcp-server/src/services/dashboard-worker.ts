/**
 * Dashboard Worker Process
 *
 * This script is forked by DashboardManager to run the dashboard server
 * in a detached process. It reads configuration from environment variables
 * and starts the DashboardServer.
 *
 * Environment variables:
 * - HARSHJUDGE_PORT: Port to listen on (default: 7002)
 * - HARSHJUDGE_PROJECT_PATH: Path to the project directory
 */

// Import from the actual file path since tsup doesn't resolve subpath exports
import { DashboardServer } from '../../../ux/src/server/DashboardServer.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main(): Promise<void> {
  const port = parseInt(process.env['HARSHJUDGE_PORT'] || '7002', 10);
  const projectPath = process.env['HARSHJUDGE_PROJECT_PATH'] || process.cwd();

  // The dist path for static assets - copied alongside this worker during build
  // __dirname is the dist folder where dashboard-worker.js resides
  // ux-dist is copied there by the tsup onSuccess hook
  const distPath = join(__dirname, 'ux-dist');

  console.log(`[HarshJudge Worker] Starting dashboard server...`);
  console.log(`[HarshJudge Worker] Port: ${port}`);
  console.log(`[HarshJudge Worker] Project path: ${projectPath}`);
  console.log(`[HarshJudge Worker] Dist path: ${distPath}`);

  const server = new DashboardServer({
    port,
    projectPath,
    distPath,
  });

  try {
    const actualPort = await server.start();
    console.log(`[HarshJudge Worker] Dashboard running at http://localhost:${actualPort}`);

    // Keep the process alive
    process.on('SIGTERM', async () => {
      console.log('[HarshJudge Worker] Received SIGTERM, shutting down...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('[HarshJudge Worker] Received SIGINT, shutting down...');
      await server.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error('[HarshJudge Worker] Failed to start:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[HarshJudge Worker] Fatal error:', err);
  process.exit(1);
});
