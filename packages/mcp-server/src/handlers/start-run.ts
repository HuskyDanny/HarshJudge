import { nanoid } from 'nanoid';
import {
  StartRunParamsSchema,
  type StartRunResult,
  type StartRunStepInfo,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const SCENARIOS_DIR = 'scenarios';
const RUNS_DIR = 'runs';
const EVIDENCE_DIR = 'evidence';
const META_FILE = 'meta.yaml';

interface ScenarioMetaYaml {
  title: string;
  slug: string;
  starred?: boolean;
  tags?: string[];
  estimatedDuration?: number;
  steps?: Array<{
    id: string;
    title: string;
    file: string;
  }>;
  totalRuns?: number;
  passCount?: number;
  failCount?: number;
  avgDuration?: number;
}

/**
 * Starts a new test run for a scenario.
 * Creates run directory with evidence subdirectory.
 * Returns step information from meta.yaml for orchestration.
 */
export async function handleStartRun(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<StartRunResult> {
  // 1. Validate input parameters
  const validated = StartRunParamsSchema.parse(params);

  // 2. Check if project is initialized
  if (!(await fs.exists(HARSH_JUDGE_DIR))) {
    throw new Error('Project not initialized. Run initProject first.');
  }

  // 3. Check if scenario exists
  const scenarioDir = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${validated.scenarioSlug}`;
  if (!(await fs.exists(scenarioDir))) {
    throw new Error(`Scenario "${validated.scenarioSlug}" does not exist.`);
  }

  // 4. Read meta.yaml for step information
  const metaPath = `${scenarioDir}/${META_FILE}`;
  if (!(await fs.exists(metaPath))) {
    throw new Error(`Scenario "${validated.scenarioSlug}" has no meta.yaml.`);
  }
  const meta = (await fs.readYaml(metaPath)) as ScenarioMetaYaml;

  // 5. Extract step information
  const steps: StartRunStepInfo[] = (meta.steps || []).map((step) => ({
    id: step.id,
    title: step.title,
    file: step.file,
  }));

  // 6. Generate unique run ID (10 characters, URL-safe)
  const runId = nanoid(10);

  // 7. Calculate run number (count existing runs + 1)
  const runsDir = `${scenarioDir}/${RUNS_DIR}`;
  let runNumber = 1;
  if (await fs.exists(runsDir)) {
    const existingRuns = await fs.listDirs(runsDir);
    runNumber = existingRuns.length + 1;
  }

  // 8. Create run directory structure
  const runPath = `${runsDir}/${runId}`;
  const evidencePath = `${runPath}/${EVIDENCE_DIR}`;
  await fs.ensureDir(runPath);
  await fs.ensureDir(evidencePath);

  // 9. Record start timestamp
  const startedAt = new Date().toISOString();

  // 10. Return result with step information
  return {
    success: true,
    runId,
    runNumber,
    runPath,
    evidencePath,
    startedAt,
    scenarioSlug: validated.scenarioSlug,
    scenarioTitle: meta.title,
    steps,
  };
}
