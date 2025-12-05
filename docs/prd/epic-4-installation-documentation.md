# Epic 4: Installation & Documentation

**Goal:** Create installation flow, CLI commands, and comprehensive documentation for users to get started quickly.

## Story 4.1: Implement CLI Entry Point

**As a** developer,
**I want** a unified CLI for HarshJudge commands,
**so that** users have a single entry point for all operations.

**Acceptance Criteria:**

1. CLI implemented with commands: `init`, `dashboard`, `status`
2. `harshjudge init` copies YAML-structured skills (skill.yaml + tasks/ + templates/ + checklists/ + data/) to `.claude/skills/harshjudge/` and initializes project
3. `harshjudge dashboard` starts the dashboard server
4. `harshjudge status` prints quick status to terminal
5. CLI has `--help` for all commands
6. CLI has `--version` flag
7. Proper exit codes for success/failure

---

## Story 4.2: Create Installation Documentation

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
