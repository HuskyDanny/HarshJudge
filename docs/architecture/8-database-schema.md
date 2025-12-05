# 8. Database Schema

HarshJudge uses **file-system-as-database**. No traditional database is used.

## 8.1 Directory Structure Schema

```
.harshJudge/
├── config.yaml                           # Project configuration
├── .gitignore                            # Git ignore patterns
└── scenarios/
    └── {scenario-slug}/                  # One directory per scenario
        ├── scenario.md                   # Scenario definition
        ├── meta.yaml                     # Statistics (machine-updated)
        └── runs/
            └── {run-id}/                 # One directory per run
                ├── result.json           # Run outcome
                ├── skill-state.yaml      # Skill execution state (progress tracking)
                └── evidence/
                    ├── step-01-{name}.png
                    ├── step-01-{name}.meta.json
                    ├── step-02-{name}.json
                    └── step-02-{name}.meta.json
```

## 8.2 File Schemas

### config.yaml
```yaml
projectName: "My App"
baseUrl: "http://localhost:3000"
version: "1.0"
createdAt: "2025-12-04T10:00:00Z"
```

### scenario.md
```markdown
---
id: login-flow
title: User Login Flow
tags: [auth, critical]
estimatedDuration: 30
---

# Overview
Test the complete user login flow.

# Prerequisites
- Test user exists: test@example.com / password123
- Application running at http://localhost:3000

# Steps

## Step 1: Navigate to Login
**Action:** Go to the login page
**Playwright:**
```javascript
await page.goto('/login');
```
**Verify:** Login form is visible

## Step 2: Enter Credentials
**Action:** Fill in credentials
**Playwright:**
```javascript
await page.fill('[data-testid="email"]', 'test@example.com');
await page.fill('[data-testid="password"]', 'password123');
```
**Verify:** Fields are populated

## Step 3: Submit Form
**Action:** Click login button
**Playwright:**
```javascript
await page.click('[data-testid="login-button"]');
await page.waitForURL('/dashboard');
```
**Verify:** Redirected to dashboard
**DB Verification:**
```sql
SELECT last_login FROM users WHERE email = 'test@example.com';
-- Should be within last minute
```

# Expected Final State
- User is logged in
- Dashboard page is displayed
- Session cookie is set
```

### meta.yaml
```yaml
totalRuns: 5
passCount: 4
failCount: 1
lastRun: "2025-12-04T15:30:00Z"
lastResult: pass
avgDuration: 3200
```

### result.json
```json
{
  "runId": "abc123xyz",
  "status": "pass",
  "duration": 3150,
  "completedAt": "2025-12-04T15:30:00Z",
  "failedStep": null,
  "errorMessage": null,
  "stepCount": 3,
  "evidenceCount": 6
}
```

### evidence/{step}-{name}.meta.json
```json
{
  "runId": "abc123xyz",
  "step": 1,
  "type": "screenshot",
  "name": "login-page",
  "capturedAt": "2025-12-04T15:29:58Z",
  "fileSize": 45678,
  "metadata": {
    "url": "http://localhost:3000/login",
    "viewport": { "width": 1280, "height": 720 }
  }
}
```

### skill-state.yaml
Tracks skill execution progress for recoverability and monitoring. Created by the run-scenario task.
```yaml
# Skill execution state - tracks progress through run-scenario task
skillVersion: "1.0"
startedAt: "2025-12-05T10:00:00Z"
currentPhase: "execute-steps"    # init | execute-steps | db-verify | error | success | completed
currentStep: 2
totalSteps: 5
completedSteps:
  - step: 1
    status: pass
    evidenceCaptured: true
    timestamp: "2025-12-05T10:00:05Z"
  - step: 2
    status: pass
    evidenceCaptured: true
    timestamp: "2025-12-05T10:00:12Z"
checklistStatus:
  pre-run: completed
  evidence: in_progress
lastAction: "Executing Playwright for step 3"
error: null                      # Populated on failure: {step, message, diagnostics}
completedAt: null                # Populated on completion
```

## 8.3 Indexing Strategy

Since file-system-as-database doesn't support queries, the dashboard uses in-memory indexing:

1. **On Load:** Read all `meta.yaml` files into memory
2. **On Change:** File watcher triggers selective re-read
3. **Caching:** Recent reads cached with TTL
4. **Performance:** For 100+ scenarios, < 1s load time (per NFR3)

---
