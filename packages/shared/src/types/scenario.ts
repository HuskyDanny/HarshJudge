/**
 * Test scenario definition stored as `scenario.md` with YAML frontmatter
 */
export interface Scenario {
  id: string;
  title: string;
  tags: string[];
  estimatedDuration: number;
  content: string;
}

/**
 * YAML frontmatter extracted from scenario.md
 */
export interface ScenarioFrontmatter {
  id: string;
  title: string;
  tags: string[];
  estimatedDuration: number;
}

/**
 * Machine-updated statistics stored in `meta.yaml`
 */
export interface ScenarioMeta {
  totalRuns: number;
  passCount: number;
  failCount: number;
  lastRun: string | null;
  lastResult: 'pass' | 'fail' | null;
  avgDuration: number;
}
