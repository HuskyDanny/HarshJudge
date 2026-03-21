# Status Workflow

## Trigger

Use this workflow when user wants to:
- Check HarshJudge project status
- View all test scenarios
- See run history for a scenario
- Get summary of test results
- Filter starred scenarios
- Browse the .harshJudge/ directory structure

## CLI Commands Used

- `harshjudge status` — project-wide or per-scenario status
- `harshjudge discover tree [path]` — browse directory structure
- `harshjudge discover search <pattern>` — search file content
- `harshjudge star <slug>` — mark/unmark as favorite

## Prerequisites

- HarshJudge initialized (`.harshJudge/` exists)

## Workflow

### Option A: Project-Wide Status

```bash
harshjudge status
```

**Output:**
```
HarshJudge Project Status

Project: my-app
Base URL: http://localhost:3000
Dashboard: http://localhost:3001

Scenarios (2 total):

| Scenario | Starred | Last Run | Status | Pass Rate |
|----------|---------|----------|--------|-----------|
| User Login Flow | ⭐ | 2h ago | Pass | 80% (8/10) |
| Checkout Process |  | Never | N/A | - |

Tags: auth (1), critical (1), cart (1), payment (1)
```

### Option B: Specific Scenario Status

```bash
harshjudge status login-flow
```

**Output includes:**
- Scenario metadata (slug, title, tags, starred)
- Step list with filenames
- Run statistics (totalRuns, passed, failed, passRate, avgDuration)
- Recent run history with status and duration
- Last failure details (step, error, evidence path)

### Option C: Browse Directory Structure

```bash
harshjudge discover tree
harshjudge discover tree .harshJudge/scenarios/login-flow
```

Useful for finding evidence files, exploring run history, or confirming file layout.

### Option D: Search File Content

```bash
harshjudge discover search "error"
harshjudge discover search "data-testid"
```

Searches within `.harshJudge/` — useful for finding known patterns in step files or prd.md.

---

## Toggle Star

Mark a scenario as starred (favorite) for quick filtering:

```bash
harshjudge star login-flow          # toggle current state
harshjudge star login-flow --on     # explicitly star
harshjudge star login-flow --off    # explicitly unstar
```

---

## Error Handling

| Error | Cause | Response |
|-------|-------|----------|
| `Project not initialized` | No `.harshJudge/` directory | Suggest running setup workflow |
| `Scenario not found` | Invalid slug | List available scenarios |
| `No scenarios` | Empty project | Suggest creating first scenario |

**On Error:**
1. **STOP immediately**
2. Report error with context
3. Suggest resolution based on error type

---

## Status Indicators

| Icon | Meaning |
|------|---------|
| Pass | All steps completed successfully |
| Fail | One or more steps failed |
| N/A | Never run |
| ⭐ | Starred scenario (favorite) |

## Post-Status Guidance

Based on status, suggest next actions:

**If scenarios exist but never run:**
> "Would you like to run one of these scenarios?"

**If recent failures:**
> "The login-flow scenario failed at step 03. Would you like to investigate or re-run it?"
> Reference: Use [[iterate]] workflow to analyze failures

**If no scenarios:**
> "No test scenarios found. Would you like to create one?"

**If high pass rate:**
> "Tests are looking healthy! Last run passed 2 hours ago."
