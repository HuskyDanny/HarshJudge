# HarshJudge

AI-native E2E testing orchestration for Claude Code.

## Key References

| Doc | Purpose |
|-----|---------|
| [README.md](README.md) | Project overview, installation |
| [docs/architecture/](docs/architecture/) | System design |
| [docs/prd/](docs/prd/) | Product requirements |
| [skills/harshjudge/](skills/harshjudge/) | Claude Code skill files |

## Quick Commands

```bash
# Dev
pnpm install && pnpm build

# Run CLI
node dist/cli.js --help
```

## Structure

```
src/
  cli.ts            # CLI entry point
  commands/         # CLI command implementations
  handlers/         # Core logic handlers
  services/         # FileSystemService, DashboardManager
  types/            # TypeScript types
  utils/            # Utility functions
skills/
  harshjudge/       # Claude Code skill
```
