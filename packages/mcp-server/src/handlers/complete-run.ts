import {
  CompleteRunParamsSchema,
  type CompleteRunResult,
  type ScenarioMeta,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const SCENARIOS_DIR = 'scenarios';
const RUNS_DIR = 'runs';
const EVIDENCE_DIR = 'evidence';
const RESULT_FILE = 'result.json';
const META_FILE = 'meta.yaml';

/**
 * Finds the run directory and its parent scenario by searching all scenarios.
 * Returns the run path and scenario path, or null if not found.
 */
async function findRunAndScenario(
  fs: FileSystemService,
  runId: string
): Promise<{ runPath: string; scenarioPath: string } | null> {
  const scenariosPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}`;

  if (!(await fs.exists(scenariosPath))) {
    return null;
  }

  const scenarios = await fs.listDirs(scenariosPath);

  for (const scenario of scenarios) {
    const scenarioPath = `${scenariosPath}/${scenario}`;
    const runPath = `${scenarioPath}/${RUNS_DIR}/${runId}`;
    if (await fs.exists(runPath)) {
      return { runPath, scenarioPath };
    }
  }

  return null;
}

/**
 * Counts evidence files in a run's evidence directory.
 */
async function countEvidence(
  fs: FileSystemService,
  runPath: string
): Promise<number> {
  const evidencePath = `${runPath}/${EVIDENCE_DIR}`;
  if (!(await fs.exists(evidencePath))) {
    return 0;
  }

  // Count non-meta files (actual evidence, not .meta.json files)
  const files = await fs.listFiles(evidencePath);
  return files.filter((f) => !f.endsWith('.meta.json')).length;
}

/**
 * Completes a test run and updates scenario statistics.
 */
export async function handleCompleteRun(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<CompleteRunResult> {
  // 1. Validate input parameters
  const validated = CompleteRunParamsSchema.parse(params);

  // 2. Check if project is initialized
  if (!(await fs.exists(HARSH_JUDGE_DIR))) {
    throw new Error('Project not initialized. Run initProject first.');
  }

  // 3. Find the run and its scenario
  const found = await findRunAndScenario(fs, validated.runId);
  if (!found) {
    throw new Error(`Run "${validated.runId}" does not exist.`);
  }

  const { runPath, scenarioPath } = found;

  // 4. Check if run is already completed
  const resultPath = `${runPath}/${RESULT_FILE}`;
  if (await fs.exists(resultPath)) {
    throw new Error(`Run "${validated.runId}" is already completed.`);
  }

  // 5. Count evidence and determine step count
  const evidenceCount = await countEvidence(fs, runPath);

  // 6. Write result.json
  const result = {
    runId: validated.runId,
    status: validated.status,
    duration: validated.duration,
    completedAt: new Date().toISOString(),
    failedStep: validated.failedStep ?? null,
    errorMessage: validated.errorMessage ?? null,
    evidenceCount,
  };
  await fs.writeJson(resultPath, result);

  // 7. Update scenario meta.yaml
  const metaPath = `${scenarioPath}/${META_FILE}`;
  let meta: ScenarioMeta;

  if (await fs.exists(metaPath)) {
    meta = await fs.readYaml<ScenarioMeta>(metaPath);
  } else {
    meta = {
      totalRuns: 0,
      passCount: 0,
      failCount: 0,
      lastRun: null,
      lastResult: null,
      avgDuration: 0,
    };
  }

  // Update statistics
  const newTotalRuns = meta.totalRuns + 1;
  const newPassCount = meta.passCount + (validated.status === 'pass' ? 1 : 0);
  const newFailCount = meta.failCount + (validated.status === 'fail' ? 1 : 0);

  // Calculate new average duration
  const totalDuration = meta.avgDuration * meta.totalRuns + validated.duration;
  const newAvgDuration = Math.round(totalDuration / newTotalRuns);

  const updatedMeta: ScenarioMeta = {
    totalRuns: newTotalRuns,
    passCount: newPassCount,
    failCount: newFailCount,
    lastRun: new Date().toISOString(),
    lastResult: validated.status,
    avgDuration: newAvgDuration,
  };

  await fs.writeYaml(metaPath, updatedMeta);

  // 8. Return result
  return {
    success: true,
    resultPath,
    updatedMeta: {
      totalRuns: newTotalRuns,
      passCount: newPassCount,
      failCount: newFailCount,
      avgDuration: newAvgDuration,
    },
  };
}
