import { z } from 'zod';

// ============================================================
// Step Types (NEW in v2)
// ============================================================

/**
 * Reference to a step file in meta.yaml
 */
export const StepReferenceSchema = z.object({
  id: z.string().regex(/^\d{2}$/, 'Step ID must be zero-padded (01, 02, etc.)'),
  title: z.string().min(1),
  file: z.string().regex(/^\d{2}-[\w-]+\.md$/, 'Step file must match pattern: {id}-{slug}.md'),
});
export type StepReference = z.infer<typeof StepReferenceSchema>;

/**
 * Full step definition with content sections
 */
export interface Step {
  id: string;
  title: string;
  description: string;
  preconditions: string;
  actions: string;
  expectedOutcome: string;
}

/**
 * Step file read from filesystem
 */
export interface StepFile {
  id: string;
  title: string;
  content: string; // Full markdown content
}

// ============================================================
// Scenario Types (v2)
// ============================================================

/**
 * Test scenario definition (v2 - with steps)
 */
export interface Scenario {
  slug: string;
  title: string;
  starred: boolean;
  tags: string[];
  estimatedDuration: number;
  steps: StepReference[];
}

/**
 * Full scenario metadata stored in `meta.yaml` (v2)
 * Combines scenario definition + machine-updated statistics
 */
export const ScenarioMetaSchema = z.object({
  // Scenario definition
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  starred: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  estimatedDuration: z.number().positive().default(60),
  steps: z.array(StepReferenceSchema).default([]),

  // Statistics (machine-updated)
  totalRuns: z.number().nonnegative().default(0),
  passCount: z.number().nonnegative().default(0),
  failCount: z.number().nonnegative().default(0),
  lastRun: z.string().nullable().default(null),
  lastResult: z.enum(['pass', 'fail']).nullable().default(null),
  avgDuration: z.number().nonnegative().default(0),
});
export type ScenarioMeta = z.infer<typeof ScenarioMetaSchema>;

// ============================================================
// Statistics Types (shared between v1 and v2)
// ============================================================

/**
 * Machine-updated statistics (shared structure)
 */
export interface ScenarioStats {
  totalRuns: number;
  passCount: number;
  failCount: number;
  lastRun: string | null;
  lastResult: 'pass' | 'fail' | null;
  avgDuration: number;
}

/**
 * Default statistics values for new scenarios
 */
export const DEFAULT_SCENARIO_STATS: ScenarioStats = {
  totalRuns: 0,
  passCount: 0,
  failCount: 0,
  lastRun: null,
  lastResult: null,
  avgDuration: 0,
};

// ============================================================
// Legacy Types (v1 - deprecated)
// ============================================================

/**
 * @deprecated Use Scenario instead (v2)
 * Test scenario definition stored as `scenario.md` with YAML frontmatter
 */
export interface ScenarioV1 {
  id: string;
  title: string;
  tags: string[];
  estimatedDuration: number;
  content: string;
}

/**
 * @deprecated Use ScenarioMeta instead (v2)
 * YAML frontmatter extracted from scenario.md
 */
export interface ScenarioFrontmatter {
  id: string;
  title: string;
  tags: string[];
  estimatedDuration: number;
}

/**
 * @deprecated Use ScenarioStats instead
 * Machine-updated statistics stored in `meta.yaml`
 */
export type ScenarioMetaV1 = ScenarioStats;

// ============================================================
// Utility Functions
// ============================================================

/**
 * Generate zero-padded step ID from number
 */
export function padStepId(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Generate step filename from id and title
 */
export function generateStepFilename(id: string, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${id}-${slug}.md`;
}
