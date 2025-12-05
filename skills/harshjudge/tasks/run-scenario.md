# Run Scenario Task

## Purpose

Execute a test scenario with complete evidence capture and state tracking. Enables recovery on interruption and provides detailed progress reporting.

## Triggers

- "run scenario {name}"
- "execute test {name}"
- "run {scenario-name}"
- `/harshjudge:run {name}`

## Sequential Task Execution

### Phase 1: Initialize

#### Step 1: Validate Scenario Exists

**Action:** Verify the scenario exists using `getStatus` tool

**MCP Call:**
```
Tool: getStatus
Parameters:
  scenarioSlug: {provided-slug}
```

**Verify:** Scenario found in response

**On Failure:** Report "Scenario '{slug}' not found" and abort

---

#### Step 2: Execute Pre-Run Checklist

**Action:** Run `checklists/pre-run-checklist.md`

**Verify:**
- Application is running at configured baseUrl
- Playwright MCP is available
- HarshJudge MCP server is responding
- Scenario has valid structure

**On Failure:** Report checklist failures and abort

---

#### Step 3: Start Run

**Action:** Call `startRun` MCP tool

**MCP Call:**
```
Tool: startRun
Parameters:
  scenarioSlug: {slug}
```

**Verify:** Returns runId

**Store:** `runId` for subsequent calls

---

#### Step 4: Create skill-state.yaml

**Action:** Initialize state tracking file

**Location:** `.harshJudge/scenarios/{slug}/runs/{runId}/skill-state.yaml`

**Content:**
```yaml
skillVersion: "1.0"
startedAt: "{current ISO timestamp}"
currentPhase: "init"
currentStep: 0
totalSteps: {parsed from scenario}
completedSteps: []
checklistStatus:
  pre-run: completed
  evidence: pending
lastAction: "Initialized run"
error: null
completedAt: null
```

---

#### Step 5: Parse Scenario

**Action:** Read and parse scenario.md content

**Extract:**
- Total step count
- Prerequisites
- Each step's Playwright code and verification

**Update skill-state.yaml:**
```yaml
totalSteps: {count}
lastAction: "Scenario parsed, ready to execute"
```

**Checkpoint:** ✓ Initialization complete

---

### Phase 2: Execute Steps

For EACH step in scenario:

#### Step 2.N.1: Update State

**Action:** Update skill-state.yaml

```yaml
currentPhase: "execute-steps"
currentStep: {N}
lastAction: "Starting step {N}: {step title}"
```

---

#### Step 2.N.2: Announce Step

**Action:** Report progress to user

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step {N}/{total}: {step title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

#### Step 2.N.3: Execute Playwright

**Action:** Execute Playwright code from scenario

**MCP Calls:** Use Playwright MCP tools:
- `mcp__Playwright__browser_navigate`
- `mcp__Playwright__browser_click`
- `mcp__Playwright__browser_type`
- `mcp__Playwright__browser_snapshot`

**Update skill-state.yaml:**
```yaml
lastAction: "Executing Playwright for step {N}"
```

---

#### Step 2.N.4: Capture Screenshot

**Action:** Take screenshot as evidence

**MCP Call:**
```
Tool: mcp__Playwright__browser_take_screenshot
Parameters:
  filename: "step-{N}-{name}.png"
```

---

#### Step 2.N.5: Record Evidence

**Action:** Call `recordEvidence` MCP tool

**MCP Call:**
```
Tool: recordEvidence
Parameters:
  runId: {runId}
  step: {N}
  type: "screenshot"
  name: "{step-name}"
  data: {screenshot data}
  metadata:
    url: {current URL}
    viewport: {width, height}
```

---

#### Step 2.N.6: Execute Evidence Checklist

**Action:** Run `checklists/evidence-checklist.md` for this step

**Verify:**
- Screenshot captured
- Evidence recorded
- Metadata complete

**Update skill-state.yaml:**
```yaml
checklistStatus:
  evidence: in_progress
```

---

#### Step 2.N.7: Verify Assertions

**Action:** Check verification from scenario

**Methods:**
- Use `browser_snapshot` for DOM inspection
- Check for expected elements/text
- Verify URL if specified

**On Failure:** → Go to Phase 4 (Error Protocol)

---

#### Step 2.N.8: Update Completed Steps

**Action:** Update skill-state.yaml

```yaml
completedSteps:
  - step: {N}
    status: pass
    evidenceCaptured: true
    timestamp: "{current ISO timestamp}"
lastAction: "Step {N} completed successfully"
```

**Checkpoint:** ✓ Step {N} complete

---

### Phase 3: Database Verification (if applicable)

When step includes DB Verification:

#### Step 3.1: Execute Query

**Action:** Execute SQL query from scenario

**Note:** Requires database MCP tool or direct connection

---

#### Step 3.2: Record DB Evidence

**MCP Call:**
```
Tool: recordEvidence
Parameters:
  runId: {runId}
  step: {N}
  type: "db_snapshot"
  name: "{query-name}"
  data: {query results}
```

---

#### Step 3.3: Verify Expected Values

**Action:** Compare results to expected values in scenario

**On Mismatch:** → Go to Phase 4 (Error Protocol)

**Update skill-state.yaml:**
```yaml
currentPhase: "db-verify"
lastAction: "Database verification for step {N}"
```

---

### Phase 4: Error Protocol

On ANY failure:

#### Step 4.1: Update State

**Action:** Mark error in skill-state.yaml

```yaml
currentPhase: "error"
lastAction: "Error encountered at step {N}"
```

---

#### Step 4.2: Follow Error Protocols

**Action:** Execute `data/error-protocols.md`

**Capture:**
1. Screenshot of current state
2. Console logs: `mcp__Playwright__browser_console_messages`
3. Network requests if applicable

---

#### Step 4.3: Record Diagnostic Evidence

**For each diagnostic artifact:**

**MCP Call:**
```
Tool: recordEvidence
Parameters:
  runId: {runId}
  step: {failed step}
  type: "log" | "screenshot" | "network"
  name: "error-{type}"
  data: {artifact data}
```

---

#### Step 4.4: Complete Run as Failed

**MCP Call:**
```
Tool: completeRun
Parameters:
  runId: {runId}
  status: "fail"
  failedStep: {step number}
  errorMessage: "{descriptive error}"
```

---

#### Step 4.5: Finalize State

**Update skill-state.yaml:**
```yaml
currentPhase: "completed"
error:
  step: {N}
  message: "{error message}"
  diagnostics:
    screenshot: "evidence/step-{N}-error.png"
    console: [{log entries}]
completedAt: "{current ISO timestamp}"
```

---

#### Step 4.6: Report Failure

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Test Failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: {title}
Failed at: Step {N} - {step title}
Error: {error message}

Diagnostics captured:
• Screenshot: evidence/step-{N}-error.png
• Console logs: {count} entries

Run ID: {runId}
Duration: {duration}ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**End Task**

---

### Phase 5: Success Protocol

After all steps pass:

#### Step 5.1: Update State

```yaml
currentPhase: "success"
lastAction: "All steps completed successfully"
```

---

#### Step 5.2: Complete Run

**MCP Call:**
```
Tool: completeRun
Parameters:
  runId: {runId}
  status: "pass"
  duration: {total milliseconds}
```

---

#### Step 5.3: Finalize State

**Update skill-state.yaml:**
```yaml
currentPhase: "completed"
checklistStatus:
  pre-run: completed
  evidence: completed
completedAt: "{current ISO timestamp}"
```

---

#### Step 5.4: Report Success

**Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Test Passed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: {title}
Steps: {completed}/{total}
Evidence: {count} artifacts captured

| Step | Status | Duration |
|------|--------|----------|
| 1. {title} | ✓ | {ms}ms |
| 2. {title} | ✓ | {ms}ms |
| ... | ... | ... |

Run ID: {runId}
Total Duration: {duration}ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Checkpoint:** ✓ Run complete

---

## Rules

- **NEVER skip steps** - Execute every step in order
- **ALWAYS capture evidence** - Screenshot after every step
- **ALWAYS update skill-state.yaml** - After each step completion
- **ALWAYS call completeRun** - Whether success or failure
- **On error, capture ALL diagnostics** - Before completing run
- **Report progress** - Announce each step to user
