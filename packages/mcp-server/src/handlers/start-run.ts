import { nanoid } from 'nanoid';
import {
  StartRunParamsSchema,
  type StartRunResult,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const SCENARIOS_DIR = 'scenarios';
const RUNS_DIR = 'runs';
const EVIDENCE_DIR = 'evidence';

/**
 * Starts a new test run for a scenario.
 * Creates run directory with evidence subdirectory.
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

  // 4. Generate unique run ID (10 characters, URL-safe)
  const runId = nanoid(10);

  // 5. Calculate run number (count existing runs + 1)
  const runsDir = `${scenarioDir}/${RUNS_DIR}`;
  let runNumber = 1;
  if (await fs.exists(runsDir)) {
    const existingRuns = await fs.listDirs(runsDir);
    runNumber = existingRuns.length + 1;
  }

  // 6. Create run directory structure
  const runPath = `${runsDir}/${runId}`;
  const evidencePath = `${runPath}/${EVIDENCE_DIR}`;
  await fs.ensureDir(runPath);
  await fs.ensureDir(evidencePath);

  // 7. Record start timestamp
  const startedAt = new Date().toISOString();

  // 8. Return result
  return {
    success: true,
    runId,
    runNumber,
    runPath,
    evidencePath,
    startedAt,
  };
}
