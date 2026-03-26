# Publishing & Updating HarshJudge

## Publish a New Version

```bash
# 1. Bump version in both files
#    - package.json → "version"
#    - .claude-plugin/plugin.json → "version"

# 2. Build & test
pnpm build:cli && pnpm test

# 3. Publish to npm
npm publish --access public

# 4. Commit version bump → PR → MERGE TO MAIN
#    ⚠ MUST merge before updating marketplace — plugin installs from git main
git checkout -b chore/bump-X.Y.Z
git add package.json .claude-plugin/plugin.json
git commit -m "chore: bump version to X.Y.Z"
git push -u origin chore/bump-X.Y.Z
gh pr create --title "chore: bump version to X.Y.Z" --body "npm published"
gh pr merge --merge

# 5. Update marketplace repo (AFTER PR is merged)
cd /tmp && git clone https://github.com/HuskyDanny/harshjudge-marketplace.git
# Edit .claude-plugin/marketplace.json → bump version
git commit -am "chore: bump to X.Y.Z" && git push
```

> **Order matters:** The plugin installs from git main, not npm. If you update the marketplace before merging the version bump PR, `/plugin update` will see the old version and report "already at latest".

## npm Authentication

Uses a **Classic Automation Token** (bypasses 2FA/OTP):

```bash
npm config set //registry.npmjs.org/:_authToken=npm_YOUR_TOKEN
```

Create at: https://www.npmjs.com/settings/allenpan2026/tokens → Classic → Automation

## Client Update Instructions

Users update the plugin in Claude Code:

```
/plugin marketplace update harshjudge-marketplace
/plugin update harshjudge@harshjudge-marketplace
/reload-plugins
```

## First-Time Install

```
/plugin marketplace add HuskyDanny/harshjudge-marketplace
/plugin install harshjudge@harshjudge-marketplace
/reload-plugins
```

## How It Works

- **Plugin** installs from git (skills + plugin manifest)
- **CLI** runs via `npx @allenpan2026/harshjudge@latest` (downloads built package from npm)
- Marketplace repo (`HuskyDanny/harshjudge-marketplace`) points to the main repo
