# 16. Coding Standards

## 16.1 Critical Fullstack Rules

- **Type Sharing:** Always define types in `packages/shared` and import from `@harshjudge/shared`
- **File Operations:** All file operations go through `FileSystemService`, never direct `fs` calls in handlers
- **Path Safety:** Always use `path.join()`, never string concatenation for paths
- **Error Handling:** All handlers must catch errors and return structured error responses
- **Validation:** All MCP tool inputs must be validated with Zod before processing
- **No Side Effects:** Handlers should be pure functions with no global state

## 16.2 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| TypeScript Interfaces | PascalCase | `ScenarioMeta` |
| TypeScript Types | PascalCase | `EvidenceType` |
| Functions | camelCase | `handleInitProject` |
| React Components | PascalCase | `ProjectListPanel.tsx` |
| React Hooks | camelCase with 'use' | `useProjects.ts` |
| File Names | kebab-case | `file-system-service.ts` |
| Directory Names | kebab-case | `mcp-server/` |
| MCP Tool Names | camelCase | `initProject`, `saveScenario` |
| YAML Keys | camelCase | `projectName`, `baseUrl` |
| CSS Classes | kebab-case (Tailwind) | `bg-gray-800` |

---
