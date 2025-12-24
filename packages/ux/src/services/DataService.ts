import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import yaml from 'js-yaml';
import type {
  HarshJudgeConfig,
  ScenarioStats,
  RunResult,
  ScenarioSummary,
  ScenarioDetail,
  RunSummary,
} from '@harshjudge/shared';

export interface ProjectSummary {
  path: string;
  name: string;
  scenarioCount: number;
  overallStatus: 'pass' | 'fail' | 'never_run';
}

export interface RunDetail {
  runId: string;
  scenarioSlug: string;
  result: RunResult | null;
  evidencePaths: string[];
}

export class DataService {
  constructor(private basePath: string = '.') {}

  /**
   * Discover all HarshJudge projects in the base path
   */
  async getProjects(): Promise<ProjectSummary[]> {
    try {
      const harshJudgePath = join(this.basePath, '.harshJudge');
      const exists = await this.pathExists(harshJudgePath);

      if (!exists) {
        return [];
      }

      const config = await this.readConfig(harshJudgePath);
      if (!config) {
        return [];
      }

      const scenarios = await this.getScenarios(harshJudgePath);
      const overallStatus = this.calculateOverallStatus(scenarios);

      return [{
        path: harshJudgePath,
        name: config.projectName,
        scenarioCount: scenarios.length,
        overallStatus,
      }];
    } catch {
      return [];
    }
  }

  /**
   * Get all scenarios for a project
   */
  async getScenarios(projectPath: string): Promise<ScenarioSummary[]> {
    try {
      const scenariosPath = join(projectPath, 'scenarios');
      const exists = await this.pathExists(scenariosPath);

      if (!exists) {
        return [];
      }

      const entries = await readdir(scenariosPath, { withFileTypes: true });
      const scenarioDirs = entries.filter(e => e.isDirectory());

      const scenarios: ScenarioSummary[] = [];

      for (const dir of scenarioDirs) {
        const scenario = await this.readScenarioSummary(
          join(scenariosPath, dir.name),
          dir.name
        );
        if (scenario) {
          scenarios.push(scenario);
        }
      }

      // Sort by last run time (most recent first)
      return scenarios.sort((a, b) => {
        if (!a.lastRun && !b.lastRun) return 0;
        if (!a.lastRun) return 1;
        if (!b.lastRun) return -1;
        return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
      });
    } catch {
      return [];
    }
  }

  /**
   * Get detailed scenario information including runs
   */
  async getScenarioDetail(
    projectPath: string,
    slug: string
  ): Promise<ScenarioDetail | null> {
    try {
      const scenarioPath = join(projectPath, 'scenarios', slug);
      const exists = await this.pathExists(scenarioPath);

      if (!exists) {
        return null;
      }

      const [scenarioContent, meta] = await Promise.all([
        this.readScenarioContent(scenarioPath),
        this.readScenarioStats(scenarioPath),
      ]);

      if (!scenarioContent) {
        return null;
      }

      const recentRuns = await this.getRecentRuns(scenarioPath, 10);
      const metaData = meta || this.defaultMeta();

      return {
        slug,
        title: scenarioContent.title,
        starred: false, // v1 DataService doesn't support starring
        tags: scenarioContent.tags,
        stepCount: 0, // v1 structure doesn't have steps
        steps: [], // v1 structure doesn't have steps array
        content: scenarioContent.content,
        meta: metaData,
        recentRuns,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get run detail including evidence paths
   */
  async getRunDetail(
    projectPath: string,
    scenarioSlug: string,
    runId: string
  ): Promise<RunDetail | null> {
    try {
      const runPath = join(projectPath, 'scenarios', scenarioSlug, 'runs', runId);
      const exists = await this.pathExists(runPath);

      if (!exists) {
        return null;
      }

      const result = await this.readRunResult(runPath);
      const evidencePaths = await this.getEvidencePaths(runPath);

      return {
        runId,
        scenarioSlug,
        result,
        evidencePaths,
      };
    } catch {
      return null;
    }
  }

  // --- Private helper methods ---

  private async pathExists(path: string): Promise<boolean> {
    try {
      await stat(path);
      return true;
    } catch {
      return false;
    }
  }

  private async readConfig(projectPath: string): Promise<HarshJudgeConfig | null> {
    try {
      const configPath = join(projectPath, 'config.yaml');
      const content = await readFile(configPath, 'utf-8');
      return yaml.load(content) as HarshJudgeConfig;
    } catch {
      return null;
    }
  }

  private async readScenarioStats(scenarioPath: string): Promise<ScenarioStats | null> {
    try {
      const metaPath = join(scenarioPath, 'meta.yaml');
      const content = await readFile(metaPath, 'utf-8');
      return yaml.load(content) as ScenarioStats;
    } catch {
      return null;
    }
  }

  private async readScenarioContent(
    scenarioPath: string
  ): Promise<{ title: string; tags: string[]; content: string } | null> {
    try {
      const scenarioFile = join(scenarioPath, 'scenario.md');
      const content = await readFile(scenarioFile, 'utf-8');

      // Parse YAML frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!frontmatterMatch || !frontmatterMatch[1] || frontmatterMatch[2] === undefined) {
        return null;
      }

      const frontmatter = yaml.load(frontmatterMatch[1]) as {
        title: string;
        tags: string[];
      };

      return {
        title: frontmatter.title || 'Untitled',
        tags: frontmatter.tags || [],
        content: frontmatterMatch[2],
      };
    } catch {
      return null;
    }
  }

  private async readScenarioSummary(
    scenarioPath: string,
    slug: string
  ): Promise<ScenarioSummary | null> {
    const [meta, scenario] = await Promise.all([
      this.readScenarioStats(scenarioPath),
      this.readScenarioContent(scenarioPath),
    ]);

    if (!scenario) {
      return null;
    }

    const metaData = meta || this.defaultMeta();
    const passRate = metaData.totalRuns > 0
      ? (metaData.passCount / metaData.totalRuns) * 100
      : 0;

    return {
      slug,
      title: scenario.title,
      starred: false, // v1 DataService doesn't support starring
      tags: scenario.tags,
      stepCount: 0, // v1 structure doesn't have steps
      lastResult: metaData.lastResult,
      lastRun: metaData.lastRun,
      totalRuns: metaData.totalRuns,
      passRate,
    };
  }

  private async readRunResult(runPath: string): Promise<RunResult | null> {
    try {
      const resultPath = join(runPath, 'result.json');
      const content = await readFile(resultPath, 'utf-8');
      return JSON.parse(content) as RunResult;
    } catch {
      return null;
    }
  }

  private async getRecentRuns(
    scenarioPath: string,
    limit: number
  ): Promise<RunSummary[]> {
    try {
      const runsPath = join(scenarioPath, 'runs');
      const exists = await this.pathExists(runsPath);

      if (!exists) {
        return [];
      }

      const entries = await readdir(runsPath, { withFileTypes: true });
      const runDirs = entries.filter(e => e.isDirectory());

      const runs: RunSummary[] = [];

      for (const dir of runDirs) {
        const runPath = join(runsPath, dir.name);
        const result = await this.readRunResult(runPath);

        if (result) {
          // Support both completed runs (pass/fail) and running runs
          const status = result.status as 'pass' | 'fail' | 'running';
          runs.push({
            id: result.runId,
            runNumber: runs.length + 1,
            status,
            duration: result.duration ?? 0,
            startedAt: result.startedAt,
            completedAt: result.completedAt,
            errorMessage: result.errorMessage ?? null,
          });
        }
      }

      // Sort by startedAt (most recent first), fallback to completedAt, and limit
      return runs
        .sort((a, b) => {
          const aTime = new Date(a.startedAt || a.completedAt || 0).getTime();
          const bTime = new Date(b.startedAt || b.completedAt || 0).getTime();
          return bTime - aTime;
        })
        .slice(0, limit);
    } catch {
      return [];
    }
  }

  private async getEvidencePaths(runPath: string): Promise<string[]> {
    try {
      // Check for v2 structure first (step-XX directories)
      const runEntries = await readdir(runPath, { withFileTypes: true });
      const stepDirs = runEntries.filter(
        e => e.isDirectory() && e.name.startsWith('step-')
      );

      if (stepDirs.length > 0) {
        // v2 structure: collect evidence from each step-XX/evidence/ directory
        const allPaths: string[] = [];
        for (const stepDir of stepDirs) {
          const stepEvidencePath = join(runPath, stepDir.name, 'evidence');
          const stepEvidenceExists = await this.pathExists(stepEvidencePath);
          if (stepEvidenceExists) {
            const entries = await readdir(stepEvidencePath);
            const paths = entries
              .filter(e => !e.endsWith('.meta.json'))
              .map(e => join(stepEvidencePath, e));
            allPaths.push(...paths);
          }
        }
        return allPaths;
      }

      // v1 structure: evidence directly in run/evidence/
      const evidencePath = join(runPath, 'evidence');
      const exists = await this.pathExists(evidencePath);

      if (!exists) {
        return [];
      }

      const entries = await readdir(evidencePath);
      // Filter out .meta.json files, return only actual evidence files
      return entries
        .filter(e => !e.endsWith('.meta.json'))
        .map(e => join(evidencePath, e));
    } catch {
      return [];
    }
  }

  private calculateOverallStatus(
    scenarios: ScenarioSummary[]
  ): 'pass' | 'fail' | 'never_run' {
    if (scenarios.length === 0) {
      return 'never_run';
    }

    const hasFailure = scenarios.some(s => s.lastResult === 'fail');
    if (hasFailure) {
      return 'fail';
    }

    const hasPass = scenarios.some(s => s.lastResult === 'pass');
    if (hasPass) {
      return 'pass';
    }

    return 'never_run';
  }

  private defaultMeta(): ScenarioStats {
    return {
      totalRuns: 0,
      passCount: 0,
      failCount: 0,
      lastRun: null,
      lastResult: null,
      avgDuration: 0,
    };
  }
}

// Default singleton instance
export const dataService = new DataService();
