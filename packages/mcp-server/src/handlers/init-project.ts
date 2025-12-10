import {
  InitProjectParamsSchema,
  type InitProjectResult,
  type HarshJudgeConfig,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';
import { DashboardManager } from '../services/dashboard-manager.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const CONFIG_FILE = 'config.yaml';
const SCENARIOS_DIR = 'scenarios';
const GITIGNORE_FILE = '.gitignore';

const GITIGNORE_CONTENT = `# HarshJudge
# Ignore large evidence files in CI
scenarios/*/runs/*/evidence/*.png
scenarios/*/runs/*/evidence/*.html
# Dashboard state (local only)
.dashboard-state.json
`;

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

  // 6. Spawn dashboard server using DashboardManager
  let dashboardUrl: string | undefined;
  let message = 'HarshJudge initialized successfully';

  try {
    const manager = new DashboardManager(fs);
    const state = await manager.start();
    dashboardUrl = state.url;
    message = `HarshJudge initialized successfully. Dashboard running at ${dashboardUrl} (PID: ${state.pid})`;
    console.error(`[HarshJudge] ${message}`);
  } catch (error) {
    // Dashboard spawn failure is non-fatal - project is still initialized
    console.error(`[HarshJudge] Warning: Could not start dashboard: ${error}`);
    message = `HarshJudge initialized successfully. Dashboard could not be started automatically - use openDashboard tool to start it.`;
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
