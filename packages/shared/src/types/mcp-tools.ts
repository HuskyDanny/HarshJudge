import { z } from 'zod';
import type { ProjectStatus, ScenarioDetail } from './status.js';
import { StepResultSchema } from './run.js';

// ============================================================
// initProject
// ============================================================

export const InitProjectParamsSchema = z.object({
  projectName: z.string().min(1).max(100),
  baseUrl: z.string().url().optional(),
});
export type InitProjectParams = z.infer<typeof InitProjectParamsSchema>;

export interface InitProjectResult {
  success: boolean;
  projectPath: string;
  configPath: string;
  prdPath: string;
  scenariosPath: string;
  dashboardUrl?: string;
  message?: string;
}

// ============================================================
// saveScenario (DEPRECATED - use createScenario instead)
// ============================================================

/** @deprecated Use CreateScenarioParamsSchema instead */
export const SaveScenarioParamsSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  estimatedDuration: z.number().positive().optional().default(60),
});
/** @deprecated Use CreateScenarioParams instead */
export type SaveScenarioParams = z.infer<typeof SaveScenarioParamsSchema>;

/** @deprecated Use CreateScenarioResult instead */
export interface SaveScenarioResult {
  success: boolean;
  slug: string;
  scenarioPath: string;
  metaPath: string;
  isNew: boolean;
}

// ============================================================
// createScenario (NEW - replaces saveScenario)
// ============================================================

export const StepInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  preconditions: z.string().optional().default(''),
  actions: z.string().min(1),
  expectedOutcome: z.string().min(1),
});
export type StepInput = z.infer<typeof StepInputSchema>;

export const CreateScenarioParamsSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(200),
  steps: z.array(StepInputSchema).min(1),
  tags: z.array(z.string()).optional().default([]),
  estimatedDuration: z.number().positive().optional().default(60),
  starred: z.boolean().optional().default(false),
});
export type CreateScenarioParams = z.infer<typeof CreateScenarioParamsSchema>;

export interface CreateScenarioResult {
  success: boolean;
  slug: string;
  scenarioPath: string;
  metaPath: string;
  stepsPath: string;
  stepFiles: string[];
  isNew: boolean;
}

// ============================================================
// toggleStar
// ============================================================

export const ToggleStarParamsSchema = z.object({
  scenarioSlug: z.string().regex(/^[a-z0-9-]+$/),
  starred: z.boolean().optional(), // If omitted, toggles current state
});
export type ToggleStarParams = z.infer<typeof ToggleStarParamsSchema>;

export interface ToggleStarResult {
  success: boolean;
  slug: string;
  starred: boolean;
}

// ============================================================
// startRun
// ============================================================

export const StartRunParamsSchema = z.object({
  scenarioSlug: z.string().regex(/^[a-z0-9-]+$/),
});
export type StartRunParams = z.infer<typeof StartRunParamsSchema>;

export interface StartRunStepInfo {
  id: string; // Zero-padded step ID (e.g., "01", "02")
  title: string;
  file: string; // Filename in steps/ directory
}

export interface StartRunResult {
  success: boolean;
  runId: string;
  runNumber: number;
  runPath: string;
  evidencePath: string;
  startedAt: string;
  // NEW: Step information for orchestration
  scenarioSlug: string;
  scenarioTitle: string;
  steps: StartRunStepInfo[];
}

// ============================================================
// recordEvidence (v2 - stepId instead of step number)
// ============================================================

export const RecordEvidenceParamsSchema = z.object({
  runId: z.string().min(1),
  step: z.number().int().positive(), // v2: accepts number, will be converted to zero-padded string
  type: z.enum(['screenshot', 'db_snapshot', 'console_log', 'network_log', 'html_snapshot', 'custom']),
  name: z.string().min(1).max(100),
  data: z.string(), // For screenshot: absolute file path; for others: content
  metadata: z.record(z.unknown()).optional(),
});
export type RecordEvidenceParams = z.infer<typeof RecordEvidenceParamsSchema>;

export interface RecordEvidenceResult {
  success: boolean;
  filePath: string;
  metaPath: string;
  stepPath: string; // NEW: path to the step's evidence directory
  fileSize: number;
}

// ============================================================
// completeRun (v2 - step ID string, optional steps array)
// ============================================================

export const CompleteRunParamsSchema = z.object({
  runId: z.string().min(1),
  status: z.enum(['pass', 'fail']),
  duration: z.number().nonnegative(),
  failedStep: z.string().regex(/^\d{2}$/, 'Step ID must be zero-padded').optional(), // Changed from number to string
  errorMessage: z.string().optional(),
  steps: z.array(StepResultSchema).optional(), // NEW: per-step results
});
export type CompleteRunParams = z.infer<typeof CompleteRunParamsSchema>;

export interface CompleteRunResult {
  success: boolean;
  resultPath: string;
  updatedMeta: {
    totalRuns: number;
    passCount: number;
    failCount: number;
    avgDuration: number;
  };
}

// ============================================================
// completeStep (NEW in v2)
// ============================================================

export const CompleteStepParamsSchema = z.object({
  runId: z.string().min(1),
  stepId: z.string().regex(/^\d{2}$/, 'Step ID must be zero-padded (e.g., "01", "02")'),
  status: z.enum(['pass', 'fail', 'skipped']),
  duration: z.number().nonnegative(),
  error: z.string().optional(),
  /** AI-generated summary describing what happened in this step and match result */
  summary: z.string().optional(),
});
export type CompleteStepParams = z.infer<typeof CompleteStepParamsSchema>;

export interface CompleteStepResult {
  success: boolean;
  runId: string;
  stepId: string;
  status: 'pass' | 'fail' | 'skipped';
  nextStepId: string | null; // null if last step or should stop
}

// ============================================================
// getStatus
// ============================================================

export const GetStatusParamsSchema = z.object({
  scenarioSlug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  starredOnly: z.boolean().optional().default(false),
});
export type GetStatusParams = z.infer<typeof GetStatusParamsSchema>;

export type GetStatusResult = ProjectStatus | ScenarioDetail;

// ============================================================
// openDashboard
// ============================================================

export const OpenDashboardParamsSchema = z.object({
  port: z.number().int().min(1024).max(65535).optional(),
  openBrowser: z.boolean().optional().default(true),
  projectPath: z.string().optional().describe('Path to the project directory containing .harshJudge folder. Defaults to current working directory.'),
});
export type OpenDashboardParams = z.infer<typeof OpenDashboardParamsSchema>;

export interface OpenDashboardResult {
  success: boolean;
  url: string;
  port: number;
  pid: number;
  alreadyRunning: boolean;
  message: string;
}

// ============================================================
// closeDashboard
// ============================================================

export const CloseDashboardParamsSchema = z.object({
  projectPath: z.string().optional().describe('Path to the project directory containing .harshJudge folder. Defaults to current working directory.'),
});
export type CloseDashboardParams = z.infer<typeof CloseDashboardParamsSchema>;

export interface CloseDashboardResult {
  success: boolean;
  wasRunning: boolean;
  message: string;
}

// ============================================================
// getDashboardStatus
// ============================================================

export const GetDashboardStatusParamsSchema = z.object({
  projectPath: z.string().optional().describe('Path to the project directory containing .harshJudge folder. Defaults to current working directory.'),
});
export type GetDashboardStatusParams = z.infer<typeof GetDashboardStatusParamsSchema>;

export interface GetDashboardStatusResult {
  running: boolean;
  pid?: number;
  port?: number;
  url?: string;
  startedAt?: string;
  stale?: boolean;
  message: string;
}
