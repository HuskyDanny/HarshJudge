#!/usr/bin/env node

// src/cli.ts
import { Command as Command11 } from "commander";
import { readFileSync as readFileSync2 } from "fs";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname3, join as join4 } from "path";

// src/commands/init.ts
import "commander";

// src/types/scenario.ts
import { z } from "zod";
var StepReferenceSchema = z.object({
  id: z.string().regex(/^\d{2}$/, "Step ID must be zero-padded (01, 02, etc.)"),
  title: z.string().min(1),
  file: z.string().regex(/^\d{2}-[\w-]+\.md$/, "Step file must match pattern: {id}-{slug}.md")
});
var ScenarioMetaSchema = z.object({
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
  lastResult: z.enum(["pass", "fail"]).nullable().default(null),
  avgDuration: z.number().nonnegative().default(0)
});
var DEFAULT_SCENARIO_STATS = {
  totalRuns: 0,
  passCount: 0,
  failCount: 0,
  lastRun: null,
  lastResult: null,
  avgDuration: 0
};
function padStepId(n) {
  return String(n).padStart(2, "0");
}

// src/types/run.ts
import { z as z2 } from "zod";
var StepResultSchema = z2.object({
  id: z2.string().regex(/^\d{2}$/, "Step ID must be zero-padded"),
  status: z2.enum(["pass", "fail", "skipped"]),
  duration: z2.number().nonnegative().optional().default(0),
  error: z2.string().nullable().default(null),
  evidenceFiles: z2.array(z2.string()).default([]),
  /** AI-generated summary describing what happened in this step */
  summary: z2.string().nullable().optional().default(null)
});
var RunResultSchema = z2.object({
  runId: z2.string(),
  scenarioSlug: z2.string().optional(),
  // Optional for backward compat
  status: z2.enum(["pass", "fail", "running"]),
  startedAt: z2.string(),
  completedAt: z2.string().optional(),
  duration: z2.number().nonnegative().optional().default(0),
  steps: z2.array(StepResultSchema).default([]),
  failedStep: z2.string().nullable().default(null),
  // Changed from number to string (step ID)
  errorMessage: z2.string().nullable().default(null)
});

// src/schemas/index.ts
import { z as z3 } from "zod";
var InitProjectParamsSchema = z3.object({
  projectName: z3.string().min(1).max(100),
  baseUrl: z3.string().url().optional()
});
var SaveScenarioParamsSchema = z3.object({
  slug: z3.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z3.string().min(1).max(200),
  content: z3.string().min(1),
  tags: z3.array(z3.string()).optional().default([]),
  estimatedDuration: z3.number().positive().optional().default(60)
});
var StepInputSchema = z3.object({
  title: z3.string().min(1),
  description: z3.string().optional().default(""),
  preconditions: z3.string().optional().default(""),
  actions: z3.string().min(1),
  expectedOutcome: z3.string().min(1)
});
var CreateScenarioParamsSchema = z3.object({
  slug: z3.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z3.string().min(1).max(200),
  steps: z3.array(StepInputSchema).min(1),
  tags: z3.array(z3.string()).optional().default([]),
  estimatedDuration: z3.number().positive().optional().default(60),
  starred: z3.boolean().optional().default(false)
});
var ToggleStarParamsSchema = z3.object({
  scenarioSlug: z3.string().regex(/^[a-z0-9-]+$/),
  starred: z3.boolean().optional()
  // If omitted, toggles current state
});
var StartRunParamsSchema = z3.object({
  scenarioSlug: z3.string().regex(/^[a-z0-9-]+$/)
});
var RecordEvidenceParamsSchema = z3.object({
  runId: z3.string().min(1),
  step: z3.number().int().positive(),
  // v2: accepts number, will be converted to zero-padded string
  type: z3.enum([
    "screenshot",
    "db_snapshot",
    "console_log",
    "network_log",
    "html_snapshot",
    "custom"
  ]),
  name: z3.string().min(1).max(100),
  data: z3.string(),
  // For screenshot: absolute file path; for others: content
  metadata: z3.record(z3.unknown()).optional()
});
var CompleteRunParamsSchema = z3.object({
  runId: z3.string().min(1),
  status: z3.enum(["pass", "fail"]),
  duration: z3.number().nonnegative(),
  failedStep: z3.string().regex(/^\d{2}$/, "Step ID must be zero-padded").optional(),
  // Changed from number to string
  errorMessage: z3.string().optional(),
  steps: z3.array(StepResultSchema).optional()
  // NEW: per-step results
});
var CompleteStepParamsSchema = z3.object({
  runId: z3.string().min(1),
  stepId: z3.string().regex(/^\d{2}$/, 'Step ID must be zero-padded (e.g., "01", "02")'),
  status: z3.enum(["pass", "fail", "skipped"]),
  duration: z3.number().nonnegative(),
  error: z3.string().optional(),
  /** AI-generated summary describing what happened in this step and match result */
  summary: z3.string().optional()
});
var GetStatusParamsSchema = z3.object({
  scenarioSlug: z3.string().regex(/^[a-z0-9-]+$/).optional(),
  starredOnly: z3.boolean().optional().default(false)
});
var OpenDashboardParamsSchema = z3.object({
  port: z3.number().int().min(1024).max(65535).optional(),
  openBrowser: z3.boolean().optional().default(true),
  projectPath: z3.string().optional().describe(
    "Path to the project directory containing .harshJudge folder. Defaults to current working directory."
  )
});
var CloseDashboardParamsSchema = z3.object({
  projectPath: z3.string().optional().describe(
    "Path to the project directory containing .harshJudge folder. Defaults to current working directory."
  )
});
var GetDashboardStatusParamsSchema = z3.object({
  projectPath: z3.string().optional().describe(
    "Path to the project directory containing .harshJudge folder. Defaults to current working directory."
  )
});

// src/services/file-system-service.ts
import { mkdir, writeFile, readFile, access, readdir } from "fs/promises";
import { dirname, join } from "path";
import yaml from "js-yaml";
var HARSH_JUDGE_DIR = ".harshJudge";
var SCENARIOS_DIR = "scenarios";
var STEPS_DIR = "steps";
var FileSystemService = class {
  basePath;
  constructor(basePath = process.cwd()) {
    this.basePath = basePath;
  }
  /**
   * Resolves a relative path against the base path.
   */
  resolve(path) {
    return join(this.basePath, path);
  }
  /**
   * Creates a directory recursively if it doesn't exist.
   */
  async ensureDir(path) {
    await mkdir(this.resolve(path), { recursive: true });
  }
  /**
   * Checks if a path exists.
   */
  async exists(path) {
    try {
      await access(this.resolve(path));
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Writes an object as YAML to a file.
   */
  async writeYaml(path, data) {
    const content = yaml.dump(data, { indent: 2 });
    await this.writeFile(path, content);
  }
  /**
   * Reads and parses a YAML file.
   */
  async readYaml(path) {
    const content = await readFile(this.resolve(path), "utf-8");
    return yaml.load(content);
  }
  /**
   * Writes an object as JSON to a file.
   */
  async writeJson(path, data) {
    const content = JSON.stringify(data, null, 2);
    await this.writeFile(path, content);
  }
  /**
   * Reads and parses a JSON file.
   */
  async readJson(path) {
    const content = await readFile(this.resolve(path), "utf-8");
    return JSON.parse(content);
  }
  /**
   * Writes string or binary data to a file.
   * Creates parent directories if they don't exist.
   */
  async writeFile(path, data) {
    const fullPath = this.resolve(path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, data);
  }
  async readFile(path, binary) {
    const isAbsolute = /^[A-Z]:[/\\]/i.test(path) || path.startsWith("/");
    const fullPath = isAbsolute ? path : this.resolve(path);
    if (binary) {
      return readFile(fullPath);
    }
    return readFile(fullPath, "utf-8");
  }
  /**
   * Lists subdirectories in a directory.
   */
  async listDirs(path) {
    const entries = await readdir(this.resolve(path), { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  }
  /**
   * Lists files (not directories) in a directory.
   */
  async listFiles(path) {
    const entries = await readdir(this.resolve(path), { withFileTypes: true });
    return entries.filter((e) => e.isFile()).map((e) => e.name);
  }
  // ============================================================
  // Step File Operations (v2)
  // ============================================================
  /**
   * Ensures steps directory exists for a scenario.
   */
  async ensureStepsDir(scenarioSlug) {
    const stepsPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${scenarioSlug}/${STEPS_DIR}`;
    await this.ensureDir(stepsPath);
  }
  /**
   * Writes a step file to the scenario's steps directory.
   */
  async writeStepFile(scenarioSlug, stepId, stepSlug, content) {
    const filename = `${stepId}-${stepSlug}.md`;
    const stepPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${scenarioSlug}/${STEPS_DIR}/${filename}`;
    await this.writeFile(stepPath, content);
    return stepPath;
  }
  /**
   * Reads a step file from the scenario's steps directory.
   */
  async readStepFile(scenarioSlug, filename) {
    const stepPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${scenarioSlug}/${STEPS_DIR}/${filename}`;
    return this.readFile(stepPath);
  }
  /**
   * Lists step files in a scenario's steps directory.
   */
  async listStepFiles(scenarioSlug) {
    const stepsPath = `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${scenarioSlug}/${STEPS_DIR}`;
    if (!await this.exists(stepsPath)) {
      return [];
    }
    const files = await this.listFiles(stepsPath);
    return files.filter((f) => /^\d{2}-[\w-]+\.md$/.test(f)).sort();
  }
  /**
   * Gets the steps directory path for a scenario.
   */
  getStepsPath(scenarioSlug) {
    return `${HARSH_JUDGE_DIR}/${SCENARIOS_DIR}/${scenarioSlug}/${STEPS_DIR}`;
  }
};
function generateStepMarkdown(step) {
  return `# Step ${step.id}: ${step.title}

## Description
${step.description}

## Preconditions
${step.preconditions}

## Actions
${step.actions}

**Playwright:**
\`\`\`javascript
// Add Playwright code here
\`\`\`

## Expected Outcome
${step.expectedOutcome}
`;
}

// src/services/dashboard-manager.ts
import { fork } from "child_process";
import { createServer } from "net";
import { existsSync, writeFileSync, unlinkSync, readFileSync, mkdirSync } from "fs";
import { join as join2, resolve, dirname as dirname2 } from "path";
import { fileURLToPath } from "url";
var HARSH_JUDGE_DIR2 = ".harshJudge";
var DASHBOARD_STATE_FILE = ".dashboard-state.json";
var DEFAULT_DASHBOARD_PORT = 7002;
async function isPortAvailable(port) {
  return new Promise((resolve2) => {
    const server = createServer();
    server.once("error", () => resolve2(false));
    server.once("listening", () => {
      server.close();
      resolve2(true);
    });
    server.listen(port);
  });
}
async function findAvailablePort(startPort, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function waitForServer(port, timeoutMs = 5e3) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (!await isPortAvailable(port)) {
      return true;
    }
    await new Promise((resolve2) => setTimeout(resolve2, 100));
  }
  return false;
}
function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
async function killProcess(pid) {
  try {
    process.kill(pid, "SIGTERM");
    await new Promise((resolve2) => setTimeout(resolve2, 300));
    if (isProcessRunning(pid)) {
      process.kill(pid, "SIGKILL");
    }
    return true;
  } catch {
    return false;
  }
}
var DashboardManager = class {
  fs;
  stateFilePath;
  projectDir;
  constructor(fs = new FileSystemService(), projectPath) {
    this.fs = fs;
    this.projectDir = projectPath ? resolve(projectPath) : process.cwd();
    this.stateFilePath = join2(this.projectDir, HARSH_JUDGE_DIR2, DASHBOARD_STATE_FILE);
  }
  /**
   * Get dashboard state file path.
   */
  getStateFilePath() {
    return this.stateFilePath;
  }
  /**
   * Read the current dashboard state from file.
   */
  readState() {
    try {
      if (existsSync(this.stateFilePath)) {
        const content = readFileSync(this.stateFilePath, "utf-8");
        return JSON.parse(content);
      }
    } catch {
    }
    return null;
  }
  /**
   * Write dashboard state to file.
   */
  writeState(state) {
    const dir = dirname2(this.stateFilePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.stateFilePath, JSON.stringify(state, null, 2));
  }
  /**
   * Remove dashboard state file.
   */
  clearState() {
    try {
      if (existsSync(this.stateFilePath)) {
        unlinkSync(this.stateFilePath);
      }
    } catch {
    }
  }
  /**
   * Get the current dashboard status.
   */
  async getStatus() {
    const state = this.readState();
    if (!state) {
      return { running: false };
    }
    const processAlive = isProcessRunning(state.pid);
    const portInUse = !await isPortAvailable(state.port);
    if (processAlive && portInUse) {
      return {
        running: true,
        pid: state.pid,
        port: state.port,
        url: state.url,
        startedAt: state.startedAt
      };
    }
    return {
      running: false,
      pid: state.pid,
      port: state.port,
      stale: true
    };
  }
  /**
   * Start the dashboard server.
   */
  async start(preferredPort) {
    const status = await this.getStatus();
    if (status.running) {
      throw new Error(`Dashboard already running on port ${status.port} (PID: ${status.pid}). Use closeDashboard first.`);
    }
    if (status.stale) {
      this.clearState();
    }
    const startPort = preferredPort ?? DEFAULT_DASHBOARD_PORT;
    const port = await findAvailablePort(startPort);
    if (process.env["NODE_ENV"] === "test" || process.env["VITEST"]) {
      const state2 = {
        pid: 0,
        port,
        url: `http://localhost:${port}`,
        startedAt: (/* @__PURE__ */ new Date()).toISOString(),
        projectPath: this.projectDir
      };
      this.writeState(state2);
      return state2;
    }
    const __filename = fileURLToPath(import.meta.url);
    const __dirname2 = dirname2(__filename);
    const workerPath = join2(__dirname2, "dashboard-worker.js");
    console.error(`[HarshJudge] Starting dashboard on port ${port}`);
    console.error(`[HarshJudge] Project directory: ${this.projectDir}`);
    console.error(`[HarshJudge] Worker path: ${workerPath}`);
    let child;
    try {
      child = fork(workerPath, [], {
        cwd: this.projectDir,
        detached: true,
        stdio: ["ignore", "pipe", "pipe", "ipc"],
        env: {
          ...process.env,
          HARSHJUDGE_PORT: String(port),
          HARSHJUDGE_PROJECT_PATH: this.projectDir
        }
      });
    } catch (err) {
      throw new Error(`Failed to fork dashboard worker: ${err}`);
    }
    const pid = child.pid;
    if (!pid) {
      throw new Error("Failed to fork dashboard worker - no PID returned");
    }
    let startupError = "";
    child.stderr?.on("data", (data) => {
      const msg = data.toString();
      console.error(`[Dashboard] ${msg}`);
      if (msg.toLowerCase().includes("error")) {
        startupError += msg;
      }
    });
    child.stdout?.on("data", (data) => {
      console.error(`[Dashboard] ${data.toString()}`);
    });
    const started = await waitForServer(port, 8e3);
    child.disconnect?.();
    child.unref();
    if (!started) {
      if (startupError) {
        throw new Error(`Dashboard failed to start: ${startupError}`);
      }
      throw new Error(`Dashboard did not start within timeout on port ${port}`);
    }
    console.error(`[HarshJudge] Dashboard started successfully (PID: ${pid})`);
    const state = {
      pid,
      port,
      url: `http://localhost:${port}`,
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      projectPath: this.projectDir
    };
    this.writeState(state);
    return state;
  }
  /**
   * Stop the dashboard server.
   */
  async stop() {
    const status = await this.getStatus();
    if (!status.running && !status.stale) {
      return { stopped: false, message: "Dashboard is not running" };
    }
    if (status.stale) {
      this.clearState();
      return { stopped: true, message: "Cleaned up stale dashboard state (process was already dead)" };
    }
    if (status.pid) {
      const killed = await killProcess(status.pid);
      if (!killed) {
        return { stopped: false, message: `Failed to kill process ${status.pid}` };
      }
    }
    this.clearState();
    return { stopped: true, message: `Dashboard stopped (was running on port ${status.port})` };
  }
  /**
   * Restart the dashboard (stop then start).
   */
  async restart(preferredPort) {
    await this.stop();
    return await this.start(preferredPort);
  }
};

// src/handlers/init-project.ts
var HARSH_JUDGE_DIR3 = ".harshJudge";
var CONFIG_FILE = "config.yaml";
var SCENARIOS_DIR2 = "scenarios";
var GITIGNORE_FILE = ".gitignore";
var PRD_FILE = "prd.md";
var GITIGNORE_CONTENT = `# HarshJudge
# Ignore large evidence files in CI (per-step structure)
scenarios/*/runs/*/step-*/evidence/*.png
scenarios/*/runs/*/step-*/evidence/*.html
# Dashboard state (local only)
.dashboard-state.json
`;
var PRD_TEMPLATE_CONTENT = `# Project PRD

## Application Type
<!-- backend | fullstack | frontend | other -->
{app_type}

## Ports
| Service | Port |
|---------|------|
| Frontend | {frontend_port} |
| Backend | {backend_port} |
| Database | {database_port} |

## Main Scenarios
<!-- High-level list of main testing scenarios -->
- {scenario_1}
- {scenario_2}
- {scenario_3}

## Authentication
<!-- Auth requirements for testing -->
- **Login URL:** {login_url}
- **Test Credentials:**
  - Username: {test_username}
  - Password: {test_password}

## Tech Stack
<!-- Frameworks, libraries, tools -->
- Frontend: {frontend_stack}
- Backend: {backend_stack}
- Testing: {testing_tools}

## Notes
<!-- Additional context for test scenarios -->
- {note_1}
- {note_2}
`;
async function handleInitProject(params, fs = new FileSystemService()) {
  const validated = InitProjectParamsSchema.parse(params);
  if (await fs.exists(HARSH_JUDGE_DIR3)) {
    throw new Error(
      "Project already initialized. Use a different directory or remove existing .harshJudge folder."
    );
  }
  await fs.ensureDir(HARSH_JUDGE_DIR3);
  await fs.ensureDir(`${HARSH_JUDGE_DIR3}/${SCENARIOS_DIR2}`);
  const config = {
    projectName: validated.projectName,
    baseUrl: validated.baseUrl ?? "",
    version: "1.0",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const configPath = `${HARSH_JUDGE_DIR3}/${CONFIG_FILE}`;
  await fs.writeYaml(configPath, config);
  const gitignorePath = `${HARSH_JUDGE_DIR3}/${GITIGNORE_FILE}`;
  await fs.writeFile(gitignorePath, GITIGNORE_CONTENT);
  const prdPath = `${HARSH_JUDGE_DIR3}/${PRD_FILE}`;
  await fs.writeFile(prdPath, PRD_TEMPLATE_CONTENT);
  let dashboardUrl;
  let message = "HarshJudge initialized successfully";
  try {
    const manager = new DashboardManager(fs);
    const state = await manager.start();
    dashboardUrl = state.url;
    message = `HarshJudge initialized successfully. Dashboard running at ${dashboardUrl} (PID: ${state.pid})`;
    console.error(`[HarshJudge] ${message}`);
  } catch (error) {
    console.error(`[HarshJudge] Warning: Could not start dashboard: ${error}`);
    message = `HarshJudge initialized successfully. Dashboard could not be started automatically - use openDashboard tool to start it.`;
  }
  return {
    success: true,
    projectPath: HARSH_JUDGE_DIR3,
    configPath,
    prdPath,
    scenariosPath: `${HARSH_JUDGE_DIR3}/${SCENARIOS_DIR2}`,
    dashboardUrl,
    message
  };
}

// src/utils/cli-helpers.ts
function withErrorHandling(fn) {
  return async (...args) => {
    try {
      await fn(...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(JSON.stringify({ error: message }));
      process.exit(1);
    }
  };
}

// src/commands/init.ts
function register(program2) {
  program2.command("init <name>").description("Initialize a HarshJudge project in the current directory").option("--base-url <url>", "Base URL for the application under test").action(
    withErrorHandling(
      async (name, opts, cmd) => {
        const cwd = cmd.parent?.opts()["cwd"] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const result = await handleInitProject(
          { projectName: name, baseUrl: opts.baseUrl },
          fs
        );
        console.log(JSON.stringify(result));
      }
    )
  );
}

// src/commands/create.ts
import "commander";

// src/utils/slugify.ts
function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

// src/handlers/create-scenario.ts
var HARSH_JUDGE_DIR4 = ".harshJudge";
var SCENARIOS_DIR3 = "scenarios";
var STEPS_DIR2 = "steps";
var META_FILE = "meta.yaml";
function generateStepContent(stepId, step) {
  return generateStepMarkdown({
    id: stepId,
    title: step.title,
    description: step.description || "",
    preconditions: step.preconditions || "",
    actions: step.actions,
    expectedOutcome: step.expectedOutcome
  });
}
async function handleCreateScenario(params, fs = new FileSystemService()) {
  const validated = CreateScenarioParamsSchema.parse(params);
  if (!await fs.exists(HARSH_JUDGE_DIR4)) {
    throw new Error("Project not initialized. Run initProject first.");
  }
  const scenarioPath = `${HARSH_JUDGE_DIR4}/${SCENARIOS_DIR3}/${validated.slug}`;
  const stepsPath = `${scenarioPath}/${STEPS_DIR2}`;
  const metaPath = `${scenarioPath}/${META_FILE}`;
  const isNew = !await fs.exists(scenarioPath);
  await fs.ensureDir(stepsPath);
  if (!isNew) {
    const existingStepFiles = await fs.listStepFiles(validated.slug);
    const newStepCount = validated.steps.length;
    for (const file of existingStepFiles) {
      const stepNum = parseInt(file.substring(0, 2), 10);
      if (stepNum > newStepCount) {
        const orphanPath = `${stepsPath}/${file}`;
      }
    }
  }
  const stepFiles = [];
  const stepRefs = [];
  for (let i = 0; i < validated.steps.length; i++) {
    const step = validated.steps[i];
    const stepId = padStepId(i + 1);
    const stepSlug = slugify(step.title);
    const filename = `${stepId}-${stepSlug}.md`;
    const stepFilePath = `${stepsPath}/${filename}`;
    const content = generateStepContent(stepId, step);
    await fs.writeFile(stepFilePath, content);
    stepFiles.push(stepFilePath);
    stepRefs.push({
      id: stepId,
      title: step.title,
      file: filename
    });
  }
  const existingMeta = isNew ? null : await loadExistingMeta(fs, metaPath);
  const meta = {
    // Definition fields
    title: validated.title,
    slug: validated.slug,
    starred: validated.starred,
    tags: validated.tags,
    estimatedDuration: validated.estimatedDuration,
    steps: stepRefs,
    // Statistics (preserve existing or initialize)
    ...DEFAULT_SCENARIO_STATS,
    ...existingMeta ? {
      totalRuns: existingMeta.totalRuns,
      passCount: existingMeta.passCount,
      failCount: existingMeta.failCount,
      lastRun: existingMeta.lastRun,
      lastResult: existingMeta.lastResult,
      avgDuration: existingMeta.avgDuration
    } : {}
  };
  await fs.writeYaml(metaPath, meta);
  return {
    success: true,
    slug: validated.slug,
    scenarioPath,
    metaPath,
    stepsPath,
    stepFiles,
    isNew
  };
}
async function loadExistingMeta(fs, metaPath) {
  try {
    if (await fs.exists(metaPath)) {
      return await fs.readYaml(metaPath);
    }
  } catch {
  }
  return null;
}

// src/commands/create.ts
function register2(program2) {
  program2.command("create <slug>").description("Create a new test scenario").requiredOption("--title <title>", "Scenario title").requiredOption("--steps <json>", "Steps as a JSON string").option("--tags <tags>", "Comma-separated list of tags").option("--estimated-duration <seconds>", "Estimated duration in seconds").option("--starred", "Mark scenario as starred").action(
    withErrorHandling(
      async (slug, opts, cmd) => {
        const cwd = cmd.parent?.opts()["cwd"] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const tags = opts.tags ? opts.tags.split(",").map((t) => t.trim()) : void 0;
        const result = await handleCreateScenario(
          {
            slug,
            title: opts.title,
            steps: JSON.parse(opts.steps),
            tags,
            estimatedDuration: opts.estimatedDuration ? parseInt(opts.estimatedDuration, 10) : void 0,
            starred: opts.starred
          },
          fs
        );
        console.log(JSON.stringify(result));
      }
    )
  );
}

// src/commands/star.ts
import "commander";

// src/handlers/toggle-star.ts
var HARSH_JUDGE_DIR5 = ".harshJudge";
var SCENARIOS_DIR4 = "scenarios";
var META_FILE2 = "meta.yaml";
async function handleToggleStar(params, fs = new FileSystemService()) {
  const validated = ToggleStarParamsSchema.parse(params);
  if (!await fs.exists(HARSH_JUDGE_DIR5)) {
    throw new Error("Project not initialized. Run initProject first.");
  }
  const scenarioPath = `${HARSH_JUDGE_DIR5}/${SCENARIOS_DIR4}/${validated.scenarioSlug}`;
  const metaPath = `${scenarioPath}/${META_FILE2}`;
  if (!await fs.exists(scenarioPath)) {
    throw new Error(`Scenario "${validated.scenarioSlug}" does not exist.`);
  }
  let meta;
  if (await fs.exists(metaPath)) {
    meta = await fs.readYaml(metaPath);
  } else {
    throw new Error(`Scenario "${validated.scenarioSlug}" has no meta.yaml.`);
  }
  const newStarred = validated.starred !== void 0 ? validated.starred : !meta.starred;
  meta.starred = newStarred;
  await fs.writeYaml(metaPath, meta);
  return {
    success: true,
    slug: validated.scenarioSlug,
    starred: newStarred
  };
}

// src/commands/star.ts
function register3(program2) {
  program2.command("star <slug>").description("Star or unstar a scenario").option("--unstar", "Remove star from scenario").action(
    withErrorHandling(
      async (slug, opts, cmd) => {
        const cwd = cmd.parent?.opts()["cwd"] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const result = await handleToggleStar(
          { scenarioSlug: slug, starred: !opts.unstar },
          fs
        );
        console.log(JSON.stringify(result));
      }
    )
  );
}

// src/commands/status.ts
import "commander";

// src/handlers/get-status.ts
var HARSH_JUDGE_DIR6 = ".harshJudge";
var SCENARIOS_DIR5 = "scenarios";
var CONFIG_FILE2 = "config.yaml";
var SCENARIO_FILE = "scenario.md";
var META_FILE3 = "meta.yaml";
var RUNS_DIR = "runs";
var RESULT_FILE = "result.json";
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match || !match[1]) {
    return { title: "Untitled", tags: [] };
  }
  const frontmatter = match[1];
  let title = "Untitled";
  let tags = [];
  const titleMatch = frontmatter.match(/^title:\s*(.+)$/m);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }
  const tagsMatch = frontmatter.match(/^tags:\s*\[([^\]]*)\]/m);
  if (tagsMatch && tagsMatch[1] !== void 0) {
    tags = tagsMatch[1].split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  }
  return { title, tags };
}
function getContentWithoutFrontmatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n*/, "");
}
async function getProjectStatus(fs, starredOnly = false) {
  const configPath = `${HARSH_JUDGE_DIR6}/${CONFIG_FILE2}`;
  const config = await fs.readYaml(configPath);
  const scenariosPath = `${HARSH_JUDGE_DIR6}/${SCENARIOS_DIR5}`;
  const scenarioSlugs = await fs.listDirs(scenariosPath);
  const scenarios = [];
  let passing = 0;
  let failing = 0;
  let neverRun = 0;
  for (const slug of scenarioSlugs) {
    const scenarioPath = `${scenariosPath}/${slug}`;
    const metaPath = `${scenarioPath}/${META_FILE3}`;
    let meta;
    let title = "Untitled";
    let tags = [];
    let starred = false;
    let stepCount = 0;
    if (await fs.exists(metaPath)) {
      meta = await fs.readYaml(metaPath);
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
        avgDuration: 0
      };
    }
    const scenarioFilePath = `${scenarioPath}/${SCENARIO_FILE}`;
    if (await fs.exists(scenarioFilePath)) {
      const scenarioContent = await fs.readFile(scenarioFilePath);
      const parsed = parseFrontmatter(scenarioContent);
      if (!meta.title) {
        title = parsed.title;
      }
      tags = parsed.tags;
    }
    if (starredOnly && !starred) {
      continue;
    }
    const passRate = meta.totalRuns > 0 ? Math.round(meta.passCount / meta.totalRuns * 100) : 0;
    if (meta.totalRuns === 0) {
      neverRun++;
    } else if (meta.lastResult === "pass") {
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
      passRate
    });
  }
  return {
    projectName: config.projectName,
    scenarioCount: scenarios.length,
    passing,
    failing,
    neverRun,
    scenarios
  };
}
async function getScenarioDetail(fs, slug) {
  const scenarioPath = `${HARSH_JUDGE_DIR6}/${SCENARIOS_DIR5}/${slug}`;
  if (!await fs.exists(scenarioPath)) {
    throw new Error(`Scenario "${slug}" does not exist.`);
  }
  const metaPath = `${scenarioPath}/${META_FILE3}`;
  let meta;
  let title = "Untitled";
  let tags = [];
  let starred = false;
  let stepCount = 0;
  let content = "";
  if (await fs.exists(metaPath)) {
    meta = await fs.readYaml(metaPath);
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
      avgDuration: 0
    };
  }
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
  const runsPath = `${scenarioPath}/${RUNS_DIR}`;
  const recentRuns = [];
  if (await fs.exists(runsPath)) {
    const runIds = await fs.listDirs(runsPath);
    const runResults = [];
    for (const id of runIds) {
      const resultPath = `${runsPath}/${id}/${RESULT_FILE}`;
      if (await fs.exists(resultPath)) {
        const result = await fs.readJson(resultPath);
        runResults.push({ id, result });
      }
    }
    runResults.sort(
      (a, b) => new Date(b.result.completedAt).getTime() - new Date(a.result.completedAt).getTime()
    );
    for (let i = 0; i < Math.min(10, runResults.length); i++) {
      const runData = runResults[i];
      if (runData) {
        const { id, result } = runData;
        recentRuns.push({
          id,
          runNumber: runResults.length - i,
          // Approximate run number
          status: result.status,
          duration: result.duration,
          completedAt: result.completedAt,
          errorMessage: result.errorMessage || null
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
    recentRuns
  };
}
async function handleGetStatus(params, fs = new FileSystemService()) {
  const validated = GetStatusParamsSchema.parse(params);
  if (!await fs.exists(HARSH_JUDGE_DIR6)) {
    throw new Error("Project not initialized. Run initProject first.");
  }
  if (validated.scenarioSlug) {
    return getScenarioDetail(fs, validated.scenarioSlug);
  } else {
    return getProjectStatus(fs, validated.starredOnly);
  }
}

// src/commands/status.ts
function register4(program2) {
  program2.command("status [slug]").description("Get project or scenario status").option("--starred-only", "Show only starred scenarios").action(
    withErrorHandling(
      async (slug, opts, cmd) => {
        const cwd = cmd.parent?.opts()["cwd"] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const result = await handleGetStatus(
          { scenarioSlug: slug, starredOnly: opts.starredOnly },
          fs
        );
        console.log(JSON.stringify(result));
      }
    )
  );
}

// src/commands/start.ts
import "commander";

// src/handlers/start-run.ts
import { nanoid } from "nanoid";
var HARSH_JUDGE_DIR7 = ".harshJudge";
var SCENARIOS_DIR6 = "scenarios";
var RUNS_DIR2 = "runs";
var EVIDENCE_DIR = "evidence";
var META_FILE4 = "meta.yaml";
async function handleStartRun(params, fs = new FileSystemService()) {
  const validated = StartRunParamsSchema.parse(params);
  if (!await fs.exists(HARSH_JUDGE_DIR7)) {
    throw new Error("Project not initialized. Run initProject first.");
  }
  const scenarioDir = `${HARSH_JUDGE_DIR7}/${SCENARIOS_DIR6}/${validated.scenarioSlug}`;
  if (!await fs.exists(scenarioDir)) {
    throw new Error(`Scenario "${validated.scenarioSlug}" does not exist.`);
  }
  const metaPath = `${scenarioDir}/${META_FILE4}`;
  if (!await fs.exists(metaPath)) {
    throw new Error(`Scenario "${validated.scenarioSlug}" has no meta.yaml.`);
  }
  const meta = await fs.readYaml(metaPath);
  const steps = (meta.steps || []).map((step) => ({
    id: step.id,
    title: step.title,
    file: step.file
  }));
  const runId = nanoid(10);
  const runsDir = `${scenarioDir}/${RUNS_DIR2}`;
  let runNumber = 1;
  if (await fs.exists(runsDir)) {
    const existingRuns = await fs.listDirs(runsDir);
    runNumber = existingRuns.length + 1;
  }
  const runPath = `${runsDir}/${runId}`;
  const evidencePath = `${runPath}/${EVIDENCE_DIR}`;
  await fs.ensureDir(runPath);
  await fs.ensureDir(evidencePath);
  const startedAt = (/* @__PURE__ */ new Date()).toISOString();
  return {
    success: true,
    runId,
    runNumber,
    runPath,
    evidencePath,
    startedAt,
    scenarioSlug: validated.scenarioSlug,
    scenarioTitle: meta.title,
    steps
  };
}

// src/commands/start.ts
function register5(program2) {
  program2.command("start <slug>").description("Start a new test run for a scenario").action(
    withErrorHandling(async (slug, _opts, cmd) => {
      const cwd = cmd.parent?.opts()["cwd"] ?? process.cwd();
      const fs = new FileSystemService(cwd);
      const result = await handleStartRun({ scenarioSlug: slug }, fs);
      console.log(JSON.stringify(result));
    })
  );
}

// src/commands/evidence.ts
import "commander";

// src/handlers/record-evidence.ts
var HARSH_JUDGE_DIR8 = ".harshJudge";
var SCENARIOS_DIR7 = "scenarios";
var RUNS_DIR3 = "runs";
var RESULT_FILE2 = "result.json";
var EVIDENCE_EXTENSIONS = {
  screenshot: "png",
  db_snapshot: "json",
  console_log: "txt",
  network_log: "json",
  html_snapshot: "html",
  custom: "json"
};
var BINARY_TYPES = /* @__PURE__ */ new Set(["screenshot"]);
function isAbsoluteFilePath(data) {
  if (/^[A-Z]:[/\\]/i.test(data)) {
    return true;
  }
  if (data.startsWith("/")) {
    return true;
  }
  return false;
}
async function findRunDirectory(fs, runId) {
  const scenariosPath = `${HARSH_JUDGE_DIR8}/${SCENARIOS_DIR7}`;
  if (!await fs.exists(scenariosPath)) {
    return null;
  }
  const scenarios = await fs.listDirs(scenariosPath);
  for (const scenario of scenarios) {
    const runPath = `${scenariosPath}/${scenario}/${RUNS_DIR3}/${runId}`;
    if (await fs.exists(runPath)) {
      return runPath;
    }
  }
  return null;
}
async function isRunCompleted(fs, runPath) {
  const resultPath = `${runPath}/${RESULT_FILE2}`;
  if (!await fs.exists(resultPath)) {
    return false;
  }
  const result = await fs.readJson(resultPath);
  return result.status === "pass" || result.status === "fail";
}
async function handleRecordEvidence(params, fs = new FileSystemService()) {
  const validated = RecordEvidenceParamsSchema.parse(params);
  if (!await fs.exists(HARSH_JUDGE_DIR8)) {
    throw new Error("Project not initialized. Run initProject first.");
  }
  const runPath = await findRunDirectory(fs, validated.runId);
  if (!runPath) {
    throw new Error(`Run "${validated.runId}" does not exist.`);
  }
  if (await isRunCompleted(fs, runPath)) {
    throw new Error(`Run "${validated.runId}" is already completed. Cannot add evidence.`);
  }
  const stepId = String(validated.step).padStart(2, "0");
  const extension = EVIDENCE_EXTENSIONS[validated.type] || "bin";
  const fileName = `${validated.name}.${extension}`;
  const metaFileName = `${validated.name}.meta.json`;
  const stepPath = `${runPath}/step-${stepId}`;
  const evidencePath = `${stepPath}/evidence`;
  const filePath = `${evidencePath}/${fileName}`;
  const metaPath = `${evidencePath}/${metaFileName}`;
  let dataToWrite;
  let fileSize;
  if (BINARY_TYPES.has(validated.type)) {
    if (!isAbsoluteFilePath(validated.data)) {
      throw new Error(
        `For type="${validated.type}", data must be an absolute file path to the image file. Got: "${validated.data.substring(0, 50)}${validated.data.length > 50 ? "..." : ""}". Use the file path from Playwright's browser_take_screenshot tool.`
      );
    }
    try {
      dataToWrite = await fs.readFile(validated.data, true);
      fileSize = dataToWrite.length;
    } catch {
      throw new Error(`Cannot read screenshot file: ${validated.data}`);
    }
  } else {
    dataToWrite = validated.data;
    fileSize = Buffer.byteLength(validated.data, "utf-8");
  }
  await fs.ensureDir(evidencePath);
  await fs.writeFile(filePath, dataToWrite);
  const metadata = {
    runId: validated.runId,
    stepId,
    type: validated.type,
    name: validated.name,
    capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
    fileSize,
    metadata: validated.metadata || {}
  };
  await fs.writeJson(metaPath, metadata);
  return {
    success: true,
    filePath,
    metaPath,
    stepPath,
    fileSize
  };
}

// src/commands/evidence.ts
function register6(program2) {
  program2.command("evidence <runId>").description("Record evidence for a test run step").option("--step <n>", "Step number").option(
    "--type <type>",
    "Evidence type (screenshot, db_snapshot, console_log, etc.)"
  ).option("--name <name>", "Evidence name").option("--data <data>", "Evidence data or file path").action(
    withErrorHandling(
      async (runId, opts, cmd) => {
        const cwd = cmd.parent?.opts()["cwd"] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const result = await handleRecordEvidence(
          {
            runId,
            step: parseInt(opts.step ?? "1", 10),
            type: opts.type,
            name: opts.name,
            data: opts.data
          },
          fs
        );
        console.log(JSON.stringify(result));
      }
    )
  );
}

// src/commands/complete-step.ts
import "commander";

// src/handlers/complete-step.ts
var HARSH_JUDGE_DIR9 = ".harshJudge";
var SCENARIOS_DIR8 = "scenarios";
var RUNS_DIR4 = "runs";
var RESULT_FILE3 = "result.json";
var META_FILE5 = "meta.yaml";
async function findRunAndScenario(fs, runId) {
  const scenariosPath = `${HARSH_JUDGE_DIR9}/${SCENARIOS_DIR8}`;
  if (!await fs.exists(scenariosPath)) {
    return null;
  }
  const scenarios = await fs.listDirs(scenariosPath);
  for (const scenario of scenarios) {
    const scenarioPath = `${scenariosPath}/${scenario}`;
    const runPath = `${scenarioPath}/${RUNS_DIR4}/${runId}`;
    if (await fs.exists(runPath)) {
      return { runPath, scenarioSlug: scenario, scenarioPath };
    }
  }
  return null;
}
async function getNextStepId(fs, scenarioPath, currentStepId) {
  const metaPath = `${scenarioPath}/${META_FILE5}`;
  if (!await fs.exists(metaPath)) {
    return null;
  }
  const meta = await fs.readYaml(metaPath);
  if (!meta.steps || meta.steps.length === 0) {
    return null;
  }
  const currentIdx = meta.steps.findIndex((s) => s.id === currentStepId);
  if (currentIdx === -1 || currentIdx >= meta.steps.length - 1) {
    return null;
  }
  return meta.steps[currentIdx + 1].id;
}
async function listStepEvidence(fs, runPath, stepId) {
  const evidencePath = `${runPath}/step-${stepId}/evidence`;
  if (!await fs.exists(evidencePath)) {
    return [];
  }
  const files = await fs.listFiles(evidencePath);
  return files.filter((f) => !f.endsWith(".meta.json"));
}
async function handleCompleteStep(params, fs = new FileSystemService()) {
  const validated = CompleteStepParamsSchema.parse(params);
  if (!await fs.exists(HARSH_JUDGE_DIR9)) {
    throw new Error("Project not initialized. Run initProject first.");
  }
  const found = await findRunAndScenario(fs, validated.runId);
  if (!found) {
    throw new Error(`Run "${validated.runId}" does not exist.`);
  }
  const { runPath, scenarioSlug, scenarioPath } = found;
  const resultPath = `${runPath}/${RESULT_FILE3}`;
  if (await fs.exists(resultPath)) {
    const existingResult = await fs.readJson(resultPath);
    if (existingResult.status !== "running") {
      throw new Error(`Run "${validated.runId}" is already completed. Cannot add step results.`);
    }
  }
  let inProgress;
  const runJsonPath = `${runPath}/run.json`;
  if (await fs.exists(resultPath)) {
    inProgress = await fs.readJson(resultPath);
  } else if (await fs.exists(runJsonPath)) {
    const runData = await fs.readJson(runJsonPath);
    inProgress = {
      runId: validated.runId,
      scenarioSlug,
      status: "running",
      startedAt: runData.startedAt,
      steps: []
    };
  } else {
    inProgress = {
      runId: validated.runId,
      scenarioSlug,
      status: "running",
      startedAt: (/* @__PURE__ */ new Date()).toISOString(),
      steps: []
    };
  }
  const evidenceFiles = await listStepEvidence(fs, runPath, validated.stepId);
  const stepResult = {
    id: validated.stepId,
    status: validated.status,
    duration: validated.duration,
    error: validated.error ?? null,
    evidenceFiles,
    summary: validated.summary ?? null
  };
  const existingIdx = inProgress.steps.findIndex((s) => s.id === validated.stepId);
  if (existingIdx >= 0) {
    inProgress.steps[existingIdx] = stepResult;
  } else {
    inProgress.steps.push(stepResult);
    inProgress.steps.sort((a, b) => a.id.localeCompare(b.id));
  }
  await fs.writeJson(resultPath, inProgress);
  let nextStepId = null;
  if (validated.status === "pass" || validated.status === "skipped") {
    nextStepId = await getNextStepId(fs, scenarioPath, validated.stepId);
  }
  return {
    success: true,
    runId: validated.runId,
    stepId: validated.stepId,
    status: validated.status,
    nextStepId
  };
}

// src/commands/complete-step.ts
function register7(program2) {
  program2.command("complete-step <runId>").description("Complete a single step in a test run").option("--step <id>", "Step ID (zero-padded, e.g. 01)").option("--status <status>", "Step status (pass, fail, skipped)").requiredOption("--duration <ms>", "Step duration in milliseconds").option("--error <msg>", "Error message if step failed").option("--summary <text>", "Step summary").action(
    withErrorHandling(
      async (runId, opts, cmd) => {
        const cwd = cmd.parent?.opts()["cwd"] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const result = await handleCompleteStep(
          {
            runId,
            stepId: opts.step,
            status: opts.status,
            duration: parseInt(opts.duration, 10),
            error: opts.error,
            summary: opts.summary
          },
          fs
        );
        console.log(JSON.stringify(result));
      }
    )
  );
}

// src/commands/complete-run.ts
import "commander";

// src/handlers/complete-run.ts
var HARSH_JUDGE_DIR10 = ".harshJudge";
var SCENARIOS_DIR9 = "scenarios";
var RUNS_DIR5 = "runs";
var RESULT_FILE4 = "result.json";
var META_FILE6 = "meta.yaml";
async function findRunAndScenario2(fs, runId) {
  const scenariosPath = `${HARSH_JUDGE_DIR10}/${SCENARIOS_DIR9}`;
  if (!await fs.exists(scenariosPath)) {
    return null;
  }
  const scenarios = await fs.listDirs(scenariosPath);
  for (const scenario of scenarios) {
    const scenarioPath = `${scenariosPath}/${scenario}`;
    const runPath = `${scenarioPath}/${RUNS_DIR5}/${runId}`;
    if (await fs.exists(runPath)) {
      return { runPath, scenarioPath };
    }
  }
  return null;
}
async function collectStepEvidence(fs, runPath) {
  const results = [];
  if (!await fs.exists(runPath)) {
    return results;
  }
  const dirs = await fs.listDirs(runPath);
  const stepDirs = dirs.filter((d) => /^step-\d{2}$/.test(d)).sort();
  for (const stepDir of stepDirs) {
    const stepId = stepDir.replace("step-", "");
    const evidencePath = `${runPath}/${stepDir}/evidence`;
    if (await fs.exists(evidencePath)) {
      const files = await fs.listFiles(evidencePath);
      const evidenceFiles = files.filter((f) => !f.endsWith(".meta.json"));
      results.push({ stepId, evidenceFiles });
    } else {
      results.push({ stepId, evidenceFiles: [] });
    }
  }
  return results;
}
function extractScenarioSlug(runPath) {
  const parts = runPath.split("/");
  const scenariosIdx = parts.indexOf("scenarios");
  if (scenariosIdx >= 0 && parts.length > scenariosIdx + 1) {
    return parts[scenariosIdx + 1] ?? "unknown";
  }
  return "unknown";
}
async function handleCompleteRun(params, fs = new FileSystemService()) {
  const validated = CompleteRunParamsSchema.parse(params);
  if (!await fs.exists(HARSH_JUDGE_DIR10)) {
    throw new Error("Project not initialized. Run initProject first.");
  }
  const found = await findRunAndScenario2(fs, validated.runId);
  if (!found) {
    throw new Error(`Run "${validated.runId}" does not exist.`);
  }
  const { runPath, scenarioPath } = found;
  const resultPath = `${runPath}/${RESULT_FILE4}`;
  let existingResult = null;
  if (await fs.exists(resultPath)) {
    existingResult = await fs.readJson(
      resultPath
    );
    if (existingResult.status !== "running") {
      throw new Error(`Run "${validated.runId}" is already completed.`);
    }
  }
  let steps;
  if (validated.steps && validated.steps.length > 0) {
    steps = validated.steps;
  } else if (existingResult?.steps && Array.isArray(existingResult.steps) && existingResult.steps.length > 0) {
    steps = existingResult.steps;
  } else {
    const stepEvidence = await collectStepEvidence(fs, runPath);
    steps = stepEvidence.map((se) => ({
      id: se.stepId,
      status: validated.failedStep === se.stepId ? "fail" : "pass",
      duration: 0,
      // Unknown for v1 compat
      error: validated.failedStep === se.stepId ? validated.errorMessage ?? null : null,
      evidenceFiles: se.evidenceFiles,
      summary: null
    }));
  }
  let startedAt;
  if (existingResult && "startedAt" in existingResult) {
    startedAt = existingResult.startedAt;
  }
  if (!startedAt) {
    const runJsonPath = `${runPath}/run.json`;
    if (await fs.exists(runJsonPath)) {
      const runData = await fs.readJson(runJsonPath);
      startedAt = runData.startedAt;
    }
  }
  let effectiveStatus = validated.status;
  let warning;
  if (steps.length > 0) {
    const anyFailed = steps.some((s) => s.status === "fail");
    const derivedStatus = anyFailed ? "fail" : "pass";
    if (derivedStatus !== validated.status) {
      warning = `Status mismatch: --status "${validated.status}" contradicts step results (derived: "${derivedStatus}"). Using derived status.`;
      effectiveStatus = derivedStatus;
    }
  }
  const scenarioSlug = extractScenarioSlug(runPath);
  const result = {
    runId: validated.runId,
    scenarioSlug,
    status: effectiveStatus,
    startedAt: startedAt ?? (/* @__PURE__ */ new Date()).toISOString(),
    completedAt: (/* @__PURE__ */ new Date()).toISOString(),
    duration: validated.duration,
    steps,
    failedStep: validated.failedStep ?? null,
    errorMessage: validated.errorMessage ?? null
  };
  await fs.writeJson(resultPath, result);
  const metaPath = `${scenarioPath}/${META_FILE6}`;
  let existingMeta = {};
  if (await fs.exists(metaPath)) {
    existingMeta = await fs.readYaml(metaPath);
  }
  const currentStats = {
    totalRuns: existingMeta["totalRuns"] ?? 0,
    passCount: existingMeta["passCount"] ?? 0,
    failCount: existingMeta["failCount"] ?? 0,
    lastRun: existingMeta["lastRun"] ?? null,
    lastResult: existingMeta["lastResult"] ?? null,
    avgDuration: existingMeta["avgDuration"] ?? 0
  };
  const newTotalRuns = currentStats.totalRuns + 1;
  const newPassCount = currentStats.passCount + (effectiveStatus === "pass" ? 1 : 0);
  const newFailCount = currentStats.failCount + (effectiveStatus === "fail" ? 1 : 0);
  const totalDuration = currentStats.avgDuration * currentStats.totalRuns + validated.duration;
  const newAvgDuration = Math.round(totalDuration / newTotalRuns);
  const updatedMeta = {
    ...existingMeta,
    totalRuns: newTotalRuns,
    passCount: newPassCount,
    failCount: newFailCount,
    lastRun: (/* @__PURE__ */ new Date()).toISOString(),
    lastResult: effectiveStatus,
    avgDuration: newAvgDuration
  };
  await fs.writeYaml(metaPath, updatedMeta);
  return {
    success: true,
    resultPath,
    updatedMeta: {
      totalRuns: newTotalRuns,
      passCount: newPassCount,
      failCount: newFailCount,
      avgDuration: newAvgDuration
    },
    ...warning !== void 0 ? { warning } : {}
  };
}

// src/commands/complete-run.ts
function register8(program2) {
  program2.command("complete-run <runId>").description("Complete a test run and update scenario statistics").option("--status <status>", "Run status (pass, fail)").requiredOption("--duration <ms>", "Run duration in milliseconds").option("--failed-step <id>", "ID of the failed step").option("--error <msg>", "Error message").option("--steps <json>", "Steps as a JSON string").action(
    withErrorHandling(
      async (runId, opts, cmd) => {
        const cwd = cmd.parent?.opts()["cwd"] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const result = await handleCompleteRun(
          {
            runId,
            status: opts.status,
            duration: parseInt(opts.duration, 10),
            failedStep: opts.failedStep,
            errorMessage: opts.error,
            steps: opts.steps ? JSON.parse(opts.steps) : void 0
          },
          fs
        );
        console.log(JSON.stringify(result));
      }
    )
  );
}

// src/commands/dashboard.ts
import "commander";

// src/handlers/open-dashboard.ts
import { exec } from "child_process";
function openBrowser(url) {
  const command = process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`;
  exec(command, (err) => {
    if (err) {
      console.error(`[HarshJudge] Failed to open browser: ${err.message}`);
    }
  });
}
async function handleOpenDashboard(params, fs = new FileSystemService()) {
  const validated = OpenDashboardParamsSchema.parse(params);
  const manager = new DashboardManager(fs, validated.projectPath);
  const status = await manager.getStatus();
  if (status.running && status.url && status.port && status.pid) {
    if (validated.openBrowser) {
      openBrowser(status.url);
    }
    return {
      success: true,
      url: status.url,
      port: status.port,
      pid: status.pid,
      alreadyRunning: true,
      message: `Dashboard already running at ${status.url}`
    };
  }
  try {
    const state = await manager.start(validated.port);
    if (validated.openBrowser) {
      openBrowser(state.url);
    }
    return {
      success: true,
      url: state.url,
      port: state.port,
      pid: state.pid,
      alreadyRunning: false,
      message: `Dashboard started at ${state.url}`
    };
  } catch (error) {
    throw new Error(`Failed to start dashboard: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/handlers/close-dashboard.ts
async function handleCloseDashboard(params, fs = new FileSystemService()) {
  const validated = CloseDashboardParamsSchema.parse(params);
  const manager = new DashboardManager(fs, validated.projectPath);
  const status = await manager.getStatus();
  const wasRunning = status.running || status.stale === true;
  const result = await manager.stop();
  return {
    success: result.stopped || !wasRunning,
    wasRunning,
    message: result.message
  };
}

// src/handlers/get-dashboard-status.ts
async function handleGetDashboardStatus(params, fs = new FileSystemService()) {
  const validated = GetDashboardStatusParamsSchema.parse(params);
  const manager = new DashboardManager(fs, validated.projectPath);
  const status = await manager.getStatus();
  let message;
  if (status.running) {
    message = `Dashboard running at ${status.url} (PID: ${status.pid})`;
  } else if (status.stale) {
    message = `Dashboard state is stale (process ${status.pid} is dead). Run openDashboard to start a new one.`;
  } else {
    message = "Dashboard is not running. Use openDashboard to start it.";
  }
  return {
    running: status.running,
    pid: status.pid,
    port: status.port,
    url: status.url,
    startedAt: status.startedAt,
    stale: status.stale,
    message
  };
}

// src/commands/dashboard.ts
function register9(program2) {
  const dashboard = program2.command("dashboard").description("Manage the HarshJudge dashboard server");
  dashboard.command("open").description("Start or reconnect to the dashboard server").option("--port <n>", "Port to run the dashboard on").option("--no-browser", "Do not open browser automatically").action(
    withErrorHandling(
      async (opts, cmd) => {
        const cwd = cmd.parent?.parent?.opts()["cwd"] ?? process.cwd();
        const fs = new FileSystemService(cwd);
        const result = await handleOpenDashboard(
          {
            port: opts.port ? parseInt(opts.port, 10) : void 0,
            openBrowser: opts.browser !== false,
            projectPath: cwd
          },
          fs
        );
        console.log(JSON.stringify(result));
      }
    )
  );
  dashboard.command("close").description("Stop the dashboard server").action(
    withErrorHandling(async (_opts, cmd) => {
      const cwd = cmd.parent?.parent?.opts()["cwd"] ?? process.cwd();
      const fs = new FileSystemService(cwd);
      const result = await handleCloseDashboard({ projectPath: cwd }, fs);
      console.log(JSON.stringify(result));
    })
  );
  dashboard.command("status").description("Get the current dashboard status").action(
    withErrorHandling(async (_opts, cmd) => {
      const cwd = cmd.parent?.parent?.opts()["cwd"] ?? process.cwd();
      const fs = new FileSystemService(cwd);
      const result = await handleGetDashboardStatus({ projectPath: cwd }, fs);
      console.log(JSON.stringify(result));
    })
  );
}

// src/commands/discover.ts
import "commander";
import { readdir as readdir2, readFile as readFile2, stat } from "fs/promises";
import { join as join3, relative } from "path";
import yaml2 from "js-yaml";
var META_YAML_FIELDS = [
  "title",
  "slug",
  "starred",
  "tags",
  "totalRuns",
  "passCount",
  "failCount",
  "lastRun",
  "lastResult",
  "avgDuration"
];
var CONFIG_YAML_FIELDS = ["projectName", "baseUrl", "version", "createdAt"];
var RESULT_JSON_FIELDS = ["status", "duration", "runId"];
function pickFields(obj, fields) {
  const result = {};
  for (const key of fields) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}
async function walkDir(dirPath, basePath, _fileName) {
  const entries = await readdir2(dirPath, { withFileTypes: true });
  const node = {};
  for (const entry of entries) {
    const fullPath = join3(dirPath, entry.name);
    if (entry.isDirectory()) {
      node[`${entry.name}/`] = await walkDir(fullPath, basePath, entry.name);
    } else {
      if (entry.name === "meta.yaml") {
        try {
          const raw = yaml2.load(await readFile2(fullPath, "utf8"));
          node[entry.name] = pickFields(raw, META_YAML_FIELDS);
        } catch {
          node[entry.name] = {};
        }
      } else if (entry.name === "config.yaml") {
        try {
          const raw = yaml2.load(await readFile2(fullPath, "utf8"));
          node[entry.name] = pickFields(raw, CONFIG_YAML_FIELDS);
        } catch {
          node[entry.name] = {};
        }
      } else if (entry.name === "result.json") {
        try {
          const raw = JSON.parse(await readFile2(fullPath, "utf8"));
          node[entry.name] = pickFields(raw, RESULT_JSON_FIELDS);
        } catch {
          node[entry.name] = {};
        }
      } else {
        node[entry.name] = true;
      }
    }
  }
  return node;
}
async function buildTree(basePath, subPath) {
  const rootPath = subPath ? join3(basePath, ".harshJudge", subPath) : join3(basePath, ".harshJudge");
  const dirStat = await stat(rootPath);
  if (!dirStat.isDirectory()) {
    throw new Error(`Path is not a directory: ${rootPath}`);
  }
  const tree = await walkDir(rootPath, basePath, "");
  const rootLabel = relative(basePath, rootPath) + "/";
  return { root: rootLabel, tree };
}
var SEARCHABLE_EXTENSIONS = /* @__PURE__ */ new Set([".yaml", ".yml", ".json", ".md"]);
async function* walkForSearch(dirPath) {
  const entries = await readdir2(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join3(dirPath, entry.name);
    if (entry.isDirectory()) {
      yield* walkForSearch(fullPath);
    } else {
      const ext = entry.name.slice(entry.name.lastIndexOf("."));
      if (SEARCHABLE_EXTENSIONS.has(ext)) {
        yield fullPath;
      }
    }
  }
}
async function searchFiles(basePath, pattern, subPath) {
  const searchRoot = subPath ? join3(basePath, ".harshJudge", subPath) : join3(basePath, ".harshJudge");
  const lowerPattern = pattern.toLowerCase();
  const matches = [];
  for await (const filePath of walkForSearch(searchRoot)) {
    let content;
    try {
      content = await readFile2(filePath, "utf8");
    } catch {
      continue;
    }
    const lines = content.split("\n");
    for (const line of lines) {
      if (line.toLowerCase().includes(lowerPattern)) {
        matches.push({ file: filePath, match: line.trim() });
      }
    }
  }
  return { matches };
}
function register10(program2) {
  const discover = program2.command("discover").description("Explore .harshJudge/ structure");
  discover.command("tree [path]").description("Show folder structure with metadata").action(
    withErrorHandling(async (subPath, cmd) => {
      const cwd = cmd.parent?.parent?.opts()["cwd"] ?? process.cwd();
      const result = await buildTree(cwd, subPath);
      console.log(JSON.stringify(result, null, 2));
    })
  );
  discover.command("search <pattern>").description("Search file content in .harshJudge/").option("--path <folder>", "Restrict search to subfolder").action(
    withErrorHandling(
      async (pattern, opts, cmd) => {
        const cwd = cmd.parent?.parent?.opts()["cwd"] ?? process.cwd();
        const result = await searchFiles(cwd, pattern, opts.path);
        console.log(JSON.stringify(result, null, 2));
      }
    )
  );
}

// src/cli.ts
var __dirname = dirname3(fileURLToPath2(import.meta.url));
var pkg = JSON.parse(
  readFileSync2(join4(__dirname, "..", "package.json"), "utf8")
);
var program = new Command11();
program.name("harshjudge").description("AI-native E2E testing orchestration CLI").version(pkg.version).option("--cwd <path>", "Working directory override");
register(program);
register2(program);
register3(program);
register4(program);
register5(program);
register6(program);
register7(program);
register8(program);
register9(program);
register10(program);
program.parse();
//# sourceMappingURL=cli.js.map