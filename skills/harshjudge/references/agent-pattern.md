# Agent Pattern for Inspection Tools

## Overview

To save context tokens, spawn a subagent to execute high-token-cost inspection tools and save output to files.

## Why Use This Pattern?

Inspection tools return large outputs that consume context tokens:

| Tool | Typical Output Size | Token Impact |
|------|---------------------|--------------|
| `browser_snapshot` | 5-50KB (YAML accessibility tree) | High |
| `browser_take_screenshot` | 100-500KB base64 | Very High |
| `browser_console_messages` | 1-20KB | Medium-High |
| `browser_network_requests` | 5-100KB | High |

## How It Works

1. **Spawn Agent**: Use the `Task` tool with `subagent_type: "general-purpose"`
2. **Agent Executes**: The subagent calls the inspection tool
3. **Agent Saves Output**: Writes raw markdown to `.harshJudge/snapshots/{type}-{timestamp}.md`
4. **Agent Returns Reference**: Returns only the file path and a brief summary
5. **Main Context Preserved**: Large output stays in file, not conversation

## Snapshot Output Format

The `browser_snapshot` tool returns markdown with YAML accessibility tree:

```markdown
### Page state
- Page URL: http://localhost:3000/
- Page Title: My App
- Page Snapshot:
```yaml
- generic [ref=e2]:
  - heading "Welcome" [level=1] [ref=e3]
  - textbox "Username" [ref=e4]:
    - /placeholder: your_username
  - button "Submit" [ref=e5] [cursor=pointer]
```

### Element Annotations

| Annotation       | Meaning |
|------------------|---------|
| `[ref=eN]`       | Unique element reference for interaction (e.g., e1, e2, e18) |
| `[level=N]`      | Heading level (1-6) |
| `[cursor=pointer]` | Element is clickable |
| `[disabled]`     | Element is disabled |
| `[checked]`      | Checkbox/radio is checked |
| `/placeholder:`  | Input placeholder text |

See [playwright-tools.md](playwright-tools.md) for full reference.

## Agent Prompt Templates

### For browser_snapshot

```
Execute browser_snapshot and save output to a file:

Instructions:
1. Call: mcp__Playwright__browser_snapshot
2. Create directory if needed: .harshJudge/snapshots/
3. Save the FULL raw markdown output to: .harshJudge/snapshots/snapshot-{YYYYMMDD-HHmmss}.md
4. Return ONLY:
   - File path where output was saved
   - Page URL and Title
   - Brief summary (e.g., "Page has 15 interactive elements, login form found")
   - Key element refs needed: {describe what elements you need}

   Example ref format from snapshot: button "Submit" [ref=e5]
   Return as: Submit button ref: e5

DO NOT return the full snapshot content in your response.
```

### For browser_take_screenshot

```
Execute browser_take_screenshot and save to file:

Instructions:
1. Call: mcp__Playwright__browser_take_screenshot
2. Create directory if needed: .harshJudge/snapshots/
3. Save screenshot to: .harshJudge/snapshots/screenshot-{YYYYMMDD-HHmmss}.png
4. Return ONLY:
   - File path where screenshot was saved
   - Brief description of what's visible

DO NOT return the base64 data in your response.
```

### For browser_console_messages

```
Execute browser_console_messages and save to file:

Instructions:
1. Call: mcp__Playwright__browser_console_messages
2. Create directory if needed: .harshJudge/snapshots/
3. Save FULL output to: .harshJudge/snapshots/console-{YYYYMMDD-HHmmss}.md
4. Return ONLY:
   - File path where output was saved
   - Error count and summary of any errors
   - Warning count

DO NOT return the full console log in your response.
```

### For browser_network_requests

```
Execute browser_network_requests and save to file:

Instructions:
1. Call: mcp__Playwright__browser_network_requests
2. Create directory if needed: .harshJudge/snapshots/
3. Save FULL output to: .harshJudge/snapshots/network-{YYYYMMDD-HHmmss}.md
4. Return ONLY:
   - File path where output was saved
   - Request count
   - Any failed requests (status >= 400)
   - Specific API response if requested: {describe what you need}

DO NOT return the full network log in your response.
```

## Reference ID Format

Files are saved with consistent naming (raw markdown like MCP response):

| Type | Filename Pattern | Extension |
|------|------------------|-----------|
| Snapshot | `snapshot-{YYYYMMDD-HHmmss}.md` | .md |
| Screenshot | `screenshot-{YYYYMMDD-HHmmss}.png` | .png |
| Console | `console-{YYYYMMDD-HHmmss}.md` | .md |
| Network | `network-{YYYYMMDD-HHmmss}.md` | .md |

## Example Usage

### Bad (high token cost):
```
// DON'T DO THIS - dumps large output into context
mcp__Playwright__browser_snapshot
```

### Good (token efficient):
```
Task tool with prompt:
"Execute browser_snapshot, save to .harshJudge/snapshots/snapshot-{timestamp}.md,
return only the file path and the ref for the 'Submit' button I need to click"
```

**Agent returns:**
```
Saved: .harshJudge/snapshots/snapshot-20241215-143022.md
Page: http://localhost:3000/login - Login Page
Summary: Login form with username, password fields and submit button
Submit button ref: e5
```

### Using the ref:
```json
// mcp__Playwright__browser_click
{
  "element": "Submit button",
  "ref": "e5"
}
```

## When to Use Agent Pattern

| Scenario | Use Agent Pattern? |
|----------|-------------------|
| Getting element ref for immediate click | Yes - ask agent to return only the specific ref needed |
| Capturing screenshot for evidence | Yes - agent saves file, returns path for recordEvidence |
| Debugging console errors | Yes - agent saves full log, returns error summary |
| Capturing network for API test | Yes - agent saves requests, returns specific API response |
| Quick page state check | Optional - if snapshot is small, direct may be acceptable |

## Integration with recordEvidence

When using agent pattern for evidence capture:

1. Agent saves file to `.harshJudge/snapshots/`
2. Agent returns file path
3. Use file path in `recordEvidence`:

```json
{
  "runId": "run_abc123",
  "step": 1,
  "type": "screenshot",
  "name": "step-1-before",
  "data": ".harshJudge/snapshots/screenshot-20241215-143022.png"
}
```

## Directory Structure

```
.harshJudge/
  snapshots/                   # Inspection tool outputs (raw markdown)
    snapshot-20241215-143022.md
    screenshot-20241215-143025.png
    console-20241215-143030.md
    network-20241215-143035.md
```

## Benefits

1. **Token Savings**: Large outputs stored in files, not context
2. **Persistence**: Evidence preserved for later analysis
3. **Debugging**: Full data available when needed
4. **Consistency**: Uniform file naming for easy reference
5. **Raw Format**: Markdown matches MCP tool response format
