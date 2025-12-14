# Publishing @allenpan/harshjudge-mcp

## Quick Publish (One Command)

```bash
cd packages/mcp-server
npm publish --access public
```

> **Note**: Requires automation token with 2FA bypass. Set via:
> ```bash
> npm config set //registry.npmjs.org/:_authToken=YOUR_TOKEN
> ```

## Full Workflow

### 1. Bump Version
```bash
# Edit packages/mcp-server/package.json "version" field
# Edit packages/mcp-server/server.json "version" + "packages[0].version"
```

### 2. Commit & Push
```bash
git add -A && git commit -m "chore(mcp): bump version to X.Y.Z" && git push
```

### 3. Publish to npm
```bash
cd packages/mcp-server
npm publish --access public
```

### 4. Publish to MCP Registry (optional)
```bash
mcp-publisher publish
```

## npm Authentication

Your account has 2FA enabled. Use an **Automation token**:

1. Go to https://www.npmjs.com/settings/allenpan/tokens
2. Create token: Type = "Automation" (bypasses 2FA)
3. Set token:
   ```bash
   npm config set //registry.npmjs.org/:_authToken=npm_xxxxx
   ```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 2FA required | Use automation token (see above) |
| Version exists | Bump version in package.json + server.json |
| Namespace not authorized | `mcp-publisher login github` |
