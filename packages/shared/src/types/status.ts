import type { ScenarioStats } from './scenario.js';

/**
 * Summary of a scenario for dashboard display
 */
export interface ScenarioSummary {
  slug: string;
  title: string;
  starred: boolean;
  tags: string[];
  stepCount: number;
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
  scenarios: ScenarioSummary[];
}

/**
 * Summary of a run for display in scenario detail view
 */
export interface RunSummary {
  id: string;
  runNumber: number;
  status: 'pass' | 'fail' | 'running';
  duration: number;
  startedAt: string;
  completedAt?: string; // Optional - not present for running status
  errorMessage: string | null;
}

/**
 * Step information for display in scenario detail
 */
export interface StepInfo {
  id: string;
  title: string;
}

/**
 * Detailed scenario information including content and recent runs
 */
export interface ScenarioDetail {
  slug: string;
  title: string;
  starred: boolean;
  tags: string[];
  stepCount: number;
  steps: StepInfo[];
  content: string;
  meta: ScenarioStats;
  recentRuns: RunSummary[];
}
