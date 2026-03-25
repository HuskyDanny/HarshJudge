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

## Core Philosophy: Learn from Failures

**Failed runs are valuable data, not waste.** Each failed run provides:
1. Step evidence showing what actually happened (in `step-XX/evidence/`)
2. Logs, responses, and output revealing actual behavior
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

Read `result.json` for per-step details. Review step evidence (screenshots, responses, output) in `step-XX/evidence/`.

### Step 3: Review the Dashboard

```bash
harshjudge dashboard open
```

Open `http://localhost:3001` → Scenario → Failed Run.

Examine: step evidence (screenshots, responses, output), console logs, network logs.

### Step 4: Classify the Failure

| Failure Type | Description | Action | Document In |
|-------------|-------------|--------|-------------|
| **Frontend: Element not found** | UI changed, element missing or relocated | Edit step file with updated actions | prd.md (UI patterns) |
| **Frontend: Page didn't load** | Navigation failed or timed out | Add wait, check URL | prd.md (timing patterns) |
| **Frontend: Visual mismatch** | Page state differs from expectation | Update expected outcome | — |
| **Backend: Status code mismatch** | API returned unexpected status | Update step or fix app | prd.md (known behaviors) |
| **Backend: Response schema drift** | Response shape changed | Update expected outcome | prd.md (schema notes) |
| **Backend: Timeout** | Request took too long | Add timeout, check service | prd.md (env setup) |
| **CLI: Non-zero exit code** | Command failed unexpectedly | Check stderr, update step | prd.md (known errors) |
| **CLI: Missing output** | Expected text absent from stdout | Update expected outcome | — |
| **CLI: Unexpected stderr** | Warnings or errors in stderr | Investigate root cause | prd.md (known bugs) |
| **Timing Issue** | Action too fast, resource not ready | Add wait to step | prd.md (timing patterns) |
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
- Updated step-02 actions to match the new API response schema

**Learning:**
- Always verify response schema against live API, not just status code
```

### Step 8: Report Iteration Result

```
Iteration complete: login-flow

Previous Run: {runId} (FAIL at step 02)
New Run: {newRunId} (PASS)

Changes:
- Updated step-02 expected outcome to match new API response schema

Learnings recorded in prd.md:
- API response schema: always check body structure, not just status code
```

---

## Best Practices

1. **Review step evidence first** — before changing anything, examine step evidence (screenshots, responses, output)
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
