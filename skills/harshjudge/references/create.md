# Create Scenario Workflow

## Trigger

Use this workflow when user wants to:
- Create a new E2E test scenario
- Define test steps for a user flow
- Document a test case with expected behavior

## CLI Commands Used

- `harshjudge create <slug>` — creates scenario with individual step files

## Prerequisites

- HarshJudge must be initialized (`.harshJudge/` directory exists)
- If not initialized, run setup workflow first

## Workflow

### Step 1: Check PRD for Context

**Before creating a scenario, review existing knowledge:**

```
Read .harshJudge/prd.md
```

Check for:
- Existing user flows to test
- Known UI patterns and selectors
- Timing considerations
- Environment requirements
- Test credentials

### Step 2: Gather Scenario Information

Collect from user (or analyze codebase to suggest):

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `slug` | Yes | URL-safe identifier | `login-flow`, `checkout-process` |
| `title` | Yes | Human-readable title | `User Login Flow` |
| `steps` | Yes | Array of step objects | See format below |
| `tags` | No | Categorization tags | `["auth", "critical"]` |
| `estimatedDuration` | No | Expected seconds | `60` |
| `starred` | No | Mark as favorite | `false` |

### Step 3: Define Steps

Each step needs:

```typescript
{
  title: string,           // Step title (becomes filename)
  description?: string,    // What this step does
  preconditions?: string,  // Required state before step
  actions: string,         // Actions to perform
  expectedOutcome: string  // What should happen
}
```

**Example step:**
```json
{
  "title": "Navigate to login",
  "description": "Open the application login page",
  "preconditions": "Application is running at baseUrl",
  "actions": "1. Navigate to /login\n2. Wait for page to load",
  "expectedOutcome": "Login form is visible with email and password fields"
}
```

### Step 4: Run create

Pass scenario data as JSON via stdin or a file:

```bash
harshjudge create login-flow --title "User Login Flow" --steps-file steps.json
```

Or provide inline JSON:

```bash
harshjudge create login-flow --json '{
  "title": "User Login Flow",
  "steps": [
    {
      "title": "Navigate to login",
      "description": "Open the login page",
      "actions": "1. Navigate to /login\n2. Wait for page load",
      "expectedOutcome": "Login form is visible"
    },
    {
      "title": "Enter credentials",
      "description": "Fill in the login form",
      "preconditions": "Login form is visible",
      "actions": "1. Enter email into email field\n2. Enter password into password field",
      "expectedOutcome": "Both fields are populated"
    },
    {
      "title": "Submit form",
      "description": "Submit and verify login",
      "actions": "1. Click login button\n2. Wait for redirect",
      "expectedOutcome": "Dashboard is displayed with welcome message"
    }
  ],
  "tags": ["auth", "critical", "smoke"],
  "estimatedDuration": 60,
  "starred": false
}'
```

### Step 5: Verify Output

The command outputs:

```
Scenario created: login-flow

Structure:
  .harshJudge/scenarios/login-flow/
    meta.yaml
    steps/
      01-navigate-to-login.md
      02-enter-credentials.md
      03-submit-form.md

Steps: 3
Tags: auth, critical, smoke
```

**On Success:** Continue to Step 6
**On Error:** STOP and report (see Error Handling below)

### Step 6: Report Success

```
Scenario created: login-flow

Structure:
  .harshJudge/scenarios/login-flow/
    meta.yaml           # Scenario definition
    steps/
      01-navigate-to-login.md
      02-enter-credentials.md
      03-submit-form.md

Steps: 3
Tags: auth, critical, smoke

Next steps:
1. Run the scenario: "Run the login-flow scenario"
2. Expect iteration: First runs often reveal needed adjustments
3. Learnings will be captured in prd.md
```

---

## Created File Structure

After `harshjudge create` completes:

```
.harshJudge/scenarios/{slug}/
  meta.yaml           # Scenario metadata + step references
  steps/
    01-{step-slug}.md # First step details
    02-{step-slug}.md # Second step details
    ...
```

**meta.yaml format:**
```yaml
title: User Login Flow
slug: login-flow
starred: false
tags:
  - auth
  - critical
estimatedDuration: 60
steps:
  - id: '01'
    title: Navigate to login
    file: 01-navigate-to-login.md
  - id: '02'
    title: Enter credentials
    file: 02-enter-credentials.md
  - id: '03'
    title: Submit form
    file: 03-submit-form.md
totalRuns: 0
passCount: 0
failCount: 0
avgDuration: 0
```

**Step file format (01-navigate-to-login.md):**
```markdown
# Step 01: Navigate to login

## Description
Open the login page

## Preconditions
Application is running at baseUrl

## Actions
1. Navigate to /login
2. Wait for page load

## Expected Outcome
Login form is visible
```

---

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `Project not initialized` | Missing .harshJudge/ | Run setup workflow |
| `Invalid slug format` | Non-URL-safe characters | Use lowercase, hyphens, numbers only |
| `Steps array empty` | No steps provided | Add at least one step |
| `Step missing actions` | Incomplete step object | Add actions and expectedOutcome |

**On Error:**
1. **STOP immediately**
2. Report error with full context
3. Do NOT proceed or retry

---

## Updating Existing Scenarios

To update a scenario (same slug = update):

```bash
harshjudge create login-flow --json '{ ... updated steps ... }'
```

**What happens on update:**
- Step files are overwritten with new content
- `meta.yaml` is updated with new step references
- Run statistics (totalRuns, passCount, etc.) are **preserved**

**When to update vs create new:**
- **Update:** Fixing selectors, adding steps, correcting expectations
- **New:** Testing completely different flow

---

## Post-Create Guidance

After successful creation:
1. **Run the scenario** - First runs often fail, this is expected
2. **Use iterate workflow** - To fix issues and capture learnings
3. **Learnings go to prd.md** - Document selector patterns, timing, etc.
