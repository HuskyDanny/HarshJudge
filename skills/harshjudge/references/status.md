# Status Workflow

## Trigger

Use this workflow when user wants to:
- Check HarshJudge project status
- View all test scenarios
- See run history for a scenario
- Get summary of test results

## MCP Tools Used

- `mcp__harshjudge__getStatus`

## Assets Used

| Asset | Usage |
|-------|-------|
| `.harshJudge/assets/prd.md` | **Read:** Check Scenario Registry for context |

## Prerequisites

- HarshJudge initialized (`.harshJudge/` exists)

## Workflow

### Option A: Project-Wide Status

Get status of all scenarios in the project.

#### Step 1: Check prd.md for Context

```
Read .harshJudge/assets/prd.md
```

Check the Scenario Registry for:
- Scenario priorities (P0/P1/P2)
- Expected scenarios
- Deprecated scenarios

#### Step 2: Call getStatus (no parameters)

```json
// mcp__harshjudge__getStatus
{}
```

#### Step 3: Process Response

```json
{
  "success": true,
  "project": {
    "name": "my-app",
    "baseUrl": "http://localhost:3000",
    "initialized": "2024-01-15T10:00:00Z"
  },
  "scenarios": [
    {
      "slug": "login-flow",
      "title": "User Login Flow",
      "tags": ["auth", "critical"],
      "lastRun": {
        "status": "pass",
        "timestamp": "2024-01-15T12:30:00Z",
        "duration": 15234
      },
      "stats": {
        "totalRuns": 10,
        "passed": 8,
        "failed": 2,
        "passRate": 80
      }
    }
  ],
  "dashboardUrl": "http://localhost:3001"
}
```

#### Step 4: Present Summary

Format as readable table, incorporating priority from prd.md:

```
HarshJudge Project Status

Project: my-app
Base URL: http://localhost:3000
Dashboard: http://localhost:3001

Scenarios (2 total):

| Scenario | Priority | Last Run | Status | Pass Rate |
|----------|----------|----------|--------|-----------|
| User Login Flow | P0 | 2h ago | Pass | 80% (8/10) |
| Checkout Process | P1 | Never | N/A | - |

Tags: auth (1), critical (1), cart (1), payment (1)

Note: Check .harshJudge/assets/prd.md for scenario priorities
```

### Option B: Specific Scenario Status

Get detailed status for a single scenario.

#### Step 1: Call getStatus with scenarioSlug

```json
// mcp__harshjudge__getStatus
{
  "scenarioSlug": "login-flow"
}
```

#### Step 2: Process Response

```json
{
  "success": true,
  "scenario": {
    "slug": "login-flow",
    "title": "User Login Flow",
    "tags": ["auth", "critical"],
    "content": "# User Login Flow\n\n## Description...",
    "estimatedDuration": 30,
    "stats": {
      "totalRuns": 10,
      "passed": 8,
      "failed": 2,
      "passRate": 80,
      "avgDuration": 14500
    },
    "recentRuns": [
      {
        "runId": "run_abc123",
        "status": "pass",
        "timestamp": "2024-01-15T12:30:00Z",
        "duration": 15234
      }
    ]
  },
  "dashboardUrl": "http://localhost:3001/scenarios/login-flow"
}
```

#### Step 3: Present Detailed Status

```
Scenario Status: User Login Flow

Slug: login-flow
Tags: auth, critical
Estimated Duration: 30s

Statistics:
- Total Runs: 10
- Passed: 8 (80%)
- Failed: 2 (20%)
- Avg Duration: 14.5s

Recent Runs:
| Run ID | Status | Duration | Time |
|--------|--------|----------|------|
| run_abc123 | Pass | 15.2s | 2h ago |
| run_xyz789 | Fail | 8.5s | 3.5h ago |

Last Failure:
- Step 3: Element not found
- Run: run_xyz789

View details: http://localhost:3001/scenarios/login-flow
```

## Error Handling

| Error | Cause | Response |
|-------|-------|----------|
| `Project not initialized` | No `.harshJudge/` directory | Suggest running setup workflow |
| `Scenario not found` | Invalid slug | List available scenarios |
| `No scenarios` | Empty project | Suggest creating first scenario |

**On Error:**
1. **STOP immediately**
2. Report error:
   ```
   Failed to get status:
   - Error: {error.message}

   Suggested resolution: {based on error type}
   ```

## Status Indicators

| Icon | Status | Meaning |
|------|--------|---------|
| Pass | All steps completed successfully |
| Fail | One or more steps failed |
| N/A | Never run |
| Running | Currently executing |

## Post-Status Guidance

Based on status, suggest next actions:

**If scenarios exist but never run:**
> "Would you like to run one of these scenarios?"

**If recent failures:**
> "The login-flow scenario failed recently. Would you like to investigate or re-run it?"
> Reference: Use iterate workflow to analyze failures

**If no scenarios:**
> "No test scenarios found. Would you like to create one?"

**If high pass rate:**
> "Tests are looking healthy! Last run passed 2 hours ago."

**If prd.md shows missing scenarios:**
> "prd.md lists scenarios that don't exist yet. Would you like to create them?"
