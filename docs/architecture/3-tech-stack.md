# 3. Tech Stack

## 3.1 Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| **Shared Language** | TypeScript | 5.3+ | Type safety across all packages | Strong typing, better DX, catch errors at compile time |
| **Runtime** | Node.js | 18+ LTS | MCP server and build tools | Native fetch, stable ESM, long-term support |
| **Package Manager** | pnpm | 8+ | Dependency management | Fast, disk-efficient, excellent monorepo support |
| **Monorepo** | Turborepo | 2.0+ | Build orchestration | Fast caching, parallel execution, simple config |
| **MCP SDK** | @modelcontextprotocol/sdk | latest | MCP protocol implementation | Official Anthropic SDK for tool registration |
| **Frontend Framework** | React | 18+ | Dashboard UI | Component model, hooks, mature ecosystem |
| **Build Tool** | Vite | 5+ | Frontend bundling and dev server | Fast HMR, modern defaults, excellent DX |
| **Styling** | TailwindCSS | 3.4+ | Utility-first CSS | Rapid development, dark mode support, small bundle |
| **YAML Parsing** | js-yaml | 4+ | Config and meta file handling | Standard, well-maintained, TypeScript support |
| **Markdown Parsing** | marked | 11+ | Scenario file rendering | Fast, extensible, GFM support |
| **File Watching** | chokidar | 3+ | Dashboard live updates | Cross-platform, reliable, efficient |
| **ID Generation** | nanoid | 5+ | Run IDs | Fast, URL-safe, no dependencies |
| **Schema Validation** | zod | 3+ | Input validation | Runtime validation, TypeScript inference |
| **Unit Testing** | Vitest | 1+ | Unit and integration tests | Fast, TypeScript-native, Vite-compatible |
| **Linting** | ESLint | 8+ | Code quality | Industry standard, extensive plugin ecosystem |
| **Formatting** | Prettier | 3+ | Code formatting | Consistent style, integrates with ESLint |

## 3.2 Notable Exclusions

| Not Included | Reason |
|--------------|--------|
| Playwright | Handled by external Playwright MCP |
| Database ORM | No database - file-system storage |
| Auth Library | No authentication required - local only |
| State Management (Redux, etc.) | React hooks sufficient for dashboard |
| CSS-in-JS | TailwindCSS covers all styling needs |
| Backend Framework (Express, etc.) | MCP SDK handles all server needs |

---
