# @allenpan/harshjudge-mcp

AI-native E2E testing orchestration MCP server for Claude Code.

## Installation

```bash
npm install -g @allenpan/harshjudge-mcp
```

Or use with npx:

```bash
npx @allenpan/harshjudge-mcp
```

## Claude Code Configuration

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "harshjudge": {
      "command": "npx",
      "args": ["@allenpan/harshjudge-mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@anthropic/playwright-mcp-server"]
    }
  }
}
```

## MCP Tools

| Tool | Purpose |
|------|---------|
| `initProject` | Initialize HarshJudge in your project |
| `saveScenario` | Save a test scenario |
| `startRun` | Start a new test run |
| `recordEvidence` | Record test evidence |
| `completeRun` | Complete a test run |
| `getStatus` | Get project/scenario status |
| `openDashboard` | Start dashboard UI |
| `closeDashboard` | Stop dashboard |
| `getDashboardStatus` | Check dashboard status |

## Usage

```bash
# In Claude Code
> Initialize HarshJudge in this project
> Create a login test scenario
> Run the login-flow scenario
```

## Documentation

- [Full documentation](https://github.com/HuskyDanny/HarshJudge)
- [Claude Code Skills](https://github.com/HuskyDanny/HarshJudge/tree/main/skills/harshjudge)

## License

MIT
