# Iterate Scenario Workflow

## Trigger

Use this workflow when:
- A test run **failed** and needs scenario refinement
- The scenario definition doesn't match actual application behavior
- User wants to **improve** a scenario based on failed evidence
- Test steps are **outdated** after application changes

## CLI Commands Used

- `harshjudge status <slug>` — review failed run evidence
- `harshjudge create <slug>` — update scenario with step files
- `harshjudge start` + `harshjudge complete-step` + `harshjudge complete-run` — re-run test
- Playwright tools for browser automation

## Core Philosophy: Learn from Failures

**Failed runs are valuable data, not waste.** Each failed run provides:
1. Screenshots showing what actually happened (in `step-XX/evidence/`)
2. Logs revealing backend behavior
3. Evidence of gaps between expectation and reality

**Goal:** Use evidence to iterate toward a scenario that accurately tests the intended behavior, and **accumulate learnings** in `prd.md`.

## Workflow

### Step 1: Analyze the Failed Run

```bash
harshjudge status login-flow
```

Review to identify: lastRun ID, which step failed, historical pass rate.

### Step 2: Review Evidence

Navigate to the failed run's evidence directories:

```
.harshJudge/scenarios/{slug}/runs/{runId}/
```

Read `result.json` for per-step details. View screenshots in `step-XX/evidence/`.

### Step 3: Review the Dashboard

```bash
harshjudge dashboard open
```

Open `http://localhost:3001` → Scenario → Failed Run.

Examine: before/after screenshots, console logs, network logs.

### Step 4: Classify the Failure

| Failure Type | Description | Action | Document In |
|-------------|-------------|--------|-------------|
| **Selector Broken** | UI changed, selectors outdated | Edit step file | prd.md (selector notes) |
| **Timing Issue** | Action too fast, element not ready | Add wait to step | prd.md (timing patterns) |
| **Step Mismatch** | Step describes wrong flow | Edit step file | — |
| **Missing Step** | Need additional step | Add step, update scenario | — |
| **App Bug** | Application has actual bug | Mark as known-fail | prd.md (known bugs) |
| **Environment Issue** | Test env not matching prod | Fix environment | prd.md (env setup) |

### Step 5: Update the Step File(s)

**Option A: Edit a single step file directly**

```
Edit .harshJudge/scenarios/{slug}/steps/{stepId}-{step-slug}.md
```

**Option B: Recreate scenario with updated steps**

```bash
harshjudge create login-flow --json '{ "title": "...", "steps": [...] }'
```

> `harshjudge create` preserves existing run statistics when updating.

### Step 6: Re-run the Updated Scenario

Follow [[run]] workflow:
1. `harshjudge start login-flow`
2. Execute each step via spawned agents
3. `harshjudge complete-run <runId>` with final status

### Step 7: Record the Iteration

**Update prd.md with learnings:**

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
```

---

## Best Practices

1. **Review step evidence first** — before changing anything, examine before/after screenshots
2. **Edit individual steps when possible** — for small fixes, edit the `.md` file directly
3. **Use create for major changes** — when adding/removing steps or reorganizing
4. **Document learnings in prd.md** — after each successful iteration
5. **Small iterations** — one change per iteration for clearer diagnosis

---

## Error Handling

| Error | Action |
|-------|--------|
| `harshjudge status` fails | Check if HarshJudge initialized, scenario exists |
| `harshjudge create` fails | Check slug format, step array validity |
| Step file not found | Recreate scenario with `harshjudge create` |
| New run fails same way | Check if change was applied correctly |
| New run fails differently | Progress — new issue to investigate |

**On Error:**
1. **STOP** — Do not proceed
2. **Report** — Command, params, error
3. **Check prd.md** — Is this a known pattern?
4. **Do NOT retry** — Unless user instructs
