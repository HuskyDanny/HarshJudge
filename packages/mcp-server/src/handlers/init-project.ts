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

const GITIGNORE_CONTENT = `# HarshJudge
# Ignore large evidence files in CI
scenarios/*/runs/*/evidence/*.png
scenarios/*/runs/*/evidence/*.html
`;

/**
 * Initializes a HarshJudge project in the current directory.
 * Creates the .harshJudge directory structure with config and gitignore.
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

  // 6. Return success result
  return {
    success: true,
    projectPath: HARSH_JUDGE_DIR,
    configPath,
    scenariosPath: `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}`,
  };
}
