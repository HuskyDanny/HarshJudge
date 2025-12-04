import { z } from 'zod';
import type { ProjectStatus, ScenarioDetail } from './status.js';

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
  scenariosPath: string;
}

// ============================================================
// saveScenario
// ============================================================

export const SaveScenarioParamsSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  estimatedDuration: z.number().positive().optional().default(60),
});
export type SaveScenarioParams = z.infer<typeof SaveScenarioParamsSchema>;

export interface SaveScenarioResult {
  success: boolean;
  slug: string;
  scenarioPath: string;
  metaPath: string;
  isNew: boolean;
}

// ============================================================
// startRun
// ============================================================

export const StartRunParamsSchema = z.object({
  scenarioSlug: z.string().regex(/^[a-z0-9-]+$/),
});
export type StartRunParams = z.infer<typeof StartRunParamsSchema>;

export interface StartRunResult {
  success: boolean;
  runId: string;
  runNumber: number;
  runPath: string;
  evidencePath: string;
  startedAt: string;
}

// ============================================================
// recordEvidence
// ============================================================

export const RecordEvidenceParamsSchema = z.object({
  runId: z.string().min(1),
  step: z.number().int().positive(),
  type: z.enum(['screenshot', 'db_snapshot', 'console_log', 'network_log', 'html_snapshot', 'custom']),
  name: z.string().min(1).max(100),
  data: z.string(), // base64 for binary, JSON string for objects, plain text for logs
  metadata: z.record(z.unknown()).optional(),
});
export type RecordEvidenceParams = z.infer<typeof RecordEvidenceParamsSchema>;

export interface RecordEvidenceResult {
  success: boolean;
  filePath: string;
  metaPath: string;
  fileSize: number;
}

// ============================================================
// completeRun
// ============================================================

export const CompleteRunParamsSchema = z.object({
  runId: z.string().min(1),
  status: z.enum(['pass', 'fail']),
  duration: z.number().nonnegative(),
  failedStep: z.number().int().positive().optional(),
  errorMessage: z.string().optional(),
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
// getStatus
// ============================================================

export const GetStatusParamsSchema = z.object({
  scenarioSlug: z.string().regex(/^[a-z0-9-]+$/).optional(),
});
export type GetStatusParams = z.infer<typeof GetStatusParamsSchema>;

export type GetStatusResult = ProjectStatus | ScenarioDetail;
