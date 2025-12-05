# Setup Project Task

## Purpose

Guide users through HarshJudge installation and project initialization, ensuring all prerequisites are met and the environment is properly configured.

## Triggers

- "setup harshjudge"
- "configure harshjudge"
- "install harshjudge"
- `/harshjudge:setup`

## Sequential Task Execution

### Phase 1: Environment Validation

#### Step 1: Verify Node.js Version

**Action:** Check Node.js is installed and version >= 18

**Command:**
```bash
node --version
```

**Verify:** Version is v18.0.0 or higher

**Checkpoint:** ✓ Node.js requirement met

**On Failure:** See Troubleshooting > Node.js Version Too Old

---

#### Step 2: Verify Package Manager

**Action:** Check npm or pnpm is available

**Command:**
```bash
npm --version
# or
pnpm --version
```

**Verify:** Package manager responds with version

**Checkpoint:** ✓ Package manager available

---

### Phase 2: MCP Server Setup

#### Step 3: Verify/Install HarshJudge MCP Server

**Action:** Check if @harshjudge/mcp-server is available

**Command:**
```bash
npx @harshjudge/mcp-server --version
```

**If not installed:** Guide user to install:
```bash
npm install -g @harshjudge/mcp-server
```

**Checkpoint:** ✓ HarshJudge MCP server available

**On Failure:** See Troubleshooting > MCP Server Not Found

---

#### Step 4: Configure Claude Code MCP Settings

**Action:** Ensure Claude Code has HarshJudge MCP configured

**Location:** `~/.claude/claude_desktop_config.json` (or platform equivalent)

**Required Configuration:**
```json
{
  "mcpServers": {
    "harshjudge": {
      "command": "npx",
      "args": ["@harshjudge/mcp-server"]
    }
  }
}
```

**Verify:** User confirms configuration is in place

**Checkpoint:** ✓ Claude Code MCP configured

**On Failure:** See Troubleshooting > Claude Code MCP Config Issues

---

### Phase 3: Playwright Verification

#### Step 5: Verify Playwright MCP Availability

**Action:** Check Playwright MCP is configured in Claude Code

**Required Configuration:**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic/mcp-playwright"]
    }
  }
}
```

**Checkpoint:** ✓ Playwright MCP configured

---

#### Step 6: Test Playwright MCP

**Action:** Verify Playwright tools are accessible

**Test:** Call `mcp__Playwright__browser_snapshot` to verify connectivity

**Verify:** Tool responds without error

**Checkpoint:** ✓ Playwright MCP functional

**On Failure:** See Troubleshooting > Playwright Not Installed

---

### Phase 4: Project Initialization

#### Step 7: Initialize HarshJudge Project

**Action:** Call the `initProject` MCP tool

**MCP Call:**
```
Tool: initProject
Parameters:
  projectName: {detected from package.json or prompt user}
  baseUrl: {prompt user, default: "http://localhost:3000"}
```

**Verify:** Tool returns success response

**Checkpoint:** ✓ Project initialized

---

#### Step 8: Verify Directory Structure

**Action:** Confirm `.harshJudge/` directory was created

**Check:**
```bash
ls -la .harshJudge/
```

**Expected Files:**
- `config.yaml` - Project configuration
- `.gitignore` - Git ignore patterns
- `scenarios/` - Scenarios directory (empty)

**Checkpoint:** ✓ Directory structure created

---

### Phase 5: Verification & Summary

#### Step 9: Verify Setup with getStatus

**Action:** Call the `getStatus` MCP tool

**MCP Call:**
```
Tool: getStatus
Parameters: {}
```

**Verify:** Tool returns project status without errors

**Checkpoint:** ✓ Setup verification passed

---

#### Step 10: Output Environment Summary

**Action:** Display setup completion summary

**Output Format:**
```
╔══════════════════════════════════════════════════════════════╗
║                 HarshJudge Setup Complete                     ║
╠══════════════════════════════════════════════════════════════╣
║ Environment:                                                  ║
║   • Node.js: v{version}                                       ║
║   • Package Manager: {npm|pnpm} v{version}                    ║
║                                                               ║
║ MCP Servers:                                                  ║
║   • @harshjudge/mcp-server: ✓ Configured                      ║
║   • Playwright MCP: ✓ Configured                              ║
║                                                               ║
║ Project:                                                      ║
║   • Name: {projectName}                                       ║
║   • Base URL: {baseUrl}                                       ║
║   • Config: .harshJudge/config.yaml                           ║
╠══════════════════════════════════════════════════════════════╣
║ Next Steps:                                                   ║
║   1. Run `/harshjudge:analyze` to analyze your project        ║
║   2. Run `/harshjudge:create` to create test scenarios        ║
║   3. Run `/harshjudge:run {scenario}` to execute tests        ║
╚══════════════════════════════════════════════════════════════╝
```

**Checkpoint:** ✓ Setup complete

---

## Troubleshooting

### Node.js Version Too Old

**Symptom:** Node.js version is below 18.0.0

**Resolution:**
1. Download Node.js 18+ from https://nodejs.org/
2. Or use nvm to install: `nvm install 18 && nvm use 18`
3. Verify: `node --version`

---

### MCP Server Not Found

**Symptom:** `npx @harshjudge/mcp-server` fails

**Resolution:**
1. Install globally: `npm install -g @harshjudge/mcp-server`
2. Or ensure npm registry is accessible
3. Check for proxy/firewall issues

**Diagnostic:**
```bash
npm config list
npm ping
```

---

### Playwright Not Installed

**Symptom:** Playwright MCP tools not available

**Resolution:**
1. Install Playwright MCP: `npm install -g @anthropic/mcp-playwright`
2. Run Playwright browser install: `npx playwright install chromium`
3. Update Claude Code MCP configuration

---

### Permission Errors

**Symptom:** Cannot create `.harshJudge/` directory

**Resolution:**
1. Check directory permissions: `ls -la .`
2. Ensure you have write access to project root
3. Try running with appropriate permissions

---

### Claude Code MCP Config Issues

**Symptom:** MCP tools not recognized in Claude Code

**Resolution:**
1. Locate config file:
   - macOS: `~/.claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/claude/claude_desktop_config.json`
2. Verify JSON syntax is valid
3. Restart Claude Code after config changes
4. Check Claude Code logs for errors

**Diagnostic:**
```bash
cat ~/.claude/claude_desktop_config.json | npx json-lint
```

---

## Checklist Reference

Execute `checklists/setup-checklist.md` for validation.

## Rules

- Complete all phases sequentially
- Stop on critical errors (Node.js, MCP server)
- Warn but continue on optional failures (Playwright)
- Always output final status summary
- Record all checkpoint results
