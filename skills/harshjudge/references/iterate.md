# Iterate Scenario Workflow

## Trigger

Use this workflow when:
- A test run **failed** and needs scenario refinement
- The scenario definition doesn't match actual application behavior
- User wants to **improve** a scenario based on failed evidence
- Test steps are **outdated** after application changes

## MCP Tools Used

- `mcp__harshjudge__getStatus` - Review failed run evidence
- `mcp__harshjudge__createScenario` - Update scenario with step files
- `mcp__harshjudge__startRun` + `completeStep` + `completeRun` - Re-run test
- Playwright tools for browser automation

## Core Philosophy: Learn from Failures

**Failed runs are valuable data, not waste.** Each failed run provides:
1. Screenshots showing what actually happened (in `step-XX/evidence/`)
2. Logs revealing backend behavior
3. Evidence of gaps between expectation and reality

**Goal:** Use this evidence to iterate toward a scenario that accurately tests the intended behavior, and **accumulate learnings** in `prd.md`.

## Project Structure for Iteration

```
.harshJudge/
  prd.md                          # Project knowledge (update with learnings)
  scenarios/{slug}/
    meta.yaml                     # Scenario definition + stats
    steps/                        # Individual step files (edit these)
      01-navigate-to-login.md
      02-enter-credentials.md
      03-submit-form.md
    runs/{runId}/                 # Run history (review evidence here)
      result.json                 # Per-step results
      step-01/evidence/           # Step 01 evidence
        before.png
        after.png
      step-02/evidence/           # Step 02 evidence
      ...
```

## Workflow

### Step 1: Analyze the Failed Run

Get detailed status of the scenario:

```json
// mcp__harshjudge__getStatus
{
  "scenarioSlug": "login-flow"
}
```

Review the response to identify:
- **lastRun**: Run ID of the failed run
- **lastResult**: Which step failed
- **passRate**: Historical success rate

### Step 2: Review Evidence

Navigate to the failed run's evidence directories:

```
.harshJudge/scenarios/{slug}/runs/{runId}/
```

**For each step directory:**
- `step-01/evidence/` - First step evidence
- `step-02/evidence/` - Second step evidence
- etc.

**Read result.json for per-step details:**
```json
{
  "status": "fail",
  "startedAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:30:15Z",
  "duration": 15234,
  "failedStep": "03",
  "errorMessage": "Expected dashboard but got error page",
  "steps": [
    { "id": "01", "status": "pass", "duration": 3000 },
    { "id": "02", "status": "pass", "duration": 5000 },
    { "id": "03", "status": "fail", "duration": 7234, "error": "..." }
  ]
}
```

### Step 3: Review the Dashboard

Open the dashboard and navigate to the failed run:

```
http://localhost:3001 -> Scenario -> Failed Run
```

**Examine critically:**

| Evidence Type | What to Look For |
|--------------|------------------|
| **Before screenshots** | Was the page in expected state before action? |
| **After screenshots** | What actually happened after action? |
| **Console logs** | Any JavaScript errors? |
| **Network logs** | Did API calls succeed/fail? |

### Step 4: Classify the Failure

Determine the failure type to choose the correct action:

| Failure Type | Description | Action | Document In |
|-------------|-------------|--------|-------------|
| **Selector Broken** | UI changed, selectors outdated | Edit step file | prd.md (selector notes) |
| **Timing Issue** | Action too fast, element not ready | Add wait to step | prd.md (timing patterns) |
| **Step Mismatch** | Step describes wrong flow | Edit step file | - |
| **Missing Step** | Need additional step | Add step file, update scenario | - |
| **App Bug** | Application has actual bug | Mark as known-fail | prd.md (known bugs) |
| **Environment Issue** | Test env not matching prod | Fix environment | prd.md (env setup) |

### Step 5: Update the Step File(s)

**Option A: Edit a single step**

Read and edit the specific step file:
```
.harshJudge/scenarios/{slug}/steps/{stepId}-{step-slug}.md
```

Example: Fix a broken selector in step 02:
```markdown
# Step 02: Enter Credentials

## Description
Enter username and password into the login form.

## Preconditions
- Login form is visible

## Actions
1. Enter email into email field
2. Enter password into password field

**Playwright:**
```javascript
await page.type('[data-testid="email"]', 'test@example.com');
await page.type('[data-testid="password"]', 'password123');
```

## Expected Outcome
- Email field shows entered email
- Password field shows dots
- Fields are not in error state
```

**Option B: Recreate entire scenario with updated steps**

Use `createScenario` to update all steps at once:

```json
// mcp__harshjudge__createScenario
{
  "slug": "login-flow",
  "title": "User Login Flow",
  "steps": [
    {
      "title": "Navigate to login",
      "description": "Open the login page",
      "actions": "1. Navigate to /login\n2. Wait for page load",
      "expectedOutcome": "Login form is visible"
    },
    {
      "title": "Enter credentials",
      "description": "Fill in the login form",
      "preconditions": "Login form is visible",
      "actions": "1. Enter email\n2. Enter password",
      "expectedOutcome": "Fields are populated"
    },
    {
      "title": "Submit form",
      "description": "Submit and verify login",
      "actions": "1. Click login button\n2. Wait for redirect",
      "expectedOutcome": "Dashboard is displayed"
    }
  ]
}
```

> Note: `createScenario` preserves existing run statistics when updating.

### Step 6: Re-run the Updated Scenario

After updating, immediately re-run to validate the fix:

Follow the [run workflow](run.md):
1. `startRun({ scenarioSlug: "login-flow" })`
2. Execute each step via spawned agents
3. `completeRun()` with final status

### Step 7: Record the Iteration

**Update prd.md with learnings:**

Add a new entry to the Iteration History section:

```markdown
## Iteration History

### ITR-001: Login selector fix (2024-01-15)

**Scenario:** login-flow
**Failed Step:** 02 (Enter credentials)
**Root Cause:** Email input selector changed from `.email-input` to `[data-testid="email"]`

**Changes Made:**
- Updated step-02 Playwright selectors to use data-testid attributes

**Learning:**
- Always prefer data-testid selectors over class names
- Added selector convention note to Tech Stack section
```

### Step 8: Report Iteration Result

```
Iteration complete: login-flow

Previous Run: {runId} (FAIL at step 02)
New Run: {newRunId} (PASS)

Changes:
- Updated step-02 selectors to use data-testid

Learnings recorded in prd.md:
- Selector convention: prefer data-testid attributes

Next steps:
- Verify stability with additional runs
- Apply same selector fix to related scenarios
```

---

## Iteration Patterns

### Pattern A: Progressive Refinement

```
ITR-001: Initial scenario fails at step 03 (wrong selector)
  → Review step-03/evidence/after.png shows button moved
  → Edit step-03 file with correct selector
  → Document selector mapping in prd.md

ITR-002: Same scenario fails at step 05 (timeout)
  → Review shows operation takes 10s
  → Add browser_wait_for to step-05
  → Document timing requirement in prd.md

ITR-003: Scenario passes
  → Document success, update statistics
```

### Pattern B: Knowledge Reuse

```
New scenario fails with "Element not found"
  → Check prd.md for selector conventions
  → Pattern exists from ITR-001
  → Apply same data-testid approach
  → Document as "Applied ITR-001 pattern"
```

### Pattern C: Step Addition

```
Scenario fails because expected element requires prior action
  → Review evidence shows missing click
  → Add new step file (03-open-dropdown.md)
  → Update meta.yaml steps array via createScenario
  → Renumber subsequent steps
```

---

## Best Practices

### 1. Review Step Evidence First

Before changing anything, examine:
- `step-XX/evidence/before.png` - Initial state
- `step-XX/evidence/after.png` - Result state
- `result.json` - Error messages

### 2. Edit Individual Steps When Possible

For small fixes, edit the step `.md` file directly rather than recreating the entire scenario.

### 3. Use createScenario for Major Changes

When adding/removing steps or reorganizing, use `createScenario` to rebuild the scenario structure.

### 4. Document Learnings in prd.md

After each successful iteration:
- Add entry to Iteration History
- Update relevant sections (selectors, timing, env)
- Note patterns that apply to other scenarios

### 5. Small Iterations

Make one change per iteration:
- Easier to identify what fixed the issue
- Clearer documentation
- Less risk of introducing new problems

---

## Error Handling

| Error | Action |
|-------|--------|
| `getStatus` fails | Check if HarshJudge initialized, scenario exists |
| `createScenario` fails | Check slug format, step array validity |
| Step file not found | Run was from v1 format, recreate scenario |
| New run fails same way | Check if change was applied correctly |
| New run fails differently | Progress! New issue to investigate |

**On Error:**
1. **STOP** - Do not proceed
2. **Report** - Tool, params, error
3. **Check prd.md** - Is this a known pattern?
4. **Do NOT retry** - Unless user instructs
