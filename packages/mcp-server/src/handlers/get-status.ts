import {
  GetStatusParamsSchema,
  type GetStatusResult,
  type ProjectStatus,
  type ScenarioDetail,
  type ScenarioSummary,
  type ScenarioMeta,
  type HarshJudgeConfig,
  type RunSummary,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const SCENARIOS_DIR = 'scenarios';
const CONFIG_FILE = 'config.yaml';
const SCENARIO_FILE = 'scenario.md';
const META_FILE = 'meta.yaml';
const RUNS_DIR = 'runs';
const RESULT_FILE = 'result.json';

/**
 * Parses YAML frontmatter from scenario.md content.
 */
function parseFrontmatter(content: string): { title: string; tags: string[] } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match || !match[1]) {
    return { title: 'Untitled', tags: [] };
  }

  const frontmatter = match[1];
  let title = 'Untitled';
  let tags: string[] = [];

  // Parse title
  const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  // Parse tags
  const tagsMatch = frontmatter.match(/^tags:\s*\[([^\]]*)\]/m);
  if (tagsMatch && tagsMatch[1] !== undefined) {
    tags = tagsMatch[1]
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }

  return { title, tags };
}

/**
 * Gets the content of scenario.md without the frontmatter.
 */
function getContentWithoutFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n*/, '');
}

/**
 * Extended ScenarioMeta that may include v2 fields
 */
interface ScenarioMetaV2 extends ScenarioMeta {
  starred?: boolean;
  title?: string;
  steps?: Array<{ id: string; title: string; file: string }>;
}

/**
 * Gets project-level status with all scenarios.
 */
async function getProjectStatus(
  fs: FileSystemService,
  starredOnly: boolean = false
): Promise<ProjectStatus> {
  // Read config
  const configPath = `${HARSH_JUDGE_DIR}/${CONFIG_FILE}`;
  const config = await fs.readYaml<HarshJudgeConfig>(configPath);

  // Get all scenarios
  const scenariosPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}`;
  const scenarioSlugs = await fs.listDirs(scenariosPath);

  const scenarios: ScenarioSummary[] = [];
  let passing = 0;
  let failing = 0;
  let neverRun = 0;

  for (const slug of scenarioSlugs) {
    const scenarioPath = `${scenariosPath}/${slug}`;

    // Read meta.yaml for stats (v2 format includes title, starred, steps)
    const metaPath = `${scenarioPath}/${META_FILE}`;
    let meta: ScenarioMetaV2;
    let title = 'Untitled';
    let tags: string[] = [];
    let starred = false;
    let stepCount = 0;

    if (await fs.exists(metaPath)) {
      meta = await fs.readYaml<ScenarioMetaV2>(metaPath);
      // v2 format: title and starred in meta.yaml
      if (meta.title) {
        title = meta.title;
      }
      starred = meta.starred ?? false;
      stepCount = meta.steps?.length ?? 0;
    } else {
      meta = {
        totalRuns: 0,
        passCount: 0,
        failCount: 0,
        lastRun: null,
        lastResult: null,
        avgDuration: 0,
      };
    }

    // Fallback to scenario.md for title and tags (v1 format)
    const scenarioFilePath = `${scenarioPath}/${SCENARIO_FILE}`;
    if (await fs.exists(scenarioFilePath)) {
      const scenarioContent = await fs.readFile(scenarioFilePath);
      const parsed = parseFrontmatter(scenarioContent);
      if (!meta.title) {
        title = parsed.title;
      }
      tags = parsed.tags;
    }

    // Skip non-starred scenarios if filter is enabled
    if (starredOnly && !starred) {
      continue;
    }

    // Calculate pass rate
    const passRate = meta.totalRuns > 0
      ? Math.round((meta.passCount / meta.totalRuns) * 100)
      : 0;

    // Count status
    if (meta.totalRuns === 0) {
      neverRun++;
    } else if (meta.lastResult === 'pass') {
      passing++;
    } else {
      failing++;
    }

    scenarios.push({
      slug,
      title,
      starred,
      tags,
      stepCount,
      lastResult: meta.lastResult,
      lastRun: meta.lastRun,
      totalRuns: meta.totalRuns,
      passRate,
    });
  }

  return {
    projectName: config.projectName,
    scenarioCount: scenarios.length,
    passing,
    failing,
    neverRun,
    scenarios,
  };
}

/**
 * Gets detailed status for a specific scenario.
 */
async function getScenarioDetail(
  fs: FileSystemService,
  slug: string
): Promise<ScenarioDetail> {
  const scenarioPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${slug}`;

  // Check if scenario exists
  if (!(await fs.exists(scenarioPath))) {
    throw new Error(`Scenario "${slug}" does not exist.`);
  }

  // Read meta.yaml for stats (v2 format includes title, starred, steps)
  const metaPath = `${scenarioPath}/${META_FILE}`;
  let meta: ScenarioMetaV2;
  let title = 'Untitled';
  let tags: string[] = [];
  let starred = false;
  let stepCount = 0;
  let content = '';

  if (await fs.exists(metaPath)) {
    meta = await fs.readYaml<ScenarioMetaV2>(metaPath);
    // v2 format: title and starred in meta.yaml
    if (meta.title) {
      title = meta.title;
    }
    starred = meta.starred ?? false;
    stepCount = meta.steps?.length ?? 0;
  } else {
    meta = {
      totalRuns: 0,
      passCount: 0,
      failCount: 0,
      lastRun: null,
      lastResult: null,
      avgDuration: 0,
    };
  }

  // Fallback to scenario.md for title and tags (v1 format)
  const scenarioFilePath = `${scenarioPath}/${SCENARIO_FILE}`;
  if (await fs.exists(scenarioFilePath)) {
    const scenarioContent = await fs.readFile(scenarioFilePath);
    const parsed = parseFrontmatter(scenarioContent);
    if (!meta.title) {
      title = parsed.title;
    }
    tags = parsed.tags;
    content = getContentWithoutFrontmatter(scenarioContent);
  }

  // Get recent runs (last 10)
  const runsPath = `${scenarioPath}/${RUNS_DIR}`;
  const recentRuns: RunSummary[] = [];

  if (await fs.exists(runsPath)) {
    const runIds = await fs.listDirs(runsPath);

    // Type for run result data
    interface RunResultData {
      runId: string;
      status: 'pass' | 'fail';
      duration: number;
      completedAt: string;
      errorMessage?: string | null;
    }

    // Read results for completed runs
    const runResults: Array<{ id: string; result: RunResultData }> = [];

    for (const id of runIds) {
      const resultPath = `${runsPath}/${id}/${RESULT_FILE}`;
      if (await fs.exists(resultPath)) {
        const result = await fs.readJson<RunResultData>(resultPath);
        runResults.push({ id, result });
      }
    }

    // Sort by completedAt descending and take last 10
    runResults.sort((a, b) =>
      new Date(b.result.completedAt).getTime() -
      new Date(a.result.completedAt).getTime()
    );

    for (let i = 0; i < Math.min(10, runResults.length); i++) {
      const runData = runResults[i];
      if (runData) {
        const { id, result } = runData;
        recentRuns.push({
          id,
          runNumber: runResults.length - i, // Approximate run number
          status: result.status,
          duration: result.duration,
          completedAt: result.completedAt,
          errorMessage: result.errorMessage || null,
        });
      }
    }
  }

  return {
    slug,
    title,
    starred,
    tags,
    stepCount,
    content,
    meta,
    recentRuns,
  };
}

/**
 * Gets status of all scenarios or a specific scenario.
 */
export async function handleGetStatus(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<GetStatusResult> {
  // 1. Validate input parameters
  const validated = GetStatusParamsSchema.parse(params);

  // 2. Check if project is initialized
  if (!(await fs.exists(HARSH_JUDGE_DIR))) {
    throw new Error('Project not initialized. Run initProject first.');
  }

  // 3. Return appropriate status
  if (validated.scenarioSlug) {
    return getScenarioDetail(fs, validated.scenarioSlug);
  } else {
    return getProjectStatus(fs, validated.starredOnly);
  }
}
