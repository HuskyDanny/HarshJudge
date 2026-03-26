# Publishing & Updating HarshJudge

## Publish a New Version

```bash
# 1. Bump version in THREE files
#    - package.json → "version"
#    - .claude-plugin/plugin.json → "version"
#    - .claude-plugin/marketplace.json → plugins[0].version

# 2. Build & test
pnpm build:cli && pnpm test

# 3. Publish to npm
npm publish --access public

# 4. Commit version bump → PR → MERGE TO MAIN
git checkout -b chore/bump-X.Y.Z
git add package.json .claude-plugin/plugin.json .claude-plugin/marketplace.json
git commit -m "chore: bump version to X.Y.Z"
git push -u origin chore/bump-X.Y.Z
gh pr create --title "chore: bump version to X.Y.Z" --body "npm published"
gh pr merge --merge
```

> **Order matters:** The plugin installs from git main. `plugin.json` version in the clone must match `marketplace.json` version, or `/plugin update` reports "already at latest."

## Three Version Files

| File | Purpose |
|------|---------|
| `package.json` | npm package version |
| `.claude-plugin/plugin.json` | Version Claude Code reads from git clone |
| `.claude-plugin/marketplace.json` | Version that triggers update check |

All three must match.

## npm Authentication

Uses a **Classic Automation Token** (bypasses 2FA/OTP):

```bash
npm config set //registry.npmjs.org/:_authToken=npm_YOUR_TOKEN
```

Create at: https://www.npmjs.com/settings/allenpan2026/tokens → Classic → Automation

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
marketplace.json (in this repo)     ← triggers update check
    ↓
plugin.json (in this repo)          ← version Claude Code reads from git clone
    ↓
~/.claude/plugins/cache/            ← cloned copy of this repo (skills + manifest)

npx @allenpan2026/harshjudge@latest ← CLI binary from npm (separate)
```

- **Plugin** installs from git (skills + plugin manifest) — single repo
- **CLI** runs via `npx` from npm (built `dist/` not in git)
