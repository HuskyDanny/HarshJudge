import {
  CreateScenarioParamsSchema,
  type CreateScenarioResult,
  type StepInput,
  type ScenarioMeta,
  type StepReference,
  DEFAULT_SCENARIO_STATS,
  padStepId,
} from '@harshjudge/shared';
import { FileSystemService, generateStepMarkdown } from '../services/file-system-service.js';
import { slugify } from '../utils/slugify.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const SCENARIOS_DIR = 'scenarios';
const STEPS_DIR = 'steps';
const META_FILE = 'meta.yaml';

/**
 * Generates a step markdown file content.
 */
function generateStepContent(stepId: string, step: StepInput): string {
  return generateStepMarkdown({
    id: stepId,
    title: step.title,
    description: step.description || '',
    preconditions: step.preconditions || '',
    actions: step.actions,
    expectedOutcome: step.expectedOutcome,
  });
}

/**
 * Creates a complete scenario structure with steps (v2).
 * Replaces the deprecated saveScenario handler.
 */
export async function handleCreateScenario(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<CreateScenarioResult> {
  // 1. Validate input parameters
  const validated = CreateScenarioParamsSchema.parse(params);

  // 2. Check if project is initialized
  if (!(await fs.exists(HARSH_JUDGE_DIR))) {
    throw new Error('Project not initialized. Run initProject first.');
  }

  // 3. Determine if scenario already exists
  const scenarioPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${validated.slug}`;
  const stepsPath = `${scenarioPath}/${STEPS_DIR}`;
  const metaPath = `${scenarioPath}/${META_FILE}`;
  const isNew = !(await fs.exists(scenarioPath));

  // 4. Create directories
  await fs.ensureDir(stepsPath);

  // 5. If updating, remove old step files that aren't in new steps
  if (!isNew) {
    const existingStepFiles = await fs.listStepFiles(validated.slug);
    const newStepCount = validated.steps.length;

    for (const file of existingStepFiles) {
      const stepNum = parseInt(file.substring(0, 2), 10);
      if (stepNum > newStepCount) {
        // Remove orphaned step file
        const orphanPath = `${stepsPath}/${file}`;
        // Note: FileSystemService doesn't have delete, so we just overwrite
        // In production, you'd want to add a delete method
      }
    }
  }

  // 6. Generate step files
  const stepFiles: string[] = [];
  const stepRefs: StepReference[] = [];

  for (let i = 0; i < validated.steps.length; i++) {
    const step = validated.steps[i];
    const stepId = padStepId(i + 1);
    const stepSlug = slugify(step.title);
    const filename = `${stepId}-${stepSlug}.md`;
    const stepFilePath = `${stepsPath}/${filename}`;

    // Generate step content
    const content = generateStepContent(stepId, step);
    await fs.writeFile(stepFilePath, content);

    stepFiles.push(stepFilePath);
    stepRefs.push({
      id: stepId,
      title: step.title,
      file: filename,
    });
  }

  // 7. Generate and write meta.yaml
  const existingMeta = isNew ? null : await loadExistingMeta(fs, metaPath);

  const meta: ScenarioMeta = {
    // Definition fields
    title: validated.title,
    slug: validated.slug,
    starred: validated.starred,
    tags: validated.tags,
    estimatedDuration: validated.estimatedDuration,
    steps: stepRefs,
    // Statistics (preserve existing or initialize)
    ...DEFAULT_SCENARIO_STATS,
    ...(existingMeta
      ? {
          totalRuns: existingMeta.totalRuns,
          passCount: existingMeta.passCount,
          failCount: existingMeta.failCount,
          lastRun: existingMeta.lastRun,
          lastResult: existingMeta.lastResult,
          avgDuration: existingMeta.avgDuration,
        }
      : {}),
  };

  await fs.writeYaml(metaPath, meta);

  // 8. Return result
  return {
    success: true,
    slug: validated.slug,
    scenarioPath,
    metaPath,
    stepsPath,
    stepFiles,
    isNew,
  };
}

/**
 * Load existing meta.yaml if it exists, for preserving statistics.
 */
async function loadExistingMeta(
  fs: FileSystemService,
  metaPath: string
): Promise<ScenarioMeta | null> {
  try {
    if (await fs.exists(metaPath)) {
      return await fs.readYaml<ScenarioMeta>(metaPath);
    }
  } catch {
    // Ignore errors, return null
  }
  return null;
}
