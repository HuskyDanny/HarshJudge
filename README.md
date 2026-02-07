# HarshJudge

AI-native E2E testing orchestration for Claude Code. HarshJudge uses Claude Code skills and MCP tools to create, run, and manage end-to-end test scenarios with visual evidence capture.

## Quick Start

```bash
# In Claude Code, install the plugin:
/plugin install @HuskyDanny/HarshJudge

# Then ask Claude to set up testing:
# "Initialize HarshJudge and create a test for the login flow"
```

## Prerequisites

- **Node.js**: 18+ LTS
- **Claude Code**: Latest version with MCP support
- **Playwright MCP Server**: For browser automation

## Installation

### As Claude Code Plugin (Recommended)

Install directly from GitHub — includes the skill, MCP server, and everything you need:

```bash
/plugin install @HuskyDanny/HarshJudge
```

That's it. The plugin auto-configures the MCP server and loads the HarshJudge skill.

### Manual Install

If you prefer to configure things yourself:

```bash
npm install -g @allenpan2026/harshjudge-mcp
```

Or use with npx (no install required):

```bash
npx @allenpan2026/harshjudge-mcp
```

Then add the MCP server to your Claude Code settings:

```json
{
  "mcpServers": {
    "harshjudge": {
      "command": "npx",
      "args": ["-y", "@allenpan2026/harshjudge-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic/playwright-mcp-server"]
    }
  }
}
```

### MCP Tools Available

| Tool | Purpose |
|------|---------|
| `initProject` | Initialize HarshJudge in your project |
| `saveScenario` | Save a test scenario |
| `startRun` | Start a new test run |
| `recordEvidence` | Record test evidence (screenshots, logs, etc.) |
| `completeRun` | Complete a test run with results |
| `getStatus` | Get project and scenario status |
| `openDashboard` | Start the dashboard UI server |
| `closeDashboard` | Stop the dashboard server |
| `getDashboardStatus` | Check dashboard running status |

## Usage with Claude Code

### 1. Initialize Project

In Claude Code, the `initProject` MCP tool creates the HarshJudge structure:

```
your-project/
├── .harshJudge/
│   ├── config.yaml              # Project configuration
│   ├── scenarios/               # Test scenarios
│   └── .dashboard-state.json    # Dashboard process state
└── ...
```

### 2. Create Test Scenarios

Use the HarshJudge skill in Claude Code:
- `/harshjudge` - Activates the testing skill
- Claude will guide you through creating scenarios

### 3. Run Tests

Claude Code with Playwright MCP executes tests and records evidence:
- Screenshots at each step
- Console logs
- Network activity
- Database snapshots (if configured)

### 4. View Results

Use `openDashboard` tool to launch the visual dashboard:
- 3-column layout: Scenarios | Runs | Evidence
- Real-time updates
- Screenshot timeline viewer

## Project Structure After Init

```
your-project/
├── .harshJudge/
│   ├── config.yaml              # Project configuration
│   ├── scenarios/               # Test scenarios
│   │   └── login-flow/          # Example scenario
│   │       ├── scenario.md      # Scenario definition
│   │       ├── meta.yaml        # Run statistics
│   │       └── runs/            # Run history with evidence
│   │           └── run_abc123/
│   │               ├── result.json
│   │               └── evidence/
│   │                   ├── step-1-screenshot.png
│   │                   └── step-1-screenshot.meta.json
│   └── .gitignore               # Ignore large evidence files
└── ...
```

## Verification Steps

After configuration, verify your setup in Claude Code:

1. **Check MCP tools are available:**
   - HarshJudge tools should appear in Claude Code's tool list

2. **Initialize project:**
   - Ask Claude: "Initialize HarshJudge in this project"
   - This calls `initProject` and optionally opens the dashboard

3. **Check status:**
   - Ask Claude: "What's the HarshJudge status?"
   - This calls `getStatus` to show scenarios and results

## Troubleshooting

### Common Issues

#### "MCP server not responding"
1. Check Claude Code MCP settings syntax
2. Restart Claude Code
3. Verify `npx @allenpan2026/harshjudge-mcp` runs manually

#### "Dashboard won't start"
```bash
# Check if port is in use
netstat -ano | grep 7002

# Use different port via MCP tool
# openDashboard with port: 7003
```

#### "Skills not loading"
1. Verify the plugin is installed: `/plugin list` should show `harshjudge`
2. Restart Claude Code after plugin installation
3. For manual installs, copy the `skills/` directory to your project

### Getting Help

- File issues at [GitHub Issues](https://github.com/HuskyDanny/HarshJudge/issues)

## Development

### Project Structure

```
HarshJudge/
├── packages/
│   ├── mcp-server/    # @allenpan2026/harshjudge-mcp - MCP server (published)
│   ├── ux/            # Dashboard UI (bundled into mcp-server)
│   └── shared/        # Shared types (bundled into mcp-server)
├── skills/
│   └── harshjudge/    # Claude Code skills (for reference/copying)
├── docs/              # Documentation
└── examples/          # Example projects
```

### Development Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Start development mode |
| `pnpm test` | Run tests |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm clean` | Clean build artifacts |

### Building Individual Packages

```bash
pnpm --filter @allenpan2026/harshjudge-mcp build
pnpm --filter @harshjudge/ux build
pnpm --filter @harshjudge/shared build
```

### Publishing

```bash
cd packages/mcp-server
npm publish
```

## License

MIT License - See [LICENSE](LICENSE) for details.
