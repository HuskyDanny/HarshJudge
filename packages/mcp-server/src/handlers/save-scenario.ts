import {
  SaveScenarioParamsSchema,
  type SaveScenarioResult,
  type ScenarioMeta,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const SCENARIOS_DIR = 'scenarios';
const SCENARIO_FILE = 'scenario.md';
const META_FILE = 'meta.yaml';

/**
 * Finds a unique slug by appending numeric suffix if needed.
 * Returns the unique slug and whether it's a new scenario.
 * @deprecated Use createScenario instead
 */
async function findUniqueSlug(
  fs: FileSystemService,
  baseSlug: string
): Promise<{ slug: string; isNew: boolean }> {
  const scenarioPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${baseSlug}`;

  if (!(await fs.exists(scenarioPath))) {
    return { slug: baseSlug, isNew: true };
  }

  // Find unique slug with numeric suffix
  let suffix = 2;
  while (suffix <= 1000) {
    // Safety limit to prevent infinite loop
    const newSlug = `${baseSlug}-${suffix}`;
    const newPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${newSlug}`;
    if (!(await fs.exists(newPath))) {
      return { slug: newSlug, isNew: true };
    }
    suffix++;
  }

  throw new Error(`Could not find unique slug for "${baseSlug}" after 1000 attempts`);
}

/**
 * Saves a test scenario to the filesystem.
 * Creates scenario directory with scenario.md and meta.yaml files.
 * @deprecated Use createScenario instead. This tool will be removed in a future version.
 */
export async function handleSaveScenario(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<SaveScenarioResult> {
  // Deprecation warning
  console.error(
    '[HarshJudge] WARNING: saveScenario is deprecated. Use createScenario instead for proper step structure.'
  );

  // 1. Validate input parameters
  const validated = SaveScenarioParamsSchema.parse(params);

  // 2. Check if project is initialized
  if (!(await fs.exists(HARSH_JUDGE_DIR))) {
    throw new Error('Project not initialized. Run initProject first.');
  }

  // 3. Find unique slug (handles duplicates)
  const { slug, isNew } = await findUniqueSlug(fs, validated.slug);

  // 4. Create scenario directory
  const scenarioDir = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${slug}`;
  await fs.ensureDir(scenarioDir);

  // 5. Build and write scenario.md with YAML frontmatter
  const tagsArray = validated.tags ?? [];
  const frontmatter = `---
id: ${slug}
title: ${validated.title}
tags: [${tagsArray.join(', ')}]
estimatedDuration: ${validated.estimatedDuration}
---

`;
  const scenarioContent = frontmatter + validated.content;
  const scenarioPath = `${scenarioDir}/${SCENARIO_FILE}`;
  await fs.writeFile(scenarioPath, scenarioContent);

  // 6. Write meta.yaml with initial statistics
  const initialMeta: ScenarioMeta = {
    totalRuns: 0,
    passCount: 0,
    failCount: 0,
    lastRun: null,
    lastResult: null,
    avgDuration: 0,
  };
  const metaPath = `${scenarioDir}/${META_FILE}`;
  await fs.writeYaml(metaPath, initialMeta);

  // 7. Return result
  return {
    success: true,
    slug,
    scenarioPath,
    metaPath,
    isNew,
  };
}
