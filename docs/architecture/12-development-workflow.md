# 12. Development Workflow

## 12.1 Local Development Setup

### Prerequisites
```bash
# Required
node --version  # v18+ required
pnpm --version  # v8+ recommended

# Verify Claude Code
claude --version
```

### Initial Setup
```bash
# Clone repository
git clone https://github.com/harshjudge/harshjudge.git
cd harshjudge

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development Commands
```bash
# Start all services (MCP server + dashboard dev server)
pnpm dev

# Start dashboard only
pnpm --filter @harshjudge/ux dev

# Build all packages
pnpm build

# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck
```

## 12.2 Environment Configuration

### Required Environment Variables
```bash
# No environment variables required for development
# HarshJudge is local-only

# Optional: Dashboard port (default 5173)
VITE_PORT=5173

# Optional: Dashboard base path for .harshJudge discovery
VITE_BASE_PATH=.
```

## 12.3 MCP Server Testing

```bash
# Test MCP server locally with npx
npx @harshjudge/mcp-server

# Or link locally for development
cd packages/mcp-server
pnpm link --global

# Then use in Claude Code config
```

---
