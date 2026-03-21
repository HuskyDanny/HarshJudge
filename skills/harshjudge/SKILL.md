---
name: harshjudge
description: AI-native E2E testing orchestration for Claude Code. Use when creating, running, or managing end-to-end test scenarios with visual evidence capture. Activates for tasks involving E2E tests, browser automation testing, test scenario creation, test execution with screenshots, or checking test status.
---

# HarshJudge E2E Testing

AI-native E2E testing with CLI commands and visual evidence capture.

## Core Principles

1. **Evidence First**: Screenshot before and after every action
2. **Fail Fast**: Stop on error, report with context
3. **Complete Runs**: Always call `harshjudge complete-run`, even on failure
4. **Step Isolation**: Each step executes in its own spawned agent for token efficiency
5. **Knowledge Accumulation**: Learnings go to `prd.md`, not scenarios

## Step-Based Execution

HarshJudge uses a **step-based agent pattern** for token-efficient test execution:

```
Main Agent                    Step Agents (spawned per step)
    │
    ├─ harshjudge start <scenarioSlug>
    │      ↓
    │  Returns: runId, steps[]
    │
    ├─► Spawn Agent: Step 01 ──────────────────────► Execute actions
    │      │                                              │
    │      │ ◄─────────────────────────────────── Return: { status, evidencePaths }
    │      │
    │   harshjudge complete-step <runId> --step 01 --status pass
    │      │
    ├─► Spawn Agent: Step 02 ──────────────────────► Execute actions
    │      │                                              │
    │      │ ◄─────────────────────────────────── Return: { status, evidencePaths }
    │      │
    │   harshjudge complete-step <runId> --step 02 --status pass
    │      │
    │   ... (repeat for each step)
    │
    └─ harshjudge complete-run <runId> --status pass
```

**Benefits:**
- Each step agent has isolated context (no token accumulation)
- Large outputs (screenshots, logs) saved to files, not returned
- Main agent only receives concise summaries
- Automatic token optimization without manual management

## Workflows

| Intent | Reference | Key Commands |
|--------|-----------|-----------|
| Initialize project | [references/setup.md](references/setup.md) | `harshjudge init` |
| Create scenario | [references/create.md](references/create.md) | `harshjudge create` |
| Run scenario | [references/run.md](references/run.md) | `harshjudge start`, `harshjudge complete-step`, `harshjudge complete-run` |
| Fix failed test | [references/iterate.md](references/iterate.md) | `harshjudge status`, `harshjudge create` |
| Check status | [references/status.md](references/status.md) | `harshjudge status` |

## Project Structure

```
.harshJudge/
  config.yaml              # Project configuration
  prd.md                   # Product requirements (from assets/prd.md template)
  scenarios/{slug}/
    meta.yaml              # Scenario definition + run statistics
    steps/                 # Individual step files
      01-step-slug.md      # Step 01 details
      02-step-slug.md      # Step 02 details
      ...
    runs/{runId}/          # Run history
      result.json          # Run result with per-step data
      step-01/evidence/    # Step 01 evidence
      step-02/evidence/    # Step 02 evidence
      ...
  snapshots/               # Inspection tool outputs (token-saving pattern)
```

## Quick Reference

### HarshJudge CLI Commands

| Command | Purpose |
|---------|---------|
| `harshjudge init <name>` | Initialize project (creates .harshJudge/) |
| `harshjudge create <slug>` | Create/update scenario with step files |
| `harshjudge star <slug>` | Toggle/set scenario starred status |
| `harshjudge start <slug>` | Start test run, returns step list |
| `harshjudge evidence <runId>` | Capture evidence for a step |
| `harshjudge complete-step <runId>` | Complete a step, get next step ID |
| `harshjudge complete-run <runId>` | Finalize run with status |
| `harshjudge status [slug]` | Check project or scenario status |
| `harshjudge discover tree [path]` | Browse .harshJudge/ structure |
| `harshjudge discover search <pattern>` | Search file content |
| `harshjudge dashboard open/close/status` | Manage dashboard server |

### Playwright MCP Tools

| Tool | Purpose |
|------|---------|
| `browser_navigate` | Navigate to URL |
| `browser_snapshot` | Get accessibility tree (use before click/type) |
| `browser_click` | Click element using ref |
| `browser_type` | Type into input using ref |
| `browser_take_screenshot` | Capture screenshot for evidence |
| `browser_console_messages` | Get console logs |
| `browser_network_requests` | Get network activity |
| `browser_wait_for` | Wait for text/condition |

## Step Agent Prompt Template

When spawning an agent for each step:

```
Execute step {stepId} of scenario {scenarioSlug}:

## Step Content
{content from steps/{stepId}-{slug}.md}

## Project Context
Base URL: {from config.yaml}
Auth: {from prd.md if needed}

## Previous Step
Status: {pass|fail|first step}

## Your Task
1. Execute the actions using Playwright MCP tools
2. Use browser_snapshot before clicking to get element refs
3. Capture before/after screenshots using browser_take_screenshot
4. Record evidence: harshjudge evidence <runId> --step {stepNumber} --type screenshot --name before --data /path/to/screenshot.png

Return ONLY a JSON object:
{
  "status": "pass" | "fail",
  "evidencePaths": ["path1.png", "path2.png"],
  "error": null | "error message"
}

DO NOT return full evidence content. DO NOT explain your work.
```

## Error Handling

On ANY error:
1. **STOP** - Do not proceed
2. **Report** - Command, params, error, resolution
3. **Check prd.md** - Is this a known pattern?
4. **Do NOT retry** - Unless user instructs
