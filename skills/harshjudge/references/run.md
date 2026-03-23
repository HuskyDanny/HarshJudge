# Run Scenario Workflow

## Trigger

Use this workflow when user wants to:
- Execute an E2E test scenario
- Run a specific test with evidence capture
- Validate application behavior

## CLI Commands Used

**HarshJudge Commands (in order):**
1. `harshjudge start <scenarioSlug>` — Initialize the test run, get step list
2. `harshjudge evidence <runId>` — Capture evidence for each step
3. `harshjudge complete-step <runId>` — Complete each step, get next step
4. `harshjudge complete-run <runId>` — Finalize with pass/fail status

See [[run-browser]] for browser tool reference (Playwright MCP, browser-use, Chrome DevTools).

> **TOKEN OPTIMIZATION**: Each step executes in its own spawned agent. This isolates context and prevents token accumulation.

## Prerequisites

- HarshJudge initialized (`.harshJudge/` exists)
- Scenario exists with steps (created via `harshjudge create`)
- Target application is running at configured baseUrl

## Orchestration Flow

```
1. harshjudge start <scenarioSlug>
   → Returns: runId, steps[{id, title, file}]

2. Read .harshJudge/prd.md for project context

3. FOR EACH step in steps:
   a. Read step file: .harshJudge/scenarios/{slug}/steps/{step.file}
   b. Spawn step agent (see [[run-step-agent]] for prompt template)
   c. Agent returns: { status, evidencePaths, error, summary }
   d. harshjudge complete-step <runId> --step <id> --status <pass|fail>
      --duration <ms> --summary "..."
      → Returns: nextStepId or null
   e. IF status === 'fail' OR nextStepId === null: BREAK

4. harshjudge complete-run <runId> --status <pass|fail> --duration <ms>

5. Report results to user
```

## Step 1: Start the Run

```bash
harshjudge start login-flow
```

Output includes `runId`, `runPath`, `steps[]` array with `{id, title, file}`.

## Step 2: Read Project Context

```
Read .harshJudge/prd.md
```

Extract: Base URL, auth credentials, tech stack info.

## Step 3: Execute Each Step

For each step: read step file → spawn step agent → process result → call complete-step.

See [[run-step-agent]] for the full step agent prompt template.

**Complete the step:**
```bash
harshjudge complete-step <runId> \
  --step 01 \
  --status pass \
  --duration 3500 \
  --summary "Navigated to login page. Form visible with email/password fields."
```

Returns `nextStepId` (null when last step or should stop).

## Step 4: Complete the Run

**On Success:**
```bash
harshjudge complete-run <runId> --status pass --duration 15234
```

**On Failure:**
```bash
harshjudge complete-run <runId> \
  --status fail \
  --duration 8521 \
  --failed-step 03 \
  --error "Expected dashboard but got error page"
```

## Evidence Recording

```bash
harshjudge evidence <runId> \
  --step 1 \
  --type screenshot \
  --name before \
  --data /absolute/path/to/screenshot.png
```

Saved to: `.harshJudge/scenarios/{slug}/runs/{runId}/step-01/evidence/`

Evidence types: `screenshot`, `console_log`, `network_log`, `html_snapshot`.

## Step Tracking (MANDATORY)

> [!warning] Never skip steps
> Before calling `complete-run`, verify EVERY step has been executed or explicitly skipped.

After `harshjudge start` returns the step list, create a checklist and track each step:

```
Steps for run {runId}:
- [ ] 01 — {title} → pending
- [ ] 02 — {title} → pending
- [ ] 03 — {title} → pending
```

Update after each `complete-step`:
```
- [x] 01 — Navigate to login → pass (1200ms)
- [x] 02 — Fill credentials → pass (800ms)
- [ ] 03 — Verify dashboard → pending
```

**Before calling `complete-run`:** Count completed steps vs total steps. If any step is still `pending` and not explicitly failed/skipped, DO NOT finalize — execute the missing step first.

**If a step agent crashes** without returning a result, mark it as `fail` via `complete-step` with `--error "Agent did not return result"`, then continue to the next step or finalize.

## Error Handling

| Error | Action |
|-------|--------|
| `harshjudge start` fails | STOP, report error |
| Step agent fails | complete-step with fail, break loop |
| `harshjudge evidence` fails | Log warning, continue |
| `harshjudge complete-step` fails | CRITICAL: attempt complete-run anyway |
| `harshjudge complete-run` fails | CRITICAL: report immediately |

Always call `complete-run`, even on failure. Never retry unless user instructs.

## Post-Run Guidance

**On Pass:** Consider re-running to verify stability.

**On Fail:** Use iterate workflow. Review evidence in `step-XX/evidence/`. See [[iterate]].
