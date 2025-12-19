import { exec } from 'child_process';
import {
  OpenDashboardParamsSchema,
  type OpenDashboardResult,
} from '@harshjudge/shared';
import { DashboardManager } from '../services/dashboard-manager.js';
import { FileSystemService } from '../services/file-system-service.js';

/**
 * Opens the dashboard browser URL.
 */
function openBrowser(url: string): void {
  const command = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
    ? `open "${url}"`
    : `xdg-open "${url}"`;

  exec(command, (err) => {
    if (err) {
      console.error(`[HarshJudge] Failed to open browser: ${err.message}`);
    }
  });
}

/**
 * Start or reconnect to the dashboard server.
 * If already running, returns the existing URL.
 * If not running, starts a new dashboard and optionally opens browser.
 */
export async function handleOpenDashboard(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<OpenDashboardResult> {
  const validated = OpenDashboardParamsSchema.parse(params);
  const manager = new DashboardManager(fs, validated.projectPath);

  // Check current status
  const status = await manager.getStatus();

  if (status.running && status.url && status.port && status.pid) {
    // Already running - just open browser if requested
    if (validated.openBrowser) {
      openBrowser(status.url);
    }

    return {
      success: true,
      url: status.url,
      port: status.port,
      pid: status.pid,
      alreadyRunning: true,
      message: `Dashboard already running at ${status.url}`,
    };
  }

  // Not running - start new dashboard
  try {
    const state = await manager.start(validated.port);

    if (validated.openBrowser) {
      openBrowser(state.url);
    }

    return {
      success: true,
      url: state.url,
      port: state.port,
      pid: state.pid,
      alreadyRunning: false,
      message: `Dashboard started at ${state.url}`,
    };
  } catch (error) {
    throw new Error(`Failed to start dashboard: ${error instanceof Error ? error.message : String(error)}`);
  }
}
