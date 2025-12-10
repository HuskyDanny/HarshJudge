---
name: harshjudge
description: AI-native E2E testing orchestration for Claude Code. Use when creating, running, or managing end-to-end test scenarios with visual evidence capture. Activates for tasks involving E2E tests, browser automation testing, test scenario creation, test execution with screenshots, or checking test status.
---

# HarshJudge E2E Testing

AI-native E2E testing with MCP tools and visual evidence capture.

## Core Principles

1. **Evidence First**: Screenshot before and after every action
2. **Fail Fast**: Stop on error, report with context
3. **Complete Runs**: Always call `completeRun`, even on failure
4. **Knowledge Accumulation**: Learnings go to `iterations.md`, not scenarios

## Workflows

| Intent | Reference | Key Tools |
|--------|-----------|-----------|
| Initialize project | [references/setup.md](references/setup.md) | `initProject` |
| Create scenario | [references/create.md](references/create.md) | `saveScenario` |
| Run scenario | [references/run.md](references/run.md) | `startRun`, `recordEvidence`, `completeRun` |
| Fix failed test | [references/iterate.md](references/iterate.md) | `getStatus`, `saveScenario` |
| Check status | [references/status.md](references/status.md) | `getStatus` |

## Project Structure

```
.harshJudge/
  config.yaml              # Project configuration
  assets/                  # Knowledge assets
    prd.md                 # Product requirements (from assets/prd.md template)
    iterations.md          # Iteration knowledge (from assets/iterations.md template)
  scenarios/{slug}/
    scenario.md            # Test steps
    meta.yaml              # Run statistics
    runs/                  # Run history with evidence
```

## Quick Reference

### HarshJudge MCP Tools
- `initProject` - Initialize project (spawns dashboard)
- `saveScenario` - Create/update scenario
- `startRun` / `recordEvidence` / `completeRun` - Execute tests
- `getStatus` - Check project or scenario status

### Playwright MCP Tools
- `browser_navigate`, `browser_click`, `browser_type` - Actions
- `browser_snapshot` - Element discovery (use before click/type)
- `browser_take_screenshot` - Evidence capture
- `browser_console_messages`, `browser_network_requests` - Logs

## Error Handling

On ANY error:
1. **STOP** - Do not proceed
2. **Report** - Tool, params, error, resolution
3. **Check assets** - Is this a known pattern in `iterations.md`?
4. **Do NOT retry** - Unless user instructs
