# Iterate Scenario Workflow

## Trigger

Use this workflow when:
- A test run **failed** and needs scenario refinement
- The scenario definition doesn't match actual application behavior
- User wants to **improve** a scenario based on failed evidence
- Test steps are **outdated** after application changes

## MCP Tools Used

- `mcp__harshjudge__getStatus` - Review failed run evidence
- `mcp__harshjudge__saveScenario` - Update scenario definition
- `mcp__harshjudge__startRun` + `recordEvidence` + `completeRun` - Re-run test
- Playwright tools for browser automation

## Assets Used & Updated

| Asset | Usage |
|-------|-------|
| `.harshJudge/assets/iterations.md` | **Read:** Check known patterns, selector mappings, timing requirements |
| `.harshJudge/assets/iterations.md` | **Update:** Add new ITR-{NUMBER} record after each iteration |
| `.harshJudge/assets/prd.md` | **Read:** Check product context if needed |

## Core Philosophy: Learn from Failures

**Failed runs are valuable data, not waste.** Each failed run provides:
1. Screenshots showing what actually happened
2. Logs revealing backend behavior
3. Evidence of gaps between expectation and reality

**Goal:** Use this evidence to iterate toward a scenario that accurately tests the intended behavior, and **accumulate learnings** in `iterations.md`.

## Workflow

### Step 1: Check Existing Knowledge

**Before analyzing the failure, check iterations.md for known patterns:**

```
Read .harshJudge/assets/iterations.md
```

Check the Quick Reference tables:
- **Selector Mappings:** Is this element already mapped?
- **Timing Requirements:** Is this operation known to need waits?
- **Common Failure Patterns:** Have we seen this failure before?

If the pattern is known, apply the documented solution directly.

### Step 2: Analyze the Failed Run

If not a known pattern, investigate the failure:

```
mcp__harshjudge__getStatus({ scenarioSlug: "the-scenario" })
```

Review the response to identify:
- **failedStep**: Which step failed?
- **errorMessage**: What went wrong?
- **evidencePaths**: What screenshots/logs were captured?

### Step 3: Review Evidence from Dashboard

Open the dashboard and navigate to the failed run:

```
http://localhost:3001 -> Project -> Scenario -> Failed Run
```

**Examine critically:**

| Evidence Type | What to Look For |
|--------------|------------------|
| **Screenshots** | Does the UI match scenario expectations? Are selectors correct? |
| **Logs** | What did the backend actually do? Are API calls correct? |
| **DB Verification** | Is data in expected state? |
| **Error Messages** | Actual error vs expected behavior |

### Step 4: Classify the Failure

Determine the failure type to choose the correct action:

| Failure Type | Description | Action | Update to iterations.md |
|-------------|-------------|--------|-------------------------|
| **Selector Broken** | UI changed, selectors outdated | Update step selectors | Add to Selector Mappings |
| **Timing Issue** | Action too fast, element not ready | Add wait conditions | Add to Timing Requirements |
| **Scenario Mismatch** | Scenario describes wrong flow | Update scenario | Add to Failure Patterns |
| **App Bug** | Application has actual bug | Mark as known-fail, report bug | Document as App Bug pattern |
| **Environment Issue** | Test env not matching prod | Fix environment | Document env requirement |
| **Incomplete Scenario** | Missing steps or validations | Add missing steps | Document what was missing |

### Step 5: Update the Scenario (if needed)

Use `mcp__harshjudge__saveScenario` to save the updated scenario:

```json
{
  "slug": "portfolio-analysis",
  "title": "Portfolio Analysis Full Flow",
  "content": "# Updated content...",
  "tags": ["portfolio", "analysis"]
}
```

**Note:** Scenarios stay focused on test steps. Move learnings to `iterations.md`.

### Step 6: Re-run the Updated Scenario

After updating, immediately re-run to validate the fix:

```
mcp__harshjudge__startRun({ scenarioSlug: "portfolio-analysis" })
```

Follow the standard run workflow.

### Step 7: Record the Iteration

**CRITICAL: After every iteration (pass or fail), update iterations.md**

#### 7a. Determine the next ITR number

Check the last ITR-{NUMBER} in `iterations.md` and increment.

#### 7b. Add new iteration record

Append to the Iteration Records section:

```markdown
### ITR-{NUMBER}: {Brief Title}

**Date:** {YYYY-MM-DD}
**Project:** {project_name}
**Scenario:** {scenario_slug}
**Run ID:** {run_id}
**Status:** RESOLVED | ONGOING | BLOCKED

#### Context
{What was being tested and what triggered this iteration}

#### Failure Analysis
- **Failed Step:** {step number and name}
- **Error:** {error message or symptom}
- **Root Cause:** {what actually caused the failure}

#### Evidence Reviewed
| Type | File | Key Finding |
|------|------|-------------|
| Screenshot | {filename} | {what it showed} |
| Log | {filename} | {relevant log entry} |

#### Changes Made
- {what was removed/changed}
+ {what was added/changed to}

#### Learnings
- **Selector:** {if selector mapping discovered}
- **Timing:** {if timing requirement discovered}
- **Pattern:** {if common pattern identified}

#### Result
- **Re-run Status:** PASS | FAIL
- **Run ID:** {new_run_id}
- **Notes:** {any additional context}
```

#### 7c. Update Quick Reference Tables (if applicable)

**If new selector discovered:**
```markdown
| Logical Element | Selector | Discovered | Notes |
|----------------|----------|------------|-------|
| Analyze Button | .sidebar-action | ITR-003 | Was .analyze-btn |
```

**If timing requirement discovered:**
```markdown
| Operation | Wait Strategy | Duration | Scenario |
|-----------|--------------|----------|----------|
| Analysis completion | Wait for text | 30s | portfolio-analysis |
```

**If new failure pattern identified:**
```markdown
| Pattern | Symptom | Solution | Scenarios Affected |
|---------|---------|----------|-------------------|
| Sidebar buttons | Element not found | Check sidebar first | portfolio-analysis, reports |
```

### Step 8: Report Iteration Result

```
Iteration complete: ITR-{NUMBER}

Scenario: {slug}
Previous Run: {old_run_id} (FAIL)
New Run: {new_run_id} (PASS/FAIL)

Changes:
- {summary of changes made}

Learnings recorded in iterations.md:
- {summary of new knowledge added}

Next steps:
- {if PASS: "Verify stability with additional runs"}
- {if FAIL: "Continue iteration, check ITR-{NUMBER} for context"}
```

## Iteration Patterns

### Pattern A: Progressive Refinement

```
ITR-001: Initial scenario fails at step 3 (wrong selector)
  -> Evidence shows button moved to sidebar
  -> Update selector, add to Selector Mappings

ITR-002: Same scenario fails at step 5 (timeout)
  -> Evidence shows operation takes 30s
  -> Add wait, add to Timing Requirements

ITR-003: Scenario passes
  -> Document success, update Statistics
```

### Pattern B: Knowledge Reuse

```
New scenario fails with "Element not found"
  -> Check iterations.md Selector Mappings
  -> Pattern exists from ITR-001
  -> Apply known solution immediately
  -> Document as "Applied ITR-001 pattern" in new ITR
```

### Pattern C: Bug Discovery

```
ITR-005: Scenario fails
  -> Evidence shows application error (not test error)
  -> Status: BLOCKED
  -> Add to Failure Patterns as "App Bug"
  -> Report bug to development team
  -> Re-iterate after bug fix
```

## Best Practices

### 1. Always Check iterations.md First

Before debugging, check if this pattern is known. Saves time and ensures consistency.

### 2. Keep Iteration Records Complete

Every ITR record should have:
- Clear context (what was being tested)
- Evidence references (which files reviewed)
- Specific changes (diff format preferred)
- Learnings (what we now know)

### 3. Update Quick Reference Tables

When you discover:
- A new selector mapping -> Add to Selector Mappings table
- A timing requirement -> Add to Timing Requirements table
- A failure pattern -> Add to Common Failure Patterns table

### 4. Use Evidence-Driven Updates

**Always base changes on evidence, not guesses:**
- Screenshot shows wrong element? Update selector, document mapping
- Log shows timeout? Add wait, document timing requirement
- Same failure twice? It's a pattern, document it

### 5. Small Iterations

Make one change per iteration:
- Easier to identify what fixed the issue
- Clearer ITR records
- Less risk of introducing new problems

## Error Handling

| Error | Action |
|-------|--------|
| `getStatus` fails | Check if HarshJudge initialized, scenario exists |
| `saveScenario` fails | Check slug format, file permissions |
| `iterations.md` missing | Run setup to create assets |
| New run fails same way | Check ITR records for missed context |
| New run fails differently | Progress! Create new ITR record |

**On Error:**
1. **STOP** - Do not proceed
2. **Report** - Tool, params, error
3. **Check assets** - Is pattern in iterations.md?
4. **Do NOT retry** - Unless user instructs

## Example: Complete Iteration with Asset Updates

**Initial situation:** Portfolio Analysis test failing at step 3

```
User: The portfolio analysis test is failing. Help me fix it.

AI: Let me first check iterations.md for known patterns...

[Reads .harshJudge/assets/iterations.md]

No existing pattern matches this failure. Let me analyze the run...

[Calls getStatus]

Failed at Step 3: "Click Analyze Portfolio button"
Error: Element not found with selector ".analyze-btn"

[Reviews dashboard evidence]

Screenshot shows the "Analyze" button is in LEFT SIDEBAR with class "sidebar-action"

[Updates scenario with saveScenario]
[Re-runs scenario - PASSES]

Now recording this iteration in iterations.md...

[Updates iterations.md with ITR-001 record and Selector Mappings table]

Iteration complete: ITR-001
Learnings recorded for future reference.
```

## Post-Iteration Guidance

After successful iteration:
1. **Verify stability:** Run 2-3 more times to ensure it's not flaky
2. **Check related scenarios:** Do other scenarios need the same fix?
3. **Review Statistics:** Update By Scenario and By Failure Type in iterations.md
