# Setup Workflow

## Trigger

Use this workflow when user wants to:
- Initialize HarshJudge in a project
- Set up E2E testing infrastructure
- Start the HarshJudge dashboard

## MCP Tools Used

- `mcp__harshjudge__initProject` (spawns dashboard automatically)

## Assets Created

This workflow creates:
- `.harshJudge/config.yaml` - Project configuration
- `.harshJudge/prd.md` - Product requirements document
- `.harshJudge/scenarios/` - Empty scenarios directory

## Workflow

### Step 1: Gather Project Information

Determine the following (ask user if not clear):
- **projectName**: From `package.json` name field, or ask user
- **baseUrl**: Target application URL (default: `http://localhost:3000`)

Optionally explore the codebase to understand:
- Tech stack (frontend/backend frameworks)
- Key user flows
- Environment requirements

### Step 2: Call initProject

Invoke `mcp__harshjudge__initProject` with parameters:

```json
{
  "projectName": "<project-name>",
  "baseUrl": "<base-url>"
}
```

### Step 3: Verify Response

The tool returns:

```json
{
  "success": true,
  "projectPath": ".harshJudge",
  "configPath": ".harshJudge/config.yaml",
  "prdPath": ".harshJudge/prd.md",
  "scenariosPath": ".harshJudge/scenarios",
  "dashboardUrl": "http://localhost:3001",
  "message": "HarshJudge initialized successfully"
}
```

**On Success:** Continue to Step 4
**On Error:** STOP and report (see Error Scenarios below)

### Step 4: Update PRD with Project Details

The `prd.md` file is created from a template. Update it with:
- Product overview
- Tech stack details
- Test credentials
- Environment setup instructions

### Step 5: Report Success

```
HarshJudge initialized successfully!

Project: {projectName}
Dashboard: {dashboardUrl}

Created structure:
.harshJudge/
  config.yaml       # Project configuration
  prd.md            # Product requirements (update with project details)
  scenarios/        # Test scenarios (empty)
  .gitignore        # Ignores large evidence files

Next steps:
1. Update .harshJudge/prd.md with product details and test credentials
2. Create your first test scenario
3. Open {dashboardUrl} to view the dashboard
```

## Expected Output

After successful setup:

```
.harshJudge/
  config.yaml         # Project configuration
  prd.md              # Product requirements document
  scenarios/          # Empty, ready for test scenarios
    {slug}/           # Created by createScenario
      meta.yaml       # Scenario definition + stats
      steps/          # Individual step files
        01-step.md
        02-step.md
      runs/           # Run history with evidence
  snapshots/          # Inspection tool outputs
  .gitignore          # Ignores large evidence files
```

Dashboard available at: `http://localhost:3001`

## Error Scenarios

| Error | Cause | Resolution |
|-------|-------|------------|
| `EACCES` | Permission denied | Check directory write permissions |
| `EADDRINUSE` | Port 3001 in use | Kill existing process or use different port |
| `ENOENT` | Directory not found | Ensure running in valid project directory |
| `Dashboard spawn failed` | Node.js issue | Check Node.js installation |

**On ANY error:**
1. **STOP immediately**
2. Report error with full context
3. Do NOT proceed or retry

## Post-Setup Guidance

After successful initialization, suggest:
1. **Update PRD:** "Review `.harshJudge/prd.md` and add product details, credentials"
2. **Create scenario:** "Would you like to create a test scenario?"
3. **View dashboard:** "Open {dashboardUrl} to view the testing dashboard"
