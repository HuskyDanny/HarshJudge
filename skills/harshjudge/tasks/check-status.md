# Check Status Task

## Purpose

Provide formatted status information for scenarios and runs, including detecting in-progress runs.

## Triggers

- "test status"
- "scenario status"
- "harshjudge status"
- `/harshjudge:status`

## Sequential Task Execution

### Phase 1: Get Status Data

#### Step 1: Call getStatus Tool

**Action:** Retrieve current status from MCP server

**MCP Call:**
```
Tool: getStatus
Parameters: {}
```

**Store:** Response containing:
- Project metadata
- Scenario list with statistics
- Recent run information

---

#### Step 2: Check for In-Progress Runs

**Action:** Scan for incomplete skill-state.yaml files

**Search Pattern:** `.harshJudge/scenarios/*/runs/*/skill-state.yaml`

**Check:** `currentPhase != "completed"` indicates in-progress

**Store:** List of in-progress runs with details

---

### Phase 2: Format Output

#### Step 3: Generate Status Report

**Action:** Format output using template

**Use Template:** `templates/status-output-tmpl.md`

**Sections:**
1. Project header
2. In-progress runs alert (if any)
3. Scenario status table
4. Summary statistics
5. Recent failures

---

### Phase 3: Display Results

#### Step 4: Output Status Report

**Format:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 HarshJudge Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: {projectName}
Base URL: {baseUrl}

{In-Progress Alert if applicable}

┌─────────────────────────────────────────────┐
│ Scenarios                                   │
├──────────────────┬────────┬────────┬────────┤
│ Scenario         │ Status │ Runs   │ Last   │
├──────────────────┼────────┼────────┼────────┤
│ {name}           │ ✓/✗/—  │ {n}    │ {date} │
│ {name}           │ ✓/✗/—  │ {n}    │ {date} │
└──────────────────┴────────┴────────┴────────┘

Summary:
• Total: {total} scenarios
• Passing: {pass} ✓
• Failing: {fail} ✗
• Never Run: {never} —

{Recent Failures section if any}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### Step 5: Offer Drill-Down Options

**Action:** Present options for more details

**Output:**
```
Options:
• View scenario details: /harshjudge:status {scenario-slug}
• Run a scenario: /harshjudge:run {scenario-slug}
• Create new scenario: /harshjudge:create
```

---

## In-Progress Run Alert

When in-progress runs are detected:

```
⚠️ In-Progress Run Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: {slug}
Run ID: {runId}
Phase: {currentPhase}
Step: {currentStep}/{totalSteps}
Started: {startedAt}

This run may have been interrupted. Options:
• Resume: Review skill-state.yaml and continue
• Abort: Mark as failed and start fresh
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Scenario Detail View

When called with a specific scenario:

**Trigger:** `/harshjudge:status {scenario-slug}`

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Scenario: {title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slug: {slug}
Tags: {tags}
Steps: {stepCount}
Estimated Duration: {duration}s

Statistics:
• Total Runs: {totalRuns}
• Pass Rate: {passRate}%
• Avg Duration: {avgDuration}ms

Recent Runs:
┌──────────┬────────┬──────────┬──────────────┐
│ Run ID   │ Status │ Duration │ Date         │
├──────────┼────────┼──────────┼──────────────┤
│ {id}     │ ✓/✗    │ {ms}ms   │ {date}       │
│ {id}     │ ✓/✗    │ {ms}ms   │ {date}       │
└──────────┴────────┴──────────┴──────────────┘

{Last Failure Details if applicable}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Recent Failures Section

When failures exist:

```
Recent Failures:
━━━━━━━━━━━━━━━━

{scenario-name} - {date}
  Failed at: Step {N} - {step title}
  Error: {error message}
  Run ID: {runId}

{scenario-name} - {date}
  Failed at: Step {N} - {step title}
  Error: {error message}
  Run ID: {runId}
```

---

## Status Indicators

| Symbol | Meaning |
|--------|---------|
| ✓ | Passing (last run succeeded) |
| ✗ | Failing (last run failed) |
| — | Never run |
| ⚠️ | In progress |

---

## Rules

- Always check for in-progress runs first
- Display clear visual hierarchy
- Offer actionable next steps
- Format tables for readability
- Show recent failures prominently
