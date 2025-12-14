# Run Scenario Workflow

## Trigger

Use this workflow when user wants to:
- Execute an E2E test scenario
- Run a specific test with evidence capture
- Validate application behavior

## MCP Tools Used

**HarshJudge Tools (in order):**
1. `mcp__harshjudge__startRun` - Initialize the test run
2. `mcp__harshjudge__recordEvidence` - Capture evidence for each step
3. `mcp__harshjudge__completeRun` - Finalize with pass/fail status

**Playwright Tools (for browser automation):**
- `mcp__Playwright__browser_navigate` - Navigate to URLs
- `mcp__Playwright__browser_snapshot` - Get accessibility tree (use for element discovery)
- `mcp__Playwright__browser_click` - Click elements
- `mcp__Playwright__browser_type` - Type into inputs
- `mcp__Playwright__browser_take_screenshot` - Capture screenshots
- `mcp__Playwright__browser_console_messages` - Capture console logs
- `mcp__Playwright__browser_network_requests` - Capture network activity

> **TOKEN OPTIMIZATION**: For `browser_snapshot`, `browser_take_screenshot`, `browser_console_messages`, and `browser_network_requests`, use the [Agent Pattern](agent-pattern.md) to save context tokens.

## Assets Used

| Asset | Usage |
|-------|-------|
| `.harshJudge/assets/prd.md` | **Read:** Check environment info, credentials, timing considerations |
| `.harshJudge/assets/iterations.md` | **Read:** Check known selector mappings, timing requirements |

## Prerequisites

- HarshJudge initialized (`.harshJudge/` exists)
- Scenario exists (created via create workflow)
- Target application is running at configured baseUrl

## Workflow

### Step 1: Check Assets for Context

**Before running, gather context from assets:**

```
Read .harshJudge/assets/prd.md
```

Check for:
- **Test Environment:** URLs, credentials
- **Timing Considerations:** Known slow operations
- **Architecture Notes:** UI patterns, API behavior

```
Read .harshJudge/assets/iterations.md
```

Check for:
- **Selector Mappings:** Use known working selectors
- **Timing Requirements:** Apply documented waits
- **Common Failure Patterns:** Avoid known issues

### Step 2: Start the Run

Invoke `mcp__harshjudge__startRun`:

```json
{
  "scenarioSlug": "login-flow"
}
```

**Response:**
```json
{
  "success": true,
  "runId": "run_abc123",
  "scenarioSlug": "login-flow",
  "startedAt": "2024-01-15T10:30:00Z"
}
```

**On Error:** STOP immediately, report error, do NOT proceed.

### Step 3: Read Scenario Content

Use `Read` tool to get scenario steps from:
`.harshJudge/scenarios/{slug}/scenario.md`

Parse the test steps to understand what actions to perform.

### Step 4: Execute Each Step

For each step in the scenario:

#### 4a. Check iterations.md for Known Mappings

Before executing, check if this element has a known selector mapping:
- If mapped in iterations.md, use the documented selector
- If not, use the selector from the scenario

#### 4b. Take "Before" Screenshot

```
mcp__Playwright__browser_take_screenshot
```

#### 4c. Record Before Evidence

```json
// mcp__harshjudge__recordEvidence
{
  "runId": "run_abc123",
  "step": 1,
  "type": "screenshot",
  "name": "step-1-before",
  "data": "<base64-screenshot-data>"
}
```

#### 4d. Perform Action

Based on step type:

**Navigate:**
```json
// mcp__Playwright__browser_navigate
{ "url": "http://localhost:3000/login" }
```

**Click:**
```json
// First get snapshot to find element
// mcp__Playwright__browser_snapshot

// Then click using ref from snapshot
// mcp__Playwright__browser_click
{ "element": "Login button", "ref": "button[name='Login']" }
```

**Type:**
```json
// mcp__Playwright__browser_type
{
  "element": "Email input",
  "ref": "input[name='email']",
  "text": "test@example.com"
}
```

#### 4e. Apply Timing Requirements

If iterations.md specifies timing for this operation:
- Apply the documented wait strategy
- Use the documented duration

#### 4f. Take "After" Screenshot

```
mcp__Playwright__browser_take_screenshot
```

#### 4g. Record After Evidence

```json
// mcp__harshjudge__recordEvidence
{
  "runId": "run_abc123",
  "step": 1,
  "type": "screenshot",
  "name": "step-1-after",
  "data": "<base64-screenshot-data>"
}
```

#### 4h. Verify Expected Result

Check if the expected outcome occurred. If not:
1. Record failure evidence (screenshot, console logs)
2. Proceed to Step 5 with `status: "fail"`

### Step 5: Complete the Run

**On Success (all steps passed):**

```json
// mcp__harshjudge__completeRun
{
  "runId": "run_abc123",
  "status": "pass",
  "duration": 15234
}
```

**On Failure (any step failed):**

```json
// mcp__harshjudge__completeRun
{
  "runId": "run_abc123",
  "status": "fail",
  "duration": 8521,
  "failedStep": 3,
  "errorMessage": "Expected dashboard page but got error page"
}
```

**CRITICAL:** Always call `completeRun`, even on failure. This ensures:
- Run is properly recorded
- Dashboard shows accurate status
- Evidence is preserved

### Step 6: Report Results

Provide summary to user:

**On Pass:**
```
Test Run Complete: login-flow

Status: PASSED
Duration: 15.2s
Steps: 5/5 passed

Evidence captured:
- 10 screenshots
- Console logs
- Network requests

View details: http://localhost:3001/scenarios/login-flow/runs/run_abc123
```

**On Fail:**
```
Test Run Failed: login-flow

Status: FAILED at Step 3
Duration: 8.5s
Error: Expected dashboard page but got error page

Failed Step: Click Login Button
- Expected: Form submits, page navigates to dashboard
- Actual: Error message displayed

Evidence captured for debugging:
- Screenshot: step-3-after.png
- Console errors: [list any errors]

View details: http://localhost:3001/scenarios/login-flow/runs/run_abc123

Next: Use iterate workflow to analyze and fix
```

## Error Handling

| Error | Action |
|-------|--------|
| `startRun` fails | STOP, report "Cannot start run: {error}" |
| Playwright action fails | Record evidence, complete run as failed |
| `recordEvidence` fails | Log warning, continue (evidence is secondary) |
| `completeRun` fails | CRITICAL: Report immediately, run data may be lost |
| Selector not found | Check iterations.md for known mapping |
| Timeout | Check iterations.md for timing requirement |

**On Error:**
1. **STOP** - Do not proceed with broken state
2. **Report** - Include tool, params, error message
3. **Check assets** - Is this a known pattern?
4. **Do NOT retry** - Unless user instructs

## Evidence Types

| Type | When to Use | Data Format |
|------|-------------|-------------|
| `screenshot` | Before/after each action | Base64 PNG |
| `console_log` | When errors occur | JSON array of messages |
| `network_log` | For API-heavy tests | JSON array of requests |
| `html_snapshot` | For DOM debugging | HTML string |
| `custom` | App-specific data | JSON object |

## Best Practices

1. **Check assets first**: Read prd.md and iterations.md before executing
2. **Use known selectors**: Apply mappings from iterations.md
3. **Apply documented waits**: Use timing requirements from iterations.md
4. **Always snapshot before click**: Use `browser_snapshot` to get accurate element refs
5. **Screenshot liberally**: Before and after every action
6. **Capture console on failure**: Often reveals root cause
7. **Use descriptive evidence names**: `step-3-login-button-clicked`
8. **Include timing**: Track how long each step takes

## Post-Run Guidance

**On Pass:**
- Consider running again to verify stability
- Update iterations.md Statistics if tracking pass rates

**On Fail:**
- Use iterate workflow to analyze and fix
- Learnings will be recorded in iterations.md
