import type { ScenarioMeta } from './scenario.js';

/**
 * Summary of a scenario for dashboard display
 */
export interface ScenarioSummary {
  slug: string;
  title: string;
  tags: string[];
  lastResult: 'pass' | 'fail' | null;
  lastRun: string | null;
  totalRuns: number;
  passRate: number;
}

/**
 * Aggregated project status for dashboard queries
 */
export interface ProjectStatus {
  projectName: string;
  scenarioCount: number;
  passing: number;
  failing: number;
  neverRun: number;
  scenarios: ScenarioSummary[];
}

/**
 * Summary of a run for display in scenario detail view
 */
export interface RunSummary {
  id: string;
  runNumber: number;
  status: 'pass' | 'fail';
  duration: number;
  completedAt: string;
  errorMessage: string | null;
}

/**
 * Detailed scenario information including content and recent runs
 */
export interface ScenarioDetail {
  slug: string;
  title: string;
  tags: string[];
  content: string;
  meta: ScenarioMeta;
  recentRuns: RunSummary[];
}
