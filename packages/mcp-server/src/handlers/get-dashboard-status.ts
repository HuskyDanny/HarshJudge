import {
  GetDashboardStatusParamsSchema,
  type GetDashboardStatusResult,
} from '@harshjudge/shared';
import { DashboardManager } from '../services/dashboard-manager.js';
import { FileSystemService } from '../services/file-system-service.js';

/**
 * Get the current dashboard status.
 */
export async function handleGetDashboardStatus(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<GetDashboardStatusResult> {
  // Validate params (empty object)
  GetDashboardStatusParamsSchema.parse(params);

  const manager = new DashboardManager(fs);
  const status = await manager.getStatus();

  let message: string;
  if (status.running) {
    message = `Dashboard running at ${status.url} (PID: ${status.pid})`;
  } else if (status.stale) {
    message = `Dashboard state is stale (process ${status.pid} is dead). Run openDashboard to start a new one.`;
  } else {
    message = 'Dashboard is not running. Use openDashboard to start it.';
  }

  return {
    running: status.running,
    pid: status.pid,
    port: status.port,
    url: status.url,
    startedAt: status.startedAt,
    stale: status.stale,
    message,
  };
}
