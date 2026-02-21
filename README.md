# HarshJudge

AI-native E2E testing orchestration for Claude Code. Create, run, and manage end-to-end test scenarios with visual evidence capture — powered by MCP tools and Claude Code skills.

**Key design:** file-system-as-database (local-first, git-friendly, no cloud dependencies).

## Architecture

```
Claude Code Skill  →  MCP Server  →  Dashboard UI
   (workflow)         (storage)      (visualization)
```

| Component | Description |
|-----------|-------------|
| **Skill** | Structured workflows that guide Claude through test creation, execution, and iteration |
| **MCP Server** | 12 tools for managing scenarios, runs, evidence, and dashboard lifecycle |
| **Dashboard** | React-based 3-column UI for browsing results with real-time file watching |

## Quick Start

```bash
# 1. Add the HarshJudge marketplace:
/plugin marketplace add HuskyDanny/harshjudge-marketplace

# 2. Install the plugin:
/plugin install harshjudge@harshjudge-marketplace

# 3. Ask Claude to set up testing:
# "Initialize HarshJudge and create a test for the login flow"
```

## Prerequisites

- **Node.js**: 18+ LTS
- **Claude Code**: Latest version with MCP support
- **Playwright MCP Server**: For browser automation (screenshots, navigation, clicks)

## Installation

### As Claude Code Plugin (Recommended)

Add the marketplace and install — includes the skill, MCP server, and everything you need:

```bash
/plugin marketplace add HuskyDanny/harshjudge-marketplace
/plugin install harshjudge@harshjudge-marketplace
```

The plugin auto-configures the MCP server and loads the HarshJudge skill.

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

## MCP Tools

| Tool | Purpose |
|------|---------|
| `initProject` | Initialize `.harshJudge/` directory structure |
| `createScenario` | Create test scenarios with structured step files |
| `toggleStar` | Mark/unmark scenarios as favorites |
| `startRun` | Begin a new test execution |
| `recordEvidence` | Capture screenshots, logs, DB snapshots |
| `completeStep` | Mark individual step as pass/fail/skipped |
| `completeRun` | Finalize run and update scenario statistics |
| `getStatus` | Query project-wide or per-scenario status |
| `openDashboard` | Start the dashboard UI server |
| `closeDashboard` | Stop the dashboard server |
| `getDashboardStatus` | Check if dashboard is running |
| `saveScenario` | *(deprecated)* Legacy flat markdown format |

## Usage with Claude Code

### 1. Initialize Project

Ask Claude: *"Initialize HarshJudge in this project"*

This calls `initProject` and creates the `.harshJudge/` structure with a config file, PRD template, and scenarios directory.

### 2. Create Test Scenarios

Use the HarshJudge skill: `/harshjudge`

Claude guides you through defining scenarios with steps. Each step includes:
- **Title** and description
- **Actions** to perform
- **Expected outcome** to verify

### 3. Run Tests

Claude orchestrates test execution using Playwright MCP for browser automation:
- Screenshots before/after every action
- Console and network logs
- Database snapshots (if configured)
- Each step tracked individually with pass/fail status

### 4. View Results

Use `openDashboard` to launch the visual dashboard (default port 7002):
- **3-column layout**: Projects → Scenarios → Detail
- **Real-time updates** via file watching
- **Evidence viewers**: screenshot timeline, log viewer, DB snapshots
- **Statistics**: pass rate, run history, average duration

## Data Structure

```
your-project/
└── .harshJudge/
    ├── config.yaml                 # Project configuration
    ├── prd.md                      # Product requirements
    ├── .gitignore                  # Excludes large evidence files
    └── scenarios/
        └── login-flow/             # Example scenario
            ├── meta.yaml           # Metadata + run statistics
            ├── steps/              # Individual step definitions
            │   ├── 01-navigate.md
            │   ├── 02-fill-form.md
            │   └── 03-verify.md
            └── runs/
                └── {runId}/
                    ├── result.json          # Run outcome
                    ├── step-01/
                    │   └── evidence/
                    │       ├── screenshot-before.png
                    │       ├── screenshot-before.meta.json
                    │       ├── screenshot-after.png
                    │       └── screenshot-after.meta.json
                    ├── step-02/evidence/...
                    └── step-03/evidence/...
```

## Verification

After installation, verify your setup in Claude Code:

1. **Check MCP tools are available** — HarshJudge tools should appear in Claude Code's tool list
2. **Initialize project** — Ask Claude: *"Initialize HarshJudge in this project"*
3. **Check status** — Ask Claude: *"What's the HarshJudge status?"*

## Troubleshooting

### "MCP server not responding"
1. Check Claude Code MCP settings syntax
2. Restart Claude Code
3. Verify `npx @allenpan2026/harshjudge-mcp` runs manually

### "Dashboard won't start"
```bash
# Check if port is in use
lsof -i :7002

# Use a different port via the openDashboard tool (port parameter)
```

### "Skills not loading"
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
│   ├── mcp-server/     # @allenpan2026/harshjudge-mcp (published to npm)
│   │   ├── src/
│   │   │   ├── server.ts        # MCP server entry (stdio transport)
│   │   │   ├── handlers/        # 12 tool implementations
│   │   │   ├── services/        # FileSystemService, DashboardManager
│   │   │   └── utils/
│   │   └── dist/                # Compiled output + bundled UX assets
│   ├── shared/         # @harshjudge/shared (types + Zod schemas)
│   │   └── src/types/           # config, scenario, run, evidence, status, mcp-tools
│   └── ux/             # @harshjudge/ux (React dashboard + HTTP server)
│       └── src/
│           ├── components/      # 22 React components
│           ├── server/          # DashboardServer, PathResolver
│           ├── hooks/           # 7 custom hooks
│           └── services/        # DataService, ApiDataService, FileWatcher
├── skills/
│   └── harshjudge/     # Claude Code skill (5 workflow guides)
├── docs/               # Architecture docs, PRD, user stories
└── examples/           # Demo projects
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Build** | Turborepo + pnpm + tsup (MCP) + Vite (UX) |
| **Language** | TypeScript 5.3+, Node.js 18+ |
| **Validation** | Zod schemas for all MCP tool params |
| **Frontend** | React 18 + Tailwind CSS |
| **Testing** | Vitest + React Testing Library + memfs |
| **Protocol** | MCP SDK 1.0 (stdio transport) |

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build all packages (Turborepo) |
| `pnpm dev` | Start development mode (watch) |
| `pnpm test` | Run all tests |
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
# 1. Bump version in packages/mcp-server/package.json and server.json
# 2. Build
pnpm build

# 3. Publish
cd packages/mcp-server && npm publish --access public
```

See [PUBLISHING.md](packages/mcp-server/PUBLISHING.md) for detailed workflow.

## License

MIT License - See [LICENSE](LICENSE) for details.
