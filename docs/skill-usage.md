# HarshJudge Skill Usage Guide

This guide explains how to use HarshJudge skills within Claude Code to create, run, and manage E2E test scenarios.

## Table of Contents

- [Skill Architecture](#skill-architecture)
- [Available Commands](#available-commands)
- [Workflow Overview](#workflow-overview)
- [Command Reference](#command-reference)
  - [/harshjudge:setup](#harshjudgesetup)
  - [/harshjudge:analyze](#harshjudgeanalyze)
  - [/harshjudge:create](#harshjudgecreate)
  - [/harshjudge:run](#harshjudgerun)
  - [/harshjudge:status](#harshjudgestatus)
- [Scenario Structure](#scenario-structure)
- [Evidence Types](#evidence-types)
- [Best Practices](#best-practices)
- [Example Conversations](#example-conversations)

## Skill Architecture

HarshJudge skills follow a BMAD-Core-inspired architecture for deterministic, trackable AI agent execution.

### Directory Structure

After running `harshjudge init`, skills are copied to your project:

```
.claude/skills/harshjudge/
├── skill.yaml              # Skill definition and configuration
├── tasks/                  # Task execution workflows
│   ├── setup-project.md    # Environment setup task
│   ├── analyze-project.md  # Project analysis task
│   ├── create-scenario.md  # Scenario creation task
│   ├── run-scenario.md     # Test execution task
│   └── check-status.md     # Status reporting task
├── templates/              # Output templates
│   ├── scenario-tmpl.yaml  # Scenario file template
│   ├── analysis-output-tmpl.md
│   └── status-output-tmpl.md
├── checklists/             # Validation checklists
│   ├── setup-checklist.md
│   ├── scenario-checklist.md
│   ├── pre-run-checklist.md
│   └── evidence-checklist.md
└── data/                   # Reference data
    ├── evidence-types.md
    ├── skill-state-schema.md
    └── error-protocols.md
```

### Core Principles

HarshJudge skills operate under these principles:

| Principle | Rule |
|-----------|------|
| **Evidence First** | Always capture screenshots before and after actions |
| **Fail Fast** | Stop on first failure, capture all diagnostics |
| **Complete Runs** | Always call completeRun, even on failure |
| **Human-Readable** | Scenarios are Markdown, readable by anyone |
| **State Tracked** | Update skill-state.yaml after each step for recoverability |

## Available Commands

| Command | Purpose |
|---------|---------|
| `/harshjudge:setup` | Initialize environment and verify prerequisites |
| `/harshjudge:analyze` | Analyze project structure and suggest test scenarios |
| `/harshjudge:create` | Create a new test scenario with guided workflow |
| `/harshjudge:run {scenario}` | Execute a test scenario with evidence capture |
| `/harshjudge:status` | Display test status and statistics |

## Workflow Overview

The typical HarshJudge workflow follows these stages:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Setup     │────▶│   Analyze   │────▶│   Create    │
│ Environment │     │   Project   │     │  Scenarios  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
       ┌───────────────────────────────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│     Run     │────▶│   Review    │
│  Scenarios  │     │   Status    │
└─────────────┘     └─────────────┘
```

## Command Reference

### /harshjudge:setup

**Purpose:** Guide through installation and project initialization, verifying all prerequisites.

**Triggers:**
- "setup harshjudge"
- "configure harshjudge"
- "install harshjudge"
- `/harshjudge:setup`

**Phases:**

1. **Environment Validation**
   - Verify Node.js >= 18
   - Check npm/pnpm availability

2. **MCP Server Setup**
   - Verify @harshjudge/mcp-server
   - Configure Claude Code MCP settings

3. **Playwright Verification**
   - Check Playwright MCP availability
   - Test browser connectivity

4. **Project Initialization**
   - Call `initProject` MCP tool
   - Create `.harshJudge/` directory
   - Generate `config.yaml`

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║                 HarshJudge Setup Complete                     ║
╠══════════════════════════════════════════════════════════════╣
║ Environment:                                                  ║
║   • Node.js: v20.10.0                                         ║
║   • Package Manager: npm v10.2.3                              ║
║                                                               ║
║ MCP Servers:                                                  ║
║   • @harshjudge/mcp-server: ✓ Configured                      ║
║   • Playwright MCP: ✓ Configured                              ║
║                                                               ║
║ Project:                                                      ║
║   • Name: my-app                                              ║
║   • Base URL: http://localhost:3000                           ║
║   • Config: .harshJudge/config.yaml                           ║
╠══════════════════════════════════════════════════════════════╣
║ Next Steps:                                                   ║
║   1. Run `/harshjudge:analyze` to analyze your project        ║
║   2. Run `/harshjudge:create` to create test scenarios        ║
║   3. Run `/harshjudge:run {scenario}` to execute tests        ║
╚══════════════════════════════════════════════════════════════╝
```

---

### /harshjudge:analyze

**Purpose:** Analyze project structure, identify testable flows, and suggest prioritized test scenarios.

**Triggers:**
- "analyze project"
- "suggest tests"
- "what should I test"
- `/harshjudge:analyze`

**Detection Phases:**

1. **Tech Stack Detection**
   - Framework (Next.js, React, Vue, Angular, Express)
   - Language (TypeScript/JavaScript)
   - Existing testing tools

2. **Route/Page Discovery**
   - App Router pages (`app/**/page.tsx`)
   - Pages Router (`pages/**/*.tsx`)
   - React Router components

3. **API Endpoint Scanning**
   - Next.js API routes
   - Express routes
   - OpenAPI/Swagger specs
   - GraphQL schemas

4. **Database Schema Analysis**
   - Prisma schemas
   - Drizzle schemas
   - TypeORM entities
   - Mongoose models

5. **Authentication Detection**
   - NextAuth configuration
   - Clerk/Auth0 integration
   - JWT implementations
   - Protected routes

**Priority Criteria:**
- **Critical:** Auth flows, payment flows, data mutations
- **High:** Core user journeys, API endpoints
- **Medium:** Secondary features, edge cases
- **Low:** Static pages, informational content

**Output Options:**
1. Create all suggested scenarios
2. Select specific scenarios to create
3. Modify suggestions before creating
4. Export analysis only (no scenario creation)

---

### /harshjudge:create

**Purpose:** Create well-structured test scenarios with Playwright code and verification steps.

**Triggers:**
- "create scenario"
- "write test for"
- "new test"
- `/harshjudge:create`

**Workflow Phases:**

1. **Requirements Gathering**
   - What flow/feature to test?
   - Starting point URL
   - Expected outcomes
   - Prerequisites (logged in, data setup)
   - Database verification needs

2. **Draft Generation**
   - Generate scenario using template
   - Include frontmatter metadata
   - Create step-by-step actions
   - Add Playwright code blocks
   - Add verification assertions

3. **Checklist Validation**
   - Frontmatter completeness
   - Step atomicity (one action per step)
   - Playwright code presence
   - Verification presence
   - Logical step ordering

4. **User Review**
   - Present draft for approval
   - Option to request changes
   - Option to cancel

5. **Save Scenario**
   - Call `saveScenario` MCP tool
   - Write to `.harshJudge/scenarios/{slug}/`

**Playwright Best Practices Applied:**
```javascript
// Use data-testid selectors when available
await page.click('[data-testid="submit-button"]');

// Use explicit waits
await page.waitForSelector('[data-testid="success-message"]');
await page.waitForURL('/dashboard');

// Use getByRole for accessibility
await page.getByRole('button', { name: 'Submit' }).click();

// Use getByText for content verification
await expect(page.getByText('Welcome')).toBeVisible();
```

---

### /harshjudge:run

**Purpose:** Execute test scenarios with complete evidence capture and state tracking.

**Triggers:**
- "run scenario {name}"
- "execute test {name}"
- "run {scenario-name}"
- `/harshjudge:run {name}`

**Execution Phases:**

1. **Initialize**
   - Validate scenario exists
   - Execute pre-run checklist
   - Call `startRun` MCP tool
   - Create `skill-state.yaml` for tracking
   - Parse scenario steps

2. **Execute Steps** (for each step)
   - Update state tracking
   - Announce progress to user
   - Execute Playwright commands
   - Capture screenshot
   - Record evidence via MCP
   - Verify assertions
   - Update completed steps

3. **Database Verification** (if applicable)
   - Execute SQL query from scenario
   - Record DB evidence
   - Verify expected values

4. **Error Protocol** (on failure)
   - Mark error in state
   - Capture diagnostic screenshot
   - Capture console logs
   - Record diagnostic evidence
   - Complete run as failed
   - Report failure details

5. **Success Protocol** (all steps pass)
   - Update state to success
   - Complete run as passed
   - Report success summary

**Progress Reporting:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 2/5: Fill Login Form
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Success Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Test Passed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: User Login Flow
Steps: 5/5
Evidence: 10 artifacts captured

| Step | Status | Duration |
|------|--------|----------|
| 1. Navigate to login | ✓ | 450ms |
| 2. Fill email | ✓ | 120ms |
| 3. Fill password | ✓ | 110ms |
| 4. Submit form | ✓ | 850ms |
| 5. Verify dashboard | ✓ | 200ms |

Run ID: run-20251207-143022
Total Duration: 1730ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Failure Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Test Failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: User Login Flow
Failed at: Step 4 - Submit form
Error: Element not found: [data-testid='submit-button']

Diagnostics captured:
• Screenshot: evidence/step-4-error.png
• Console logs: 3 entries

Run ID: run-20251207-143022
Duration: 1250ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### /harshjudge:status

**Purpose:** Display formatted status information for scenarios and runs.

**Triggers:**
- "test status"
- "scenario status"
- "harshjudge status"
- `/harshjudge:status`

**Output Format:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 HarshJudge Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: my-app
Base URL: http://localhost:3000

┌─────────────────────────────────────────────┐
│ Scenarios                                   │
├──────────────────┬────────┬────────┬────────┤
│ Scenario         │ Status │ Runs   │ Last   │
├──────────────────┼────────┼────────┼────────┤
│ login-flow       │ ✓      │ 12     │ 2h ago │
│ checkout-flow    │ ✗      │ 5      │ 1d ago │
│ profile-update   │ —      │ 0      │ never  │
└──────────────────┴────────┴────────┴────────┘

Summary:
• Total: 3 scenarios
• Passing: 1 ✓
• Failing: 1 ✗
• Never Run: 1 —

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Status Indicators:**

| Symbol | Meaning |
|--------|---------|
| ✓ | Passing (last run succeeded) |
| ✗ | Failing (last run failed) |
| — | Never run |
| ⚠️ | In progress |

**In-Progress Run Alert:**
```
⚠️ In-Progress Run Detected
━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: login-flow
Run ID: run-20251207-143022
Phase: execute-steps
Step: 3/5
Started: 2025-12-07T14:30:22Z

This run may have been interrupted. Options:
• Resume: Review skill-state.yaml and continue
• Abort: Mark as failed and start fresh
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Scenario Detail View:** `/harshjudge:status {scenario-slug}`
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Scenario: User Login Flow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Slug: login-flow
Tags: auth, critical, smoke
Steps: 5
Estimated Duration: 30s

Statistics:
• Total Runs: 12
• Pass Rate: 92%
• Avg Duration: 1.7s

Recent Runs:
┌──────────┬────────┬──────────┬──────────────┐
│ Run ID   │ Status │ Duration │ Date         │
├──────────┼────────┼──────────┼──────────────┤
│ run-abc  │ ✓      │ 1650ms   │ 2h ago       │
│ run-xyz  │ ✓      │ 1720ms   │ 1d ago       │
└──────────┴────────┴──────────┴──────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Scenario Structure

Test scenarios follow a YAML + Markdown format:

```yaml
---
id: "login-001"
slug: "login-flow"
title: "User Login Flow"
tags: ["auth", "critical", "smoke"]
estimatedDuration: 30
---

# Overview

Tests the complete user login flow from the landing page through
successful authentication to the dashboard.

# Prerequisites

- Test user exists: test@example.com / password123
- Application running at http://localhost:3000
- Database seeded with test data

# Steps

## Step 1: Navigate to Login Page

**Action:** Open the login page

**Playwright:**
```javascript
await page.goto('http://localhost:3000/login');
```

**Verify:** Login form is displayed with email and password fields

---

## Step 2: Enter Email

**Action:** Fill in the email field

**Playwright:**
```javascript
await page.fill('[data-testid="email-input"]', 'test@example.com');
```

**Verify:** Email field contains the entered value

---

## Step 3: Enter Password

**Action:** Fill in the password field

**Playwright:**
```javascript
await page.fill('[data-testid="password-input"]', 'password123');
```

**Verify:** Password field is filled (masked)

---

## Step 4: Submit Form

**Action:** Click the login button and wait for navigation

**Playwright:**
```javascript
await page.click('[data-testid="login-button"]');
await page.waitForURL('/dashboard');
```

**Verify:** User is redirected to dashboard

**DB Verification:**
```sql
SELECT last_login FROM users WHERE email = 'test@example.com';
-- Expected: last_login is updated to current timestamp
```

# Expected Final State

- User is logged in
- Dashboard page is displayed
- Session cookie is set
- last_login timestamp updated in database
```

## Evidence Types

HarshJudge captures multiple types of evidence during test execution:

### Screenshot

Captures visual state of the browser.

```json
{
  "type": "screenshot",
  "format": "png",
  "metadata": {
    "url": "http://localhost:3000/login",
    "viewport": { "width": 1280, "height": 720 }
  }
}
```

### Log

Captures console output or application logs.

```json
{
  "type": "log",
  "format": "text",
  "metadata": {
    "source": "console|network|application"
  }
}
```

### Database Snapshot

Captures database state for verification.

```json
{
  "type": "db_snapshot",
  "format": "json",
  "metadata": {
    "query": "SELECT * FROM users WHERE id = 1",
    "table": "users"
  }
}
```

### Network

Captures network request/response data.

```json
{
  "type": "network",
  "format": "json",
  "metadata": {
    "method": "POST",
    "url": "/api/auth/login",
    "status": 200
  }
}
```

## Best Practices

### Scenario Design

1. **Keep scenarios focused** - Test one user flow per scenario
2. **Use descriptive slugs** - `user-login-flow` not `test1`
3. **Tag appropriately** - Use tags like `smoke`, `critical`, `regression`
4. **Define clear prerequisites** - List all required state before running
5. **Include database verification** - Validate data changes when applicable

### Step Writing

1. **One action per step** - Keep steps atomic
2. **Use data-testid selectors** - More stable than CSS/XPath
3. **Add explicit waits** - Use `waitForSelector` and `waitForURL`
4. **Include verification** - Every step should verify its outcome
5. **Handle async operations** - Wait for network requests to complete

### Evidence Capture

1. **Screenshot before/after** - Capture state transitions
2. **Capture console logs on failure** - Helps debugging
3. **Record network on API tests** - Verify request/response
4. **Database snapshots for mutations** - Prove data changed

### State Management

1. **Monitor skill-state.yaml** - Check for interrupted runs
2. **Review evidence folder** - Visual artifacts tell the story
3. **Clean up old runs** - Keep history manageable

## Example Conversations

### Setting Up HarshJudge

```
User: I want to set up HarshJudge for my Next.js project

Claude: I'll help you set up HarshJudge. Let me run the setup task.

/harshjudge:setup

[Claude verifies Node.js, npm, MCP servers, and initializes the project]

Setup complete! Your project "my-nextjs-app" is configured with:
- Base URL: http://localhost:3000
- Config location: .harshJudge/config.yaml

Next, would you like me to analyze your project for test suggestions?
```

### Analyzing a Project

```
User: What tests should I write for my app?

Claude: I'll analyze your project structure and suggest test scenarios.

/harshjudge:analyze

[Claude detects Next.js, TypeScript, NextAuth, Prisma, and identifies routes]

📋 Analysis Complete

I've identified 8 potential test scenarios:

Critical Priority:
1. User Login Flow (auth)
2. User Registration Flow (auth)
3. Password Reset Flow (auth)

High Priority:
4. Create Post (core feature)
5. Edit Post (core feature)
6. Delete Post (data mutation)

Medium Priority:
7. Search Posts (secondary)
8. User Profile Update (secondary)

Would you like me to:
1. Create all suggested scenarios
2. Select specific scenarios to create
3. Export analysis only
```

### Creating a Test Scenario

```
User: Create a test for the login flow

Claude: I'll create a login flow test scenario. Let me gather some details first.

Questions:
1. What's the login page URL? (/login)
2. What credentials should I use? (test@example.com / password123)
3. Where should the user land after login? (/dashboard)
4. Should I verify the database? (yes - update last_login)

[After user provides answers]

/harshjudge:create

[Claude generates scenario following template]

📝 Scenario Draft: User Login Flow

[Displays full scenario for review]

Options:
1. ✓ Approve and save
2. ✎ Request changes
3. ✗ Cancel

User: Approve

Claude: ✓ Scenario saved successfully!

Location: .harshJudge/scenarios/login-flow/scenario.md

Next Steps:
• Run the scenario: /harshjudge:run login-flow
• View all scenarios: /harshjudge:status
```

### Running a Test

```
User: Run the login test

Claude: I'll execute the login-flow scenario.

/harshjudge:run login-flow

[Pre-run checklist passes]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1/5: Navigate to Login Page
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Page loaded, login form visible

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 2/5: Enter Email
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Email entered

[... continues through all steps ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Test Passed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: User Login Flow
Steps: 5/5
Evidence: 10 artifacts captured

Run ID: run-20251207-143022
Total Duration: 1730ms

You can view the evidence in:
.harshJudge/scenarios/login-flow/runs/run-20251207-143022/evidence/
```

### Checking Status

```
User: What's the test status?

Claude: /harshjudge:status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 HarshJudge Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: my-nextjs-app
Base URL: http://localhost:3000

┌─────────────────────────────────────────────┐
│ Scenarios                                   │
├──────────────────┬────────┬────────┬────────┤
│ Scenario         │ Status │ Runs   │ Last   │
├──────────────────┼────────┼────────┼────────┤
│ login-flow       │ ✓      │ 1      │ just now │
└──────────────────┴────────┴────────┴────────┘

Summary:
• Total: 1 scenario
• Passing: 1 ✓

Would you like to:
• View scenario details: /harshjudge:status login-flow
• Create more scenarios: /harshjudge:create
• Run another test: /harshjudge:run {scenario}
```

## FAQ and Troubleshooting

### Skills Not Loading

**Symptom:** `/harshjudge:*` commands not recognized in Claude Code

**Solutions:**
1. Verify skills are copied: Check `.claude/skills/harshjudge/skill.yaml` exists
2. Re-run init: `harshjudge init` to copy skills again
3. Check Claude Code skill settings are enabled
4. Restart Claude Code after skill installation

### MCP Tools Not Available

**Symptom:** Skill tries to use MCP tools but they're not found

**Solutions:**
1. Verify `.claude/mcp.json` configuration syntax
2. Ensure HarshJudge MCP server is installed: `npm install -g @harshjudge/mcp-server`
3. Ensure Playwright MCP is installed: `npm install -g @anthropic/playwright-mcp-server`
4. Restart Claude Code to reload MCP configuration

### Interrupted Run Recovery

**Symptom:** Run was interrupted and shows "in progress" status

**Solutions:**
1. Check skill-state.yaml: `.harshJudge/scenarios/{slug}/runs/{runId}/skill-state.yaml`
2. Review `currentPhase` and `currentStep` to understand where it stopped
3. Option A: Resume manually by continuing from the failed step
4. Option B: Mark as failed and start fresh run

### Playwright Browser Issues

**Symptom:** Browser doesn't launch or times out

**Solutions:**
1. Install Playwright browsers: `npx playwright install chromium`
2. Check system dependencies: `npx playwright install-deps`
3. Verify Playwright MCP is responding: Try `browser_snapshot` tool
4. Check for conflicting browser instances

### Scenario Validation Failures

**Symptom:** Scenario fails checklist validation

**Common Issues:**
- Missing frontmatter fields (id, slug, title, tags, estimatedDuration)
- Steps without Playwright code blocks
- Steps without Verify sections
- Non-atomic steps (multiple actions in one step)

**Solutions:**
1. Review `checklists/scenario-checklist.md` requirements
2. Ensure each step has one action only
3. Add `**Playwright:**` code blocks to all steps
4. Add `**Verify:**` assertions to all steps

### Evidence Not Captured

**Symptom:** Run completes but no evidence files

**Solutions:**
1. Check write permissions on `.harshJudge/scenarios/{slug}/runs/`
2. Verify Playwright screenshot tool is working
3. Check `recordEvidence` MCP tool is responding
4. Review skill-state.yaml for `evidenceCaptured` flags

### Application Not Running

**Symptom:** Pre-run checklist fails with "Application not accessible"

**Solutions:**
1. Start your application before running tests
2. Verify baseUrl in `.harshJudge/config.yaml` is correct
3. Check for port conflicts
4. Ensure application is fully started (not still building)

### Database Verification Fails

**Symptom:** DB verification step fails or is skipped

**Current Status:** Database MCP tools are not yet implemented

**Workarounds:**
1. Remove DB Verification sections from scenarios
2. Manually verify database state
3. Wait for database MCP integration in future release

### Slow Test Execution

**Symptom:** Tests take much longer than estimated duration

**Solutions:**
1. Add explicit waits instead of arbitrary timeouts
2. Use `waitForSelector` before interactions
3. Check network conditions
4. Review Playwright code for inefficient selectors
5. Consider adding `waitForLoadState('networkidle')`

### State File Corruption

**Symptom:** Skill-state.yaml has invalid YAML or missing fields

**Solutions:**
1. Delete corrupted skill-state.yaml
2. Start fresh run
3. Report issue if corruption happens repeatedly

## Tips for Effective Test Organization

### Naming Conventions

- **Slugs:** Use kebab-case descriptive names
  - Good: `user-login-flow`, `checkout-with-promo-code`
  - Bad: `test1`, `loginTest`, `flow_1`

- **Tags:** Use consistent categories
  - Priority: `smoke`, `critical`, `regression`
  - Feature: `auth`, `checkout`, `profile`
  - Type: `happy-path`, `edge-case`, `error-handling`

### Scenario Organization

```
.harshJudge/scenarios/
├── auth/                    # Group by feature
│   ├── login-flow/
│   ├── logout-flow/
│   └── password-reset/
├── checkout/
│   ├── checkout-guest/
│   ├── checkout-registered/
│   └── checkout-promo-code/
└── smoke/                   # Or group by test type
    ├── critical-path-1/
    └── critical-path-2/
```

### Running Test Suites

Use tags to run related tests:
- Run all smoke tests by searching for `smoke` tag
- Run all auth tests by filtering `auth` tag
- Use dashboard to filter and batch run scenarios

### CI/CD Integration Tips

1. **Prerequisite Check:** Ensure application is healthy before tests
2. **Parallel Execution:** Run independent scenarios in parallel
3. **Evidence Archiving:** Copy evidence folder to CI artifacts
4. **Failure Reports:** Parse meta.yaml for test results

## Related Documentation

- [Installation Guide](../README.md)
- [Architecture Documentation](./architecture/index.md)
- [PRD and Epic Details](./prd/index.md)
