# Scenario Checklist

Validation checklist for test scenarios. Execute before presenting to user for review.

## Structure Validation

### Frontmatter

- [ ] **ID Present**
  - Field: `id`
  - Format: Unique identifier string
  - Critical: Yes

- [ ] **Slug Present**
  - Field: `slug`
  - Format: kebab-case, URL-friendly
  - Critical: Yes

- [ ] **Title Present**
  - Field: `title`
  - Format: Human-readable, descriptive
  - Critical: Yes

- [ ] **Tags Present**
  - Field: `tags`
  - Format: Array of strings
  - Critical: No (recommended)

- [ ] **Estimated Duration**
  - Field: `estimatedDuration`
  - Format: Number (seconds)
  - Critical: Yes

---

### Content Sections

- [ ] **Overview Present**
  - Content: Description of what scenario tests
  - Min Length: 1 sentence
  - Critical: Yes

- [ ] **Prerequisites Present**
  - Content: List of requirements before running
  - Format: Bullet list
  - Critical: Yes

- [ ] **Steps Present**
  - Content: At least 1 step defined
  - Critical: Yes

- [ ] **Expected Final State Present**
  - Content: List of expected outcomes
  - Format: Bullet list
  - Critical: Yes

---

## Step Validation

For EACH step, verify:

### Action Requirements

- [ ] **Step Has Title**
  - Format: "## Step N: {Title}"
  - Critical: Yes

- [ ] **Action Described**
  - Section: `**Action:**`
  - Content: Clear description of what to do
  - Critical: Yes

- [ ] **Step is Atomic**
  - Check: Only ONE action per step
  - Examples of violations:
    - "Fill in email and password" (should be 2 steps)
    - "Click submit and verify redirect" (should be 2 steps)
  - Critical: Yes

### Playwright Code

- [ ] **Playwright Block Present**
  - Section: `**Playwright:**`
  - Format: JavaScript code block
  - Critical: Yes

- [ ] **Code is Executable**
  - Check: Valid Playwright syntax
  - Uses: page object methods
  - Critical: Yes

- [ ] **Selectors are Robust**
  - Preferred: `[data-testid="..."]`
  - Acceptable: `getByRole()`, `getByText()`
  - Avoid: Fragile CSS selectors
  - Critical: No (recommended)

- [ ] **Waits are Explicit**
  - Use: `waitForSelector()`, `waitForURL()`, `waitForResponse()`
  - Avoid: Hard-coded timeouts without justification
  - Critical: No (recommended)

### Verification

- [ ] **Verify Assertion Present**
  - Section: `**Verify:**`
  - Content: What to check after action
  - Critical: Yes

- [ ] **Verification is Testable**
  - Check: Can be verified programmatically
  - Good: "Login form is visible"
  - Bad: "Page looks correct"
  - Critical: Yes

### Database Verification (if applicable)

- [ ] **DB Query Valid** (when present)
  - Format: SQL code block
  - Includes: Expected result comment
  - Critical: No

---

## Quality Checks

### Readability

- [ ] **Clear Language**
  - Check: Non-technical user can understand
  - Critical: No

- [ ] **Consistent Formatting**
  - Check: All steps follow same structure
  - Critical: No

### Completeness

- [ ] **Happy Path Covered**
  - Check: Main success flow is tested
  - Critical: Yes

- [ ] **Flow is End-to-End**
  - Check: Scenario has clear start and end
  - Critical: Yes

---

## Checklist Summary

| Category | Required | Optional |
|----------|----------|----------|
| Frontmatter | 4 items | 1 item |
| Content Sections | 4 items | 0 items |
| Step Validation | 6 items per step | 3 items per step |
| Quality | 2 items | 2 items |

## Pass Criteria

- All **Critical: Yes** items must pass
- At least 1 step with all required elements
- Frontmatter complete
- Expected Final State defined
