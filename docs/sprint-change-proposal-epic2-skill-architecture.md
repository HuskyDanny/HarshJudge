# Sprint Change Proposal: Epic 2 Skill Architecture Enhancement

**Date:** 2025-12-05
**Triggered By:** Pre-implementation review of Story 2.1
**Status:** APPROVED - IN PROGRESS

---

## 1. Analysis Summary

### Issue Statement

The current Epic 2 skill architecture (simple markdown files) lacks the structured, trackable, context-minimized approach needed for reliable AI agent execution. HarshJudge relies heavily on Claude agent behavior for test scenario creation and evidence capture, requiring deterministic, traceable execution patterns.

### Root Cause

The original skill design followed a simple markdown approach. However, given HarshJudge's dependency on AI agent execution for critical testing workflows, a more robust BMAD-Core-like architecture is needed to ensure:

- **Trackability:** Clear state tracking during skill execution
- **Minimized Context:** On-demand loading of dependencies
- **Exact Intention Matching:** Structured commands and triggers
- **Manageable Progress:** Step-by-step execution with checkpoints

### Recommended Path

**Option 1: Direct Adjustment** - Revise Epic 2 stories and architecture documents before implementation begins. No code rollback needed as Epic 2 has not started implementation.

### Impact Assessment

| Area | Impact Level | Details |
|------|--------------|---------|
| Epic 1 | ✅ None | Completed, no changes needed |
| Epic 2 | 🔴 High | Add Story 2.0, revise all 6 stories |
| Epic 3 | ✅ None | Dashboard reads from `.harshJudge/`, unchanged |
| Epic 4 | 🟡 Low | Minor updates to Stories 4.1, 4.3 |
| Architecture | 🔴 High | Appendix A rewrite, Sections 8 & 11 updates |
| MVP Scope | 🟡 Minor | +1 story (2.0), enhanced quality |

---

## 2. Specific Proposed Edits

### 2.1 PRD Epic 2: Add Story 2.0

**File:** `docs/prd/epic-2-claude-skills.md`

**Action:** Add new story at the beginning of Epic 2

**ADD after Epic 2 Goal statement:**

```markdown
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
```

### 2.2 PRD Epic 2: Revise Story 2.1

**File:** `docs/prd/epic-2-claude-skills.md`

**Action:** Replace existing Story 2.1 acceptance criteria

**FROM:**
```markdown
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
```

**TO:**
```markdown
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
```

### 2.3 PRD Epic 2: Revise Story 2.2

**File:** `docs/prd/epic-2-claude-skills.md`

**Action:** Replace existing Story 2.2 acceptance criteria

**FROM:**
```markdown
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
```

**TO:**
```markdown
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
```

### 2.4 PRD Epic 2: Revise Story 2.3

**File:** `docs/prd/epic-2-claude-skills.md`

**Action:** Replace existing Story 2.3 acceptance criteria

**FROM:**
```markdown
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
```

**TO:**
```markdown
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
```

### 2.5 PRD Epic 2: Revise Story 2.4

**File:** `docs/prd/epic-2-claude-skills.md`

**Action:** Replace existing Story 2.4 acceptance criteria

**FROM:**
```markdown
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
```

**TO:**
```markdown
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
```

### 2.6 PRD Epic 2: Revise Story 2.5

**File:** `docs/prd/epic-2-claude-skills.md`

**Action:** Replace existing Story 2.5 acceptance criteria

**FROM:**
```markdown
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
```

**TO:**
```markdown
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
```

### 2.7 PRD Epic 2: Revise Story 2.6

**File:** `docs/prd/epic-2-claude-skills.md`

**Action:** Replace existing Story 2.6 acceptance criteria

**FROM:**
```markdown
**Acceptance Criteria:**

1. `skills/harshjudge/status.md` created
2. Skill triggers on: "test status", "scenario status", "harshjudge status"
3. Skill calls `getStatus` tool
4. Skill formats output as readable table:
   - Scenario list with pass/fail indicators
   - Summary statistics
   - Recent failures with details
5. Skill offers to show more details for specific scenarios
```

**TO:**
```markdown
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
```

### 2.8 PRD Epic 4: Update Story 4.1

**File:** `docs/prd/epic-4-installation-documentation.md`

**Action:** Update AC #2 for CLI init command

**FROM:**
```markdown
2. `harshjudge init` copies skills to `.claude/skills/` and initializes project
```

**TO:**
```markdown
2. `harshjudge init` copies YAML-structured skills (skill.yaml + tasks/ + templates/ + checklists/ + data/) to `.claude/skills/harshjudge/` and initializes project
```

### 2.9 PRD Epic 4: Update Story 4.3

**File:** `docs/prd/epic-4-installation-documentation.md`

**Action:** Update ACs to reflect new skill structure

**FROM:**
```markdown
**Acceptance Criteria:**

1. Documentation for each skill command
2. Example conversations showing skill usage
3. Best practices for scenario creation
4. Tips for effective test organization
5. FAQ section
```

**TO:**
```markdown
**Acceptance Criteria:**

1. Documentation for skill architecture (YAML structure, tasks, templates, checklists)
2. Documentation for each skill command with task workflow explanation
3. Example conversations showing skill usage with state tracking
4. Best practices for scenario creation (using scenario-checklist)
5. Tips for effective test organization
6. FAQ section including troubleshooting skill execution issues
```

---

### 2.10 Architecture: Rewrite Appendix A

**File:** `docs/architecture/appendix-a-claude-skill-templates.md`

**Action:** Complete rewrite

**REPLACE ENTIRE FILE WITH:**

```markdown
# Appendix A: Claude Skill Architecture

## A.1 Skill Architecture Overview

HarshJudge uses a BMAD-Core-inspired skill architecture for deterministic, trackable AI agent execution.

### Directory Structure

```
skills/
└── harshjudge/
    ├── skill.yaml                    # Main skill definition
    ├── tasks/                         # Executable task workflows
    │   ├── setup-project.md
    │   ├── analyze-project.md
    │   ├── create-scenario.md
    │   ├── run-scenario.md
    │   └── check-status.md
    ├── templates/                     # Output templates
    │   ├── scenario-tmpl.yaml
    │   ├── analysis-output-tmpl.md
    │   └── status-output-tmpl.md
    ├── checklists/                    # Validation checklists
    │   ├── setup-checklist.md
    │   ├── scenario-checklist.md
    │   ├── pre-run-checklist.md
    │   └── evidence-checklist.md
    └── data/                          # Reference data
        ├── evidence-types.md
        └── error-protocols.md
```

## A.2 Main Skill Definition (skill.yaml)

```yaml
# HarshJudge Skill Definition
skill:
  name: HarshJudge
  id: harshjudge
  version: "1.0"
  description: AI-native E2E testing orchestration for Claude Code

activation:
  keywords:
    - "harshjudge"
    - "harsh judge"
    - "e2e test"
    - "end to end test"
  commands:
    - "/harshjudge:setup"
    - "/harshjudge:analyze"
    - "/harshjudge:create"
    - "/harshjudge:run"
    - "/harshjudge:status"

prerequisites:
  mcpServers:
    - name: "@harshjudge/mcp-server"
      required: true
      tools:
        - initProject
        - saveScenario
        - startRun
        - recordEvidence
        - completeRun
        - getStatus
    - name: "playwright"
      required: true
      tools:
        - browser_navigate
        - browser_click
        - browser_type
        - browser_snapshot
        - browser_take_screenshot
        - browser_console_messages

commands:
  - setup: Execute task setup-project.md
  - analyze: Execute task analyze-project.md
  - create: Execute task create-scenario.md
  - run: Execute task run-scenario.md
  - status: Execute task check-status.md

principles:
  - id: evidence-first
    name: Evidence First
    rule: Always capture screenshots before and after actions
  - id: fail-fast
    name: Fail Fast
    rule: Stop on first failure, capture all diagnostics
  - id: complete-runs
    name: Complete Runs
    rule: Always call completeRun, even on failure
  - id: human-readable
    name: Human-Readable
    rule: Scenarios are Markdown, readable by anyone
  - id: state-tracked
    name: State Tracked
    rule: Update skill-state.yaml after each step for recoverability

dependencies:
  tasks:
    - setup-project.md
    - analyze-project.md
    - create-scenario.md
    - run-scenario.md
    - check-status.md
  templates:
    - scenario-tmpl.yaml
    - analysis-output-tmpl.md
    - status-output-tmpl.md
  checklists:
    - setup-checklist.md
    - scenario-checklist.md
    - pre-run-checklist.md
    - evidence-checklist.md
  data:
    - evidence-types.md
    - error-protocols.md
```

## A.3 Run Task Example (run-scenario.md)

```markdown
# Run Scenario Task

## Purpose
Execute a test scenario with complete evidence capture and state tracking.

## Triggers
- "run scenario {name}"
- "execute test {name}"
- "/harshjudge:run {name}"

## Sequential Task Execution

### Phase 1: Initialize

1. Validate scenario exists using `getStatus` tool
2. Execute `checklists/pre-run-checklist.md`
3. Call `startRun` with scenarioSlug
4. Create `skill-state.yaml` in run directory:
   ```yaml
   skillVersion: "1.0"
   startedAt: "{timestamp}"
   currentPhase: "init"
   currentStep: 0
   totalSteps: {parsed from scenario}
   completedSteps: []
   checklistStatus:
     pre-run: completed
     evidence: pending
   ```
5. Read and parse scenario.md content

### Phase 2: Execute Steps

For EACH step in scenario:

1. Update skill-state.yaml: `currentStep: N`, `currentPhase: "execute-steps"`
2. Announce: "Step N: {step title}"
3. Execute Playwright actions from code block
4. Take screenshot: `mcp__Playwright__browser_take_screenshot`
5. Call `recordEvidence` with screenshot data
6. Execute `checklists/evidence-checklist.md` for this step
7. Verify assertions from scenario
8. Update skill-state.yaml: add to completedSteps
9. If verification fails → go to Phase 4 (Error Protocol)

### Phase 3: Database Verification (if applicable)

When step includes DB Verification:
1. Execute SQL query using database tools
2. Call `recordEvidence` type: "db_snapshot"
3. Verify expected values
4. Update skill-state.yaml with db verification status

### Phase 4: Error Protocol

On ANY failure:
1. Update skill-state.yaml: `currentPhase: "error"`
2. Follow `data/error-protocols.md`:
   - Capture screenshot of current state
   - Get console logs: `mcp__Playwright__browser_console_messages`
   - Get network requests if applicable
3. Call `recordEvidence` for each diagnostic artifact
4. Call `completeRun` with status: "fail", failedStep, errorMessage
5. Update skill-state.yaml: `currentPhase: "completed"`, add error details
6. Report failure to user with diagnostic summary

### Phase 5: Success Protocol

After all steps pass:
1. Update skill-state.yaml: `currentPhase: "success"`
2. Call `completeRun` with status: "pass", duration
3. Update skill-state.yaml: `currentPhase: "completed"`
4. Report success with summary table

## Rules

- NEVER skip steps
- ALWAYS capture evidence for every step
- ALWAYS update skill-state.yaml after each step
- ALWAYS call completeRun (success or failure)
- On error, capture ALL available diagnostics before completing
```

## A.4 Skill State Schema (skill-state.yaml)

Located at: `.harshJudge/scenarios/{slug}/runs/{runId}/skill-state.yaml`

```yaml
# Skill execution state - tracks progress through run-scenario task
skillVersion: "1.0"
startedAt: "2025-12-05T10:00:00Z"
currentPhase: "execute-steps"    # init | execute-steps | db-verify | error | success | completed
currentStep: 2
totalSteps: 5
completedSteps:
  - step: 1
    status: pass
    evidenceCaptured: true
    timestamp: "2025-12-05T10:00:05Z"
  - step: 2
    status: pass
    evidenceCaptured: true
    timestamp: "2025-12-05T10:00:12Z"
checklistStatus:
  pre-run: completed
  evidence: in_progress
lastAction: "Executing Playwright for step 3"
error: null  # Populated on failure with {step, message, diagnostics}
completedAt: null  # Populated on completion
```

---
```

### 2.11 Architecture: Update Section 8

**File:** `docs/architecture/8-database-schema.md`

**Action:** Add skill-state.yaml to directory structure and file schemas

**ADD to Section 8.1 Directory Structure Schema:**

```markdown
.harshJudge/
├── config.yaml
├── .gitignore
└── scenarios/
    └── {scenario-slug}/
        ├── scenario.md
        ├── meta.yaml
        └── runs/
            └── {run-id}/
                ├── result.json
                ├── skill-state.yaml      # NEW: Skill execution state
                └── evidence/
```

**ADD new subsection to Section 8.2 File Schemas:**

```markdown
### skill-state.yaml
```yaml
# Skill execution state - tracks progress through run-scenario task
skillVersion: "1.0"
startedAt: "2025-12-05T10:00:00Z"
currentPhase: "execute-steps"    # init | execute-steps | db-verify | error | success | completed
currentStep: 2
totalSteps: 5
completedSteps:
  - step: 1
    status: pass
    evidenceCaptured: true
    timestamp: "2025-12-05T10:00:05Z"
checklistStatus:
  pre-run: completed
  evidence: in_progress
lastAction: "Executing Playwright for step 2"
error: null
completedAt: null
```
```

### 2.12 Architecture: Update Section 11

**File:** `docs/architecture/11-unified-project-structure.md`

**Action:** Replace skills directory structure

**FROM:**
```
├── skills/
│   └── harshjudge/                   # Claude skill files
│       ├── skill.md                  # Main skill definition
│       ├── setup.md                  # Installation skill
│       ├── analyze.md                # Project analysis skill
│       ├── create.md                 # Scenario creation skill
│       ├── run.md                    # Test execution skill
│       └── status.md                 # Status check skill
```

**TO:**
```
├── skills/
│   └── harshjudge/                   # Claude skill files (BMAD-like structure)
│       ├── skill.yaml                # Main skill definition (YAML)
│       ├── tasks/                    # Executable task workflows
│       │   ├── setup-project.md
│       │   ├── analyze-project.md
│       │   ├── create-scenario.md
│       │   ├── run-scenario.md
│       │   └── check-status.md
│       ├── templates/                # Output templates
│       │   ├── scenario-tmpl.yaml
│       │   ├── analysis-output-tmpl.md
│       │   └── status-output-tmpl.md
│       ├── checklists/               # Validation checklists
│       │   ├── setup-checklist.md
│       │   ├── scenario-checklist.md
│       │   ├── pre-run-checklist.md
│       │   └── evidence-checklist.md
│       └── data/                     # Reference data
│           ├── evidence-types.md
│           └── error-protocols.md
```

### 2.13 Story File: Revise 2.1.story.md

**File:** `docs/stories/2.1.story.md`

**Action:** Story 2.1 needs to be regenerated after PRD updates. Mark current draft as superseded.

**Note:** Once PRD is updated, SM will regenerate Story 2.1 using `*draft` command.

---

## 3. High-Level Action Plan

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| 1 | Update `docs/prd/epic-2-claude-skills.md` with Story 2.0 and revised 2.1-2.6 | PM | 🔴 High |
| 2 | Update `docs/prd/epic-4-installation-documentation.md` Stories 4.1, 4.3 | PM | 🟡 Medium |
| 3 | Rewrite `docs/architecture/appendix-a-claude-skill-templates.md` | Architect | 🔴 High |
| 4 | Update `docs/architecture/8-database-schema.md` | Architect | 🟡 Medium |
| 5 | Update `docs/architecture/11-unified-project-structure.md` | Architect | 🟡 Medium |
| 6 | Delete/Archive current `docs/stories/2.1.story.md` | SM | 🟡 Medium |
| 7 | Regenerate Story 2.0 using `*draft` | SM | 🔴 High |
| 8 | Regenerate Story 2.1 using `*draft` | SM | 🔴 High |

---

## 4. Agent Handoff Plan

| Agent | Responsibility |
|-------|----------------|
| **PM** | Apply PRD edits (Epic 2, Epic 4) |
| **Architect** | Apply architecture document updates (Appendix A, Sections 8, 11) |
| **SM (Bob)** | Regenerate story files after PRD/Architecture updates |
| **PO** | Validate updated backlog, prioritize Story 2.0 |

---

## 5. Success Criteria

- [x] PRD Epic 2 contains Story 2.0 and revised Stories 2.1-2.6 ✅ (PM - 2025-12-05)
- [x] Architecture Appendix A reflects YAML-structured skill architecture ✅ (Architect - 2025-12-05)
- [x] Architecture Section 8 includes skill-state.yaml schema ✅ (Architect - 2025-12-05)
- [x] Architecture Section 11 shows updated skills directory structure ✅ (Architect - 2025-12-05)
- [x] Story files regenerated with new acceptance criteria ✅ (SM - 2025-12-05)
  - Story 2.0 created: `docs/stories/2.0.story.md`
  - Story 2.1 regenerated: `docs/stories/2.1.story.md` (v2.0)
- [ ] Dev agent can implement Story 2.0 without ambiguity

---

## 6. Approval

**Prepared By:** Bob (SM Agent)
**Date:** 2025-12-05

- [ ] **User Approval:** _______________
- [ ] **Date:** _______________

---
