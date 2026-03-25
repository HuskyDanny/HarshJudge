# Tool Reference by Step Type

Used during step execution in [[run]].

HarshJudge supports three step types. Use the tools appropriate to the step type.

## Frontend Steps

Use whatever browser automation tool is available in your environment.

### Required Capabilities

| Action | What to do |
|--------|-----------|
| Navigate | Go to a URL |
| Inspect | Get page state before interacting |
| Click | Click element by text/role/ref |
| Type | Enter text into input |
| Screenshot | Capture page as image file |
| Wait | Wait for text/element/timeout |
| Console | Read browser console output |

### Supported Browser Tools

**Playwright MCP** (default):
Tools: `browser_navigate`, `browser_click`, `browser_type`, `browser_snapshot`, `browser_take_screenshot`, `browser_wait_for`, `browser_console_messages`, `browser_network_requests`

**browser-use MCP** (token efficient):
See [browser-use MCP docs](https://docs.browser-use.com/customize/integrations/mcp-server)

**Chrome DevTools MCP:**
Tools: page navigation, DOM inspection, network monitoring via Chrome remote debugging

### Best Practices

- Inspect the page before clicking or typing
- Take a screenshot **before** and **after** each significant action
- Wait after navigation to confirm page loaded
- Capture console errors on unexpected behavior

## Backend Steps

Use Bash to make HTTP requests and query databases.

### HTTP Requests

```bash
# Using curl
curl -s -w "\n%{http_code}" -H "Content-Type: application/json" \
  -X POST http://localhost:3000/api/users \
  -d '{"name": "test"}' > /tmp/response.json

# Save response for evidence
harshjudge evidence <runId> --step 1 --type api_response --name create-user --data /tmp/response.json
```

### Database Queries

```bash
# PostgreSQL example
psql -h localhost -U user -d mydb -c "SELECT * FROM users WHERE email='test@example.com'" \
  --csv > /tmp/db-result.csv

harshjudge evidence <runId> --step 1 --type db_snapshot --name users-check --data /tmp/db-result.csv
```

### Best Practices

- Always capture the full response (status code + headers + body)
- Save responses to temp files, then record via `harshjudge evidence`
- For auth flows, chain requests (login → use token → verify)
- Check response schema, not just status code

## CLI Steps

Use Bash to run commands and capture output.

### Command Execution

```bash
# Run command and capture output
my-tool generate --config prod > /tmp/stdout.txt 2> /tmp/stderr.txt
echo $? > /tmp/exit-code.txt

# Record evidence
harshjudge evidence <runId> --step 1 --type stdout --name generate-output --data /tmp/stdout.txt
harshjudge evidence <runId> --step 1 --type exit_code --name generate-exit --data /tmp/exit-code.txt
```

### Best Practices

- Capture both stdout and stderr separately
- Always check exit code
- For long-running commands, use timeout
- Save output to temp files before recording evidence
