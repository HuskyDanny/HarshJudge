import {
  CompleteStepParamsSchema,
  type CompleteStepResult,
  type StepResult,
  type ScenarioMeta,
  StepReferenceSchema,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const SCENARIOS_DIR = 'scenarios';
const RUNS_DIR = 'runs';
const RESULT_FILE = 'result.json';
const META_FILE = 'meta.yaml';

interface InProgressResult {
  runId: string;
  scenarioSlug: string;
  status: 'running';
  startedAt: string;
  steps: StepResult[];
}

/**
 * Finds the run directory and its parent scenario by searching all scenarios.
 * Returns the run path and scenario slug, or null if not found.
 */
async function findRunAndScenario(
  fs: FileSystemService,
  runId: string
): Promise<{ runPath: string; scenarioSlug: string; scenarioPath: string } | null> {
  const scenariosPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}`;

  if (!(await fs.exists(scenariosPath))) {
    return null;
  }

  const scenarios = await fs.listDirs(scenariosPath);

  for (const scenario of scenarios) {
    const scenarioPath = `${scenariosPath}/${scenario}`;
    const runPath = `${scenarioPath}/${RUNS_DIR}/${runId}`;
    if (await fs.exists(runPath)) {
      return { runPath, scenarioSlug: scenario, scenarioPath };
    }
  }

  return null;
}

/**
 * Gets the next step ID from the scenario's step references.
 * Returns null if current step is the last one or no steps defined.
 */
async function getNextStepId(
  fs: FileSystemService,
  scenarioPath: string,
  currentStepId: string
): Promise<string | null> {
  const metaPath = `${scenarioPath}/${META_FILE}`;

  if (!(await fs.exists(metaPath))) {
    return null;
  }

  const meta = await fs.readYaml<ScenarioMeta>(metaPath);

  if (!meta.steps || meta.steps.length === 0) {
    return null;
  }

  // Find current step index
  const currentIdx = meta.steps.findIndex((s) => s.id === currentStepId);

  if (currentIdx === -1 || currentIdx >= meta.steps.length - 1) {
    // Current step not found or is the last step
    return null;
  }

  return meta.steps[currentIdx + 1].id;
}

/**
 * Lists evidence files in a step's evidence directory.
 */
async function listStepEvidence(
  fs: FileSystemService,
  runPath: string,
  stepId: string
): Promise<string[]> {
  const evidencePath = `${runPath}/step-${stepId}/evidence`;

  if (!(await fs.exists(evidencePath))) {
    return [];
  }

  const files = await fs.listFiles(evidencePath);
  return files.filter((f) => !f.endsWith('.meta.json'));
}

/**
 * Completes a single step in a test run (v2).
 * Updates the in-progress result and returns the next step ID.
 */
export async function handleCompleteStep(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<CompleteStepResult> {
  // 1. Validate input parameters
  const validated = CompleteStepParamsSchema.parse(params);

  // 2. Check if project is initialized
  if (!(await fs.exists(HARSH_JUDGE_DIR))) {
    throw new Error('Project not initialized. Run initProject first.');
  }

  // 3. Find the run and its scenario
  const found = await findRunAndScenario(fs, validated.runId);
  if (!found) {
    throw new Error(`Run "${validated.runId}" does not exist.`);
  }

  const { runPath, scenarioSlug, scenarioPath } = found;

  // 4. Check if run is already completed
  const resultPath = `${runPath}/${RESULT_FILE}`;
  if (await fs.exists(resultPath)) {
    const existingResult = await fs.readJson<{ status: string }>(resultPath);
    if (existingResult.status !== 'running') {
      throw new Error(`Run "${validated.runId}" is already completed. Cannot add step results.`);
    }
  }

  // 5. Load or create in-progress result
  let inProgress: InProgressResult;
  const runJsonPath = `${runPath}/run.json`;

  if (await fs.exists(resultPath)) {
    inProgress = await fs.readJson<InProgressResult>(resultPath);
  } else if (await fs.exists(runJsonPath)) {
    const runData = await fs.readJson<{ startedAt: string }>(runJsonPath);
    inProgress = {
      runId: validated.runId,
      scenarioSlug,
      status: 'running',
      startedAt: runData.startedAt,
      steps: [],
    };
  } else {
    inProgress = {
      runId: validated.runId,
      scenarioSlug,
      status: 'running',
      startedAt: new Date().toISOString(),
      steps: [],
    };
  }

  // 6. Collect evidence files for this step
  const evidenceFiles = await listStepEvidence(fs, runPath, validated.stepId);

  // 7. Create or update step result
  const stepResult: StepResult = {
    id: validated.stepId,
    status: validated.status,
    duration: validated.duration,
    error: validated.error ?? null,
    evidenceFiles,
  };

  // Find existing step or add new one
  const existingIdx = inProgress.steps.findIndex((s) => s.id === validated.stepId);
  if (existingIdx >= 0) {
    inProgress.steps[existingIdx] = stepResult;
  } else {
    inProgress.steps.push(stepResult);
    // Sort steps by ID
    inProgress.steps.sort((a, b) => a.id.localeCompare(b.id));
  }

  // 8. Write updated in-progress result
  await fs.writeJson(resultPath, inProgress);

  // 9. Determine next step ID
  let nextStepId: string | null = null;

  if (validated.status === 'pass' || validated.status === 'skipped') {
    // Get next step from scenario meta
    nextStepId = await getNextStepId(fs, scenarioPath, validated.stepId);
  }
  // If status is 'fail', nextStepId stays null (stop execution)

  // 10. Return result
  return {
    success: true,
    runId: validated.runId,
    stepId: validated.stepId,
    status: validated.status,
    nextStepId,
  };
}
