# Epic 4: Installation & Documentation

**Goal:** Create MCP-first installation flow and comprehensive documentation for users to get started quickly with Claude Code.

## Story 4.1: ~~DELETED - CLI Entry Point~~

> **Status:** REMOVED - CLI functionality superseded by MCP tools.
>
> All CLI commands have been replaced by MCP tools:
> - `init` → `initProject` MCP tool
> - `dashboard` → `openDashboard` MCP tool
> - `status` → `getStatus` MCP tool
>
> See Story 4.2 for MCP-based installation workflow.

---

## Story 4.2: Create Installation Documentation

**As a** new user,
**I want** clear installation instructions,
**so that** I can set up HarshJudge quickly and correctly.

**Acceptance Criteria:**

1. README.md includes quick start guide with MCP-first workflow
2. Step-by-step installation via npm (`npm install -g @allenpan/harshjudge-mcp`)
3. Claude Code MCP configuration example (JSON settings for mcpServers)
4. Playwright MCP setup instructions (required for browser automation)
5. MCP tools reference table (9 tools: initProject, saveScenario, startRun, recordEvidence, completeRun, getStatus, openDashboard, closeDashboard, getDashboardStatus)
6. Troubleshooting section for common issues
7. Verification steps to confirm working setup

---

## Story 4.3: Create Skill Usage Documentation

**As a** user,
**I want** documentation on how to use HarshJudge skills,
**so that** I can effectively use all features.

**Acceptance Criteria:**

1. Documentation for skill architecture (YAML structure, tasks, templates, checklists)
2. Documentation for each skill command with task workflow explanation
3. Example conversations showing skill usage with state tracking
4. Best practices for scenario creation (using scenario-checklist)
5. Tips for effective test organization
6. FAQ section including troubleshooting skill execution issues

---

## Story 4.4: Create Sample Project

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
