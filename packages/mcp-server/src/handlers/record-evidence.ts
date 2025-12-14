import {
  RecordEvidenceParamsSchema,
  type RecordEvidenceResult,
} from '@harshjudge/shared';
import { FileSystemService } from '../services/file-system-service.js';

const HARSH_JUDGE_DIR = '.harshJudge';
const SCENARIOS_DIR = 'scenarios';
const RUNS_DIR = 'runs';
const EVIDENCE_DIR = 'evidence';
const RESULT_FILE = 'result.json';

// Map evidence types to file extensions
const EVIDENCE_EXTENSIONS: Record<string, string> = {
  screenshot: 'png',
  db_snapshot: 'json',
  console_log: 'txt',
  network_log: 'json',
  html_snapshot: 'html',
  custom: 'json',
};

// Binary types that require file path input
const BINARY_TYPES = new Set(['screenshot']);

/**
 * Check if a string looks like an absolute file path
 * Supports Windows (C:\...) and Unix (/...) paths
 */
function isAbsoluteFilePath(data: string): boolean {
  // Windows absolute path (e.g., C:\Users\... or D:/path/...)
  if (/^[A-Z]:[/\\]/i.test(data)) {
    return true;
  }
  // Unix absolute path (starts with /)
  if (data.startsWith('/')) {
    return true;
  }
  return false;
}

/**
 * Finds the run directory by searching all scenarios for the given runId.
 * Returns the full path to the run directory or null if not found.
 */
async function findRunDirectory(
  fs: FileSystemService,
  runId: string
): Promise<string | null> {
  const scenariosPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}`;

  if (!(await fs.exists(scenariosPath))) {
    return null;
  }

  const scenarios = await fs.listDirs(scenariosPath);

  for (const scenario of scenarios) {
    const runPath = `${scenariosPath}/${scenario}/${RUNS_DIR}/${runId}`;
    if (await fs.exists(runPath)) {
      return runPath;
    }
  }

  return null;
}

/**
 * Checks if a run has been completed (has result.json).
 */
async function isRunCompleted(
  fs: FileSystemService,
  runPath: string
): Promise<boolean> {
  return fs.exists(`${runPath}/${RESULT_FILE}`);
}

/**
 * Records test evidence (screenshot, log, db snapshot) for a test run.
 */
export async function handleRecordEvidence(
  params: unknown,
  fs: FileSystemService = new FileSystemService()
): Promise<RecordEvidenceResult> {
  // 1. Validate input parameters
  const validated = RecordEvidenceParamsSchema.parse(params);

  // 2. Check if project is initialized
  if (!(await fs.exists(HARSH_JUDGE_DIR))) {
    throw new Error('Project not initialized. Run initProject first.');
  }

  // 3. Find the run directory
  const runPath = await findRunDirectory(fs, validated.runId);
  if (!runPath) {
    throw new Error(`Run "${validated.runId}" does not exist.`);
  }

  // 4. Check if run is already completed
  if (await isRunCompleted(fs, runPath)) {
    throw new Error(`Run "${validated.runId}" is already completed. Cannot add evidence.`);
  }

  // 5. Prepare file paths
  const stepPadded = String(validated.step).padStart(2, '0');
  const extension = EVIDENCE_EXTENSIONS[validated.type] || 'bin';
  const fileName = `step-${stepPadded}-${validated.name}.${extension}`;
  const metaFileName = `step-${stepPadded}-${validated.name}.meta.json`;

  const evidencePath = `${runPath}/${EVIDENCE_DIR}`;
  const filePath = `${evidencePath}/${fileName}`;
  const metaPath = `${evidencePath}/${metaFileName}`;

  // 6. Read/write evidence data
  let dataToWrite: string | Buffer;
  let fileSize: number;

  if (BINARY_TYPES.has(validated.type)) {
    // For screenshot type, data MUST be an absolute file path
    if (!isAbsoluteFilePath(validated.data)) {
      throw new Error(
        `For type="${validated.type}", data must be an absolute file path to the image file. ` +
        `Got: "${validated.data.substring(0, 50)}${validated.data.length > 50 ? '...' : ''}". ` +
        `Use the file path from Playwright's browser_take_screenshot tool.`
      );
    }
    // Read binary file from the path
    try {
      dataToWrite = await fs.readFile(validated.data, true);
      fileSize = dataToWrite.length;
    } catch {
      throw new Error(`Cannot read screenshot file: ${validated.data}`);
    }
  } else {
    // Write as-is for text types
    dataToWrite = validated.data;
    fileSize = Buffer.byteLength(validated.data, 'utf-8');
  }

  await fs.ensureDir(evidencePath);
  await fs.writeFile(filePath, dataToWrite);

  // 7. Write metadata
  const metadata = {
    runId: validated.runId,
    step: validated.step,
    type: validated.type,
    name: validated.name,
    capturedAt: new Date().toISOString(),
    fileSize,
    metadata: validated.metadata || {},
  };
  await fs.writeJson(metaPath, metadata);

  // 8. Return result
  return {
    success: true,
    filePath,
    metaPath,
    fileSize,
  };
}
