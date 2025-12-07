# HarshJudge Demo Application

A simple demo application to showcase HarshJudge E2E testing capabilities. This demo includes a login/logout flow that can be tested using HarshJudge skills.

## Features

- **Login Page:** Form-based authentication with email/password
- **Dashboard:** Protected page showing user information
- **Logout:** Session termination with redirect to login
- **No Dependencies:** Pure Node.js implementation (no npm install required)

## Quick Start

### 1. Start the Demo Application

```bash
cd examples/demo-app
node server.js
```

The server will start at `http://localhost:3000`.

### 2. Demo Credentials

| Email | Password | Name |
|-------|----------|------|
| demo@example.com | demo123 | Demo User |
| test@example.com | test123 | Test User |

### 3. Available Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Login page (redirects to dashboard if logged in) |
| `/login` | GET | Login page |
| `/dashboard` | GET | Dashboard (requires authentication) |
| `/health` | GET | Health check endpoint |
| `/api/login` | POST | Login API endpoint |
| `/api/logout` | POST | Logout API endpoint |
| `/api/me` | GET | Current user API endpoint |

## Pre-Created Test Scenarios

This demo comes with pre-created HarshJudge scenarios in `.harshJudge/scenarios/`:

### 1. Login Flow (`login-flow`)

Tests the complete user login process:
1. Navigate to login page
2. Enter email address
3. Enter password
4. Submit form
5. Verify dashboard display

### 2. Logout Flow (`logout-flow`)

Tests the user logout process:
1. Login first (prerequisite)
2. Verify logged-in state
3. Click logout button
4. Verify redirect to login
5. Verify session is cleared

## Running HarshJudge Tests

### Prerequisites

1. **HarshJudge CLI installed:**
   ```bash
   npm install -g @harshjudge/cli
   ```

2. **Claude Code with MCP configured:**
   ```json
   {
     "mcpServers": {
       "harshjudge": {
         "command": "npx",
         "args": ["@harshjudge/mcp-server"]
       },
       "playwright": {
         "command": "npx",
         "args": ["@anthropic/playwright-mcp-server"]
       }
     }
   }
   ```

3. **Demo app running:**
   ```bash
   node server.js
   ```

### Running Tests with Claude Code

1. **Check Status:**
   ```
   /harshjudge:status
   ```

   Expected output:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 HarshJudge Status
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Project: harshjudge-demo-app
   Base URL: http://localhost:3000

   ┌─────────────────────────────────────────────┐
   │ Scenarios                                   │
   ├──────────────────┬────────┬────────┬────────┤
   │ Scenario         │ Status │ Runs   │ Last   │
   ├──────────────────┼────────┼────────┼────────┤
   │ login-flow       │ —      │ 0      │ never  │
   │ logout-flow      │ —      │ 0      │ never  │
   └──────────────────┴────────┴────────┴────────┘

   Summary:
   • Total: 2 scenarios
   • Never Run: 2 —
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

2. **Run Login Flow Test:**
   ```
   /harshjudge:run login-flow
   ```

   Expected output (on success):
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✓ Test Passed
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Scenario: User Login Flow
   Steps: 5/5
   Evidence: 10 artifacts captured

   | Step | Status | Duration |
   |------|--------|----------|
   | 1. Navigate to Login Page | ✓ | ~500ms |
   | 2. Enter Email Address | ✓ | ~100ms |
   | 3. Enter Password | ✓ | ~100ms |
   | 4. Submit Login Form | ✓ | ~800ms |
   | 5. Verify Dashboard Display | ✓ | ~200ms |

   Run ID: run-YYYYMMDD-HHMMSS
   Total Duration: ~1700ms
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

3. **Run Logout Flow Test:**
   ```
   /harshjudge:run logout-flow
   ```

   Expected output (on success):
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ✓ Test Passed
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Scenario: User Logout Flow
   Steps: 5/5
   Evidence: 10 artifacts captured

   | Step | Status | Duration |
   |------|--------|----------|
   | 1. Navigate to Dashboard | ✓ | ~1500ms |
   | 2. Verify User is Logged In | ✓ | ~200ms |
   | 3. Click Logout Button | ✓ | ~500ms |
   | 4. Verify Redirect to Login | ✓ | ~200ms |
   | 5. Verify Session is Cleared | ✓ | ~400ms |

   Run ID: run-YYYYMMDD-HHMMSS
   Total Duration: ~2800ms
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

## Evidence Location

After running tests, evidence is stored in:
```
.harshJudge/scenarios/{scenario-slug}/runs/{run-id}/evidence/
```

Example:
```
.harshJudge/scenarios/login-flow/runs/run-20251207-143022/
├── evidence/
│   ├── step-1-navigate.png
│   ├── step-2-email.png
│   ├── step-3-password.png
│   ├── step-4-submit.png
│   └── step-5-dashboard.png
└── skill-state.yaml
```

## Project Structure

```
demo-app/
├── package.json           # Project configuration
├── server.js              # Demo application server
├── README.md              # This file
└── .harshJudge/
    ├── config.yaml        # HarshJudge configuration
    ├── .gitignore         # Ignore evidence files
    └── scenarios/
        ├── login-flow/
        │   ├── scenario.md   # Login test scenario
        │   └── meta.yaml     # Run statistics
        └── logout-flow/
            ├── scenario.md   # Logout test scenario
            └── meta.yaml     # Run statistics
```

## Customization

### Adding New Scenarios

1. Create a new directory in `.harshJudge/scenarios/`:
   ```bash
   mkdir -p .harshJudge/scenarios/my-new-scenario
   ```

2. Create `scenario.md` following the template in existing scenarios

3. Create `meta.yaml`:
   ```yaml
   scenarioId: my-new-001
   slug: my-new-scenario
   createdAt: "2025-12-07T00:00:00Z"
   lastRunAt: null
   totalRuns: 0
   passCount: 0
   failCount: 0
   avgDuration: null
   lastStatus: never_run
   ```

4. Or use Claude Code:
   ```
   /harshjudge:create
   ```

### Modifying the Demo App

The demo app is designed to be simple and easy to modify:

- **Add new routes:** Edit `server.js` and add new routes in the `handleRequest` function
- **Add new users:** Add to the `users` array in `server.js`
- **Modify UI:** Edit the `loginPage` and `dashboardPage` template strings

## Troubleshooting

### "Application not running"

Make sure the demo server is started:
```bash
node server.js
```

Verify it's running:
```bash
curl http://localhost:3000/health
```

### "Port already in use"

Use a different port:
```bash
PORT=3001 node server.js
```

Update `.harshJudge/config.yaml` to match:
```yaml
baseUrl: http://localhost:3001
```

### "Login fails in test"

1. Verify credentials: `demo@example.com` / `demo123`
2. Check the login page loads correctly
3. Verify data-testid attributes are present
4. Check browser console for JavaScript errors

## License

This demo application is part of the HarshJudge project.
