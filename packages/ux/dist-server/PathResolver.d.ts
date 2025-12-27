/**
 * PathResolver provides centralized, template-based path generation
 * for all HarshJudge file operations.
 *
 * All paths are derived from a validated project root path.
 */
export declare class PathResolver {
    private readonly projectRoot;
    private readonly harshJudgePath;
    /**
     * Create a PathResolver from a project root path.
     * @param projectRoot - The project root directory (must NOT contain .harshJudge)
     * @throws Error if projectRoot contains .harshJudge
     */
    constructor(projectRoot: string);
    /** Get the project root directory */
    getProjectRoot(): string;
    /** Get the .harshJudge directory path */
    getHarshJudgePath(): string;
    /** Get config.yaml path */
    getConfigPath(): string;
    /** Get prd.md path */
    getPrdPath(): string;
    /** Get the scenarios directory path */
    getScenariosDir(): string;
    /** Get a specific scenario directory path */
    getScenarioDir(scenarioSlug: string): string;
    /** Get scenario meta.yaml path */
    getScenarioMetaPath(scenarioSlug: string): string;
    /** Get scenario.md path (v1 structure, optional) */
    getScenarioContentPath(scenarioSlug: string): string;
    /** Get the steps directory for a scenario */
    getStepsDir(scenarioSlug: string): string;
    /** Get a specific step file path */
    getStepPath(scenarioSlug: string, stepFileName: string): string;
    /** Get the runs directory for a scenario */
    getRunsDir(scenarioSlug: string): string;
    /** Get a specific run directory path */
    getRunDir(scenarioSlug: string, runId: string): string;
    /** Get run result.json path */
    getRunResultPath(scenarioSlug: string, runId: string): string;
    /** Get the step directory within a run */
    getRunStepDir(scenarioSlug: string, runId: string, stepId: string): string;
    /** Get the evidence directory for a step within a run */
    getRunStepEvidenceDir(scenarioSlug: string, runId: string, stepId: string): string;
    /** Get a specific evidence file path */
    getEvidencePath(scenarioSlug: string, runId: string, stepId: string, fileName: string): string;
    /** Get evidence metadata file path */
    getEvidenceMetaPath(scenarioSlug: string, runId: string, stepId: string, fileName: string): string;
    /** Get legacy flat evidence directory at run root */
    getLegacyEvidenceDir(scenarioSlug: string, runId: string): string;
    /**
     * Check if a path is within the .harshJudge directory (for security)
     */
    isWithinHarshJudge(path: string): boolean;
    /**
     * Validate that a path is safe (within .harshJudge and no traversal)
     */
    isPathSafe(path: string): boolean;
}
/**
 * Create a PathResolver from any path, auto-detecting if it's already
 * a .harshJudge path and extracting the project root.
 *
 * @param path - Either a project root or a .harshJudge path
 * @returns PathResolver instance
 * @throws Error if path structure is invalid
 */
export declare function createPathResolver(path: string): PathResolver;
//# sourceMappingURL=PathResolver.d.ts.map