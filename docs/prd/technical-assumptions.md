# Technical Assumptions

## Repository Structure: Monorepo

**Decision:** Single monorepo containing all project packages

**Rationale:**
- Shared TypeScript types between MCP server, UX dashboard, and skills
- Simplified dependency management and versioning
- Easier local development with cross-package imports
- Single CI/CD pipeline for the entire project

**Package Structure:**
```
HarshJudge/
├── packages/
│   ├── mcp-server/     # Lightweight MCP server (file operations)
│   ├── ux/             # Vite + React dashboard
│   └── shared/         # TypeScript interfaces, utilities
├── skills/
│   └── harshjudge/     # Claude skill files
│       ├── skill.md
│       ├── setup.md
│       ├── analyze.md
│       ├── create.md
│       ├── run.md
│       └── status.md
└── turbo.json
```

## Service Architecture: Skill + Lightweight MCP + Dashboard

**Decision:** Three-component architecture with clear separation of concerns

**Components:**
1. **Claude Skill** — Structured prompts that guide Claude's behavior for testing workflows
2. **MCP Server** — Lightweight file operations only; data tunnel to filesystem
3. **Dashboard** — React app that reads filesystem; no write capabilities

**Rationale:**
- Leverages existing Playwright MCP for browser automation (no duplication)
- Leverages Claude's native code understanding (no analysis engine needed)
- Single responsibility per component
- Minimal codebase to maintain

**Communication:**
- Claude Code ↔ MCP Server: MCP protocol (stdio)
- Claude Code ↔ Playwright MCP: Direct (Claude calls Playwright tools)
- Dashboard ↔ File System: Direct file reads + chokidar watchers
- No inter-service HTTP APIs required

## Testing Requirements: Unit + Integration

**Decision:** Unit tests for MCP tools, integration tests for complete workflows

**Test Strategy:**
- **Unit Tests:** MCP tool handlers, file operations, validation logic
- **Integration Tests:** Complete skill workflows, file system operations
- **Manual Testing:** Skill execution with Claude Code

**Framework Choices:**
- **Test Runner:** Vitest (fast, TypeScript-native, Vite-compatible)
- **Assertion Library:** Vitest built-in
- **Mocking:** Vitest mocking for file system operations

**Coverage Targets:**
- Unit: 80%+ coverage on MCP tools and utilities
- Integration: All 6 MCP tools have happy path + error case coverage

## Additional Technical Assumptions

**Language & Runtime:**
- **TypeScript:** Strict mode across all packages
- **Node.js 18+ LTS:** Required for native fetch, stable ESM
- **ES Modules:** Use ESM throughout

**Key Libraries:**

| Purpose | Library | Rationale |
|---------|---------|-----------|
| MCP Protocol | `@modelcontextprotocol/sdk` | Official Anthropic SDK |
| UX Framework | `react` + `vite` | Fast dev experience, modern tooling |
| Styling | `tailwindcss` | Utility-first, matches developer aesthetic |
| YAML Parsing | `js-yaml` | Standard, well-maintained |
| Markdown Parsing | `marked` | Fast, extensible |
| File Watching | `chokidar` | Cross-platform, reliable |
| ID Generation | `nanoid` | Fast, URL-safe IDs |
| Schema Validation | `zod` | Runtime validation for inputs |

**Prerequisites:**
- Playwright MCP for browser automation
- Database tools for DB verification (optional)

---
