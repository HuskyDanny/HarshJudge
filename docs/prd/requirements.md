# Requirements

## Functional Requirements

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

## Non-Functional Requirements

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
