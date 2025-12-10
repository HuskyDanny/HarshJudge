import {
  CloseDashboardParamsSchema,
  type CloseDashboardResult,
} from '@harshjudge/shared';
import { DashboardManager } from '../services/dashboard-manager.js';
import { FileSystemService } from '../services/file-system-service.js';

/**
 * Stop the dashboard server and clean up resources.
 */
export async function handleCloseDashboard(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<CloseDashboardResult> {
  // Validate params (empty object)
  CloseDashboardParamsSchema.parse(params);

  const manager = new DashboardManager(fs);

  // Check current status first
  const status = await manager.getStatus();
  const wasRunning = status.running || status.stale === true;

  // Stop the dashboard
  const result = await manager.stop();

  return {
    success: result.stopped || !wasRunning,
    wasRunning,
    message: result.message,
  };
}
