# Appendix A: Claude Skill Templates

## A.1 Main Skill Definition (skill.md)

```markdown
# HarshJudge Skill

AI-native E2E testing orchestration for Claude Code.

# Activation

This skill activates when the user mentions:
- "harshjudge", "harsh judge", "e2e test", "end to end test"
- Or uses commands: /harshjudge:setup, /harshjudge:analyze, etc.

# Prerequisites

- Playwright MCP must be configured
- HarshJudge MCP must be configured

# Available Commands

- `/harshjudge:setup` - Initialize project and verify configuration
- `/harshjudge:analyze` - Analyze project and suggest test scenarios
- `/harshjudge:create` - Create a new test scenario
- `/harshjudge:run` - Execute a test scenario
- `/harshjudge:status` - Check test status

# Core Principles

1. **Evidence First:** Always capture screenshots before and after actions
2. **Fail Fast:** Stop on first failure, capture all diagnostics
3. **Complete Runs:** Always call completeRun, even on failure
4. **Human-Readable:** Scenarios are Markdown, readable by anyone
```

## A.2 Run Skill (run.md)

```markdown
# HarshJudge Run Skill

Execute a test scenario with complete evidence capture.

# Trigger

- "run scenario {name}"
- "execute test {name}"
- "/harshjudge:run {name}"

# Protocol

## Phase 1: Initialize

1. Call `startRun` with scenarioSlug
2. Read scenario.md content
3. Parse steps from Markdown

## Phase 2: Execute Steps

For EACH step:
1. Announce: "Step N: {step title}"
2. Execute Playwright actions
3. Take screenshot: `mcp__Playwright__browser_take_screenshot`
4. Call `recordEvidence` with screenshot data
5. Verify assertions
6. If verification fails, go to Error Protocol

## Phase 3: Database Verification (if applicable)

When step includes DB Verification:
1. Execute SQL query using database tools
2. Call `recordEvidence` type: "db_snapshot"
3. Verify expected values

## Phase 4: Error Protocol

On ANY failure:
1. Capture screenshot of current state
2. Get console logs: `mcp__Playwright__browser_console_messages`
3. Call `recordEvidence` for each diagnostic
4. Call `completeRun` with status: "fail", failedStep, errorMessage
5. Report failure to user

## Phase 5: Success Protocol

After all steps pass:
1. Call `completeRun` with status: "pass", duration
2. Report success with summary

# Rules

- NEVER skip steps
- ALWAYS capture evidence for every step
- ALWAYS call completeRun (success or failure)
- On error, capture ALL available diagnostics before completing
```

---
