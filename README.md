# HarshJudge

AI-native E2E testing orchestration for Claude Code. Create, run, and manage end-to-end test scenarios with visual evidence capture — powered by a CLI tool and Claude Code skills.

**Key design:** file-system-as-database (local-first, git-friendly, no cloud dependencies).

## Architecture

```
Claude Code Skill  →  Bash  →  CLI  →  FileSystem
   (workflow)               (storage)
```

| Component | Description |
|-----------|-------------|
| **Skill** | Structured workflows that guide Claude through test creation, execution, and iteration |
| **CLI** | Commands for managing scenarios, runs, evidence, and dashboard lifecycle |
| **Dashboard** | React-based 3-column UI for browsing results with real-time file watching |

## Quick Start

```bash
# Install globally
npm install -g @allenpan2026/harshjudge

# Or run without installing
npx @allenpan2026/harshjudge --help

# Initialize HarshJudge in your project
harshjudge init my-app
```

## Prerequisites

- **Node.js**: 18+ LTS
- **Claude Code**: Latest version
- **Playwright MCP Server**: For browser automation (screenshots, navigation, clicks)

## Installation

### Global Install (Recommended)

```bash
npm install -g @allenpan2026/harshjudge
```

### Or use with npx (no install required)

```bash
npx @allenpan2026/harshjudge --help
```

## CLI Commands

| Command | Purpose |
|---------|---------|
| `harshjudge init <name>` | Initialize `.harshJudge/` directory structure |
| `harshjudge create <slug>` | Create test scenarios with structured step files |
| `harshjudge star <slug>` | Mark/unmark scenarios as favorites |
| `harshjudge start <slug>` | Begin a new test execution run |
| `harshjudge evidence <runId>` | Capture screenshots, logs, DB snapshots |
| `harshjudge complete-step <runId>` | Mark individual step as pass/fail/skipped |
| `harshjudge complete-run <runId>` | Finalize run and update scenario statistics |
| `harshjudge status [slug]` | Query project-wide or per-scenario status |
| `harshjudge discover tree [path]` | Browse `.harshJudge/` directory structure |
| `harshjudge discover search <pattern>` | Search file content within `.harshJudge/` |
| `harshjudge dashboard open` | Start the dashboard UI server |
| `harshjudge dashboard close` | Stop the dashboard server |
| `harshjudge dashboard status` | Check if dashboard is running |

## Usage with Claude Code

### 1. Install the Skill

Copy the `skills/harshjudge/` directory to your project:

```bash
cp -r skills/harshjudge/ .claude/skills/harshjudge/
```

### 2. Initialize Project

Ask Claude: *"Initialize HarshJudge in this project"*

This runs `harshjudge init` and creates the `.harshJudge/` structure with a config file, PRD template, and scenarios directory.

### 3. Create Test Scenarios

Use the HarshJudge skill: `/harshjudge`

Claude guides you through defining scenarios with steps. Each step includes:
- **Title** and description
- **Actions** to perform
- **Expected outcome** to verify

### 4. Run Tests

Claude orchestrates test execution using Playwright MCP for browser automation:
- Screenshots before/after every action
- Console and network logs
- Database snapshots (if configured)
- Each step tracked individually with pass/fail status

### 5. View Results

Use `harshjudge dashboard open` to launch the visual dashboard (default port 7002):
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

After installation, verify your setup:

1. **Check CLI is available** — `harshjudge --help` should list all commands
2. **Initialize project** — `harshjudge init my-app` in your project root
3. **Check status** — `harshjudge status`

## Troubleshooting

### "command not found: harshjudge"
1. Ensure global npm bin is in PATH: `npm bin -g`
2. Or use `npx @allenpan2026/harshjudge <command>`

### "Dashboard won't start"
```bash
# Check if port is in use
lsof -i :7002

# Use a different port
harshjudge dashboard open --port 7003
```

### "Project not initialized"
```bash
harshjudge init <project-name>
```

### Getting Help

- File issues at [GitHub Issues](https://github.com/HuskyDanny/HarshJudge/issues)

## Development

### Project Structure

```
HarshJudge/
├── src/
│   ├── cli.ts              # CLI entry point
│   ├── commands/           # Command implementations (init, create, run, etc.)
│   ├── handlers/           # Core business logic handlers
│   ├── services/           # FileSystemService, DashboardManager
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility helpers
├── skills/
│   └── harshjudge/         # Claude Code skill (5 workflow guides)
├── docs/                   # Architecture docs, PRD, user stories
├── tests/                  # Vitest test suite
└── examples/               # Demo projects
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Build** | tsup + pnpm |
| **Language** | TypeScript 5.3+, Node.js 18+ |
| **Validation** | Zod schemas |
| **Frontend** | React 18 + Tailwind CSS |
| **Testing** | Vitest |

### Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm build` | Build CLI and dashboard |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | TypeScript type checking |

### Publishing

```bash
# 1. Bump version in package.json
# 2. Build
pnpm build

# 3. Publish
npm publish --access public
```

## License

MIT License - See [LICENSE](LICENSE) for details.
