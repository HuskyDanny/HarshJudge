# Error Protocols Reference

Standard procedures for handling errors during test execution.

## Error Handling Protocol

When ANY failure occurs during test execution, follow these steps in order:

### 1. Immediate State Update

**Action:** Update skill-state.yaml immediately

```yaml
currentPhase: "error"
lastAction: "Error encountered at step {N}: {brief description}"
```

**Rationale:** Ensures state is captured even if subsequent steps fail.

---

### 2. Capture Error Screenshot

**Action:** Take screenshot of current browser state

**MCP Call:**
```
Tool: mcp__Playwright__browser_take_screenshot
Parameters:
  filename: "step-{N}-error.png"
```

**Rationale:** Visual evidence of the error state.

---

### 3. Capture Console Logs

**Action:** Get browser console messages

**MCP Call:**
```
Tool: mcp__Playwright__browser_console_messages
Parameters:
  onlyErrors: false
```

**Store:** All console entries (info, warn, error)

**Rationale:** JavaScript errors often indicate root cause.

---

### 4. Capture Network State (Optional)

**Action:** Get network request history if relevant

**MCP Call:**
```
Tool: mcp__Playwright__browser_network_requests
```

**When to capture:**
- API call failures
- 4xx/5xx HTTP errors
- Timeout errors

---

### 5. Record All Evidence

**Action:** Call recordEvidence for each artifact

**Error Screenshot:**
```
Tool: recordEvidence
Parameters:
  runId: {runId}
  step: {N}
  type: "screenshot"
  name: "error-state"
  data: {screenshot}
```

**Console Logs:**
```
Tool: recordEvidence
Parameters:
  runId: {runId}
  step: {N}
  type: "log"
  name: "console-output"
  data: {log entries}
```

---

### 6. Complete Run as Failed

**Action:** Call completeRun with failure details

**MCP Call:**
```
Tool: completeRun
Parameters:
  runId: {runId}
  status: "fail"
  failedStep: {N}
  errorMessage: "{user-friendly error description}"
```

---

### 7. Finalize State

**Action:** Update skill-state.yaml with complete error record

```yaml
currentPhase: "completed"
error:
  step: {N}
  message: "{error message}"
  diagnostics:
    screenshot: "evidence/step-{N}-error.png"
    console:
      - "{log entry 1}"
      - "{log entry 2}"
    network: # if captured
      - "{failed request}"
completedAt: "{ISO timestamp}"
```

---

### 8. Report to User

**Action:** Display clear failure summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Test Failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: {scenario title}
Failed at: Step {N} - {step title}

Error: {user-friendly error description}

Diagnostics:
• Screenshot: evidence/step-{N}-error.png
• Console: {X} log entries captured
• Network: {Y} requests captured (if applicable)

Possible Causes:
• {Suggestion 1 based on error type}
• {Suggestion 2 based on error type}

Run ID: {runId}
Duration: {duration}ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Common Error Categories

### Playwright Errors

#### Timeout Error
**Symptom:** Element not found within timeout
**Console Pattern:** `TimeoutError: Timeout 30000ms exceeded`

**Possible Causes:**
- Element selector is incorrect
- Element is dynamically loaded
- Page didn't load completely
- Element is hidden or not visible

**Diagnostic Focus:**
- Screenshot: Check if page loaded
- Console: Look for JavaScript errors
- Network: Check for failed API calls

---

#### Navigation Error
**Symptom:** Page failed to load or redirect
**Console Pattern:** `Error: page.goto: Navigation failed`

**Possible Causes:**
- Application not running
- Wrong baseUrl configured
- Server error (5xx)
- Network connectivity issue

**Diagnostic Focus:**
- Screenshot: May show error page
- Network: Check response status codes

---

#### Selector Error
**Symptom:** Invalid or ambiguous selector
**Console Pattern:** `Error: strict mode violation`

**Possible Causes:**
- Multiple elements match selector
- Selector syntax is invalid
- DOM structure changed

**Diagnostic Focus:**
- Screenshot: Examine page structure
- Consider using more specific selectors

---

### Assertion Errors

#### Verification Failed
**Symptom:** Expected state not matched
**Pattern:** Expected element/text not found

**Possible Causes:**
- Feature behavior changed
- Timing issue (element not yet visible)
- Wrong expectations in scenario

**Diagnostic Focus:**
- Screenshot: Compare to expected state
- Console: Check for errors preventing render

---

#### DB Mismatch
**Symptom:** Database state differs from expected
**Pattern:** Query returned unexpected results

**Possible Causes:**
- Data not persisted
- Transaction rollback
- Wrong query or expectations

**Diagnostic Focus:**
- DB snapshot: Compare actual vs expected

---

### System Errors

#### MCP Error
**Symptom:** MCP tool call failed
**Pattern:** Tool returned error response

**Possible Causes:**
- MCP server not running
- Tool parameters invalid
- Server-side error

**Diagnostic Focus:**
- Check MCP server logs
- Verify tool parameters

---

#### Network Error
**Symptom:** Connection issues
**Pattern:** `ECONNREFUSED`, `ETIMEDOUT`

**Possible Causes:**
- Application not running
- Firewall blocking
- Wrong port/host

**Diagnostic Focus:**
- Verify application is running
- Check network configuration

---

## Recovery Options

After a failure, the user may:

1. **Fix and Retry**
   - Address the issue
   - Run `/harshjudge:run {scenario}` again

2. **Debug with Evidence**
   - Review captured screenshots
   - Examine console logs
   - Check network requests

3. **Update Scenario**
   - If expectations are wrong
   - If selectors need updating

4. **Report Bug**
   - If application behavior is incorrect
   - Evidence provides reproduction details
