import { fork, ChildProcess } from 'child_process';
import { createServer } from 'net';
import { existsSync, writeFileSync, unlinkSync, readFileSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { FileSystemService } from './file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const DASHBOARD_STATE_FILE = '.dashboard-state.json';
const DEFAULT_DASHBOARD_PORT = 7002;

export interface DashboardState {
  pid: number;
  port: number;
  url: string;
  startedAt: string;
  projectPath: string;
}

export interface DashboardStatus {
  running: boolean;
  pid?: number;
  port?: number;
  url?: string;
  startedAt?: string;
  stale?: boolean; // true if state file exists but process is dead
}

/**
 * Check if a port is available.
 * Binds to 0.0.0.0 (all interfaces) to match how the dashboard server binds.
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    // Don't specify host - this binds to 0.0.0.0 like the dashboard server does
    server.listen(port);
  });
}

/**
 * Find an available port starting from the given port.
 */
export async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

/**
 * Wait for a port to become unavailable (meaning server started).
 */
export async function waitForServer(port: number, timeoutMs: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (!(await isPortAvailable(port))) {
      return true; // Server is now listening
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

/**
 * Check if a process with the given PID is running.
 */
export function isProcessRunning(pid: number): boolean {
  try {
    // Sending signal 0 checks if process exists without actually sending a signal
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Kill a process by PID.
 */
export async function killProcess(pid: number): Promise<boolean> {
  try {
    process.kill(pid, 'SIGTERM');
    // Wait a bit for graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 300));
    // Check if still running and force kill
    if (isProcessRunning(pid)) {
      process.kill(pid, 'SIGKILL');
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Dashboard lifecycle manager.
 * Starts the dashboard server in a forked process.
 */
export class DashboardManager {
  private fs: FileSystemService;
  private stateFilePath: string;
  private projectDir: string;

  constructor(fs: FileSystemService = new FileSystemService(), projectPath?: string) {
    this.fs = fs;
    this.projectDir = projectPath ? resolve(projectPath) : process.cwd();
    this.stateFilePath = join(this.projectDir, HARSH_JUDGE_DIR, DASHBOARD_STATE_FILE);
  }

  /**
   * Get dashboard state file path.
   */
  getStateFilePath(): string {
    return this.stateFilePath;
  }

  /**
   * Read the current dashboard state from file.
   */
  readState(): DashboardState | null {
    try {
      if (existsSync(this.stateFilePath)) {
        const content = readFileSync(this.stateFilePath, 'utf-8');
        return JSON.parse(content) as DashboardState;
      }
    } catch {
      // State file corrupted or unreadable
    }
    return null;
  }

  /**
   * Write dashboard state to file.
   */
  writeState(state: DashboardState): void {
    // Ensure .harshJudge directory exists
    const dir = dirname(this.stateFilePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.stateFilePath, JSON.stringify(state, null, 2));
  }

  /**
   * Remove dashboard state file.
   */
  clearState(): void {
    try {
      if (existsSync(this.stateFilePath)) {
        unlinkSync(this.stateFilePath);
      }
    } catch {
      // Ignore errors
    }
  }

  /**
   * Get the current dashboard status.
   */
  async getStatus(): Promise<DashboardStatus> {
    const state = this.readState();

    if (!state) {
      return { running: false };
    }

    // Check if process is still running
    const processAlive = isProcessRunning(state.pid);

    // Check if port is in use (double verification)
    const portInUse = !(await isPortAvailable(state.port));

    if (processAlive && portInUse) {
      return {
        running: true,
        pid: state.pid,
        port: state.port,
        url: state.url,
        startedAt: state.startedAt,
      };
    }

    // Stale state - process died but state file remains
    return {
      running: false,
      pid: state.pid,
      port: state.port,
      stale: true,
    };
  }

  /**
   * Start the dashboard server.
   */
  async start(preferredPort?: number): Promise<DashboardState> {
    // Check if already running
    const status = await this.getStatus();
    if (status.running) {
      throw new Error(`Dashboard already running on port ${status.port} (PID: ${status.pid}). Use closeDashboard first.`);
    }

    // Clean up stale state if exists
    if (status.stale) {
      this.clearState();
    }

    // Find available port
    const startPort = preferredPort ?? DEFAULT_DASHBOARD_PORT;
    const port = await findAvailablePort(startPort);

    // Skip in test environment
    if (process.env['NODE_ENV'] === 'test' || process.env['VITEST']) {
      const state: DashboardState = {
        pid: 0,
        port,
        url: `http://localhost:${port}`,
        startedAt: new Date().toISOString(),
        projectPath: this.projectDir,
      };
      this.writeState(state);
      return state;
    }

    // Find the dashboard worker script
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const workerPath = join(__dirname, 'dashboard-worker.js');

    console.error(`[HarshJudge] Starting dashboard on port ${port}`);
    console.error(`[HarshJudge] Project directory: ${this.projectDir}`);
    console.error(`[HarshJudge] Worker path: ${workerPath}`);

    // Fork the dashboard worker process
    let child: ChildProcess;
    try {
      child = fork(workerPath, [], {
        cwd: this.projectDir,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        env: {
          ...process.env,
          HARSHJUDGE_PORT: String(port),
          HARSHJUDGE_PROJECT_PATH: this.projectDir,
        },
      });
    } catch (err) {
      throw new Error(`Failed to fork dashboard worker: ${err}`);
    }

    const pid = child.pid;
    if (!pid) {
      throw new Error('Failed to fork dashboard worker - no PID returned');
    }

    // Capture startup errors
    let startupError = '';
    child.stderr?.on('data', (data) => {
      const msg = data.toString();
      console.error(`[Dashboard] ${msg}`);
      if (msg.toLowerCase().includes('error')) {
        startupError += msg;
      }
    });

    child.stdout?.on('data', (data) => {
      console.error(`[Dashboard] ${data.toString()}`);
    });

    // Wait for server to start
    const started = await waitForServer(port, 8000);

    // Disconnect IPC and unref to let parent exit
    child.disconnect?.();
    child.unref();

    if (!started) {
      if (startupError) {
        throw new Error(`Dashboard failed to start: ${startupError}`);
      }
      throw new Error(`Dashboard did not start within timeout on port ${port}`);
    }

    console.error(`[HarshJudge] Dashboard started successfully (PID: ${pid})`);

    // Save state
    const state: DashboardState = {
      pid,
      port,
      url: `http://localhost:${port}`,
      startedAt: new Date().toISOString(),
      projectPath: this.projectDir,
    };
    this.writeState(state);

    return state;
  }

  /**
   * Stop the dashboard server.
   */
  async stop(): Promise<{ stopped: boolean; message: string }> {
    const status = await this.getStatus();

    if (!status.running && !status.stale) {
      return { stopped: false, message: 'Dashboard is not running' };
    }

    if (status.stale) {
      this.clearState();
      return { stopped: true, message: 'Cleaned up stale dashboard state (process was already dead)' };
    }

    // Kill the process
    if (status.pid) {
      const killed = await killProcess(status.pid);
      if (!killed) {
        return { stopped: false, message: `Failed to kill process ${status.pid}` };
      }
    }

    // Clear state
    this.clearState();

    return { stopped: true, message: `Dashboard stopped (was running on port ${status.port})` };
  }

  /**
   * Restart the dashboard (stop then start).
   */
  async restart(preferredPort?: number): Promise<DashboardState> {
    await this.stop();
    return await this.start(preferredPort);
  }
}
