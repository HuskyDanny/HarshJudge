# Setup Workflow

## Trigger

Use this workflow when user wants to:
- Initialize HarshJudge in a project
- Set up E2E testing infrastructure
- Start the HarshJudge dashboard

## MCP Tools Used

- `mcp__harshjudge__initProject` (spawns dashboard automatically)

## Assets Created

This workflow creates the project knowledge assets:
- `.harshJudge/assets/prd.md` - Product requirements document
- `.harshJudge/assets/iterations.md` - Iteration knowledge base

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
  "projectPath": "/path/to/.harshJudge",
  "dashboardUrl": "http://localhost:3001",
  "message": "HarshJudge initialized successfully"
}
```

**On Success:** Continue to Step 4
**On Error:** STOP and report (see Error Scenarios below)

### Step 4: Create Knowledge Assets

After successful initialization, create the assets directory and files:

#### 4a. Create assets directory
```
mkdir .harshJudge/assets
```

#### 4b. Create prd.md from template

Read the template from skill: `assets/prd.md`

Create `.harshJudge/assets/prd.md` with project-specific content:
- Fill in projectName, baseUrl
- Add tech stack if discovered
- Add key flows if known
- Leave other sections as placeholders

#### 4c. Create iterations.md from template

Read the template from skill: `assets/iterations.md`

Create `.harshJudge/assets/iterations.md` with project name filled in.

### Step 5: Report Success

```
HarshJudge initialized successfully!

Project: {projectName}
Dashboard: {dashboardUrl}

Created structure:
.harshJudge/
  config.yaml
  assets/
    prd.md          <- Product requirements (update as you learn)
    iterations.md   <- Iteration knowledge (grows with each fix)
  scenarios/
  .gitignore

Next steps:
1. Review and update .harshJudge/assets/prd.md with product details
2. Create your first test scenario
3. Open {dashboardUrl} to view the dashboard
```

## Expected Output

After successful setup:

```
.harshJudge/
  config.yaml        # Project configuration
  assets/            # Knowledge assets
    prd.md           # Product requirements document
    iterations.md    # Iteration knowledge base
  scenarios/         # Empty, ready for test scenarios
  .gitignore         # Ignores large evidence files
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
1. **Update PRD:** "Review `.harshJudge/assets/prd.md` and add product details"
2. **Create scenario:** "Would you like to create a test scenario?"
3. **View dashboard:** "Open {dashboardUrl} to view the testing dashboard"
