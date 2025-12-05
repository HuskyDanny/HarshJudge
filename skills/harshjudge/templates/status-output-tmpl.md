# Status Output Template

## Project Header

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 HarshJudge Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: {projectName}
Base URL: {baseUrl}
```

---

## In-Progress Alert (Conditional)

```
⚠️ In-Progress Run Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: {slug}
Run ID: {runId}
Phase: {currentPhase}
Step: {currentStep}/{totalSteps}
Started: {startedAt}

Options:
• Resume: Review and continue
• Abort: Mark as failed
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Scenario Status Table

```
┌─────────────────────────────────────────────┐
│ Scenarios                                   │
├──────────────────┬────────┬────────┬────────┤
│ Scenario         │ Status │ Runs   │ Last   │
├──────────────────┼────────┼────────┼────────┤
│ login-flow       │ ✓      │ 5      │ 2h ago │
│ user-signup      │ ✗      │ 3      │ 1d ago │
│ checkout         │ —      │ 0      │ never  │
└──────────────────┴────────┴────────┴────────┘
```

### Status Indicators

| Symbol | Meaning |
|--------|---------|
| ✓ | Passing (last run succeeded) |
| ✗ | Failing (last run failed) |
| — | Never run |

---

## Summary Statistics

```
Summary:
• Total: {total} scenarios
• Passing: {pass} ✓
• Failing: {fail} ✗
• Never Run: {never} —
```

---

## Recent Failures (Conditional)

```
Recent Failures:
━━━━━━━━━━━━━━━━

{scenario-slug} - {timestamp}
  Failed at: Step {N} - {step title}
  Error: {error message}
  Run ID: {runId}
```

---

## Drill-Down Options

```
Options:
• View scenario details: /harshjudge:status {scenario-slug}
• Run a scenario: /harshjudge:run {scenario-slug}
• Create new scenario: /harshjudge:create
```

---

## Footer

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Scenario Detail View

For specific scenario status (`/harshjudge:status {slug}`):

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
│ abc123   │ ✓      │ 3150ms   │ 2h ago       │
│ def456   │ ✗      │ 1200ms   │ 1d ago       │
│ ghi789   │ ✓      │ 3050ms   │ 2d ago       │
└──────────┴────────┴──────────┴──────────────┘

Last Failure:
  Run ID: def456
  Step: 2 - Enter Credentials
  Error: Element not found: [data-testid="email"]
  Evidence: .harshJudge/scenarios/{slug}/runs/def456/evidence/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Empty State

When no scenarios exist:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 HarshJudge Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: {projectName}
Base URL: {baseUrl}

No scenarios found.

Get started:
1. Analyze your project: /harshjudge:analyze
2. Create a scenario: /harshjudge:create

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
