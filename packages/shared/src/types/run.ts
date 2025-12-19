import { z } from 'zod';

/**
 * Result of a single step execution
 */
export const StepResultSchema = z.object({
  id: z.string().regex(/^\d{2}$/, 'Step ID must be zero-padded'),
  status: z.enum(['pass', 'fail', 'skipped']),
  duration: z.number().nonnegative().optional().default(0),
  error: z.string().nullable().default(null),
  evidenceFiles: z.array(z.string()).default([]),
});
export type StepResult = z.infer<typeof StepResultSchema>;

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
 * Final outcome of a run stored in `result.json` (v2)
 */
export const RunResultSchema = z.object({
  runId: z.string(),
  scenarioSlug: z.string().optional(), // Optional for backward compat
  status: z.enum(['pass', 'fail', 'running']),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  duration: z.number().nonnegative().optional().default(0),
  steps: z.array(StepResultSchema).default([]),
  failedStep: z.string().nullable().default(null), // Changed from number to string (step ID)
  errorMessage: z.string().nullable().default(null),
});
export type RunResult = z.infer<typeof RunResultSchema>;

/**
 * @deprecated Legacy v1 result format
 */
export interface RunResultV1 {
  runId: string;
  status: 'pass' | 'fail';
  duration: number;
  completedAt: string;
  failedStep: number | null;
  errorMessage: string | null;
  stepCount: number;
  evidenceCount: number;
}
