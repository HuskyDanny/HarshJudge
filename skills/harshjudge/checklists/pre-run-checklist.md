# Pre-Run Checklist

Validation checklist executed before starting a test run. All critical items must pass.

## Environment Validation

### Application Status

- [ ] **Application Running**
  - Check: HTTP request to baseUrl returns 200
  - Method: `curl {baseUrl}` or browser navigation
  - Critical: Yes (blocks run)

- [ ] **Correct Environment**
  - Check: URL matches configured baseUrl
  - Verify: Not accidentally targeting production
  - Critical: Yes

### MCP Availability

- [ ] **Playwright MCP Available**
  - Check: `browser_snapshot` responds
  - Critical: Yes (blocks run)

- [ ] **HarshJudge MCP Available**
  - Check: `getStatus` responds
  - Critical: Yes (blocks run)

---

## Scenario Validation

### File Structure

- [ ] **Scenario File Exists**
  - Location: `.harshJudge/scenarios/{slug}/scenario.md`
  - Critical: Yes (blocks run)

- [ ] **Scenario Has Valid Structure**
  - Check: Frontmatter, Overview, Steps, Expected Final State
  - Critical: Yes (blocks run)

- [ ] **At Least One Step Defined**
  - Check: Steps section is not empty
  - Critical: Yes

### Step Quality

- [ ] **All Steps Have Playwright Code**
  - Check: Each step has `**Playwright:**` section
  - Critical: Yes

- [ ] **All Steps Have Verification**
  - Check: Each step has `**Verify:**` section
  - Critical: Yes

---

## State Preparation

### Previous Run Cleanup

- [ ] **No Stale Run in Progress**
  - Check: No incomplete skill-state.yaml
  - Action: Archive or warn if found
  - Critical: No (warning)

### Directory Preparation

- [ ] **Run Directory Can Be Created**
  - Check: Write permissions to scenarios/{slug}/runs/
  - Critical: Yes

---

## Prerequisites Check

### From Scenario

- [ ] **Prerequisites Listed**
  - Check: Scenario has Prerequisites section
  - Critical: No (warning if missing)

- [ ] **Prerequisites Acknowledged**
  - Check: User confirms prerequisites are met
  - Note: May require user confirmation
  - Critical: Yes (for manual prerequisites)

---

## Checklist Summary

| Category | Required | Optional |
|----------|----------|----------|
| Environment | 4 items | 0 items |
| Scenario | 4 items | 0 items |
| State | 1 item | 1 item |
| Prerequisites | 1 item | 1 item |
| **Total** | **10 items** | **2 items** |

## Pass Criteria

- All **Critical: Yes** items must pass
- Warnings noted but do not block execution
- Application must be accessible
- Scenario must have valid structure
