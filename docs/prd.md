# HarshJudge Product Requirements Document (PRD)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-04 | 0.1 | Initial PRD draft | John (PM) |
| 2025-12-04 | 0.2 | Architecture pivot to Skill + MCP + Dashboard model | Winston (Architect) |

---

## Goals

- **AI-Native Test Orchestration:** Enable developers to run comprehensive E2E tests through Claude Code with organized, reviewable results
- **Eliminate Test Maintenance Burden:** Reduce test maintenance time by 70% through AI-driven scenario execution
- **Complete Evidence Capture:** Provide full diagnostic context (screenshots, logs, DB state) for every test run
- **Seamless Claude Code Integration:** Deliver a native skill-based workflow where Claude orchestrates testing using existing tools
- **Developer Confidence:** Increase deployment confidence through comprehensive, automatically captured test evidence

## Background Context

End-to-end testing remains one of the most painful aspects of software development. Writing comprehensive E2E tests typically takes 2-3x longer than building the feature itself, and maintaining those tests consumes 20-40% of development time. Existing solutions like Cypress and Playwright are powerful but fully manual, while record-and-replay tools like TestSprite don't understand code context or verify data integrity.

HarshJudge addresses this gap with a **three-component architecture**:

1. **Claude Skill** - Structured prompts that guide Claude through test workflows with consistent patterns
2. **Lightweight MCP Server** - A data tunnel that provides deterministic file storage for scenarios and evidence
3. **Read-Only Dashboard** - Visual interface for browsing test results and evidence

This architecture leverages Claude Code's native capabilities and existing tools (Playwright MCP for browser automation, database tools for verification) rather than duplicating them. The file-system-as-database approach keeps everything local, git-friendly, and portable—no cloud dependencies required.

---

## Requirements

### Functional Requirements

**Installation & Setup**
- **FR1:** The system shall provide an MCP server installable via `npm install` that integrates with Claude Code
- **FR2:** The system shall provide Claude Skills installable via `harshjudge init` command
- **FR3:** The system shall complete installation and Claude Code connection in under 5 minutes
- **FR4:** The `/harshjudge:setup` skill shall guide users through prerequisite verification and configuration

**`initProject` Tool**
- **FR5:** The `initProject` tool shall create a `.harshJudge/` directory structure at the project root
- **FR6:** The `initProject` tool shall generate a `config.yaml` with project name and base URL
- **FR7:** The `initProject` tool shall create appropriate `.gitignore` entries

**`saveScenario` Tool**
- **FR8:** The `saveScenario` tool shall validate and persist `scenario.md` files with human-readable test flows
- **FR9:** The `saveScenario` tool shall generate `meta.yaml` files for machine-updated statistics
- **FR10:** The `saveScenario` tool shall generate URL-friendly slugs from scenario titles
- **FR11:** The `saveScenario` tool shall handle duplicate slugs by appending numeric suffixes

**`startRun` Tool**
- **FR12:** The `startRun` tool shall create a new run directory with unique ID under the scenario
- **FR13:** The `startRun` tool shall return the run ID and evidence path for artifact storage
- **FR14:** The `startRun` tool shall record run start timestamp

**`recordEvidence` Tool**
- **FR15:** The `recordEvidence` tool shall accept and store screenshots as PNG files
- **FR16:** The `recordEvidence` tool shall accept and store database snapshots as JSON files
- **FR17:** The `recordEvidence` tool shall accept and store console logs as JSON files
- **FR18:** The `recordEvidence` tool shall accept and store HTML snapshots
- **FR19:** The `recordEvidence` tool shall validate evidence type and format before storage
- **FR20:** The `recordEvidence` tool shall store metadata alongside each evidence artifact

**`completeRun` Tool**
- **FR21:** The `completeRun` tool shall finalize the run with pass/fail status
- **FR22:** The `completeRun` tool shall record duration and failure details if applicable
- **FR23:** The `completeRun` tool shall update scenario statistics in `meta.yaml`

**`getStatus` Tool**
- **FR24:** The `getStatus` tool shall return a list of all scenarios with their current pass/fail status
- **FR25:** The `getStatus` tool shall provide recent run history for each scenario
- **FR26:** The `getStatus` tool shall include failure summaries with diagnostic information

**Claude Skills**
- **FR27:** The `/harshjudge:analyze` skill shall guide Claude through project analysis with structured output
- **FR28:** The `/harshjudge:create` skill shall guide Claude through scenario creation with template enforcement
- **FR29:** The `/harshjudge:run` skill shall define the exact protocol for test execution and evidence capture
- **FR30:** The `/harshjudge:status` skill shall provide quick status check workflow

**File-System Data Structure**
- **FR31:** The system shall store all data in a `.harshJudge/` folder structure (config, scenarios, runs)
- **FR32:** The system shall organize evidence by run and step number
- **FR33:** The system shall support hierarchical project isolation within the data structure

**UX Dashboard**
- **FR34:** The dashboard shall display a 3-column layout (Projects → Scenarios → Details)
- **FR35:** The dashboard shall use file watchers to provide live updates without manual refresh
- **FR36:** The dashboard shall include a screenshot viewer with step-by-step timeline navigation
- **FR37:** The dashboard shall be read-only (all actions performed via Claude Code)
- **FR38:** The dashboard shall display run history with pass/fail indicators
- **FR39:** The dashboard shall provide log viewer for failed runs

### Non-Functional Requirements

**Performance**
- **NFR1:** MCP tools shall respond within 500ms for file operations
- **NFR2:** The dashboard shall update within 2 seconds of file system changes
- **NFR3:** The `getStatus` tool shall return status in < 1 second for 100+ scenarios

**Compatibility**
- **NFR4:** The system shall run on macOS, Windows, and Linux (anywhere Claude Code runs)
- **NFR5:** The system shall require Node.js 18+ (LTS)
- **NFR6:** The system shall be compatible with Playwright MCP for browser automation

**Security & Privacy**
- **NFR7:** The system shall not transmit any data outside the local machine (privacy-first)
- **NFR8:** The system shall validate all inputs before writing to filesystem
- **NFR9:** The dashboard shall be read-only with no write capabilities

**Reliability**
- **NFR10:** The MCP server shall handle concurrent tool calls gracefully
- **NFR11:** The system shall provide clear error messages for invalid operations

**Usability**
- **NFR12:** Scenario files shall be human-readable Markdown, editable without specialized tools
- **NFR13:** The file structure shall be git-friendly for version control integration
- **NFR14:** Skills shall provide clear, actionable guidance for Claude

**Maintainability**
- **NFR15:** The codebase shall use TypeScript for type safety across all packages
- **NFR16:** The system shall follow monorepo structure with packages for MCP server, UX, and shared types

---

## User Interface Design Goals

### Overall UX Vision

HarshJudge's dashboard embodies a **"visibility without friction"** philosophy. The UX serves as a passive monitoring layer—a window into test status, run history, and diagnostic evidence—while deliberately avoiding action buttons or workflows. This reinforces the AI-native paradigm where Claude Code is the sole interface for performing operations. The design should feel like a sophisticated developer tool: information-dense but clean, fast to scan, and technically precise.

### Key Interaction Paradigms

- **Browse-Only Navigation:** Users navigate hierarchically (Projects → Scenarios → Run Details) but cannot create, edit, or trigger actions from the UI
- **Live Data Streaming:** File system watchers push updates to the UI in real-time; users never need to manually refresh
- **Drill-Down Exploration:** Click-to-expand pattern for exploring test runs, viewing screenshots, and examining failure logs
- **Timeline Scrubbing:** Step-by-step timeline for test runs allows users to "replay" the test visually via captured screenshots
- **Contextual Details:** Hovering or selecting items reveals additional metadata without page transitions

### Core Screens and Views

1. **Project List Panel** — Left column showing all discovered projects with status indicators (pass/fail/running)
2. **Scenario List Panel** — Middle column displaying scenarios for selected project with recent run status
3. **Detail Panel** — Right column showing:
   - Scenario content (rendered Markdown)
   - Run history list
   - Selected run details with step timeline
4. **Screenshot Viewer** — Full-screen or expanded view for examining captured screenshots with step navigation
5. **Log Viewer** — Expandable panel showing console, network, and error logs for failed runs

### Accessibility: WCAG AA

The dashboard shall meet WCAG AA accessibility standards including:
- Sufficient color contrast ratios (4.5:1 for text)
- Keyboard navigation support for all interactive elements
- Screen reader compatible with proper ARIA labels
- Focus indicators for interactive elements

### Branding

**Visual Identity:**
- **Aesthetic:** Clean, modern developer tooling aesthetic—inspired by VS Code, GitHub, and Vercel dashboards
- **Color Palette:** Dark mode primary (developer preference), with light mode as secondary option
- **Typography:** Monospace fonts for code/logs, sans-serif for UI text
- **Iconography:** Minimal, functional icons (status indicators, navigation)
- **Name Treatment:** "HarshJudge" conveys rigorous, uncompromising test evaluation—the UI should feel precise and trustworthy

### Target Devices and Platforms: Web Responsive

- **Primary:** Desktop browsers (Chrome, Firefox, Safari, Edge) at 1280px+ width
- **Secondary:** Tablet landscape mode (1024px+) for monitoring scenarios
- **Consideration:** The 3-column layout may collapse to 2-column or stacked views on narrower screens, but the primary use case is desktop developer workstations

---

## Technical Assumptions

### Repository Structure: Monorepo

**Decision:** Single monorepo containing all project packages

**Rationale:**
- Shared TypeScript types between MCP server, UX dashboard, and skills
- Simplified dependency management and versioning
- Easier local development with cross-package imports
- Single CI/CD pipeline for the entire project

**Package Structure:**
```
HarshJudge/
├── packages/
│   ├── mcp-server/     # Lightweight MCP server (file operations)
│   ├── ux/             # Vite + React dashboard
│   └── shared/         # TypeScript interfaces, utilities
├── skills/
│   └── harshjudge/     # Claude skill files
│       ├── skill.md
│       ├── setup.md
│       ├── analyze.md
│       ├── create.md
│       ├── run.md
│       └── status.md
└── turbo.json
```

### Service Architecture: Skill + Lightweight MCP + Dashboard

**Decision:** Three-component architecture with clear separation of concerns

**Components:**
1. **Claude Skill** — Structured prompts that guide Claude's behavior for testing workflows
2. **MCP Server** — Lightweight file operations only; data tunnel to filesystem
3. **Dashboard** — React app that reads filesystem; no write capabilities

**Rationale:**
- Leverages existing Playwright MCP for browser automation (no duplication)
- Leverages Claude's native code understanding (no analysis engine needed)
- Single responsibility per component
- Minimal codebase to maintain

**Communication:**
- Claude Code ↔ MCP Server: MCP protocol (stdio)
- Claude Code ↔ Playwright MCP: Direct (Claude calls Playwright tools)
- Dashboard ↔ File System: Direct file reads + chokidar watchers
- No inter-service HTTP APIs required

### Testing Requirements: Unit + Integration

**Decision:** Unit tests for MCP tools, integration tests for complete workflows

**Test Strategy:**
- **Unit Tests:** MCP tool handlers, file operations, validation logic
- **Integration Tests:** Complete skill workflows, file system operations
- **Manual Testing:** Skill execution with Claude Code

**Framework Choices:**
- **Test Runner:** Vitest (fast, TypeScript-native, Vite-compatible)
- **Assertion Library:** Vitest built-in
- **Mocking:** Vitest mocking for file system operations

**Coverage Targets:**
- Unit: 80%+ coverage on MCP tools and utilities
- Integration: All 6 MCP tools have happy path + error case coverage

### Additional Technical Assumptions

**Language & Runtime:**
- **TypeScript:** Strict mode across all packages
- **Node.js 18+ LTS:** Required for native fetch, stable ESM
- **ES Modules:** Use ESM throughout

**Key Libraries:**

| Purpose | Library | Rationale |
|---------|---------|-----------|
| MCP Protocol | `@modelcontextprotocol/sdk` | Official Anthropic SDK |
| UX Framework | `react` + `vite` | Fast dev experience, modern tooling |
| Styling | `tailwindcss` | Utility-first, matches developer aesthetic |
| YAML Parsing | `js-yaml` | Standard, well-maintained |
| Markdown Parsing | `marked` | Fast, extensible |
| File Watching | `chokidar` | Cross-platform, reliable |
| ID Generation | `nanoid` | Fast, URL-safe IDs |
| Schema Validation | `zod` | Runtime validation for inputs |

**Prerequisites:**
- Playwright MCP for browser automation
- Database tools for DB verification (optional)

---

## Epic List

### Epic 1: Foundation & MCP Server Core
**Goal:** Establish monorepo infrastructure, TypeScript tooling, and implement all MCP tools for file operations.

### Epic 2: Claude Skills
**Goal:** Create the Claude skill files that guide test workflows with consistent patterns and protocols.

### Epic 3: UX Dashboard
**Goal:** Build the Vite + React dashboard with 3-column layout, file watcher live updates, screenshot timeline viewer, and log viewer.

### Epic 4: Installation & Documentation
**Goal:** Create installation flow, CLI commands, and comprehensive documentation.

---

## Epic 1: Foundation & MCP Server Core

**Goal:** Establish monorepo infrastructure, TypeScript tooling, and implement all MCP tools for deterministic file operations. This epic creates the "data tunnel" that allows Claude to persist test artifacts.

### Story 1.1: Initialize Monorepo Structure

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

### Story 1.2: Configure Build and Development Tooling

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

### Story 1.3: Implement Shared Types Package

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

### Story 1.4: Implement `initProject` MCP Tool

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

### Story 1.5: Implement `saveScenario` MCP Tool

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

### Story 1.6: Implement `startRun` MCP Tool

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

### Story 1.7: Implement `recordEvidence` MCP Tool

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

### Story 1.8: Implement `completeRun` MCP Tool

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

### Story 1.9: Implement `getStatus` MCP Tool

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

### Story 1.10: Implement MCP Server Entry Point

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

## Epic 2: Claude Skills

**Goal:** Create the Claude skill files that guide test workflows with consistent patterns and protocols. Skills ensure Claude follows deterministic patterns while allowing AI flexibility in execution.

### Story 2.1: Create Main Skill Definition

**As a** Claude Code user,
**I want** a main skill file that defines HarshJudge capabilities,
**so that** Claude understands how to use HarshJudge tools correctly.

**Acceptance Criteria:**

1. `skills/harshjudge/skill.md` created with skill metadata
2. Skill defines activation triggers for HarshJudge commands
3. Skill lists all sub-skills with descriptions
4. Skill documents required MCP servers (harshjudge, playwright)
5. Skill defines core principles (evidence first, fail fast, etc.)
6. Skill provides overview of the HarshJudge workflow

---

### Story 2.2: Create Setup Skill

**As a** Claude Code user,
**I want** a setup skill that guides me through installation,
**so that** I can configure HarshJudge correctly.

**Acceptance Criteria:**

1. `skills/harshjudge/setup.md` created
2. Skill triggers on: "setup harshjudge", "configure harshjudge", "install harshjudge"
3. Skill guides through:
   - Verifying Node.js version
   - Installing MCP server
   - Configuring Claude Code MCP settings
   - Verifying Playwright MCP is available
   - Initializing project with `initProject` tool
   - Verifying setup with `getStatus` tool
4. Skill provides troubleshooting for common issues
5. Skill confirms successful setup

---

### Story 2.3: Create Analyze Skill

**As a** Claude Code user,
**I want** an analyze skill that guides project analysis,
**so that** Claude produces consistent, actionable test suggestions.

**Acceptance Criteria:**

1. `skills/harshjudge/analyze.md` created
2. Skill triggers on: "analyze project", "suggest tests", "what should I test"
3. Skill defines analysis protocol:
   - Read package.json for tech stack
   - Scan for routes/pages
   - Scan for API endpoints
   - Read database schema if present
   - Identify auth configuration
4. Skill defines output format:
   - Tech stack summary
   - Discovered entry points table
   - Suggested test scenarios with priorities
5. Skill asks before creating scenarios

---

### Story 2.4: Create Scenario Creation Skill

**As a** Claude Code user,
**I want** a create skill that guides scenario authoring,
**so that** Claude generates well-structured, consistent scenario files.

**Acceptance Criteria:**

1. `skills/harshjudge/create.md` created
2. Skill triggers on: "create scenario", "write test for", "new test"
3. Skill defines scenario template with required sections:
   - Frontmatter (id, tags, estimatedDuration)
   - Overview
   - Prerequisites
   - Steps (with Action, Playwright, Verify, DB Verification)
   - Expected Final State
4. Skill enforces atomic steps (one action per step)
5. Skill requires Playwright code blocks for each step
6. Skill calls `saveScenario` tool to persist
7. Skill presents draft for user review before saving

---

### Story 2.5: Create Run Skill

**As a** Claude Code user,
**I want** a run skill that defines test execution protocol,
**so that** Claude captures complete evidence consistently.

**Acceptance Criteria:**

1. `skills/harshjudge/run.md` created
2. Skill triggers on: "run scenario", "execute test", "run {scenario-name}"
3. Skill defines execution protocol:
   - Phase 1: Initialize (call `startRun`, read scenario)
   - Phase 2: Execute steps (Playwright + `recordEvidence` for each)
   - Phase 3: DB verification protocol (when applicable)
   - Phase 4: Error protocol (capture diagnostics on failure)
   - Phase 5: Success protocol (call `completeRun`)
4. Skill enforces: never skip steps, always capture evidence, always complete run
5. Skill defines output format for results summary
6. Skill handles Playwright MCP errors gracefully

---

### Story 2.6: Create Status Skill

**As a** Claude Code user,
**I want** a status skill for quick status checks,
**so that** Claude provides formatted status information.

**Acceptance Criteria:**

1. `skills/harshjudge/status.md` created
2. Skill triggers on: "test status", "scenario status", "harshjudge status"
3. Skill calls `getStatus` tool
4. Skill formats output as readable table:
   - Scenario list with pass/fail indicators
   - Summary statistics
   - Recent failures with details
5. Skill offers to show more details for specific scenarios

---

## Epic 3: UX Dashboard

**Goal:** Build the Vite + React dashboard with 3-column layout, file watcher live updates, screenshot timeline viewer, and log viewer for test diagnostics. This read-only interface provides visibility into test status and results.

### Story 3.1: Set Up UX Package with Vite + React + TailwindCSS

**As a** developer,
**I want** a properly scaffolded UX package with modern tooling,
**so that** I can efficiently build the dashboard interface.

**Acceptance Criteria:**

1. `packages/ux` initialized with Vite, React 18, and TypeScript
2. TailwindCSS configured with custom theme extending default palette
3. Dark mode as default with CSS variables for theme switching
4. Path aliases configured (`@/components`, `@/hooks`, `@/lib`)
5. ESLint + Prettier integrated with project-wide rules
6. Development server runs on configurable port (default 5173)
7. Production build outputs static files to `dist/`
8. Basic `App.tsx` renders "HarshJudge Dashboard" placeholder
9. Package scripts: `dev`, `build`, `preview`, `lint`

---

### Story 3.2: Implement File System Data Layer

**As a** developer,
**I want** the dashboard to read data directly from `.harshJudge/` files,
**so that** no backend API is required for data access.

**Acceptance Criteria:**

1. Data layer module reads `.harshJudge/` directory structure
2. `useProjects()` hook returns list of discovered projects
3. `useScenarios(projectPath)` hook returns scenarios for given project
4. `useScenarioDetail(scenarioSlug)` hook returns full scenario with runs
5. `useRunDetail(scenarioSlug, runId)` hook returns run results and evidence paths
6. Data layer handles missing files gracefully (empty state, not errors)
7. TypeScript types imported from `@harshjudge/shared`
8. Unit tests mock file system reads and verify data transformation

---

### Story 3.3: Implement File Watcher for Live Updates

**As a** dashboard user,
**I want** the UI to update automatically when test results change,
**so that** I don't need to manually refresh to see new data.

**Acceptance Criteria:**

1. File watcher monitors `.harshJudge/` directory for changes
2. Watcher uses chokidar with appropriate debouncing (300ms)
3. File changes trigger React state updates via context/subscription pattern
4. Watched events: file add, file change, file delete
5. Watcher ignores irrelevant files (e.g., temporary files, `.swp`)
6. UI updates within 2 seconds of file system change (per NFR2)
7. Watcher cleans up properly on component unmount
8. Integration test verifies UI updates when scenario file modified

---

### Story 3.4: Build 3-Column Layout Shell

**As a** dashboard user,
**I want** a clean 3-column layout for navigating projects, scenarios, and details,
**so that** I can efficiently browse test information.

**Acceptance Criteria:**

1. Layout consists of: Project List (left), Scenario List (middle), Detail Panel (right)
2. Column widths: 200px (projects), 300px (scenarios), remaining (details)
3. Columns are resizable via drag handles
4. Layout responsive: collapses to stacked view on screens < 1024px
5. Header bar with HarshJudge logo and minimal controls (theme toggle)
6. Empty states shown when no data (e.g., "No projects found")
7. Selected item highlighted in each column
8. Keyboard navigation: arrow keys navigate lists, Enter selects
9. WCAG AA compliance: focus indicators, sufficient contrast

---

### Story 3.5: Implement Project List Panel

**As a** dashboard user,
**I want** to see all my projects with status indicators,
**so that** I can quickly identify which projects need attention.

**Acceptance Criteria:**

1. Panel displays list of discovered projects from file system
2. Each project shows: name, scenario count, overall status indicator
3. Status indicator: green (all pass), red (any fail), gray (never run)
4. Projects sorted alphabetically by name
5. Clicking project selects it and populates Scenario List
6. Selected project visually highlighted
7. Empty state: "No HarshJudge projects found" with setup hint
8. Panel header shows total project count

---

### Story 3.6: Implement Scenario List Panel

**As a** dashboard user,
**I want** to see all scenarios for a selected project with their status,
**so that** I can identify which scenarios are passing or failing.

**Acceptance Criteria:**

1. Panel displays scenarios for currently selected project
2. Each scenario shows: title, last run status, last run time (relative)
3. Status badges: ✓ Pass (green), ✗ Fail (red), — Never Run (gray)
4. Scenarios sorted by last run time (most recent first)
5. Clicking scenario selects it and populates Detail Panel
6. Scenario tags displayed as small chips below title
7. Quick stats shown: total runs, pass rate percentage
8. Empty state when project has no scenarios
9. Scenario list updates live when new runs complete

---

### Story 3.7: Implement Scenario Detail View

**As a** dashboard user,
**I want** to see scenario details including content and run history,
**so that** I can understand what the test does and how it has performed.

**Acceptance Criteria:**

1. Detail panel shows scenario information when scenario selected
2. Scenario content section: rendered Markdown of `scenario.md`
3. Statistics section: total runs, pass/fail counts, average duration
4. Run history section: list of recent runs (last 10)
5. Each run row shows: timestamp, result, duration, click to expand
6. Clicking a run navigates to Run Detail view
7. "No runs yet" empty state for scenarios never executed
8. Scenario metadata displayed: created date, last updated, tags

---

### Story 3.8: Implement Screenshot Timeline Viewer

**As a** dashboard user,
**I want** to view screenshots from a test run in timeline order,
**so that** I can visually trace the test execution step by step.

**Acceptance Criteria:**

1. Run Detail view shows horizontal timeline of steps
2. Each step represented as thumbnail with step number
3. Clicking thumbnail shows full-size screenshot in main area
4. Step status indicated on thumbnail: green border (pass), red (fail)
5. Current step highlighted in timeline
6. Arrow keys navigate between steps
7. Step metadata shown below screenshot: action, duration, URL
8. Failed step shows error message overlay on screenshot
9. Screenshot zoom: click to toggle fit-to-width vs actual size
10. Performance: thumbnails lazy-loaded, full images loaded on demand

---

### Story 3.9: Implement Log Viewer for Failed Runs

**As a** dashboard user,
**I want** to view captured logs when tests fail,
**so that** I can diagnose the root cause of failures.

**Acceptance Criteria:**

1. Log viewer appears in Run Detail for failed runs
2. Tabbed interface: Console, Network, HTML, Error tabs
3. Console tab: displays browser console entries with level indicators
4. Network tab: shows request/response data if captured
5. HTML tab: renders captured HTML in scrollable code block
6. Error tab: shows error message and stack trace
7. Logs searchable via filter input box
8. Large logs paginated or virtualized for performance
9. Copy-to-clipboard button for each log section
10. Logs hidden for passing runs (not captured)

---

### Story 3.10: Implement Dashboard Server

**As a** developer,
**I want** the dashboard to be servable as a standalone application,
**so that** users can view results in their browser.

**Acceptance Criteria:**

1. Dashboard builds to static files in `dist/`
2. CLI command `harshjudge dashboard` starts local server
3. Server serves static files and handles client-side routing
4. Server auto-detects `.harshJudge/` path from current directory
5. Server opens browser automatically on start
6. Server runs on configurable port (default 5678)
7. Graceful shutdown on Ctrl+C

---

## Epic 4: Installation & Documentation

**Goal:** Create installation flow, CLI commands, and comprehensive documentation for users to get started quickly.

### Story 4.1: Implement CLI Entry Point

**As a** developer,
**I want** a unified CLI for HarshJudge commands,
**so that** users have a single entry point for all operations.

**Acceptance Criteria:**

1. CLI implemented with commands: `init`, `dashboard`, `status`
2. `harshjudge init` copies skills to `.claude/skills/` and initializes project
3. `harshjudge dashboard` starts the dashboard server
4. `harshjudge status` prints quick status to terminal
5. CLI has `--help` for all commands
6. CLI has `--version` flag
7. Proper exit codes for success/failure

---

### Story 4.2: Create Installation Documentation

**As a** new user,
**I want** clear installation instructions,
**so that** I can set up HarshJudge quickly and correctly.

**Acceptance Criteria:**

1. README.md includes quick start guide
2. Step-by-step installation instructions
3. Claude Code MCP configuration example
4. Playwright MCP setup instructions
5. Troubleshooting section for common issues
6. Verification steps to confirm working setup

---

### Story 4.3: Create Skill Usage Documentation

**As a** user,
**I want** documentation on how to use HarshJudge skills,
**so that** I can effectively use all features.

**Acceptance Criteria:**

1. Documentation for each skill command
2. Example conversations showing skill usage
3. Best practices for scenario creation
4. Tips for effective test organization
5. FAQ section

---

### Story 4.4: Create Sample Project

**As a** new user,
**I want** a sample project demonstrating HarshJudge,
**so that** I can see it working before using on my own project.

**Acceptance Criteria:**

1. Sample project in `examples/` directory
2. Simple web app with login flow
3. Pre-created scenarios for the sample app
4. Instructions to run the demo
5. Expected output documented

---

## Checklist Results Report

_(To be populated after Architect checklist execution)_

---

## Next Steps

### Architect Prompt

Create the full-stack architecture document for HarshJudge v2 with the Skill + MCP + Dashboard architecture. Include:

1. Detailed MCP tool specifications with TypeScript interfaces
2. File schema definitions (config.yaml, scenario.md, meta.yaml, result.json)
3. Skill file templates
4. Dashboard component architecture
5. Development workflow and testing strategy
