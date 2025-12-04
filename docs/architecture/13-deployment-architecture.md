# 13. Deployment Architecture

## 13.1 Deployment Strategy

**Frontend Deployment:**
- **Platform:** npm package (@harshjudge/ux) + local server
- **Build Command:** `pnpm --filter @harshjudge/ux build`
- **Output Directory:** `packages/ux/dist/`
- **Serving:** `harshjudge dashboard` CLI command starts local server

**Backend (MCP) Deployment:**
- **Platform:** npm package (@harshjudge/mcp-server)
- **Build Command:** `pnpm --filter @harshjudge/mcp-server build`
- **Deployment Method:** npm publish, user installs globally or adds to Claude Code config

## 13.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

## 13.3 Release Workflow

```yaml
# .github/workflows/release.yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install
      - run: pnpm build
      - run: pnpm publish -r --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 13.4 Environments

| Environment | Purpose | Notes |
|-------------|---------|-------|
| Development | Local development | `pnpm dev` |
| CI | Automated testing | GitHub Actions |
| npm | Package distribution | @harshjudge/* packages |

---
