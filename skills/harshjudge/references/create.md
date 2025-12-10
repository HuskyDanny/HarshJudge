# Create Scenario Workflow

## Trigger

Use this workflow when user wants to:
- Create a new E2E test scenario
- Define test steps for a user flow
- Document a test case with expected behavior

## MCP Tools Used

- `mcp__harshjudge__saveScenario`

## Assets Used & Updated

| Asset | Usage |
|-------|-------|
| `.harshJudge/assets/prd.md` | **Read:** Check existing flows, selectors, timing info |
| `.harshJudge/assets/prd.md` | **Update:** Add new scenario to Scenario Registry |
| `.harshJudge/assets/iterations.md` | **Read:** Check known selector mappings, timing requirements |

## Prerequisites

- HarshJudge must be initialized (`.harshJudge/` directory exists)
- If not initialized, run setup workflow first

## Workflow

### Step 1: Check Assets for Context

**Before creating a scenario, review existing knowledge:**

```
Read .harshJudge/assets/prd.md
```

Check for:
- Existing user flows to test
- Known UI patterns and selectors
- Timing considerations
- Environment requirements

```
Read .harshJudge/assets/iterations.md
```

Check for:
- Known selector mappings
- Timing requirements discovered
- Common failure patterns to avoid

### Step 2: Gather Scenario Information

Collect from user (or analyze codebase to suggest):

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `slug` | Yes | URL-safe identifier | `login-flow`, `checkout-process` |
| `title` | Yes | Human-readable title | `User Login Flow` |
| `content` | Yes | Markdown with test steps | See format below |
| `tags` | No | Categorization tags | `["auth", "critical"]` |
| `estimatedDuration` | No | Expected seconds | `30` |

### Step 3: Format Scenario Content

Create Markdown content following this structure:

```markdown
# {title}

## Description
Brief description of what this scenario tests.

## Preconditions
- List any required state before test starts
- Reference prd.md for environment setup

## Test Steps

### Step 1: {Action Description}
- **Action**: What to do (navigate, click, type, etc.)
- **Element**: Target element or URL
- **Expected**: What should happen

### Step 2: {Action Description}
- **Action**: ...
- **Element**: ...
- **Expected**: ...

## Success Criteria
- List conditions that define test success
- E.g., "User is redirected to dashboard"

## Tags
{tags as comma-separated list}
```

**Note:** Scenarios stay focused on test steps.
- Product context lives in `prd.md`
- Learnings accumulate in `iterations.md`

### Step 4: Call saveScenario

Invoke `mcp__harshjudge__saveScenario` with parameters:

```json
{
  "slug": "login-flow",
  "title": "User Login Flow",
  "content": "# User Login Flow\n\n## Description\n...",
  "tags": ["auth", "critical", "smoke"],
  "estimatedDuration": 30
}
```

### Step 5: Verify Response

The tool returns:

```json
{
  "success": true,
  "scenarioPath": ".harshJudge/scenarios/login-flow/scenario.md",
  "slug": "login-flow"
}
```

**On Success:** Continue to Step 6
**On Error:** STOP and report (see Error Handling below)

### Step 6: Update prd.md Scenario Registry

After successful creation, update the Scenario Registry in `prd.md`:

```markdown
## Scenario Registry

| Slug | Title | Priority | Status |
|------|-------|----------|--------|
| login-flow | User Login Flow | P0 | Active |  <- ADD THIS ROW
```

Also update the Change Log:
```markdown
## Change Log

| Date | Change | Author |
|------|--------|--------|
| {today} | Added login-flow scenario | {author} |
```

### Step 7: Report Success

```
Scenario created: {slug}

Path: {scenarioPath}
Title: {title}
Tags: {tags}

Updated: .harshJudge/assets/prd.md (Scenario Registry)

Next steps:
1. Run the scenario: "Run the {slug} scenario"
2. Expect iteration: First runs often reveal needed adjustments
3. Learnings will be captured in iterations.md
```

## Example Scenario

```markdown
# User Login Flow

## Description
Tests the complete user authentication flow from login page to dashboard.

## Preconditions
- User account exists (see prd.md for test credentials)
- User is logged out
- Application running at baseUrl

## Test Steps

### Step 1: Navigate to Login Page
- **Action**: Navigate to URL
- **Element**: /login
- **Expected**: Login form is displayed

### Step 2: Enter Email
- **Action**: Type into input
- **Element**: Email input field
- **Input**: test@example.com
- **Expected**: Email appears in field

### Step 3: Enter Password
- **Action**: Type into input
- **Element**: Password input field
- **Input**: password123
- **Expected**: Password field shows masked input

### Step 4: Click Login Button
- **Action**: Click button
- **Element**: Login/Submit button
- **Expected**: Form submits, page navigates

### Step 5: Verify Dashboard
- **Action**: Wait and verify
- **Element**: Dashboard page
- **Expected**: User sees dashboard with welcome message

## Success Criteria
- User is redirected to /dashboard
- Welcome message displays username
- No error messages displayed

## Tags
auth, critical, smoke
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| `Project not initialized` | Missing .harshJudge/ | Run setup workflow |
| `Invalid slug format` | Non-URL-safe characters | Use lowercase, hyphens only |
| `Scenario already exists` | Duplicate slug | Choose different slug or update existing |

**On Error:**
1. **STOP immediately**
2. Report error with full context
3. Do NOT proceed or retry

## Updating Existing Scenarios

To update a scenario (same slug = overwrite):

```json
{
  "slug": "login-flow",  // Same slug updates existing
  "title": "User Login Flow",
  "content": "# Updated content...",
  "tags": ["auth", "critical", "smoke"]
}
```

**When to update vs create new:**
- **Update:** Fixing selectors, adding steps, correcting expectations
- **New:** Testing completely different flow

**After update:** Add entry to iterations.md documenting what changed and why.

## Post-Create Guidance

After successful creation:
1. **Run the scenario** - First runs often fail, this is expected
2. **Use iterate workflow** - To fix issues and capture learnings
3. **Learnings go to iterations.md** - Not in the scenario file
