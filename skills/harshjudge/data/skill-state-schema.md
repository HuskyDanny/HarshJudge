# Skill State Schema Reference

## Overview

The `skill-state.yaml` file tracks execution progress through the run-scenario task. It enables:
- Recovery/resume on interruption
- Progress monitoring
- Diagnostic capture on failure

## File Location

```
.harshJudge/scenarios/{slug}/runs/{runId}/skill-state.yaml
```

## Schema Definition

```yaml
# Skill execution state - tracks progress through run-scenario task
skillVersion: "1.0"              # Schema version
startedAt: "ISO-8601 timestamp"  # When run started
currentPhase: "phase-name"       # Current execution phase
currentStep: 0                   # Current step number (0-indexed)
totalSteps: 5                    # Total steps in scenario
completedSteps: []               # Array of completed step records
checklistStatus:                 # Status of validation checklists
  pre-run: "pending|completed"
  evidence: "pending|in_progress|completed"
lastAction: "string"             # Description of last action taken
error: null                      # Error details (populated on failure)
completedAt: null                # Completion timestamp (populated on finish)
```

## Field Definitions

### skillVersion

- **Type:** string
- **Description:** Version of the skill-state schema
- **Current Value:** "1.0"

### startedAt

- **Type:** ISO-8601 timestamp
- **Description:** When the run was started
- **Example:** "2025-12-05T10:00:00Z"

### currentPhase

- **Type:** enum
- **Description:** Current execution phase
- **Valid Values:**
  - `init` - Initializing run, creating state file
  - `execute-steps` - Executing scenario steps
  - `db-verify` - Performing database verification
  - `error` - Handling error condition
  - `success` - All steps passed, completing run
  - `completed` - Run finished (success or failure)

### currentStep

- **Type:** integer
- **Description:** Current step being executed (1-indexed during execution)
- **Range:** 0 to totalSteps

### totalSteps

- **Type:** integer
- **Description:** Total number of steps in the scenario
- **Derived From:** Parsed scenario.md content

### completedSteps

- **Type:** array
- **Description:** Records of completed steps
- **Item Schema:**
  ```yaml
  - step: 1                           # Step number
    status: "pass|fail"               # Step outcome
    evidenceCaptured: true            # Whether evidence was recorded
    timestamp: "ISO-8601 timestamp"   # When step completed
  ```

### checklistStatus

- **Type:** object
- **Description:** Status of validation checklists
- **Fields:**
  - `pre-run`: Status of pre-run-checklist.md
  - `evidence`: Status of evidence-checklist.md per step

### lastAction

- **Type:** string
- **Description:** Human-readable description of last action taken
- **Example:** "Executing Playwright for step 3"

### error

- **Type:** object | null
- **Description:** Error details, populated on failure
- **Schema:**
  ```yaml
  error:
    step: 2                           # Step where error occurred
    message: "Error description"      # Error message
    diagnostics:                      # Captured diagnostic data
      screenshot: "path/to/error.png"
      console: ["log1", "log2"]
  ```

### completedAt

- **Type:** ISO-8601 timestamp | null
- **Description:** When run completed (success or failure)
- **Example:** "2025-12-05T10:05:00Z"

## Example: Successful Run

```yaml
skillVersion: "1.0"
startedAt: "2025-12-05T10:00:00Z"
currentPhase: "completed"
currentStep: 3
totalSteps: 3
completedSteps:
  - step: 1
    status: pass
    evidenceCaptured: true
    timestamp: "2025-12-05T10:00:05Z"
  - step: 2
    status: pass
    evidenceCaptured: true
    timestamp: "2025-12-05T10:00:12Z"
  - step: 3
    status: pass
    evidenceCaptured: true
    timestamp: "2025-12-05T10:00:18Z"
checklistStatus:
  pre-run: completed
  evidence: completed
lastAction: "Run completed successfully"
error: null
completedAt: "2025-12-05T10:00:20Z"
```

## Example: Failed Run

```yaml
skillVersion: "1.0"
startedAt: "2025-12-05T10:00:00Z"
currentPhase: "completed"
currentStep: 2
totalSteps: 3
completedSteps:
  - step: 1
    status: pass
    evidenceCaptured: true
    timestamp: "2025-12-05T10:00:05Z"
  - step: 2
    status: fail
    evidenceCaptured: true
    timestamp: "2025-12-05T10:00:15Z"
checklistStatus:
  pre-run: completed
  evidence: completed
lastAction: "Error protocol executed"
error:
  step: 2
  message: "Element not found: [data-testid='submit-button']"
  diagnostics:
    screenshot: "evidence/step-02-error.png"
    console:
      - "Error: Timeout waiting for selector"
completedAt: "2025-12-05T10:00:20Z"
```
