import {
  CompleteRunParamsSchema,
  type CompleteRunResult,
  type ScenarioStats,
  type StepResult,
  DEFAULT_SCENARIO_STATS,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const SCENARIOS_DIR = 'scenarios';
const RUNS_DIR = 'runs';
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
 * Collects evidence files from per-step directories (v2 structure).
 * Returns array of step results with their evidence files.
 */
async function collectStepEvidence(
  fs: FileSystemService,
  runPath: string
): Promise<{ stepId: string; evidenceFiles: string[] }[]> {
  const results: { stepId: string; evidenceFiles: string[] }[] = [];

  // List all step directories
  if (!(await fs.exists(runPath))) {
    return results;
  }

  const dirs = await fs.listDirs(runPath);
  const stepDirs = dirs.filter((d) => /^step-\d{2}$/.test(d)).sort();

  for (const stepDir of stepDirs) {
    const stepId = stepDir.replace('step-', '');
    const evidencePath = `${runPath}/${stepDir}/evidence`;

    if (await fs.exists(evidencePath)) {
      const files = await fs.listFiles(evidencePath);
      const evidenceFiles = files.filter((f) => !f.endsWith('.meta.json'));
      results.push({ stepId, evidenceFiles });
    } else {
      results.push({ stepId, evidenceFiles: [] });
    }
  }

  return results;
}

/**
 * Gets the scenario slug from the run path.
 */
function extractScenarioSlug(runPath: string): string {
  // Path format: .harshJudge/scenarios/{slug}/runs/{runId}
  const parts = runPath.split('/');
  const scenariosIdx = parts.indexOf('scenarios');
  if (scenariosIdx >= 0 && parts.length > scenariosIdx + 1) {
    return parts[scenariosIdx + 1];
  }
  return 'unknown';
}

/**
 * Completes a test run and updates scenario statistics (v2).
 * Supports per-step results and backward compatibility with v1.
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
  let existingResult: { status: string; steps?: unknown[] } | null = null;

  if (await fs.exists(resultPath)) {
    existingResult = await fs.readJson<{ status: string; steps?: unknown[] }>(resultPath);
    // Only reject if the run is truly completed (not "running" from completeStep)
    if (existingResult.status !== 'running') {
      throw new Error(`Run "${validated.runId}" is already completed.`);
    }
  }

  // 5. Build steps array (v2)
  let steps: StepResult[];

  if (validated.steps && validated.steps.length > 0) {
    // Use provided steps (v2 format from params)
    steps = validated.steps;
  } else if (existingResult?.steps && Array.isArray(existingResult.steps) && existingResult.steps.length > 0) {
    // Use steps from in-progress result.json (from completeStep calls)
    steps = existingResult.steps as StepResult[];
  } else {
    // Backward compatibility: collect evidence from step directories
    const stepEvidence = await collectStepEvidence(fs, runPath);
    steps = stepEvidence.map((se) => ({
      id: se.stepId,
      status: (validated.failedStep === se.stepId ? 'fail' : 'pass') as 'pass' | 'fail' | 'skipped',
      duration: 0, // Unknown for v1 compat
      error: validated.failedStep === se.stepId ? (validated.errorMessage ?? null) : null,
      evidenceFiles: se.evidenceFiles,
    }));
  }

  // 6. Read startedAt from existing result.json or run.json
  let startedAt: string | undefined;

  // First try to get from existing result.json (from completeStep)
  if (existingResult && 'startedAt' in existingResult) {
    startedAt = (existingResult as { startedAt?: string }).startedAt;
  }

  // Fallback to run.json
  if (!startedAt) {
    const runJsonPath = `${runPath}/run.json`;
    if (await fs.exists(runJsonPath)) {
      const runData = await fs.readJson<{ startedAt?: string }>(runJsonPath);
      startedAt = runData.startedAt;
    }
  }

  // 7. Write result.json (v2 format)
  const scenarioSlug = extractScenarioSlug(runPath);
  const result = {
    runId: validated.runId,
    scenarioSlug,
    status: validated.status,
    startedAt: startedAt ?? new Date().toISOString(),
    completedAt: new Date().toISOString(),
    duration: validated.duration,
    steps,
    failedStep: validated.failedStep ?? null,
    errorMessage: validated.errorMessage ?? null,
  };
  await fs.writeJson(resultPath, result);

  // 8. Update scenario meta.yaml (preserve all fields, update stats only)
  const metaPath = `${scenarioPath}/${META_FILE}`;

  // Read entire meta.yaml to preserve all fields (title, slug, starred, tags, steps, etc.)
  let existingMeta: Record<string, unknown> = {};
  if (await fs.exists(metaPath)) {
    existingMeta = await fs.readYaml<Record<string, unknown>>(metaPath);
  }

  // Extract current stats with defaults
  const currentStats: ScenarioStats = {
    totalRuns: (existingMeta.totalRuns as number) ?? 0,
    passCount: (existingMeta.passCount as number) ?? 0,
    failCount: (existingMeta.failCount as number) ?? 0,
    lastRun: (existingMeta.lastRun as string | null) ?? null,
    lastResult: (existingMeta.lastResult as 'pass' | 'fail' | null) ?? null,
    avgDuration: (existingMeta.avgDuration as number) ?? 0,
  };

  // Update statistics
  const newTotalRuns = currentStats.totalRuns + 1;
  const newPassCount = currentStats.passCount + (validated.status === 'pass' ? 1 : 0);
  const newFailCount = currentStats.failCount + (validated.status === 'fail' ? 1 : 0);

  // Calculate new average duration
  const totalDuration = currentStats.avgDuration * currentStats.totalRuns + validated.duration;
  const newAvgDuration = Math.round(totalDuration / newTotalRuns);

  // Merge updated stats back into existing meta (preserve all other fields)
  const updatedMeta = {
    ...existingMeta,
    totalRuns: newTotalRuns,
    passCount: newPassCount,
    failCount: newFailCount,
    lastRun: new Date().toISOString(),
    lastResult: validated.status,
    avgDuration: newAvgDuration,
  };

  await fs.writeYaml(metaPath, updatedMeta);

  // 9. Return result
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
