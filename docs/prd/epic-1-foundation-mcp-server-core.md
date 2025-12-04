# Epic 1: Foundation & MCP Server Core

**Goal:** Establish monorepo infrastructure, TypeScript tooling, and implement all MCP tools for deterministic file operations. This epic creates the "data tunnel" that allows Claude to persist test artifacts.

## Story 1.1: Initialize Monorepo Structure

**As a** developer,
**I want** a properly configured monorepo with all packages scaffolded,
**so that** I can begin development with consistent tooling across the project.

**Acceptance Criteria:**

1. Root `package.json` configured with pnpm workspaces pointing to `packages/*`
2. Three package directories created: `packages/mcp-server`, `packages/ux`, `packages/shared`
3. Each package has its own `package.json` with appropriate name (`@harshjudge/mcp-server`, etc.)
4. TypeScript configured with strict mode, path aliases for cross-package imports
5. Root `tsconfig.json` with project references; each package extends base config
6. ESLint + Prettier configured at root level with consistent rules
7. Turborepo configured for build orchestration
8. `.gitignore` includes `node_modules`, `dist`, `.env`, and build artifacts
9. `README.md` at root with basic project description and setup instructions

---

## Story 1.2: Configure Build and Development Tooling

**As a** developer,
**I want** consistent build scripts and development workflows,
**so that** I can efficiently build, test, and develop across all packages.

**Acceptance Criteria:**

1. Root-level scripts: `build`, `dev`, `test`, `lint`, `clean` that operate across all packages
2. Each package has individual `build`, `dev`, `test` scripts
3. `packages/shared` builds first (dependency for other packages)
4. TypeScript compilation outputs to `dist/` in each package
5. Source maps generated for debugging
6. Vitest configured at root with workspace support for all packages
7. Build completes without errors for empty/skeleton packages

---

## Story 1.3: Implement Shared Types Package

**As a** developer,
**I want** a shared types package with core TypeScript interfaces,
**so that** all packages use consistent type definitions.

**Acceptance Criteria:**

1. `packages/shared/src/types/` directory structure created
2. `HarshJudgeConfig` interface for `config.yaml` structure
3. `Scenario` and `ScenarioMeta` interfaces for scenario files
4. `Run`, `RunResult`, and `Evidence` interfaces for run data
5. `ProjectStatus` and `ScenarioStatus` interfaces for status queries
6. MCP tool parameter and response interfaces for all 6 tools
7. `Result<T, E>` type for explicit error handling
8. Package exports all types via barrel file (`index.ts`)
9. Types are importable from other packages via `@harshjudge/shared`

---

## Story 1.4: Implement `initProject` MCP Tool

**As a** Claude Code user,
**I want** to initialize a HarshJudge project structure,
**so that** I have a properly organized directory for test scenarios and runs.

**Acceptance Criteria:**

1. `initProject` tool registered in MCP server with proper schema
2. Tool accepts parameters: `projectName` (required), `baseUrl` (optional)
3. Tool creates `.harshJudge/` directory at current working directory
4. Tool generates `config.yaml` with project configuration
5. Tool creates `scenarios/` subdirectory
6. Tool creates `.gitignore` with appropriate entries
7. Tool returns success status and created paths
8. Tool handles existing `.harshJudge/` gracefully (error or update)
9. Unit tests verify directory creation and config generation

---

## Story 1.5: Implement `saveScenario` MCP Tool

**As a** Claude Code user,
**I want** to save test scenarios to the filesystem,
**so that** my scenario definitions are persisted and organized.

**Acceptance Criteria:**

1. `saveScenario` tool registered in MCP server with proper schema
2. Tool accepts parameters: `slug`, `title`, `content`, `tags` (optional)
3. Tool validates slug is URL-safe (lowercase, hyphens, no special chars)
4. Tool creates scenario directory: `.harshJudge/scenarios/{slug}/`
5. Tool writes `scenario.md` with provided content
6. Tool generates `meta.yaml` with initial statistics (0 runs, no last result)
7. Tool handles duplicate slugs by appending numeric suffix
8. Tool returns created paths and metadata
9. Unit tests verify file creation and validation logic

---

## Story 1.6: Implement `startRun` MCP Tool

**As a** Claude Code user,
**I want** to start a new test run,
**so that** I have a dedicated directory for capturing evidence.

**Acceptance Criteria:**

1. `startRun` tool registered in MCP server with proper schema
2. Tool accepts parameter: `scenarioSlug` (required)
3. Tool validates scenario exists
4. Tool generates unique run ID using nanoid
5. Tool creates run directory: `.harshJudge/scenarios/{slug}/runs/{runId}/`
6. Tool creates `evidence/` subdirectory within run
7. Tool records start timestamp
8. Tool returns `runId`, `runPath`, `evidencePath`, `runNumber`
9. Unit tests verify directory creation and ID generation

---

## Story 1.7: Implement `recordEvidence` MCP Tool

**As a** Claude Code user,
**I want** to record test evidence artifacts,
**so that** screenshots, logs, and data are captured with each test step.

**Acceptance Criteria:**

1. `recordEvidence` tool registered in MCP server with proper schema
2. Tool accepts parameters: `runId`, `step`, `type`, `name`, `data`, `metadata` (optional)
3. Tool validates run exists and is not completed
4. Tool validates evidence type: `screenshot`, `db_snapshot`, `console_log`, `network_log`, `html_snapshot`, `custom`
5. Tool decodes base64 data for binary types (screenshots)
6. Tool writes evidence to `evidence/step-{nn}-{name}.{ext}`
7. Tool writes metadata to `evidence/step-{nn}-{name}.meta.json`
8. Tool returns success status, file path, file size
9. Unit tests verify file writing and validation

---

## Story 1.8: Implement `completeRun` MCP Tool

**As a** Claude Code user,
**I want** to complete a test run with results,
**so that** the run is finalized and statistics are updated.

**Acceptance Criteria:**

1. `completeRun` tool registered in MCP server with proper schema
2. Tool accepts parameters: `runId`, `status`, `duration`, `failedStep` (optional), `errorMessage` (optional)
3. Tool validates run exists and is not already completed
4. Tool writes `result.json` with run outcome and details
5. Tool updates scenario `meta.yaml` with new statistics:
   - Increment `totalRuns`
   - Increment `passCount` or `failCount`
   - Update `lastRun` timestamp
   - Update `lastResult`
   - Recalculate `avgDuration`
6. Tool returns updated scenario statistics
7. Unit tests verify result writing and stats calculation

---

## Story 1.9: Implement `getStatus` MCP Tool

**As a** Claude Code user,
**I want** to query the status of scenarios and runs,
**so that** I can see what tests exist and their current state.

**Acceptance Criteria:**

1. `getStatus` tool registered in MCP server
2. When called without parameters, returns project-level status:
   - List of all scenarios with slug, title, lastResult, lastRun
   - Summary counts: total, passing, failing, never run
3. When called with `scenarioSlug`, returns scenario detail:
   - Full scenario metadata
   - Recent runs (last 10) with results
   - Failure summaries for failed runs
4. Returns appropriate error if project not initialized
5. Returns appropriate error if scenario not found
6. Performance: responds in < 1 second for 100+ scenarios
7. Unit tests verify both query modes

---

## Story 1.10: Implement MCP Server Entry Point

**As a** Claude Code user,
**I want** the MCP server to start and respond to tool calls,
**so that** I can use HarshJudge tools from Claude Code.

**Acceptance Criteria:**

1. MCP server implemented using `@modelcontextprotocol/sdk`
2. Server registers all 6 tools with proper schemas
3. Server handles MCP protocol handshake correctly
4. Server logs startup, tool calls, and errors to stderr
5. `packages/mcp-server/package.json` has `bin` entry for CLI execution
6. Server can be started via `npx @harshjudge/mcp-server`
7. Error responses follow MCP error format with meaningful messages
8. Integration test verifies MCP handshake and tool responses

---
