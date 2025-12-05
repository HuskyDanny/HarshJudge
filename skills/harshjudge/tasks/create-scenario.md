# Create Scenario Task

## Purpose

Guide users through creating well-structured, consistent test scenarios with proper Playwright code and verification steps.

## Triggers

- "create scenario"
- "write test for"
- "new test"
- `/harshjudge:create`

## Sequential Task Execution

### Phase 1: Gather Requirements

**Action:** Understand what the user wants to test

**Questions to Ask:**
1. What flow/feature do you want to test?
2. What is the starting point (URL)?
3. What are the expected outcomes?
4. Are there any prerequisites (logged in, data setup)?
5. Should this include database verification?

**Collect:**
- Scenario title and description
- Target URL/route
- User actions to perform
- Expected results
- Prerequisites
- Tags for categorization

**Checkpoint:** ✓ Requirements gathered

---

### Phase 2: Generate Draft Scenario

**Action:** Create scenario using template

**Use Template:** `templates/scenario-tmpl.yaml`

**Generate:**
1. Frontmatter with metadata
2. Overview section
3. Prerequisites list
4. Step-by-step actions with:
   - Action description
   - Playwright code block
   - Verification assertion
   - DB verification (if applicable)
5. Expected Final State

**Playwright Best Practices:**
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

**Checkpoint:** ✓ Draft generated

---

### Phase 3: Run Scenario Checklist

**Action:** Validate scenario against checklist

**Execute:** `checklists/scenario-checklist.md`

**Verify:**
- [ ] Frontmatter complete (id, slug, title, tags, duration)
- [ ] Overview describes the test purpose
- [ ] Prerequisites are specific and verifiable
- [ ] Each step is atomic (one action only)
- [ ] Each step has Playwright code block
- [ ] Each step has Verify assertion
- [ ] Steps follow logical order
- [ ] Expected Final State defined

**On Failure:** Revise draft to fix issues

**Checkpoint:** ✓ Checklist passed

---

### Phase 4: User Review

**Action:** Present draft for user approval

**Display:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 Scenario Draft: {title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Full scenario content}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please review the scenario above.

Options:
1. ✓ Approve and save
2. ✎ Request changes (specify what to modify)
3. ✗ Cancel and discard

Your choice:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Wait for Response:**
- If approved: Proceed to Phase 5
- If changes requested: Revise and return to Phase 3
- If cancelled: Abort task

**Checkpoint:** ✓ User approved

---

### Phase 5: Save Scenario

**Action:** Persist scenario using MCP tool

**MCP Call:**
```
Tool: saveScenario
Parameters:
  slug: {generated-slug}
  content: {scenario markdown content}
```

**Verify:** Tool returns success

**Output:**
```
✓ Scenario saved successfully!

Location: .harshJudge/scenarios/{slug}/scenario.md

Next Steps:
• Run the scenario: /harshjudge:run {slug}
• View all scenarios: /harshjudge:status
• Create another: /harshjudge:create
```

**Checkpoint:** ✓ Scenario saved

---

## Scenario Structure Reference

### Frontmatter
```yaml
---
id: {unique-id}
slug: {url-friendly-slug}
title: {Human Readable Title}
tags: [auth, critical, smoke]
estimatedDuration: 30
---
```

### Step Structure
```markdown
## Step N: {Step Title}

**Action:** {Clear description of what to do}

**Playwright:**
```javascript
// Playwright code to execute
await page.goto('/login');
await page.fill('[data-testid="email"]', 'test@example.com');
```

**Verify:** {What to check after action}

**DB Verification:** (optional)
```sql
SELECT * FROM users WHERE email = 'test@example.com';
-- Expected: User record exists
```
```

---

## Rules

- Always gather requirements before generating
- Every step must be atomic (one action)
- Every step must have Playwright code
- Every step must have verification
- Always run checklist before user review
- Never save without user approval
- Use descriptive slugs (kebab-case)
