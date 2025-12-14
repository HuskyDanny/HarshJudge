# HarshJudge

AI-native E2E testing orchestration for Claude Code.

## Key References

| Doc | Purpose |
|-----|---------|
| [README.md](README.md) | Project overview, installation |
| [packages/mcp-server/PUBLISHING.md](packages/mcp-server/PUBLISHING.md) | npm publish workflow |
| [docs/architecture/](docs/architecture/) | System design |
| [docs/prd/](docs/prd/) | Product requirements |
| [skills/harshjudge/](skills/harshjudge/) | Claude Code skill files |

## Quick Commands

```bash
# Dev
pnpm install && pnpm build

# Publish
cd packages/mcp-server && npm publish --access public
```

## Structure

```
packages/
  mcp-server/     # MCP tools (@allenpan/harshjudge-mcp)
  shared/         # Shared types
  ux/             # Dashboard UI
skills/
  harshjudge/     # Claude Code skill
```
