# Publishing Guide for @allenpan/harshjudge-mcp

This document describes how to publish the HarshJudge MCP server to npm and the MCP Registry.

## Prerequisites

1. **npm access**: You need publish access to the `@allenpan` npm organization
2. **mcp-publisher CLI**: Install via Homebrew or download binary
3. **GitHub authentication**: For MCP Registry publishing

## Step 1: Build the Package

```bash
cd packages/mcp-server
pnpm build
```

Verify the build:
```bash
npm pack --dry-run
```

Expected output:
```
📦 @allenpan/harshjudge-mcp@0.1.1
  dist/server.js, dist/index.js, LICENSE, README.md, package.json
```

## Step 2: Publish to npm

```bash
# Login to npm (if not already)
npm login

# Publish (first time - creates the package)
npm publish --access public

# Or dry-run first
npm publish --access public --dry-run
```

## Step 3: Publish to MCP Registry

### Install mcp-publisher

**Homebrew (macOS/Linux/WSL):**
```bash
brew install mcp-publisher
```

**Pre-built binary:**
```bash
curl -L "https://github.com/modelcontextprotocol/registry/releases/download/v1.0.0/mcp-publisher_1.0.0_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher && sudo mv mcp-publisher /usr/local/bin/
```

### Authenticate with GitHub

```bash
mcp-publisher login github
```

This opens a browser for OAuth authentication. You must authenticate with GitHub to publish to `io.github.allenpan/*` namespace.

### Publish to Registry

```bash
cd packages/mcp-server
mcp-publisher publish
```

Expected output:
```
✓ Successfully published io.github.allenpan/harshjudge@0.1.1
```

### Verify Publication

```bash
curl "https://registry.modelcontextprotocol.io/v0/servers?search=io.github.allenpan/harshjudge"
```

## Configuration Files

### package.json (key fields)

```json
{
  "name": "@allenpan/harshjudge-mcp",
  "version": "0.1.1",
  "mcpName": "io.github.allenpan/harshjudge",
  ...
}
```

The `mcpName` field links the npm package to the MCP Registry entry.

### server.json

```json
{
  "$schema": "https://static.modelcontextprotocol.io/schemas/2025-07-09/server.schema.json",
  "name": "io.github.allenpan/harshjudge",
  "description": "AI-native E2E testing orchestration MCP server...",
  "version": "0.1.1",
  "packages": [
    {
      "registry_type": "npm",
      "identifier": "@allenpan/harshjudge-mcp",
      "version": "0.1.1"
    }
  ]
}
```

## Version Bump Workflow

When releasing a new version:

1. Update version in `package.json`
2. Update version in `server.json` (both `version` and `packages[0].version`)
3. Build: `pnpm build`
4. Publish to npm: `npm publish --access public`
5. Publish to MCP Registry: `mcp-publisher publish`

## Troubleshooting

### "Package validation failed"
- Ensure `mcpName` in package.json matches `name` in server.json
- Verify the npm package is published before running `mcp-publisher publish`

### "Namespace not authorized"
- Run `mcp-publisher login github` and authenticate with your GitHub account (`allenpan`)

### "Version already exists"
- Bump the version in both `package.json` and `server.json`
