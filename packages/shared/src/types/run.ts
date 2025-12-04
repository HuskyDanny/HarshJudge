/**
 * Single execution of a scenario
 */
export interface Run {
  id: string;
  scenarioSlug: string;
  runNumber: number;
  startedAt: string;
  status: 'running' | 'completed';
}

/**
 * Final outcome of a run stored in `result.json`
 */
export interface RunResult {
  runId: string;
  status: 'pass' | 'fail';
  duration: number;
  completedAt: string;
  failedStep: number | null;
  errorMessage: string | null;
  stepCount: number;
  evidenceCount: number;
}
