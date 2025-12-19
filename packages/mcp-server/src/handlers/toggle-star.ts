import {
  ToggleStarParamsSchema,
  type ToggleStarResult,
  type ScenarioMeta,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const SCENARIOS_DIR = 'scenarios';
const META_FILE = 'meta.yaml';

/**
 * Toggle or set the starred status of a scenario.
 */
export async function handleToggleStar(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<ToggleStarResult> {
  // 1. Validate input parameters
  const validated = ToggleStarParamsSchema.parse(params);

  // 2. Check if project is initialized
  if (!(await fs.exists(HARSH_JUDGE_DIR))) {
    throw new Error('Project not initialized. Run initProject first.');
  }

  // 3. Check if scenario exists
  const scenarioPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${validated.scenarioSlug}`;
  const metaPath = `${scenarioPath}/${META_FILE}`;

  if (!(await fs.exists(scenarioPath))) {
    throw new Error(`Scenario "${validated.scenarioSlug}" does not exist.`);
  }

  // 4. Read existing meta.yaml
  let meta: ScenarioMeta;
  if (await fs.exists(metaPath)) {
    meta = await fs.readYaml<ScenarioMeta>(metaPath);
  } else {
    throw new Error(`Scenario "${validated.scenarioSlug}" has no meta.yaml.`);
  }

  // 5. Determine new starred value
  const newStarred =
    validated.starred !== undefined ? validated.starred : !meta.starred;

  // 6. Update meta.yaml
  meta.starred = newStarred;
  await fs.writeYaml(metaPath, meta);

  // 7. Return result
  return {
    success: true,
    slug: validated.scenarioSlug,
    starred: newStarred,
  };
}
