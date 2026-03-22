# Publishing & Updating HarshJudge

## Publish a New Version

```bash
# 1. Bump version in both files
#    - package.json → "version"
#    - .claude-plugin/plugin.json → "version"

# 2. Build & test
pnpm build:cli && pnpm test

# 3. Commit & push
git add package.json .claude-plugin/plugin.json
git commit -m "chore: bump version to X.Y.Z"
git push

# 4. Publish to npm
npm publish --access public

# 5. Update marketplace repo
cd /tmp && git clone https://github.com/HuskyDanny/harshjudge-marketplace.git
# Edit .claude-plugin/marketplace.json → bump version
git commit -am "chore: bump to X.Y.Z" && git push
```

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
