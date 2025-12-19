# 5. API Specification (MCP Tools)

HarshJudge uses MCP protocol instead of REST/GraphQL. The MCP server exposes 10 tools.

## 5.1 MCP Tool Schemas

```typescript
// packages/shared/src/types/mcp-tools.ts
import { z } from 'zod';

// ============================================================
// initProject
// ============================================================
export const InitProjectParams = z.object({
  projectName: z.string().min(1).max(100),
  baseUrl: z.string().url().optional(),
});
export type InitProjectParams = z.infer<typeof InitProjectParams>;

export interface InitProjectResult {
  success: boolean;
  projectPath: string;
  configPath: string;
  prdPath: string;        // NEW: Path to prd.md template
  scenariosPath: string;
}

// ============================================================
// createScenario (NEW - replaces saveScenario)
// ============================================================
export const StepInput = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  preconditions: z.string().optional().default(''),
  actions: z.string().min(1),
  expectedOutcome: z.string().min(1),
});
export type StepInput = z.infer<typeof StepInput>;

export const CreateScenarioParams = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(200),
  steps: z.array(StepInput).min(1),
  tags: z.array(z.string()).optional().default([]),
  estimatedDuration: z.number().positive().optional().default(60),
  starred: z.boolean().optional().default(false),
});
export type CreateScenarioParams = z.infer<typeof CreateScenarioParams>;

export interface CreateScenarioResult {
  success: boolean;
  slug: string;
  scenarioPath: string;
  metaPath: string;
  stepsPath: string;
  stepFiles: string[];
  isNew: boolean;
}

// ============================================================
// saveScenario (DEPRECATED - use createScenario)
// ============================================================
/** @deprecated Use createScenario instead */
export const SaveScenarioParams = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  estimatedDuration: z.number().positive().optional().default(60),
});
export type SaveScenarioParams = z.infer<typeof SaveScenarioParams>;

/** @deprecated Use CreateScenarioResult instead */
export interface SaveScenarioResult {
  success: boolean;
  slug: string;
  scenarioPath: string;
  metaPath: string;
  isNew: boolean;
}

// ============================================================
// toggleStar (NEW)
// ============================================================
export const ToggleStarParams = z.object({
  scenarioSlug: z.string().regex(/^[a-z0-9-]+$/),
  starred: z.boolean().optional(), // If omitted, toggles current state
});
export type ToggleStarParams = z.infer<typeof ToggleStarParams>;

export interface ToggleStarResult {
  success: boolean;
  slug: string;
  starred: boolean;
}

// ============================================================
// startRun
// ============================================================
export const StartRunParams = z.object({
  scenarioSlug: z.string().regex(/^[a-z0-9-]+$/),
});
export type StartRunParams = z.infer<typeof StartRunParams>;

export interface StartRunResult {
  success: boolean;
  runId: string;
  runNumber: number;
  runPath: string;
  steps: Array<{
    id: string;
    title: string;
    file: string;
  }>;
  startedAt: string;
}

// ============================================================
// recordEvidence
// ============================================================
export const RecordEvidenceParams = z.object({
  runId: z.string().min(1),
  stepId: z.string().regex(/^\d{2}$/, 'Step ID must be zero-padded (e.g., "01", "02")'),
  type: z.enum(['screenshot', 'db_snapshot', 'console_log', 'network_log', 'html_snapshot', 'custom']),
  name: z.string().min(1).max(100),
  data: z.string(), // File path for screenshots, JSON string for objects, plain text for logs
  metadata: z.record(z.unknown()).optional(),
});
export type RecordEvidenceParams = z.infer<typeof RecordEvidenceParams>;

export interface RecordEvidenceResult {
  success: boolean;
  filePath: string;
  metaPath: string;
  fileSize: number;
  stepPath: string;  // NEW: Path to step evidence directory
}

// ============================================================
// completeStep (NEW)
// ============================================================
export const CompleteStepParams = z.object({
  runId: z.string().min(1),
  stepId: z.string().regex(/^\d{2}$/),
  status: z.enum(['pass', 'fail', 'skipped']),
  duration: z.number().nonnegative(),
  error: z.string().optional(),
});
export type CompleteStepParams = z.infer<typeof CompleteStepParams>;

export interface CompleteStepResult {
  success: boolean;
  runId: string;
  stepId: string;
  status: 'pass' | 'fail' | 'skipped';
  nextStepId: string | null;  // null if this was the last step or run should stop
}

// ============================================================
// completeRun
// ============================================================
export const CompleteRunParams = z.object({
  runId: z.string().min(1),
  status: z.enum(['pass', 'fail']),
  duration: z.number().nonnegative(),
  failedStep: z.string().regex(/^\d{2}$/).optional(),  // Changed from number to step ID
  errorMessage: z.string().optional(),
});
export type CompleteRunParams = z.infer<typeof CompleteRunParams>;

export interface CompleteRunResult {
  success: boolean;
  resultPath: string;
  updatedMeta: {
    totalRuns: number;
    passCount: number;
    failCount: number;
    avgDuration: number;
  };
}

// ============================================================
// getStatus
// ============================================================
export const GetStatusParams = z.object({
  scenarioSlug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  starredOnly: z.boolean().optional().default(false),  // NEW: Filter by starred
});
export type GetStatusParams = z.infer<typeof GetStatusParams>;

export type GetStatusResult = ProjectStatus | ScenarioDetail;

// ============================================================
// openDashboard
// ============================================================
export const OpenDashboardParams = z.object({
  port: z.number().int().min(1024).max(65535).optional().default(7002),
  openBrowser: z.boolean().optional().default(true),
});
export type OpenDashboardParams = z.infer<typeof OpenDashboardParams>;

export interface OpenDashboardResult {
  success: boolean;
  url: string;
  port: number;
  pid: number;
  message: string;
}

// ============================================================
// closeDashboard
// ============================================================
export const CloseDashboardParams = z.object({});
export type CloseDashboardParams = z.infer<typeof CloseDashboardParams>;

export interface CloseDashboardResult {
  success: boolean;
  stopped: boolean;
  message: string;
}

// ============================================================
// getDashboardStatus
// ============================================================
export const GetDashboardStatusParams = z.object({});
export type GetDashboardStatusParams = z.infer<typeof GetDashboardStatusParams>;

export interface GetDashboardStatusResult {
  running: boolean;
  pid?: number;
  port?: number;
  url?: string;
  startedAt?: string;
  stale?: boolean;
}
```

## 5.2 MCP Tool Registration

```typescript
// packages/mcp-server/src/tools/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

export function registerTools(server: Server) {
  server.setRequestHandler('tools/list', async () => ({
    tools: [
      {
        name: 'initProject',
        description: 'Initialize a HarshJudge project in the current directory. Creates config.yaml and prd.md template.',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Project name' },
            baseUrl: { type: 'string', description: 'Base URL of target application' },
          },
          required: ['projectName'],
        },
      },
      {
        name: 'createScenario',
        description: 'Create a test scenario with granular steps. Each step is saved as a separate file.',
        inputSchema: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'URL-safe identifier' },
            title: { type: 'string', description: 'Human-readable title' },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string', description: 'Step title' },
                  description: { type: 'string', description: 'What this step does' },
                  preconditions: { type: 'string', description: 'Expected state before step' },
                  actions: { type: 'string', description: 'Actions to perform' },
                  expectedOutcome: { type: 'string', description: 'Expected result' },
                },
                required: ['title', 'actions', 'expectedOutcome'],
              },
              description: 'Ordered list of test steps',
            },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorization' },
            estimatedDuration: { type: 'number', description: 'Expected duration in seconds' },
            starred: { type: 'boolean', description: 'Mark as important scenario' },
          },
          required: ['slug', 'title', 'steps'],
        },
      },
      {
        name: 'toggleStar',
        description: 'Toggle or set the starred status of a scenario',
        inputSchema: {
          type: 'object',
          properties: {
            scenarioSlug: { type: 'string', description: 'Scenario identifier' },
            starred: { type: 'boolean', description: 'Set starred state (omit to toggle)' },
          },
          required: ['scenarioSlug'],
        },
      },
      {
        name: 'startRun',
        description: 'Start a new test run for a scenario. Returns step list for execution.',
        inputSchema: {
          type: 'object',
          properties: {
            scenarioSlug: { type: 'string', description: 'Scenario identifier' },
          },
          required: ['scenarioSlug'],
        },
      },
      {
        name: 'recordEvidence',
        description: 'Record test evidence (screenshot, log, db snapshot) for a specific step',
        inputSchema: {
          type: 'object',
          properties: {
            runId: { type: 'string', description: 'Run identifier' },
            stepId: { type: 'string', description: 'Step ID (zero-padded, e.g., "01", "02")' },
            type: {
              type: 'string',
              enum: ['screenshot', 'db_snapshot', 'console_log', 'network_log', 'html_snapshot', 'custom'],
              description: 'Type of evidence',
            },
            name: { type: 'string', description: 'Descriptive name for the evidence' },
            data: { type: 'string', description: 'File path for screenshots, JSON/text for other types' },
            metadata: { type: 'object', description: 'Optional additional metadata' },
          },
          required: ['runId', 'stepId', 'type', 'name', 'data'],
        },
      },
      {
        name: 'completeStep',
        description: 'Mark a step as complete and get the next step to execute',
        inputSchema: {
          type: 'object',
          properties: {
            runId: { type: 'string', description: 'Run identifier' },
            stepId: { type: 'string', description: 'Step ID (zero-padded)' },
            status: { type: 'string', enum: ['pass', 'fail', 'skipped'], description: 'Step result' },
            duration: { type: 'number', description: 'Step duration in milliseconds' },
            error: { type: 'string', description: 'Error message (if failed)' },
          },
          required: ['runId', 'stepId', 'status', 'duration'],
        },
      },
      {
        name: 'completeRun',
        description: 'Complete a test run with final results',
        inputSchema: {
          type: 'object',
          properties: {
            runId: { type: 'string', description: 'Run identifier' },
            status: { type: 'string', enum: ['pass', 'fail'], description: 'Final status' },
            duration: { type: 'number', description: 'Total duration in milliseconds' },
            failedStep: { type: 'string', description: 'Step ID that failed (if failed)' },
            errorMessage: { type: 'string', description: 'Error description (if failed)' },
          },
          required: ['runId', 'status', 'duration'],
        },
      },
      {
        name: 'getStatus',
        description: 'Get status of all scenarios or a specific scenario',
        inputSchema: {
          type: 'object',
          properties: {
            scenarioSlug: { type: 'string', description: 'Optional scenario identifier for detailed status' },
            starredOnly: { type: 'boolean', description: 'Only return starred scenarios' },
          },
        },
      },
      {
        name: 'openDashboard',
        description: 'Start the HarshJudge dashboard server',
        inputSchema: {
          type: 'object',
          properties: {
            port: { type: 'number', description: 'Port to listen on (default: 7002)' },
            openBrowser: { type: 'boolean', description: 'Open browser automatically (default: true)' },
          },
        },
      },
      {
        name: 'closeDashboard',
        description: 'Stop the running dashboard server',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'getDashboardStatus',
        description: 'Check if the dashboard server is running',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  }));
}
```

## 5.3 Tool Migration Guide

### Deprecation: `saveScenario` → `createScenario`

The `saveScenario` tool is deprecated and will be removed in a future version. Use `createScenario` instead.

**Before (saveScenario):**
```json
{
  "slug": "login-flow",
  "title": "User Login Flow",
  "content": "# Steps\n\n## Step 1: Navigate\n...",
  "tags": ["auth"],
  "estimatedDuration": 30
}
```

**After (createScenario):**
```json
{
  "slug": "login-flow",
  "title": "User Login Flow",
  "steps": [
    {
      "title": "Navigate to login page",
      "actions": "Go to /login",
      "expectedOutcome": "Login form is visible"
    },
    {
      "title": "Enter credentials",
      "actions": "Fill email and password fields",
      "expectedOutcome": "Fields are populated"
    }
  ],
  "tags": ["auth"],
  "estimatedDuration": 30
}
```

### New Tool: `completeStep`

Use `completeStep` to mark individual steps as complete during execution. This enables:
- Granular progress tracking
- Resume from last completed step (future feature)
- Per-step timing metrics

### Updated Tool: `recordEvidence`

The `step` parameter (number) has been replaced with `stepId` (string, zero-padded):

**Before:**
```json
{ "runId": "run_123", "step": 1, "type": "screenshot", ... }
```

**After:**
```json
{ "runId": "run_123", "stepId": "01", "type": "screenshot", ... }
```

---
