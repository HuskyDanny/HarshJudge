# Evidence Checklist

Validation checklist executed after each step to ensure proper evidence capture.

## Per-Step Evidence Requirements

### Screenshot Capture

- [ ] **Screenshot Taken**
  - Tool: `mcp__Playwright__browser_take_screenshot`
  - Timing: After Playwright actions complete
  - Critical: Yes

- [ ] **Screenshot Saved**
  - Location: Run evidence directory
  - Format: PNG
  - Critical: Yes

- [ ] **Screenshot Quality**
  - Check: Image is not blank/empty
  - Check: Relevant page content visible
  - Critical: Yes

### Evidence Recording

- [ ] **recordEvidence Called**
  - Tool: HarshJudge `recordEvidence` MCP
  - Parameters: runId, step, type, name, data
  - Critical: Yes

- [ ] **Metadata Complete**
  - Fields: timestamp, url, viewport
  - Critical: Yes

- [ ] **Evidence Type Correct**
  - Value: "screenshot" | "log" | "db_snapshot" | "network"
  - Critical: Yes

---

## Evidence Quality Standards

### Screenshot Content

- [ ] **Page Fully Loaded**
  - Check: No loading spinners visible
  - Check: Content rendered completely
  - Critical: No (recommendation)

- [ ] **Relevant Area Visible**
  - Check: Action target is in viewport
  - Check: Result of action is visible
  - Critical: No (recommendation)

### Sensitive Data

- [ ] **No Credentials Exposed**
  - Check: Password fields not showing values
  - Check: API keys not visible
  - Critical: Yes (security)

- [ ] **No PII Exposed**
  - Check: Real user data masked if present
  - Critical: No (recommendation)

---

## State Tracking

### skill-state.yaml Updates

- [ ] **evidenceCaptured Flag Set**
  - Field: `completedSteps[N].evidenceCaptured`
  - Value: `true`
  - Critical: Yes

- [ ] **Timestamp Recorded**
  - Field: `completedSteps[N].timestamp`
  - Format: ISO-8601
  - Critical: Yes

- [ ] **Checklist Status Updated**
  - Field: `checklistStatus.evidence`
  - Value: `in_progress` or `completed`
  - Critical: Yes

---

## Error Evidence (On Failure)

### Additional Captures

- [ ] **Error Screenshot Taken**
  - Name: `step-{N}-error.png`
  - Critical: Yes (on error)

- [ ] **Console Logs Captured**
  - Tool: `mcp__Playwright__browser_console_messages`
  - Critical: Yes (on error)

- [ ] **Error Details Recorded**
  - Fields: step, message, diagnostics
  - Location: skill-state.yaml `error` field
  - Critical: Yes (on error)

---

## Checklist Summary

| Category | Required | Optional |
|----------|----------|----------|
| Screenshot | 3 items | 0 items |
| Evidence Recording | 3 items | 0 items |
| Quality | 0 items | 4 items |
| State Tracking | 3 items | 0 items |
| Error (on failure) | 3 items | 0 items |

## Pass Criteria

- Screenshot must be captured and saved
- recordEvidence must be called successfully
- skill-state.yaml must be updated
- On error, all diagnostic evidence must be captured
