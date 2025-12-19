# Run Scenario Workflow

## Trigger

Use this workflow when user wants to:
- Execute an E2E test scenario
- Run a specific test with evidence capture
- Validate application behavior

## MCP Tools Used

**HarshJudge Tools (in order):**
1. `mcp__harshjudge__startRun` - Initialize the test run, get step list
2. `mcp__harshjudge__recordEvidence` - Capture evidence for each step
3. `mcp__harshjudge__completeStep` - Complete each step, get next step
4. `mcp__harshjudge__completeRun` - Finalize with pass/fail status

**Playwright Tools (for browser automation):**
- `mcp__Playwright__browser_navigate` - Navigate to URLs
- `mcp__Playwright__browser_snapshot` - Get accessibility tree (use for element discovery)
- `mcp__Playwright__browser_click` - Click elements
- `mcp__Playwright__browser_type` - Type into inputs
- `mcp__Playwright__browser_take_screenshot` - Capture screenshots
- `mcp__Playwright__browser_console_messages` - Capture console logs
- `mcp__Playwright__browser_network_requests` - Capture network activity

> **TOKEN OPTIMIZATION**: Each step executes in its own spawned agent. This isolates context and prevents token accumulation.

## Prerequisites

- HarshJudge initialized (`.harshJudge/` exists)
- Scenario exists with steps (created via `createScenario`)
- Target application is running at configured baseUrl

## Step-Based Orchestration Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ MAIN AGENT (Orchestrator)                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. startRun(scenarioSlug)                                          │
│     ↓                                                               │
│     Returns: runId, steps[{id, title, file}]                        │
│                                                                     │
│  2. Read prd.md for project context (summarize)                     │
│                                                                     │
│  3. FOR EACH step in steps:                                         │
│     ┌─────────────────────────────────────────────────────────────┐ │
│     │ a. Read step file: steps/{step.file}                        │ │
│     │                                                             │ │
│     │ b. Spawn step agent with prompt (see template below)        │ │
│     │                                                             │ │
│     │ c. Agent returns: { status, evidencePaths, error }          │ │
│     │                                                             │ │
│     │ d. completeStep(runId, stepId, status, duration, error)     │ │
│     │    → Returns: nextStepId or null                            │ │
│     │                                                             │ │
│     │ e. IF status === 'fail' OR nextStepId === null:             │ │
│     │    → BREAK loop                                             │ │
│     └─────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  4. completeRun(runId, finalStatus, totalDuration)                  │
│                                                                     │
│  5. Report results to user                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Workflow

### Step 1: Start the Run

```json
// mcp__harshjudge__startRun
{
  "scenarioSlug": "login-flow"
}
```

**Response:**
```json
{
  "success": true,
  "runId": "abc123xyz",
  "runNumber": 5,
  "runPath": ".harshJudge/scenarios/login-flow/runs/abc123xyz",
  "startedAt": "2024-01-15T10:30:00Z",
  "scenarioSlug": "login-flow",
  "scenarioTitle": "User Login Flow",
  "steps": [
    { "id": "01", "title": "Navigate to login", "file": "01-navigate-to-login.md" },
    { "id": "02", "title": "Enter credentials", "file": "02-enter-credentials.md" },
    { "id": "03", "title": "Submit form", "file": "03-submit-form.md" }
  ]
}
```

### Step 2: Read Project Context

```
Read .harshJudge/prd.md
```

Extract relevant context for step agents:
- Base URL
- Auth credentials (if login step)
- Tech stack info

### Step 3: Execute Each Step

For each step in the `steps` array:

#### 3a. Read Step File

```
Read .harshJudge/scenarios/{slug}/steps/{step.file}
```

#### 3b. Spawn Step Agent

Use the Task tool to spawn a step execution agent:

```
Task tool with:
  subagent_type: "general-purpose"
  prompt: <step execution prompt - see template below>
```

#### 3c. Process Agent Result

Agent returns:
```json
{
  "status": "pass",
  "evidencePaths": [
    ".harshJudge/scenarios/login-flow/runs/abc123xyz/step-01/evidence/before.png",
    ".harshJudge/scenarios/login-flow/runs/abc123xyz/step-01/evidence/after.png"
  ],
  "error": null
}
```

#### 3d. Complete the Step

```json
// mcp__harshjudge__completeStep
{
  "runId": "abc123xyz",
  "stepId": "01",
  "status": "pass",
  "duration": 3500
}
```

**Response:**
```json
{
  "success": true,
  "runId": "abc123xyz",
  "stepId": "01",
  "status": "pass",
  "nextStepId": "02"  // null if last step or should stop
}
```

#### 3e. Check Continue Condition

- If `status === 'fail'` → Break loop, proceed to completeRun with fail
- If `nextStepId === null` → All steps done, proceed to completeRun
- Otherwise → Continue to next step

### Step 4: Complete the Run

**On Success:**
```json
// mcp__harshjudge__completeRun
{
  "runId": "abc123xyz",
  "status": "pass",
  "duration": 15234
}
```

**On Failure:**
```json
// mcp__harshjudge__completeRun
{
  "runId": "abc123xyz",
  "status": "fail",
  "duration": 8521,
  "failedStep": "03",
  "errorMessage": "Expected dashboard but got error page"
}
```

### Step 5: Report Results

```
Test Run Complete: login-flow

Status: PASSED
Duration: 15.2s
Steps: 3/3 passed

Evidence locations:
- step-01/evidence/
- step-02/evidence/
- step-03/evidence/

View details: http://localhost:3001/scenarios/login-flow/runs/abc123xyz
```

---

## Step Agent Prompt Template

When spawning an agent for each step, use this prompt:

```
Execute step {stepId} of scenario {scenarioSlug}:

## Step Content
{paste content from steps/{step.file}}

## Project Context
Base URL: {from config.yaml}
Auth: {from prd.md if this step involves login}

## Previous Step
Status: {pass|fail|first step}

## Your Task
1. Navigate to the base URL if not already there
2. Execute the actions described in the step content
3. Use browser_snapshot before clicking to get element refs
4. Capture before/after screenshots using browser_take_screenshot
5. Record evidence using recordEvidence with:
   - runId: "{runId}"
   - step: {stepNumber}  (e.g., 1 for step 01, 2 for step 02)
6. Verify the expected outcome

Return ONLY a JSON object:
{
  "status": "pass" | "fail",
  "evidencePaths": ["path1.png", "path2.png"],
  "error": null | "error message"
}

## Important Rules
- DO NOT return full evidence content
- DO NOT explain your work in prose
- DO NOT proceed if you encounter an error
- ONLY return the JSON result object
```

---

## Playwright Tools Quick Reference

### Navigation & State

| Tool | Usage |
|------|-------|
| `browser_navigate` | `{ "url": "http://localhost:3000" }` |
| `browser_snapshot` | `{}` → Returns accessibility tree with refs |
| `browser_take_screenshot` | `{ "filename": "step-01-before.png" }` |

### Interactions

| Tool | Usage |
|------|-------|
| `browser_click` | `{ "element": "Login button", "ref": "e5" }` |
| `browser_type` | `{ "element": "Email input", "ref": "e4", "text": "test@example.com" }` |
| `browser_select_option` | `{ "element": "Country", "ref": "e7", "values": ["USA"] }` |

### Waiting

| Tool | Usage |
|------|-------|
| `browser_wait_for` | `{ "text": "Welcome" }` |
| `browser_wait_for` | `{ "textGone": "Loading..." }` |
| `browser_wait_for` | `{ "time": 2 }` |

### Debugging

| Tool | Usage |
|------|-------|
| `browser_console_messages` | `{ "level": "error" }` |
| `browser_network_requests` | `{}` |

See SKILL.md for additional Playwright tool reference.

---

## Evidence Recording

For each step, record evidence using the per-step directory structure:

```json
// mcp__harshjudge__recordEvidence
{
  "runId": "abc123xyz",
  "step": 1,
  "type": "screenshot",
  "name": "before",
  "data": "/absolute/path/to/screenshot.png"
}
```

Evidence is saved to: `.harshJudge/scenarios/{slug}/runs/{runId}/step-01/evidence/`

**Evidence Types:**
| Type | When to Use |
|------|-------------|
| `screenshot` | Before/after each action (data = file path) |
| `console_log` | When errors occur (data = JSON content) |
| `network_log` | For API-heavy tests (data = JSON content) |
| `html_snapshot` | For DOM debugging (data = HTML content) |

---

## Error Handling

| Error | Action |
|-------|--------|
| `startRun` fails | STOP, report "Cannot start run: {error}" |
| Step agent fails | Record failure, call completeStep with fail, break loop |
| `recordEvidence` fails | Log warning, continue (evidence is secondary) |
| `completeStep` fails | CRITICAL: Log error, attempt completeRun anyway |
| `completeRun` fails | CRITICAL: Report immediately, run data may be lost |

**On Error:**
1. **STOP** - Do not proceed with broken state
2. **Report** - Include step ID, tool, error message
3. **Complete** - Always call completeRun, even on failure
4. **Do NOT retry** - Unless user instructs

---

## Post-Run Guidance

**On Pass:**
- Consider running again to verify stability
- User may want to update prd.md with test observations

**On Fail:**
- Use iterate workflow to analyze and fix
- Review evidence in step-XX directories
- Check dashboard for visual evidence comparison
