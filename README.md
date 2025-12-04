# HarshJudge

An MCP-based testing and validation framework with a modern UX interface.

## Prerequisites

- **Node.js**: 18+ LTS
- **pnpm**: 8+

## Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Project Structure

```
HarshJudge/
├── packages/
│   ├── mcp-server/     # @harshjudge/mcp-server - MCP server implementation
│   ├── ux/             # @harshjudge/ux - User interface components
│   └── shared/         # @harshjudge/shared - Shared utilities and types
├── package.json        # Root workspace configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
├── turbo.json          # Turborepo build orchestration
├── tsconfig.base.json  # Base TypeScript configuration
└── tsconfig.json       # TypeScript project references
```

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Start development mode with watch |
| `pnpm test` | Run tests across all packages |
| `pnpm lint` | Run ESLint on all packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm clean` | Clean build artifacts and node_modules |
| `pnpm format` | Format code with Prettier |

## Package Development

Each package can be built independently:

```bash
# Build shared package
pnpm --filter @harshjudge/shared build

# Build MCP server
pnpm --filter @harshjudge/mcp-server build

# Build UX package
pnpm --filter @harshjudge/ux build
```

## License

Private - All rights reserved.
