# Playwright MCP Tools Reference

## Current Page

The Playwright MCP server maintains a single browser session with one or more tabs. The "current page" is the active tab that all tools operate on.

### Page Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│  No page         browser_navigate(url)        Page loaded   │
│  (about:blank)  ─────────────────────────►   (your URL)     │
│                                                             │
│                  browser_close()                            │
│  Page loaded    ◄─────────────────────────   No page        │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Tools

| Tool                  | Purpose                       |
|-----------------------|-------------------------------|
| browser_navigate      | Go to a URL                   |
| browser_navigate_back | Go back (browser history)     |
| browser_snapshot      | Check current page state      |
| browser_tabs          | List/switch/create/close tabs |
| browser_close         | Close current page            |

---

## browser_snapshot

Captures an accessibility snapshot of the current page. This is the preferred method for obtaining page state and element references for subsequent interactions (better than screenshots).

### Parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| filename  | string | No       | Save snapshot to markdown file instead of returning it in the response. Note: Currently broken - creates empty files |

### Returns

| Field                | Description |
|----------------------|-------------|
| Ran Playwright code  | The actual Playwright command executed |
| New console messages | Any new console logs since last snapshot (with level: ERROR, WARNING, INFO, DEBUG) |
| Page URL             | Current page URL |
| Page Title           | Document title |
| Page Snapshot        | YAML accessibility tree with [ref=eN] annotations |

### Output Format

```
### Page state
- Page URL: http://localhost:3000/
- Page Title: My App
- Page Snapshot:
```yaml
- generic [ref=e2]:
  - heading "Welcome" [level=1] [ref=e3]
  - textbox "Username" [ref=e4]:
    - /placeholder: your_username
  - button "Submit" [ref=e5] [cursor=pointer]
```

### Element Annotations

| Annotation       | Meaning |
|------------------|---------|
| [ref=eN]         | Unique element reference for interaction (e.g., e1, e2, e18) |
| [level=N]        | Heading level (1-6) |
| [cursor=pointer] | Element is clickable |
| [disabled]       | Element is disabled |
| [checked]        | Checkbox/radio is checked |
| [selected]       | Option is selected |
| [required]       | Field is required |
| [active]         | Element has focus |
| /placeholder:    | Input placeholder text |
| /url:            | Link destination URL |

### Element Roles

Common roles in the snapshot:

| Role        | HTML Element                    |
|-------------|---------------------------------|
| generic     | <div>, <span> containers        |
| heading     | <h1>-<h6>                       |
| paragraph   | <p>                             |
| button      | <button>, <input type="button"> |
| link        | <a>                             |
| textbox     | <input type="text">, <textarea> |
| combobox    | <select>, autocomplete inputs   |
| checkbox    | <input type="checkbox">         |
| radio       | <input type="radio">            |
| list        | <ul>, <ol>                      |
| listitem    | <li>                            |
| navigation  | <nav>                           |
| main        | <main>                          |
| search      | <search>, search landmarks      |
| img         | <img>                           |
| contentinfo | <footer>                        |

### Usage Example

```
// 1. Take snapshot
browser_snapshot()

// 2. Read refs from output, e.g., textbox "Username" [ref=e4]

// 3. Interact using refs
browser_type(ref="e4", element="Username textbox", text="myuser")
browser_click(ref="e5", element="Submit button")

// 4. Snapshot again to verify result
browser_snapshot()
```

---

## browser_take_screenshot

Captures a visual screenshot of the current page.

### Parameters

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| filename  | string  | No       | File name to save (defaults to `page-{timestamp}.png`) |
| fullPage  | boolean | No       | Capture full scrollable page vs viewport |
| type      | string  | No       | Image format: "png" (default) or "jpeg" |
| element   | string  | No       | Element description to screenshot |
| ref       | string  | No       | Element ref to screenshot |

### Returns

Base64-encoded image data or file path if filename specified.

---

## browser_console_messages

Returns all console messages from the current page.

### Parameters

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| level     | string | No       | Minimum level: "error", "warning", "info" (default), "debug" |

### Returns

Array of console messages with levels.

---

## browser_network_requests

Returns all network requests since page load.

### Parameters

| Parameter     | Type    | Required | Description |
|---------------|---------|----------|-------------|
| includeStatic | boolean | No       | Include static resources (images, fonts, etc). Default: false |

### Returns

Array of network requests with URLs, methods, status codes.

---

## Action Tools

### browser_navigate

Navigate to a URL.

```json
{ "url": "http://localhost:3000" }
```

### browser_click

Click an element using ref from snapshot.

```json
{
  "element": "Submit button",
  "ref": "e5"
}
```

### browser_type

Type text into an input element.

```json
{
  "element": "Username textbox",
  "ref": "e4",
  "text": "myuser",
  "submit": false
}
```

### browser_fill_form

Fill multiple form fields at once.

```json
{
  "fields": [
    { "name": "Username", "type": "textbox", "ref": "e4", "value": "myuser" },
    { "name": "Remember me", "type": "checkbox", "ref": "e6", "value": "true" }
  ]
}
```

### browser_select_option

Select dropdown option.

```json
{
  "element": "Country dropdown",
  "ref": "e7",
  "values": ["United States"]
}
```

### browser_press_key

Press a keyboard key.

```json
{ "key": "Enter" }
```

### browser_hover

Hover over an element.

```json
{
  "element": "Menu item",
  "ref": "e8"
}
```

---

## Utility Tools

### browser_wait_for

Wait for conditions.

```json
{ "text": "Loading complete" }
// or
{ "textGone": "Please wait..." }
// or
{ "time": 2 }
```

### browser_tabs

Manage browser tabs.

```json
{ "action": "list" }
{ "action": "new" }
{ "action": "select", "index": 0 }
{ "action": "close", "index": 1 }
```

### browser_evaluate

Run JavaScript on page.

```json
{
  "function": "() => document.title"
}
```
