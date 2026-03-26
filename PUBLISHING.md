# Publishing & Updating HarshJudge

## Publish a New Version

```bash
# 1. Bump version in TWO files
#    - .claude-plugin/plugin.json → "version"
#    - .claude-plugin/marketplace.json → plugins[0].version

# 2. Build
pnpm build

# 3. Commit everything (including dist/) → PR → MERGE
git checkout -b chore/bump-X.Y.Z
git add .claude-plugin/ dist/ package.json
git commit -m "chore: bump version to X.Y.Z"
git push -u origin chore/bump-X.Y.Z
gh pr create --title "chore: bump version to X.Y.Z" --body "Built and ready"
gh pr merge --merge
```

That's it. No npm publish needed.

> **Order matters:** `plugin.json` version in git main must match `marketplace.json` version, or `/plugin update` reports "already at latest."

## Version Files

| File | Purpose |
|------|---------|
| `.claude-plugin/plugin.json` | Version Claude Code reads from git clone |
| `.claude-plugin/marketplace.json` | Version that triggers update check |

Both must match. `package.json` version is optional (only matters if you also publish to npm).

## Client Update Instructions

```
/plugin marketplace update harshjudge-marketplace
/plugin update harshjudge@harshjudge-marketplace
/reload-plugins
```

## First-Time Install

```
/plugin marketplace add HuskyDanny/HarshJudge
/plugin install harshjudge@harshjudge-marketplace
/reload-plugins
```

## How It Works

```
marketplace.json (in this repo)  ← triggers update check
    ↓
plugin.json (in this repo)       ← version read from git clone
    ↓
~/.claude/plugins/cache/         ← cloned copy (skills + dist/ + manifest)
    ↓
dist/cli.js                      ← CLI runs directly from cache (no npm)
dist/dashboard-worker.js         ← dashboard server
dist/ux-dist/                    ← dashboard UI
```

Everything comes from git. No npm, no npx, no separate download.
