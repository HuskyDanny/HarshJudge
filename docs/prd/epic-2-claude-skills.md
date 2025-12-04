# Epic 2: Claude Skills

**Goal:** Create the Claude skill files that guide test workflows with consistent patterns and protocols. Skills ensure Claude follows deterministic patterns while allowing AI flexibility in execution.

## Story 2.1: Create Main Skill Definition

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

## Story 2.2: Create Setup Skill

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

## Story 2.3: Create Analyze Skill

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

## Story 2.4: Create Scenario Creation Skill

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

## Story 2.5: Create Run Skill

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

## Story 2.6: Create Status Skill

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
