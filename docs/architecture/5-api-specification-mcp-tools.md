# 5. API Specification (MCP Tools)

HarshJudge uses MCP protocol instead of REST/GraphQL. The MCP server exposes 9 tools.

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
  scenariosPath: string;
}

// ============================================================
// saveScenario
// ============================================================
export const SaveScenarioParams = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
  estimatedDuration: z.number().positive().optional().default(60),
});
export type SaveScenarioParams = z.infer<typeof SaveScenarioParams>;

export interface SaveScenarioResult {
  success: boolean;
  slug: string;
  scenarioPath: string;
  metaPath: string;
  isNew: boolean;
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
  evidencePath: string;
  startedAt: string;
}

// ============================================================
// recordEvidence
// ============================================================
export const RecordEvidenceParams = z.object({
  runId: z.string().min(1),
  step: z.number().int().positive(),
  type: z.enum(['screenshot', 'db_snapshot', 'console_log', 'network_log', 'html_snapshot', 'custom']),
  name: z.string().min(1).max(100),
  data: z.string(), // base64 for binary, JSON string for objects, plain text for logs
  metadata: z.record(z.unknown()).optional(),
});
export type RecordEvidenceParams = z.infer<typeof RecordEvidenceParams>;

export interface RecordEvidenceResult {
  success: boolean;
  filePath: string;
  metaPath: string;
  fileSize: number;
}

// ============================================================
// completeRun
// ============================================================
export const CompleteRunParams = z.object({
  runId: z.string().min(1),
  status: z.enum(['pass', 'fail']),
  duration: z.number().nonnegative(),
  failedStep: z.number().int().positive().optional(),
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
        description: 'Initialize a HarshJudge project in the current directory',
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
        name: 'saveScenario',
        description: 'Save a test scenario to the filesystem',
        inputSchema: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'URL-safe identifier' },
            title: { type: 'string', description: 'Human-readable title' },
            content: { type: 'string', description: 'Markdown content with test steps' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags for categorization' },
            estimatedDuration: { type: 'number', description: 'Expected duration in seconds' },
          },
          required: ['slug', 'title', 'content'],
        },
      },
      {
        name: 'startRun',
        description: 'Start a new test run for a scenario',
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
        description: 'Record test evidence (screenshot, log, db snapshot)',
        inputSchema: {
          type: 'object',
          properties: {
            runId: { type: 'string', description: 'Run identifier' },
            step: { type: 'number', description: 'Step number (1-based)' },
            type: {
              type: 'string',
              enum: ['screenshot', 'db_snapshot', 'console_log', 'network_log', 'html_snapshot', 'custom'],
              description: 'Type of evidence',
            },
            name: { type: 'string', description: 'Descriptive name for the evidence' },
            data: { type: 'string', description: 'Evidence data (base64 for binary, JSON/text otherwise)' },
            metadata: { type: 'object', description: 'Optional additional metadata' },
          },
          required: ['runId', 'step', 'type', 'name', 'data'],
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
            failedStep: { type: 'number', description: 'Step number that failed (if failed)' },
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

---
