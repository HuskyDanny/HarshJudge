// src/ux/server/DashboardServer.ts
import { createServer } from "http";
import { readFile, stat, readdir } from "fs/promises";
import { join as join2, extname, dirname } from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

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

// src/ux/server/PathResolver.ts
import { join } from "path";
var HARSHJUDGE_DIR = ".harshJudge";
var PathResolver = class {
  projectRoot;
  harshJudgePath;
  /**
   * Create a PathResolver from a project root path.
   * @param projectRoot - The project root directory (must NOT contain .harshJudge)
   * @throws Error if projectRoot contains .harshJudge
   */
  constructor(projectRoot) {
    if (projectRoot.includes(HARSHJUDGE_DIR)) {
      throw new Error(
        `Invalid projectRoot: "${projectRoot}" contains "${HARSHJUDGE_DIR}". Please provide the project working directory, not the .harshJudge path.`
      );
    }
    this.projectRoot = projectRoot;
    this.harshJudgePath = join(projectRoot, HARSHJUDGE_DIR);
  }
  // --- Root Paths ---
  /** Get the project root directory */
  getProjectRoot() {
    return this.projectRoot;
  }
  /** Get the .harshJudge directory path */
  getHarshJudgePath() {
    return this.harshJudgePath;
  }
  // --- Config Paths ---
  /** Get config.yaml path */
  getConfigPath() {
    return join(this.harshJudgePath, "config.yaml");
  }
  /** Get prd.md path */
  getPrdPath() {
    return join(this.harshJudgePath, "prd.md");
  }
  // --- Scenarios Paths ---
  /** Get the scenarios directory path */
  getScenariosDir() {
    return join(this.harshJudgePath, "scenarios");
  }
  /** Get a specific scenario directory path */
  getScenarioDir(scenarioSlug) {
    return join(this.getScenariosDir(), scenarioSlug);
  }
  /** Get scenario meta.yaml path */
  getScenarioMetaPath(scenarioSlug) {
    return join(this.getScenarioDir(scenarioSlug), "meta.yaml");
  }
  /** Get scenario.md path (v1 structure, optional) */
  getScenarioContentPath(scenarioSlug) {
    return join(this.getScenarioDir(scenarioSlug), "scenario.md");
  }
  // --- Steps Paths ---
  /** Get the steps directory for a scenario */
  getStepsDir(scenarioSlug) {
    return join(this.getScenarioDir(scenarioSlug), "steps");
  }
  /** Get a specific step file path */
  getStepPath(scenarioSlug, stepFileName) {
    return join(this.getStepsDir(scenarioSlug), stepFileName);
  }
  // --- Runs Paths ---
  /** Get the runs directory for a scenario */
  getRunsDir(scenarioSlug) {
    return join(this.getScenarioDir(scenarioSlug), "runs");
  }
  /** Get a specific run directory path */
  getRunDir(scenarioSlug, runId) {
    return join(this.getRunsDir(scenarioSlug), runId);
  }
  /** Get run result.json path */
  getRunResultPath(scenarioSlug, runId) {
    return join(this.getRunDir(scenarioSlug, runId), "result.json");
  }
  // --- Run Step Evidence Paths ---
  /** Get the step directory within a run */
  getRunStepDir(scenarioSlug, runId, stepId) {
    return join(this.getRunDir(scenarioSlug, runId), `step-${stepId}`);
  }
  /** Get the evidence directory for a step within a run */
  getRunStepEvidenceDir(scenarioSlug, runId, stepId) {
    return join(this.getRunStepDir(scenarioSlug, runId, stepId), "evidence");
  }
  /** Get a specific evidence file path */
  getEvidencePath(scenarioSlug, runId, stepId, fileName) {
    return join(this.getRunStepEvidenceDir(scenarioSlug, runId, stepId), fileName);
  }
  /** Get evidence metadata file path */
  getEvidenceMetaPath(scenarioSlug, runId, stepId, fileName) {
    return join(this.getRunStepEvidenceDir(scenarioSlug, runId, stepId), `${fileName}.meta.json`);
  }
  // --- Legacy v1 Evidence Paths (flat structure at run root) ---
  /** Get legacy flat evidence directory at run root */
  getLegacyEvidenceDir(scenarioSlug, runId) {
    return join(this.getRunDir(scenarioSlug, runId), "evidence");
  }
  // --- Utility Methods ---
  /**
   * Check if a path is within the .harshJudge directory (for security)
   */
  isWithinHarshJudge(path) {
    return path.startsWith(this.harshJudgePath);
  }
  /**
   * Validate that a path is safe (within .harshJudge and no traversal)
   */
  isPathSafe(path) {
    if (path.includes("..")) {
      return false;
    }
    return this.isWithinHarshJudge(path);
  }
};
function createPathResolver(path) {
  const harshJudgeIndex = path.indexOf(HARSHJUDGE_DIR);
  if (harshJudgeIndex !== -1) {
    const projectRoot = path.substring(0, harshJudgeIndex).replace(/\/$/, "");
    if (!projectRoot) {
      throw new Error(`Invalid path: cannot determine project root from "${path}"`);
    }
    return new PathResolver(projectRoot);
  }
  return new PathResolver(path);
}

// src/ux/server/DashboardServer.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var DashboardServer = class {
  server = null;
  port;
  pathResolver;
  distPath;
  constructor(options = {}) {
    this.port = options.port ?? 3e3;
    const projectPath = options.projectPath ?? process.cwd();
    this.pathResolver = createPathResolver(projectPath);
    this.distPath = options.distPath ?? join2(__dirname, "../../dist");
  }
  /**
   * Start the dashboard server
   * @returns The actual port the server is listening on
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.server = createServer(this.handleRequest.bind(this));
      this.server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          reject(new Error(`Port ${this.port} is already in use`));
        } else {
          reject(err);
        }
      });
      this.server.listen(this.port, () => {
        const address = this.server?.address();
        resolve(address.port);
      });
    });
  }
  /**
   * Stop the dashboard server
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  /**
   * Check if the server is running
   */
  isRunning() {
    return this.server !== null && this.server.listening;
  }
  /**
   * Get the server URL
   */
  getUrl() {
    return `http://localhost:${this.port}`;
  }
  /**
   * Handle incoming HTTP requests
   */
  async handleRequest(req, res) {
    const url = req.url || "/";
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.method !== "GET") {
      res.writeHead(405);
      res.end("Method Not Allowed");
      return;
    }
    if (url.startsWith("/api/")) {
      await this.handleApiRequest(url, res);
      return;
    }
    await this.serveStaticFile(url, res);
  }
  /**
   * Handle API requests
   */
  async handleApiRequest(url, res) {
    const urlParts = url.split("?");
    const cleanUrl = urlParts[0] ?? "";
    const queryString = urlParts[1] ?? "";
    const parts = cleanUrl.replace("/api/", "").split("/").map(decodeURIComponent);
    try {
      if (parts[0] === "file") {
        const params = new URLSearchParams(queryString);
        const filePath = params.get("path");
        if (!filePath) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing path parameter" }));
          return;
        }
        if (!filePath.includes(".harshJudge")) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Access denied: can only serve HarshJudge evidence files"
            })
          );
          return;
        }
        if (filePath.includes("..")) {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Access denied: path traversal not allowed"
            })
          );
          return;
        }
        try {
          const content = await readFile(filePath);
          const contentType = this.getContentType(filePath);
          res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=3600"
          });
          res.end(content);
          return;
        } catch {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "File not found" }));
          return;
        }
      }
      if (parts[0] === "projects" && parts.length === 1) {
        const projects = await this.getProjects();
        this.sendJson(res, projects);
        return;
      }
      if (parts[0] === "projects" && parts[2] === "scenarios" && parts.length === 3) {
        const projectPath = parts[1];
        const scenarios = await this.getScenarios(projectPath ?? "");
        this.sendJson(res, scenarios);
        return;
      }
      if (parts[0] === "projects" && parts[2] === "scenarios" && parts.length === 4) {
        const projectPath = parts[1];
        const scenarioSlug = parts[3];
        const detail = await this.getScenarioDetail(
          projectPath ?? "",
          scenarioSlug ?? ""
        );
        this.sendJson(res, detail);
        return;
      }
      if (parts[0] === "projects" && parts[2] === "scenarios" && parts[4] === "runs" && parts.length === 5) {
        const projectPath = parts[1];
        const scenarioSlug = parts[3];
        const runs = await this.getRunHistory(
          projectPath ?? "",
          scenarioSlug ?? ""
        );
        this.sendJson(res, runs);
        return;
      }
      if (parts[0] === "projects" && parts[2] === "scenarios" && parts[4] === "runs" && parts.length === 6) {
        const projectPath = parts[1];
        const scenarioSlug = parts[3];
        const runId = parts[5];
        const detail = await this.getRunDetail(
          projectPath ?? "",
          scenarioSlug ?? "",
          runId ?? ""
        );
        this.sendJson(res, detail);
        return;
      }
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "API endpoint not found" }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: err instanceof Error ? err.message : "Internal server error"
        })
      );
    }
  }
  /**
   * Send JSON response
   */
  sendJson(res, data) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  }
  /**
   * Serve a static file or fallback to index.html for SPA routing
   */
  async serveStaticFile(url, res) {
    let cleanUrl = url.split("?")[0];
    if (cleanUrl === "/") {
      cleanUrl = "/index.html";
    }
    const decodedUrl = decodeURIComponent(cleanUrl ?? "");
    if ((cleanUrl ?? "").includes("..") || decodedUrl.includes("..")) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    let filePath = join2(this.distPath, decodedUrl);
    try {
      const stats = await stat(filePath);
      if (stats.isDirectory()) {
        filePath = join2(filePath, "index.html");
      }
      const content = await readFile(filePath);
      const contentType = this.getContentType(filePath);
      res.writeHead(200, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache"
      });
      res.end(content);
    } catch {
      try {
        const indexPath = join2(this.distPath, "index.html");
        const indexContent = await readFile(indexPath);
        res.writeHead(200, {
          "Content-Type": "text/html",
          "Cache-Control": "no-cache"
        });
        res.end(indexContent);
      } catch {
        res.writeHead(404);
        res.end("Not Found - Dashboard not built. Run `npm run build` first.");
      }
    }
  }
  /**
   * Get MIME type for a file based on its extension
   */
  getContentType(filePath) {
    const ext = extname(filePath).toLowerCase();
    const mimeTypes = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".mjs": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".eot": "application/vnd.ms-fontobject"
    };
    return mimeTypes[ext] || "application/octet-stream";
  }
  // --- Data Service Methods ---
  /**
   * Discover all HarshJudge projects in the project path
   */
  async getProjects() {
    try {
      const harshJudgePath = this.pathResolver.getHarshJudgePath();
      const exists = await this.pathExists(harshJudgePath);
      if (!exists) {
        return [];
      }
      const config = await this.readConfig();
      if (!config) {
        return [];
      }
      const scenarios = await this.getScenarios(
        this.pathResolver.getProjectRoot()
      );
      const overallStatus = this.calculateOverallStatus(scenarios);
      return [
        {
          path: this.pathResolver.getProjectRoot(),
          name: config.projectName,
          scenarioCount: scenarios.length,
          overallStatus
        }
      ];
    } catch {
      return [];
    }
  }
  /**
   * Get all scenarios for a project
   * @param projectPath - Project root path (NOT the .harshJudge path)
   */
  async getScenarios(projectPath) {
    try {
      const resolver = createPathResolver(projectPath);
      const scenariosPath = resolver.getScenariosDir();
      const exists = await this.pathExists(scenariosPath);
      if (!exists) {
        return [];
      }
      const entries = await readdir(scenariosPath, { withFileTypes: true });
      const scenarioDirs = entries.filter((e) => e.isDirectory());
      const scenarios = [];
      for (const dir of scenarioDirs) {
        const scenario = await this.readScenarioSummary(
          resolver.getScenarioDir(dir.name),
          dir.name
        );
        if (scenario) {
          scenarios.push(scenario);
        }
      }
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
   * @param projectPath - Project root path (NOT the .harshJudge path)
   */
  async getScenarioDetail(projectPath, slug) {
    try {
      const resolver = createPathResolver(projectPath);
      const scenarioPath = resolver.getScenarioDir(slug);
      const exists = await this.pathExists(scenarioPath);
      if (!exists) {
        return null;
      }
      const [scenarioContent, meta] = await Promise.all([
        this.readScenarioContent(scenarioPath),
        this.readScenarioMeta(scenarioPath)
      ]);
      if (!meta && !scenarioContent) {
        return null;
      }
      const recentRuns = await this.getRecentRuns(scenarioPath, 10);
      const metaData = meta || this.defaultMeta();
      const steps = (meta?.steps || []).map((step) => ({
        id: step.id,
        title: step.title
      }));
      return {
        slug,
        title: meta?.title || scenarioContent?.title || slug,
        starred: meta?.starred ?? false,
        tags: meta?.tags || scenarioContent?.tags || [],
        stepCount: steps.length,
        steps,
        content: scenarioContent?.content || "",
        meta: metaData,
        recentRuns
      };
    } catch {
      return null;
    }
  }
  /**
   * Get run history for a scenario
   * @param projectPath - Project root path (NOT the .harshJudge path)
   */
  async getRunHistory(projectPath, scenarioSlug) {
    try {
      const resolver = createPathResolver(projectPath);
      const scenarioPath = resolver.getScenarioDir(scenarioSlug);
      return await this.getRecentRuns(scenarioPath, 100);
    } catch {
      return [];
    }
  }
  /**
   * Get run detail including evidence paths
   * @param projectPath - Project root path (NOT the .harshJudge path)
   */
  async getRunDetail(projectPath, scenarioSlug, runId) {
    try {
      const resolver = createPathResolver(projectPath);
      const runPath = resolver.getRunDir(scenarioSlug, runId);
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
        evidencePaths
      };
    } catch {
      return null;
    }
  }
  // --- Private helper methods ---
  async pathExists(path) {
    try {
      await stat(path);
      return true;
    } catch {
      return false;
    }
  }
  async readConfig() {
    try {
      const configPath = this.pathResolver.getConfigPath();
      const content = await readFile(configPath, "utf-8");
      return yaml.load(content);
    } catch {
      return null;
    }
  }
  async readScenarioMeta(scenarioPath) {
    try {
      const metaPath = join2(scenarioPath, "meta.yaml");
      const content = await readFile(metaPath, "utf-8");
      return yaml.load(content);
    } catch {
      return null;
    }
  }
  async readScenarioContent(scenarioPath) {
    try {
      const scenarioFile = join2(scenarioPath, "scenario.md");
      const content = await readFile(scenarioFile, "utf-8");
      const frontmatterMatch = content.match(
        /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
      );
      if (!frontmatterMatch || !frontmatterMatch[1] || frontmatterMatch[2] === void 0) {
        return null;
      }
      const frontmatter = yaml.load(frontmatterMatch[1]);
      return {
        title: frontmatter.title || "Untitled",
        tags: frontmatter.tags || [],
        content: frontmatterMatch[2]
      };
    } catch {
      return null;
    }
  }
  async readScenarioSummary(scenarioPath, slug) {
    const [meta, scenario] = await Promise.all([
      this.readScenarioMeta(scenarioPath),
      this.readScenarioContent(scenarioPath)
    ]);
    if (!meta && !scenario) {
      return null;
    }
    const metaData = meta || this.defaultMeta();
    const passRate = metaData.totalRuns > 0 ? metaData.passCount / metaData.totalRuns * 100 : 0;
    return {
      slug,
      title: meta?.title || scenario?.title || slug,
      starred: meta?.starred ?? false,
      tags: meta?.tags || scenario?.tags || [],
      stepCount: meta?.steps?.length ?? 0,
      lastResult: metaData.lastResult,
      lastRun: metaData.lastRun,
      totalRuns: metaData.totalRuns,
      passRate
    };
  }
  async readRunResult(runPath) {
    try {
      const resultPath = join2(runPath, "result.json");
      const content = await readFile(resultPath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  async getRecentRuns(scenarioPath, limit) {
    try {
      const runsPath = join2(scenarioPath, "runs");
      const exists = await this.pathExists(runsPath);
      if (!exists) {
        return [];
      }
      const entries = await readdir(runsPath, { withFileTypes: true });
      const runDirs = entries.filter((e) => e.isDirectory());
      const runs = [];
      for (const dir of runDirs) {
        const runPath = join2(runsPath, dir.name);
        const result = await this.readRunResult(runPath);
        if (result) {
          const status = result.status;
          runs.push({
            id: result.runId,
            runNumber: runs.length + 1,
            status,
            duration: result.duration ?? 0,
            startedAt: result.startedAt,
            completedAt: result.completedAt,
            errorMessage: result.errorMessage ?? null
          });
        }
      }
      return runs.sort((a, b) => {
        const aTime = new Date(a.startedAt || a.completedAt || 0).getTime();
        const bTime = new Date(b.startedAt || b.completedAt || 0).getTime();
        return bTime - aTime;
      }).slice(0, limit);
    } catch {
      return [];
    }
  }
  async getEvidencePaths(runPath) {
    try {
      const paths = [];
      const runEntries = await readdir(runPath, { withFileTypes: true });
      const stepDirs = runEntries.filter(
        (e) => e.isDirectory() && e.name.startsWith("step-")
      );
      if (stepDirs.length > 0) {
        for (const stepDir of stepDirs) {
          const stepEvidencePath = join2(runPath, stepDir.name, "evidence");
          if (await this.pathExists(stepEvidencePath)) {
            const entries2 = await readdir(stepEvidencePath);
            for (const entry of entries2) {
              if (!entry.endsWith(".meta.json")) {
                paths.push(join2(stepEvidencePath, entry));
              }
            }
          }
        }
        return paths;
      }
      const evidencePath = join2(runPath, "evidence");
      const exists = await this.pathExists(evidencePath);
      if (!exists) {
        return [];
      }
      const entries = await readdir(evidencePath);
      return entries.filter((e) => !e.endsWith(".meta.json")).map((e) => join2(evidencePath, e));
    } catch {
      return [];
    }
  }
  calculateOverallStatus(scenarios) {
    if (scenarios.length === 0) {
      return "never_run";
    }
    const hasFailure = scenarios.some((s) => s.lastResult === "fail");
    if (hasFailure) {
      return "fail";
    }
    const hasPass = scenarios.some((s) => s.lastResult === "pass");
    if (hasPass) {
      return "pass";
    }
    return "never_run";
  }
  defaultMeta() {
    return { ...DEFAULT_SCENARIO_STATS };
  }
};

// src/services/dashboard-worker.ts
import { dirname as dirname2, join as join3 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
async function main() {
  const port = parseInt(process.env["HARSHJUDGE_PORT"] || "7002", 10);
  const projectPath = process.env["HARSHJUDGE_PROJECT_PATH"] || process.cwd();
  const distPath = join3(__dirname2, "ux-dist");
  console.log(`[HarshJudge Worker] Starting dashboard server...`);
  console.log(`[HarshJudge Worker] Port: ${port}`);
  console.log(`[HarshJudge Worker] Project path: ${projectPath}`);
  console.log(`[HarshJudge Worker] Dist path: ${distPath}`);
  const server = new DashboardServer({
    port,
    projectPath,
    distPath
  });
  try {
    const actualPort = await server.start();
    console.log(
      `[HarshJudge Worker] Dashboard running at http://localhost:${actualPort}`
    );
    process.on("SIGTERM", async () => {
      console.log("[HarshJudge Worker] Received SIGTERM, shutting down...");
      await server.stop();
      process.exit(0);
    });
    process.on("SIGINT", async () => {
      console.log("[HarshJudge Worker] Received SIGINT, shutting down...");
      await server.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("[HarshJudge Worker] Failed to start:", error);
    process.exit(1);
  }
}
main().catch((err) => {
  console.error("[HarshJudge Worker] Fatal error:", err);
  process.exit(1);
});
//# sourceMappingURL=dashboard-worker.js.map