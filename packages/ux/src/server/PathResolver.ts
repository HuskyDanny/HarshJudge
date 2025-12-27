import { join } from 'path';

/**
 * HarshJudge directory structure:
 *
 * {projectRoot}/
 * └── .harshJudge/
 *     ├── config.yaml
 *     ├── prd.md
 *     └── scenarios/
 *         └── {scenarioSlug}/
 *             ├── meta.yaml
 *             ├── steps/
 *             │   └── {stepId}-{stepTitle}.md
 *             └── runs/
 *                 └── {runId}/
 *                     ├── result.json
 *                     └── step-{stepId}/
 *                         └── evidence/
 *                             └── {evidenceName}.*
 */

const HARSHJUDGE_DIR = '.harshJudge';

/**
 * PathResolver provides centralized, template-based path generation
 * for all HarshJudge file operations.
 *
 * All paths are derived from a validated project root path.
 */
export class PathResolver {
  private readonly projectRoot: string;
  private readonly harshJudgePath: string;

  /**
   * Create a PathResolver from a project root path.
   * @param projectRoot - The project root directory (must NOT contain .harshJudge)
   * @throws Error if projectRoot contains .harshJudge
   */
  constructor(projectRoot: string) {
    // Validate: projectRoot must not contain .harshJudge
    if (projectRoot.includes(HARSHJUDGE_DIR)) {
      throw new Error(
        `Invalid projectRoot: "${projectRoot}" contains "${HARSHJUDGE_DIR}". ` +
        `Please provide the project working directory, not the .harshJudge path.`
      );
    }

    this.projectRoot = projectRoot;
    this.harshJudgePath = join(projectRoot, HARSHJUDGE_DIR);
  }

  // --- Root Paths ---

  /** Get the project root directory */
  getProjectRoot(): string {
    return this.projectRoot;
  }

  /** Get the .harshJudge directory path */
  getHarshJudgePath(): string {
    return this.harshJudgePath;
  }

  // --- Config Paths ---

  /** Get config.yaml path */
  getConfigPath(): string {
    return join(this.harshJudgePath, 'config.yaml');
  }

  /** Get prd.md path */
  getPrdPath(): string {
    return join(this.harshJudgePath, 'prd.md');
  }

  // --- Scenarios Paths ---

  /** Get the scenarios directory path */
  getScenariosDir(): string {
    return join(this.harshJudgePath, 'scenarios');
  }

  /** Get a specific scenario directory path */
  getScenarioDir(scenarioSlug: string): string {
    return join(this.getScenariosDir(), scenarioSlug);
  }

  /** Get scenario meta.yaml path */
  getScenarioMetaPath(scenarioSlug: string): string {
    return join(this.getScenarioDir(scenarioSlug), 'meta.yaml');
  }

  /** Get scenario.md path (v1 structure, optional) */
  getScenarioContentPath(scenarioSlug: string): string {
    return join(this.getScenarioDir(scenarioSlug), 'scenario.md');
  }

  // --- Steps Paths ---

  /** Get the steps directory for a scenario */
  getStepsDir(scenarioSlug: string): string {
    return join(this.getScenarioDir(scenarioSlug), 'steps');
  }

  /** Get a specific step file path */
  getStepPath(scenarioSlug: string, stepFileName: string): string {
    return join(this.getStepsDir(scenarioSlug), stepFileName);
  }

  // --- Runs Paths ---

  /** Get the runs directory for a scenario */
  getRunsDir(scenarioSlug: string): string {
    return join(this.getScenarioDir(scenarioSlug), 'runs');
  }

  /** Get a specific run directory path */
  getRunDir(scenarioSlug: string, runId: string): string {
    return join(this.getRunsDir(scenarioSlug), runId);
  }

  /** Get run result.json path */
  getRunResultPath(scenarioSlug: string, runId: string): string {
    return join(this.getRunDir(scenarioSlug, runId), 'result.json');
  }

  // --- Run Step Evidence Paths ---

  /** Get the step directory within a run */
  getRunStepDir(scenarioSlug: string, runId: string, stepId: string): string {
    return join(this.getRunDir(scenarioSlug, runId), `step-${stepId}`);
  }

  /** Get the evidence directory for a step within a run */
  getRunStepEvidenceDir(scenarioSlug: string, runId: string, stepId: string): string {
    return join(this.getRunStepDir(scenarioSlug, runId, stepId), 'evidence');
  }

  /** Get a specific evidence file path */
  getEvidencePath(scenarioSlug: string, runId: string, stepId: string, fileName: string): string {
    return join(this.getRunStepEvidenceDir(scenarioSlug, runId, stepId), fileName);
  }

  /** Get evidence metadata file path */
  getEvidenceMetaPath(scenarioSlug: string, runId: string, stepId: string, fileName: string): string {
    // Meta files are named {fileName}.meta.json
    return join(this.getRunStepEvidenceDir(scenarioSlug, runId, stepId), `${fileName}.meta.json`);
  }

  // --- Legacy v1 Evidence Paths (flat structure at run root) ---

  /** Get legacy flat evidence directory at run root */
  getLegacyEvidenceDir(scenarioSlug: string, runId: string): string {
    return join(this.getRunDir(scenarioSlug, runId), 'evidence');
  }

  // --- Utility Methods ---

  /**
   * Check if a path is within the .harshJudge directory (for security)
   */
  isWithinHarshJudge(path: string): boolean {
    return path.startsWith(this.harshJudgePath);
  }

  /**
   * Validate that a path is safe (within .harshJudge and no traversal)
   */
  isPathSafe(path: string): boolean {
    if (path.includes('..')) {
      return false;
    }
    return this.isWithinHarshJudge(path);
  }
}

/**
 * Create a PathResolver from any path, auto-detecting if it's already
 * a .harshJudge path and extracting the project root.
 *
 * @param path - Either a project root or a .harshJudge path
 * @returns PathResolver instance
 * @throws Error if path structure is invalid
 */
export function createPathResolver(path: string): PathResolver {
  // If path contains .harshJudge, extract the project root
  const harshJudgeIndex = path.indexOf(HARSHJUDGE_DIR);

  if (harshJudgeIndex !== -1) {
    // Extract everything before .harshJudge
    const projectRoot = path.substring(0, harshJudgeIndex).replace(/\/$/, '');
    if (!projectRoot) {
      throw new Error(`Invalid path: cannot determine project root from "${path}"`);
    }
    return new PathResolver(projectRoot);
  }

  // Path is already a project root
  return new PathResolver(path);
}
