#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { handleInitProject } from './handlers/init-project.js';
import { handleSaveScenario } from './handlers/save-scenario.js';
import { handleStartRun } from './handlers/start-run.js';
import { handleRecordEvidence } from './handlers/record-evidence.js';
import { handleCompleteRun } from './handlers/complete-run.js';
import { handleGetStatus } from './handlers/get-status.js';
import { handleOpenDashboard } from './handlers/open-dashboard.js';
import { handleCloseDashboard } from './handlers/close-dashboard.js';
import { handleGetDashboardStatus } from './handlers/get-dashboard-status.js';

// Tool schemas for MCP registration
const TOOLS = [
  {
    name: 'initProject',
    description: 'Initialize a HarshJudge project in the current directory',
    inputSchema: {
      type: 'object' as const,
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
      type: 'object' as const,
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
      type: 'object' as const,
      properties: {
        scenarioSlug: { type: 'string', description: 'Scenario identifier' },
      },
      required: ['scenarioSlug'],
    },
  },
  {
    name: 'recordEvidence',
    description: 'Record test evidence (screenshot, log, db snapshot). IMPORTANT: For type="screenshot", data must be an absolute file path to the PNG file (e.g., from Playwright browser_take_screenshot). For other types, data is the text/JSON content.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        runId: { type: 'string', description: 'Run identifier' },
        step: { type: 'number', description: 'Step number (1-based)' },
        type: {
          type: 'string',
          enum: ['screenshot', 'db_snapshot', 'console_log', 'network_log', 'html_snapshot', 'custom'],
          description: 'Type of evidence',
        },
        name: { type: 'string', description: 'Descriptive name for the evidence' },
        data: { type: 'string', description: 'For screenshot: absolute file path to PNG. For other types: text/JSON content.' },
        metadata: { type: 'object', description: 'Optional additional metadata' },
      },
      required: ['runId', 'step', 'type', 'name', 'data'],
    },
  },
  {
    name: 'completeRun',
    description: 'Complete a test run with final results',
    inputSchema: {
      type: 'object' as const,
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
      type: 'object' as const,
      properties: {
        scenarioSlug: { type: 'string', description: 'Optional scenario identifier for detailed status' },
      },
    },
  },
  {
    name: 'openDashboard',
    description: 'Start or open the dashboard server. If already running, returns the existing URL. Optionally opens browser.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        port: { type: 'number', description: 'Preferred port (default: 3001, auto-increments if busy)' },
        openBrowser: { type: 'boolean', description: 'Open browser after starting (default: true)' },
      },
    },
  },
  {
    name: 'closeDashboard',
    description: 'Stop the dashboard server and free up resources',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'getDashboardStatus',
    description: 'Check if the dashboard is running, get URL, port, and PID',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
];

// Handler map
const HANDLERS: Record<string, (params: unknown) => Promise<unknown>> = {
  initProject: handleInitProject,
  saveScenario: handleSaveScenario,
  startRun: handleStartRun,
  recordEvidence: handleRecordEvidence,
  completeRun: handleCompleteRun,
  getStatus: handleGetStatus,
  openDashboard: handleOpenDashboard,
  closeDashboard: handleCloseDashboard,
  getDashboardStatus: handleGetDashboardStatus,
};

/**
 * Create and configure the MCP server.
 */
function createServer(): Server {
  const server = new Server(
    {
      name: 'harshjudge',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, () => {
    return { tools: TOOLS };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    console.error(`[HarshJudge] Tool called: ${name}`);

    const handler = HANDLERS[name];
    if (!handler) {
      console.error(`[HarshJudge] Unknown tool: ${name}`);
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
        isError: true,
      };
    }

    try {
      const result = await handler(args);
      console.error(`[HarshJudge] Tool ${name} completed successfully`);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[HarshJudge] Tool ${name} failed: ${message}`);
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: message }) }],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * Main entry point - starts the MCP server.
 */
async function main(): Promise<void> {
  console.error('[HarshJudge] Starting MCP server...');

  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('[HarshJudge] MCP server running on stdio');
}

// Run if this is the entry point
main().catch((error) => {
  console.error('[HarshJudge] Fatal error:', error);
  process.exit(1);
});
