# Appendix B: Sample Scenario Template

This appendix shows the new granular step-based scenario structure introduced in Epic 6.

## Directory Structure

```
.harshJudge/scenarios/user-login/
├── meta.yaml
└── steps/
    ├── 01-navigate-to-landing.md
    ├── 02-click-login-button.md
    ├── 03-enter-credentials.md
    └── 04-submit-login.md
```

## meta.yaml

```yaml
# Scenario Definition
slug: "user-login"
title: "User Login Flow"
starred: true
tags:
  - auth
  - critical
  - smoke
estimatedDuration: 30
steps:
  - id: "01"
    title: "Navigate to Landing Page"
    file: "01-navigate-to-landing.md"
  - id: "02"
    title: "Click Login Button"
    file: "02-click-login-button.md"
  - id: "03"
    title: "Enter Credentials"
    file: "03-enter-credentials.md"
  - id: "04"
    title: "Submit Login"
    file: "04-submit-login.md"

# Statistics (machine-updated)
totalRuns: 0
passCount: 0
failCount: 0
lastRun: null
lastResult: null
avgDuration: 0
```

## Step Files

### steps/01-navigate-to-landing.md

```markdown
# Step 01: Navigate to Landing Page

## Description
Open the application landing page and wait for it to fully load.

## Preconditions
- Application running at configured baseUrl
- Browser is in clean state (no cookies/session)

## Actions
1. Navigate to the root URL
2. Wait for network to be idle

**Playwright:**
```javascript
await page.goto('/');
await page.waitForLoadState('networkidle');
```

## Expected Outcome
- Landing page loads successfully
- Login button is visible
- No console errors
```

### steps/02-click-login-button.md

```markdown
# Step 02: Click Login Button

## Description
Click the login button to open the login form/modal.

## Preconditions
- Landing page is fully loaded
- Login button is visible

## Actions
1. Locate the login button
2. Click it
3. Wait for login form to appear

**Playwright:**
```javascript
await page.click('[data-testid="login-button"]');
await page.waitForSelector('[data-testid="login-form"]');
```

## Expected Outcome
- Login form is displayed
- Email and password fields are visible
- Submit button is present
```

### steps/03-enter-credentials.md

```markdown
# Step 03: Enter Credentials

## Description
Fill in the email and password fields with test credentials.

## Preconditions
- Login form is visible
- Email and password fields are empty and enabled

## Actions
1. Fill email field with test credentials
2. Fill password field with test credentials

**Playwright:**
```javascript
await page.fill('[data-testid="email-input"]', 'test@example.com');
await page.fill('[data-testid="password-input"]', 'password123');
```

## Expected Outcome
- Email field contains: test@example.com
- Password field contains masked password
- Submit button remains enabled
```

### steps/04-submit-login.md

```markdown
# Step 04: Submit Login

## Description
Submit the login form and verify successful authentication.

## Preconditions
- Login form has valid credentials entered
- Submit button is enabled

## Actions
1. Click submit button
2. Wait for navigation to dashboard
3. Verify database was updated

**Playwright:**
```javascript
await page.click('[data-testid="submit-button"]');
await page.waitForURL('**/dashboard');
```

**DB Verification:**
```sql
SELECT last_login FROM users WHERE email = 'test@example.com';
-- Verify: last_login is within the last minute
```

## Expected Outcome
- User is redirected to dashboard
- Session cookie is set
- Database last_login is updated
- Welcome message shows user name
```

## Run Result Example

After execution, the `result.json` would look like:

```json
{
  "runId": "run_abc123",
  "scenarioSlug": "user-login",
  "status": "pass",
  "startedAt": "2025-12-04T15:29:55Z",
  "completedAt": "2025-12-04T15:30:25Z",
  "duration": 30000,
  "steps": [
    {
      "id": "01",
      "status": "pass",
      "duration": 5000,
      "error": null,
      "evidenceFiles": ["before.png", "after.png"]
    },
    {
      "id": "02",
      "status": "pass",
      "duration": 3000,
      "error": null,
      "evidenceFiles": ["before.png", "after.png"]
    },
    {
      "id": "03",
      "status": "pass",
      "duration": 7000,
      "error": null,
      "evidenceFiles": ["before.png", "after.png"]
    },
    {
      "id": "04",
      "status": "pass",
      "duration": 15000,
      "error": null,
      "evidenceFiles": ["before.png", "after.png", "console.json"]
    }
  ],
  "failedStep": null,
  "errorMessage": null
}
```

## Evidence Directory Structure

```
.harshJudge/scenarios/user-login/runs/run_abc123/
├── result.json
├── step-01/
│   └── evidence/
│       ├── before.png
│       ├── before.meta.json
│       ├── after.png
│       └── after.meta.json
├── step-02/
│   └── evidence/
│       ├── before.png
│       ├── before.meta.json
│       ├── after.png
│       └── after.meta.json
├── step-03/
│   └── evidence/
│       ├── before.png
│       ├── before.meta.json
│       ├── after.png
│       └── after.meta.json
└── step-04/
    └── evidence/
        ├── before.png
        ├── before.meta.json
        ├── after.png
        ├── after.meta.json
        ├── console.json
        └── console.meta.json
```

---

## Legacy Format (Deprecated)

The old single-file scenario format is deprecated but shown here for reference:

```markdown
---
id: user-login
title: User Login Flow
tags: [auth, critical, smoke]
estimatedDuration: 30
---

# Overview
Test the complete user login flow...

# Steps
## Step 1: Navigate to Landing Page
...
## Step 2: Click Login Button
...
```

This format is no longer supported. Use `createScenario` MCP tool to create scenarios in the new granular format.

---
