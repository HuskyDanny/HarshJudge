# HarshJudge

AI-native E2E testing orchestration for Claude Code. HarshJudge uses Claude Code skills and MCP tools to create, run, and manage end-to-end test scenarios with visual evidence capture.

## Quick Start

```bash
# 1. Install HarshJudge CLI globally
npm install -g @harshjudge/cli

# 2. Initialize in your project
cd your-project
harshjudge init

# 3. Configure Claude Code MCP (see below)

# 4. Start the dashboard
harshjudge dashboard
```

## Prerequisites

- **Node.js**: 18+ LTS
- **pnpm**: 8+ (for development)
- **Claude Code**: Latest version with MCP support
- **Playwright MCP Server**: For browser automation

## Installation

### Option 1: npm Install (Recommended)

```bash
npm install -g @harshjudge/cli
```

### Option 2: From Source

```bash
# Clone the repository
git clone https://github.com/your-org/HarshJudge.git
cd HarshJudge

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Link CLI globally
cd packages/cli
npm link
```

## Claude Code MCP Configuration

Add the following to your `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "harshjudge": {
      "command": "npx",
      "args": ["@harshjudge/mcp-server"],
      "env": {}
    },
    "playwright": {
      "command": "npx",
      "args": ["@anthropic/playwright-mcp-server"]
    }
  }
}
```

### MCP Server Configuration Options

| Server | Purpose | Required |
|--------|---------|----------|
| `harshjudge` | Test orchestration, scenario management, evidence capture | Yes |
| `playwright` | Browser automation for E2E testing | Yes |

## CLI Commands

### `harshjudge init`

Initialize HarshJudge in your project:

```bash
harshjudge init [options]

Options:
  --name <name>     Project name (default: from package.json)
  --url <url>       Base URL (default: http://localhost:3000)
  --skip-skills     Skip copying skills to .claude/skills/
```

This command:
1. Copies HarshJudge skills to `.claude/skills/harshjudge/`
2. Creates `.harshJudge/` directory with configuration
3. Sets up `.harshJudge/scenarios/` for test scenarios

### `harshjudge dashboard`

Start the HarshJudge dashboard server:

```bash
harshjudge dashboard [options]

Options:
  --port <port>     Port number (default: 3000)
  --no-open         Don't open browser automatically
```

### `harshjudge status`

Show project status:

```bash
harshjudge status [options]

Options:
  --json            Output as JSON
```

## Project Structure After Init

```
your-project/
├── .claude/
│   └── skills/
│       └── harshjudge/          # HarshJudge skills for Claude Code
│           ├── skill.yaml       # Skill definition
│           ├── tasks/           # Task definitions
│           ├── templates/       # Output templates
│           ├── checklists/      # Quality checklists
│           └── data/            # Reference data
├── .harshJudge/
│   ├── config.yaml              # Project configuration
│   ├── scenarios/               # Test scenarios
│   │   └── login-flow/          # Example scenario
│   │       ├── scenario.yaml    # Scenario definition
│   │       ├── meta.yaml        # Run statistics
│   │       └── runs/            # Run history with evidence
│   └── .gitignore               # Ignore large evidence files
└── ...
```

## Verification Steps

After installation, verify your setup:

1. **Check CLI installation:**
   ```bash
   harshjudge --version
   ```

2. **Verify project initialization:**
   ```bash
   harshjudge status
   ```

3. **Start dashboard:**
   ```bash
   harshjudge dashboard
   ```

4. **Test MCP in Claude Code:**
   - Open Claude Code in your project
   - Type `/harshjudge:status` to check skill activation
   - MCP tools should be available in Claude Code

## Troubleshooting

### Common Issues

#### "harshjudge: command not found"
```bash
# Ensure npm global bin is in PATH
npm config get prefix
# Add <prefix>/bin to your PATH
```

#### "MCP server not responding"
1. Check `.claude/mcp.json` syntax
2. Restart Claude Code
3. Verify `npx @harshjudge/mcp-server` runs manually

#### "Skills not loading"
1. Verify `.claude/skills/harshjudge/skill.yaml` exists
2. Check Claude Code skill settings
3. Run `harshjudge init` again if needed

#### "Dashboard won't start"
```bash
# Check if port is in use
lsof -i :3000
# Use different port
harshjudge dashboard --port 3001
```

### Getting Help

- Check logs in `.harshJudge/logs/` (if enabled)
- Run commands with `DEBUG=harshjudge:* harshjudge <command>`
- File issues at [GitHub Issues](https://github.com/your-org/HarshJudge/issues)

## Development

### Project Structure

```
HarshJudge/
├── packages/
│   ├── cli/           # @harshjudge/cli - Command line interface
│   ├── mcp-server/    # @harshjudge/mcp-server - MCP server
│   ├── ux/            # @harshjudge/ux - Dashboard UI
│   └── shared/        # @harshjudge/shared - Shared types
├── skills/
│   └── harshjudge/    # Skills source (copied during init)
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
pnpm --filter @harshjudge/cli build
pnpm --filter @harshjudge/mcp-server build
pnpm --filter @harshjudge/ux build
```

## License

Private - All rights reserved.
