import { spawn } from 'child_process';
import { createServer } from 'net';
import {
  InitProjectParamsSchema,
  type InitProjectResult,
  type HarshJudgeConfig,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const CONFIG_FILE = 'config.yaml';
const SCENARIOS_DIR = 'scenarios';
const GITIGNORE_FILE = '.gitignore';
const DEFAULT_DASHBOARD_PORT = 3001;

const GITIGNORE_CONTENT = `# HarshJudge
# Ignore large evidence files in CI
scenarios/*/runs/*/evidence/*.png
scenarios/*/runs/*/evidence/*.html
`;

/**
 * Check if a port is available.
 */
async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
}

/**
 * Find an available port starting from the given port.
 */
async function findAvailablePort(startPort: number, maxAttempts: number = 10): Promise<number> {
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
async function waitForServer(port: number, timeoutMs: number = 5000): Promise<boolean> {
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
 * Spawn the dashboard server as a detached process.
 * Returns the dashboard URL or undefined if spawning is skipped/failed.
 * @param port - Port to run the dashboard on
 * @param projectDir - Project directory to run the dashboard from
 */
async function spawnDashboard(port: number, projectDir: string): Promise<string | undefined> {
  // Skip dashboard spawning in test environment
  if (process.env['NODE_ENV'] === 'test' || process.env['VITEST']) {
    console.error(`[HarshJudge] Skipping dashboard spawn in test environment`);
    return `http://localhost:${port}`;
  }

  // Check if already running on this port
  if (!(await isPortAvailable(port))) {
    console.error(`[HarshJudge] Dashboard already running on port ${port}`);
    return `http://localhost:${port}`;
  }

  // Use node to run the CLI dashboard command directly (since package isn't published to npm)
  const nodeCommand = process.platform === 'win32' ? 'node.exe' : 'node';
  // Resolve CLI path relative to this module (mcp-server/dist/handlers/ -> cli/dist/)
  // Need 3 levels up: handlers/ -> dist/ -> mcp-server/ -> packages/
  const cliPath = new URL('../../../cli/dist/index.js', import.meta.url).pathname.replace(/^\/([A-Z]:)/i, '$1');

  try {
    // Spawn the dashboard as a detached process from the project directory
    const dashboard = spawn(nodeCommand, [cliPath, 'dashboard', '--port', String(port), '--no-open'], {
      cwd: projectDir,
      detached: true,
      stdio: 'ignore',
      shell: true,
      windowsHide: true,
    });

    // Unref to allow parent process to exit independently
    dashboard.unref();

    console.error(`[HarshJudge] Spawned dashboard process (PID: ${dashboard.pid}) on port ${port}`);

    // Wait for the server to start
    const started = await waitForServer(port, 5000);
    if (!started) {
      console.error(`[HarshJudge] Dashboard may not have started properly, but process was spawned`);
    }

    return `http://localhost:${port}`;
  } catch (error) {
    console.error(`[HarshJudge] Failed to spawn dashboard: ${error}`);
    return undefined;
  }
}

/**
 * Initializes a HarshJudge project in the current directory.
 * Creates the .harshJudge directory structure with config and gitignore.
 * Automatically spawns the dashboard server.
 */
export async function handleInitProject(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<InitProjectResult> {
  // 1. Validate input parameters
  const validated = InitProjectParamsSchema.parse(params);

  // 2. Check if project is already initialized
  if (await fs.exists(HARSH_JUDGE_DIR)) {
    throw new Error(
      'Project already initialized. Use a different directory or remove existing .harshJudge folder.'
    );
  }

  // 3. Create directory structure
  await fs.ensureDir(HARSH_JUDGE_DIR);
  await fs.ensureDir(`${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}`);

  // 4. Write config.yaml
  const config: HarshJudgeConfig = {
    projectName: validated.projectName,
    baseUrl: validated.baseUrl ?? '',
    version: '1.0',
    createdAt: new Date().toISOString(),
  };
  const configPath = `${HARSH_JUDGE_DIR}/${CONFIG_FILE}`;
  await fs.writeYaml(configPath, config);

  // 5. Write .gitignore
  const gitignorePath = `${HARSH_JUDGE_DIR}/${GITIGNORE_FILE}`;
  await fs.writeFile(gitignorePath, GITIGNORE_CONTENT);

  // 6. Spawn dashboard server
  let dashboardUrl: string | undefined;
  let message = 'HarshJudge initialized successfully';

  try {
    const port = await findAvailablePort(DEFAULT_DASHBOARD_PORT);
    dashboardUrl = await spawnDashboard(port, process.cwd());
    if (dashboardUrl) {
      message = `HarshJudge initialized successfully. Dashboard running at ${dashboardUrl}`;
    } else {
      message = `HarshJudge initialized successfully. Dashboard could not be started automatically - run 'harshjudge dashboard' manually.`;
    }
    console.error(`[HarshJudge] ${message}`);
  } catch (error) {
    // Dashboard spawn failure is non-fatal - project is still initialized
    console.error(`[HarshJudge] Warning: Could not start dashboard: ${error}`);
    message = `HarshJudge initialized successfully. Dashboard could not be started automatically - run 'harshjudge dashboard' manually.`;
  }

  // 7. Return success result
  return {
    success: true,
    projectPath: HARSH_JUDGE_DIR,
    configPath,
    scenariosPath: `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}`,
    dashboardUrl,
    message,
  };
}
