# Playwright Tools Reference

Used during step execution in [[run]].

## Navigation & State

| Tool | Usage |
|------|-------|
| `browser_navigate` | `{ "url": "http://localhost:3000" }` |
| `browser_snapshot` | `{}` → Returns accessibility tree with refs |
| `browser_take_screenshot` | `{ "filename": "step-01-before.png" }` |

## Interactions

| Tool | Usage |
|------|-------|
| `browser_click` | `{ "element": "Login button", "ref": "e5" }` |
| `browser_type` | `{ "element": "Email input", "ref": "e4", "text": "test@example.com" }` |
| `browser_select_option` | `{ "element": "Country", "ref": "e7", "values": ["USA"] }` |

## Waiting

| Tool | Usage |
|------|-------|
| `browser_wait_for` | `{ "text": "Welcome" }` |
| `browser_wait_for` | `{ "textGone": "Loading..." }` |
| `browser_wait_for` | `{ "time": 2 }` |

## Debugging

| Tool | Usage |
|------|-------|
| `browser_console_messages` | `{ "level": "error" }` |
| `browser_network_requests` | `{}` |

## Best Practices

- Always call `browser_snapshot` before `browser_click` or `browser_type` to get current element refs
- Take a screenshot **before** and **after** each significant action
- Use `browser_wait_for` after navigation to confirm page loaded
- Capture console errors on any unexpected behavior
