# Setup Checklist

Validation checklist for HarshJudge setup task. Execute each section sequentially.

## Pre-Setup Validation

### Environment Requirements

- [ ] **Node.js Version**
  - Command: `node --version`
  - Expected: v18.0.0 or higher
  - Critical: Yes (blocks setup)

- [ ] **Package Manager**
  - Command: `npm --version` or `pnpm --version`
  - Expected: Any valid version response
  - Critical: Yes (blocks setup)

- [ ] **Git Repository** (Optional)
  - Command: `git status`
  - Expected: Valid git repository
  - Critical: No (warning only)

---

## MCP Server Validation

### HarshJudge MCP Server

- [ ] **Server Installed**
  - Command: `npx @harshjudge/mcp-server --version`
  - Expected: Version string returned
  - Critical: Yes

- [ ] **Claude Code Configuration**
  - Location: `~/.claude/claude_desktop_config.json`
  - Required: `mcpServers.harshjudge` entry present
  - Critical: Yes

### Playwright MCP Server

- [ ] **Playwright MCP Configured**
  - Location: `~/.claude/claude_desktop_config.json`
  - Required: `mcpServers.playwright` entry present
  - Critical: Yes

- [ ] **Playwright Browser Installed**
  - Command: `npx playwright install chromium`
  - Expected: Browser available
  - Critical: Yes (for test execution)

---

## Project Initialization

### Directory Structure

- [ ] **Project Root Access**
  - Check: Write permissions to current directory
  - Critical: Yes

- [ ] **`.harshJudge/` Directory Created**
  - Command: `ls -la .harshJudge/`
  - Expected: Directory exists
  - Critical: Yes

- [ ] **`config.yaml` Generated**
  - Location: `.harshJudge/config.yaml`
  - Expected: Valid YAML with projectName, baseUrl
  - Critical: Yes

- [ ] **`.gitignore` Created**
  - Location: `.harshJudge/.gitignore`
  - Expected: Contains appropriate patterns
  - Critical: No

- [ ] **`scenarios/` Directory Created**
  - Location: `.harshJudge/scenarios/`
  - Expected: Empty directory exists
  - Critical: Yes

---

## Post-Setup Verification

### MCP Tool Connectivity

- [ ] **`getStatus` Tool Responds**
  - Tool: `getStatus`
  - Expected: Returns project status JSON
  - Critical: Yes

- [ ] **`initProject` Succeeded**
  - Evidence: `.harshJudge/config.yaml` exists
  - Expected: Valid configuration
  - Critical: Yes

### Console Status

- [ ] **No Error Messages**
  - Check: Console output during setup
  - Expected: No error-level messages
  - Critical: No (warnings acceptable)

---

## Checklist Summary

| Category | Required | Optional |
|----------|----------|----------|
| Pre-Setup | 2 items | 1 item |
| MCP Server | 4 items | 0 items |
| Initialization | 4 items | 1 item |
| Verification | 3 items | 0 items |
| **Total** | **13 items** | **2 items** |

## Pass Criteria

- All **Critical: Yes** items must pass
- **Critical: No** items may warn but not block
- Final status: `getStatus` returns valid response
