# Epic 2: Claude Skills

**Goal:** Create the Claude skill files that guide test workflows with consistent patterns and protocols. Skills ensure Claude follows deterministic patterns while allowing AI flexibility in execution.

## Story 2.0: Create HarshJudge Skill Core Structure

**As a** developer,
**I want** a BMAD-like skill architecture with structured directories,
**so that** skills are trackable, context-minimized, and deterministic.

**Acceptance Criteria:**

1. `skills/harshjudge/` directory structure created with subdirectories:
   - `tasks/` - Executable task workflows
   - `templates/` - Output and scenario templates
   - `checklists/` - Validation checklists
   - `data/` - Reference data files
2. Main `skill.yaml` file created with YAML-structured definition including:
   - Skill metadata (name, id, version, description)
   - Activation triggers (keywords and commands)
   - Prerequisites (required MCP servers)
   - Command-to-task mappings
   - Core principles
   - Dependencies list
3. `skill-state.yaml` schema defined for run-level state tracking
4. Base templates created for tasks, checklists, and data files
5. Architecture documents updated to reflect new structure

---

## Story 2.1: Implement Main Skill Definition

**As a** Claude Code user,
**I want** a YAML-structured main skill file that defines HarshJudge capabilities,
**so that** Claude understands how to use HarshJudge tools with deterministic behavior.

**Acceptance Criteria:**

1. `skills/harshjudge/skill.yaml` populated with complete skill definition
2. Activation section defines keyword triggers and slash commands
3. Commands section maps each command to corresponding task file
4. Prerequisites section documents required MCP servers with validation hints
5. Principles section defines core principles with IDs for reference
6. Dependencies section lists all tasks, templates, checklists, and data files
7. Skill follows BMAD-like activation pattern (read YAML, adopt persona, await commands)

---

## Story 2.2: Create Setup Skill

**As a** Claude Code user,
**I want** a setup skill that guides me through installation,
**so that** I can configure HarshJudge correctly.

**Acceptance Criteria:**

1. `skills/harshjudge/tasks/setup-project.md` created as executable task workflow
2. Task triggers defined in `skill.yaml` for: "setup harshjudge", "configure harshjudge", "install harshjudge"
3. Task defines sequential steps with checkpoints:
   - Step 1: Verify Node.js version (>= 18)
   - Step 2: Verify/Install MCP server
   - Step 3: Configure Claude Code MCP settings
   - Step 4: Verify Playwright MCP availability
   - Step 5: Initialize project with `initProject` tool
   - Step 6: Verify setup with `getStatus` tool
4. `skills/harshjudge/checklists/setup-checklist.md` created for validation
5. Task includes troubleshooting section with common issues and resolutions
6. Task outputs success confirmation with environment summary

---

## Story 2.3: Create Analyze Skill

**As a** Claude Code user,
**I want** an analyze skill that guides project analysis,
**so that** Claude produces consistent, actionable test suggestions.

**Acceptance Criteria:**

1. `skills/harshjudge/tasks/analyze-project.md` created as executable task workflow
2. Task triggers defined in `skill.yaml` for: "analyze project", "suggest tests", "what should I test"
3. Task defines sequential analysis protocol with progress reporting:
   - Phase 1: Tech Stack Detection (package.json, config files)
   - Phase 2: Route/Page Discovery (Next.js pages, React Router, etc.)
   - Phase 3: API Endpoint Scanning (routes, handlers, OpenAPI)
   - Phase 4: Database Schema Analysis (if present)
   - Phase 5: Auth Configuration Detection
4. `skills/harshjudge/templates/analysis-output-tmpl.md` created for consistent output format
5. Output includes: tech stack summary, entry points table, prioritized scenario suggestions
6. Task requires user confirmation before proceeding to scenario creation

---

## Story 2.4: Create Scenario Creation Skill

**As a** Claude Code user,
**I want** a create skill that guides scenario authoring,
**so that** Claude generates well-structured, consistent scenario files.

**Acceptance Criteria:**

1. `skills/harshjudge/tasks/create-scenario.md` created as executable task workflow
2. Task triggers defined in `skill.yaml` for: "create scenario", "write test for", "new test"
3. `skills/harshjudge/templates/scenario-tmpl.yaml` created with required sections:
   - Frontmatter (id, slug, title, tags, estimatedDuration)
   - Overview
   - Prerequisites
   - Steps (with Action, Playwright, Verify, DB Verification)
   - Expected Final State
4. `skills/harshjudge/checklists/scenario-checklist.md` created to enforce:
   - Atomic steps (one action per step)
   - Playwright code blocks for each step
   - Verify assertions for each step
5. Task workflow: gather requirements → generate draft → run checklist → user review → `saveScenario`
6. Task presents draft for user review and revision before saving

---

## Story 2.5: Create Run Skill

**As a** Claude Code user,
**I want** a run skill that defines test execution protocol,
**so that** Claude captures complete evidence consistently.

**Acceptance Criteria:**

1. `skills/harshjudge/tasks/run-scenario.md` created as executable task workflow
2. Task triggers defined in `skill.yaml` for: "run scenario", "execute test", "run {scenario-name}"
3. Task creates and updates `skill-state.yaml` in run directory for progress tracking:
   - Tracks currentPhase, currentStep, completedSteps, checklistStatus
   - Updates after each step completion
   - Enables recovery/resume on interruption
4. `skills/harshjudge/checklists/pre-run-checklist.md` created for pre-execution validation
5. `skills/harshjudge/checklists/evidence-checklist.md` created to enforce evidence capture
6. `skills/harshjudge/data/error-protocols.md` created with error handling procedures
7. Task defines 5-phase execution protocol with state tracking:
   - Phase 1: Initialize (run pre-run-checklist, call `startRun`, create skill-state.yaml)
   - Phase 2: Execute steps (Playwright + `recordEvidence`, update skill-state.yaml per step)
   - Phase 3: DB verification (when applicable, follow evidence-checklist)
   - Phase 4: Error protocol (follow error-protocols.md, capture all diagnostics)
   - Phase 5: Success protocol (call `completeRun`, finalize skill-state.yaml)
8. Task handles Playwright MCP errors gracefully with retry logic

---

## Story 2.6: Create Status Skill

**As a** Claude Code user,
**I want** a status skill for quick status checks,
**so that** Claude provides formatted status information.

**Acceptance Criteria:**

1. `skills/harshjudge/tasks/check-status.md` created as executable task workflow
2. Task triggers defined in `skill.yaml` for: "test status", "scenario status", "harshjudge status"
3. Task calls `getStatus` MCP tool and formats output
4. `skills/harshjudge/templates/status-output-tmpl.md` created for consistent formatting:
   - Project summary header
   - Scenario list table with pass/fail indicators (✓/✗/—)
   - Summary statistics (total, passing, failing, never run)
   - Recent failures with error details
5. Task offers drill-down options for specific scenario details
6. Task detects and reports any in-progress runs (via skill-state.yaml)

---
