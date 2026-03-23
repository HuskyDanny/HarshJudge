# Browser Tool Reference

Used during step execution in [[run]].

HarshJudge is **browser-tool-agnostic**. Use whatever browser automation tool is available in your environment. The step agent needs these capabilities:

## Required Capabilities

| Action | What to do |
|--------|-----------|
| Navigate | Go to a URL |
| Inspect page | Get current page state (DOM, accessibility tree) before interacting |
| Click | Click an element by text, role, or reference |
| Type | Enter text into an input field |
| Select | Choose an option from a dropdown |
| Wait | Wait for text to appear/disappear, or for a timeout |
| Screenshot | Capture the current page as an image file |
| Console logs | Read browser console output |
| Network logs | Read network requests/responses |

## Supported Browser Tools

### Playwright MCP (Default)

Most common. Available as a Claude Code plugin.

```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

Tools: `browser_navigate`, `browser_click`, `browser_type`, `browser_snapshot`, `browser_take_screenshot`, `browser_wait_for`, `browser_console_messages`, `browser_network_requests`

### browser-use MCP (Token Efficient Alternative)

Compresses DOM before sending to LLM — significantly fewer tokens per interaction. Python-based.

Setup: See [browser-use MCP docs](https://docs.browser-use.com/customize/integrations/mcp-server)

### Chrome DevTools MCP

Connects to an already-running Chrome instance via remote debugging.

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": ["chrome-devtools-mcp"]
  }
}
```

## Best Practices

- Always inspect the page before clicking or typing to get current element state
- Take a screenshot **before** and **after** each significant action
- Wait after navigation to confirm the page loaded
- Capture console errors on unexpected behavior
- Save screenshots to a temp path, then record via `harshjudge evidence`
