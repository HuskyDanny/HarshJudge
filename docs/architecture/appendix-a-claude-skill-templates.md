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
