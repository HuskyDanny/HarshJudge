# 8. Database Schema

HarshJudge uses **file-system-as-database**. No traditional database is used.

## 8.1 Directory Structure Schema

```
.harshJudge/
├── config.yaml                           # Project configuration
├── prd.md                                # Project PRD with context (NEW)
├── .gitignore                            # Git ignore patterns
└── scenarios/
    └── {scenario-slug}/                  # One directory per scenario
        ├── meta.yaml                     # Scenario definition + statistics
        ├── steps/                        # Individual step files (NEW)
        │   ├── 01-{step-slug}.md
        │   ├── 02-{step-slug}.md
        │   └── ...
        └── runs/
            └── {run-id}/                 # One directory per run
                ├── result.json           # Run outcome with per-step results
                ├── step-01/              # Per-step evidence directories (NEW)
                │   └── evidence/
                │       ├── before.png
                │       ├── before.meta.json
                │       ├── after.png
                │       ├── after.meta.json
                │       └── console.json
                ├── step-02/
                │   └── evidence/
                └── ...
```

## 8.2 File Schemas

### config.yaml
```yaml
projectName: "My App"
baseUrl: "http://localhost:3000"
version: "2.0"
createdAt: "2025-12-04T10:00:00Z"
```

### prd.md (NEW)
Project-level context to avoid duplication across scenarios.

```markdown
# Project PRD

## Application Type
<!-- backend | fullstack | frontend | other -->
fullstack

## Ports
| Service | Port |
|---------|------|
| Frontend | 3000 |
| Backend | 8080 |
| Database | 5432 |

## Main Scenarios
<!-- High-level list of main testing scenarios -->
- User authentication (login/logout)
- Product catalog browsing
- Shopping cart management
- Checkout flow

## Authentication
<!-- Auth requirements for testing -->
- **Login URL:** /login
- **Test Credentials:**
  - Username: test@example.com
  - Password: password123

## Tech Stack
<!-- Frameworks, libraries, tools -->
- Frontend: React, Vite, TailwindCSS
- Backend: Node.js, Express, PostgreSQL
- Testing: Playwright

## Notes
<!-- Additional context for test scenarios -->
- Database resets between test runs
- Use incognito mode for auth tests
```

### meta.yaml (UPDATED)
Combined scenario definition and statistics.

```yaml
# Scenario Definition
slug: "login-flow"
title: "User Login Flow"
starred: false
tags:
  - auth
  - critical
estimatedDuration: 30
steps:
  - id: "01"
    title: "Navigate to login page"
    file: "01-navigate-to-login.md"
  - id: "02"
    title: "Enter credentials"
    file: "02-enter-credentials.md"
  - id: "03"
    title: "Submit form"
    file: "03-submit-form.md"

# Statistics (machine-updated)
totalRuns: 5
passCount: 4
failCount: 1
lastRun: "2025-12-04T15:30:00Z"
lastResult: pass
avgDuration: 3200
```

### steps/{id}-{slug}.md (NEW)
Individual step file with structured content.

```markdown
# Step 01: Navigate to Login Page

## Description
Navigate to the application's login page and verify it loads correctly.

## Preconditions
- Application is running at configured baseUrl
- User is not logged in (no session cookie)

## Actions
1. Navigate to /login
2. Wait for page to fully load

**Playwright:**
```javascript
await page.goto('/login');
await page.waitForLoadState('networkidle');
```

## Expected Outcome
- Login form is visible
- Email and password fields are present
- Submit button is enabled
- No error messages displayed
```

### result.json (UPDATED)
Run outcome with per-step results.

```json
{
  "runId": "abc123xyz",
  "scenarioSlug": "login-flow",
  "status": "fail",
  "startedAt": "2025-12-04T15:29:55Z",
  "completedAt": "2025-12-04T15:30:00Z",
  "duration": 5000,
  "steps": [
    {
      "id": "01",
      "status": "pass",
      "duration": 1500,
      "error": null,
      "evidenceFiles": ["before.png", "after.png"]
    },
    {
      "id": "02",
      "status": "pass",
      "duration": 2000,
      "error": null,
      "evidenceFiles": ["before.png", "after.png", "console.json"]
    },
    {
      "id": "03",
      "status": "fail",
      "duration": 1500,
      "error": "Element not found: Submit button",
      "evidenceFiles": ["before.png", "error.png", "console.json"]
    }
  ],
  "failedStep": "03",
  "errorMessage": "Element not found: Submit button"
}
```

### step-{id}/evidence/{name}.meta.json
Evidence metadata for a specific step.

```json
{
  "runId": "abc123xyz",
  "stepId": "01",
  "type": "screenshot",
  "name": "before",
  "capturedAt": "2025-12-04T15:29:58Z",
  "fileSize": 45678,
  "metadata": {
    "url": "http://localhost:3000/login",
    "viewport": { "width": 1280, "height": 720 }
  }
}
```

## 8.3 Evidence Naming Conventions

Evidence files use consistent naming within each step's evidence directory:

| Name | Type | Description |
|------|------|-------------|
| `before.png` | screenshot | State before action |
| `after.png` | screenshot | State after action |
| `error.png` | screenshot | State when error occurred |
| `console.json` | console_log | Browser console messages |
| `network.json` | network_log | Network requests/responses |
| `dom.html` | html_snapshot | DOM state |
| `db-{table}.json` | db_snapshot | Database state |
| `custom-{name}.json` | custom | Custom evidence |

## 8.4 Indexing Strategy

Since file-system-as-database doesn't support queries, the dashboard uses in-memory indexing:

1. **On Load:** Read all `meta.yaml` files into memory
2. **On Change:** File watcher triggers selective re-read
3. **Caching:** Recent reads cached with TTL
4. **Performance:** For 100+ scenarios, < 1s load time (per NFR3)

### Starred Scenarios Index

For efficient starred scenario filtering:

```typescript
// In-memory index structure
interface ScenarioIndex {
  all: Map<string, ScenarioMeta>;
  starred: Set<string>;  // Set of starred scenario slugs
  byTag: Map<string, Set<string>>;
}
```

## 8.5 Migration from v1 Structure

The new structure (v2) is a **clean break** from v1. No automatic migration is provided.

**v1 Structure (deprecated):**
```
.harshJudge/scenarios/{slug}/
├── scenario.md        # All steps in one file
├── meta.yaml          # Statistics only
└── runs/{runId}/
    └── evidence/      # Flat evidence folder
```

**v2 Structure (current):**
```
.harshJudge/scenarios/{slug}/
├── meta.yaml          # Definition + statistics
├── steps/             # Individual step files
└── runs/{runId}/
    ├── result.json    # Per-step results
    └── step-{id}/     # Per-step evidence
        └── evidence/
```

To convert v1 projects, users must:
1. Re-initialize with `initProject`
2. Recreate scenarios with `createScenario`
3. Old run history will not be preserved

---
