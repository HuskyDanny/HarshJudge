# Evidence Types Reference

> **Status:** Placeholder - To be fully implemented in Story 2.5

## Supported Evidence Types

### screenshot

Captures visual state of the browser.

```json
{
  "type": "screenshot",
  "format": "png",
  "metadata": {
    "url": "string",
    "viewport": { "width": 1280, "height": 720 }
  }
}
```

### log

Captures console output or application logs.

```json
{
  "type": "log",
  "format": "text",
  "metadata": {
    "source": "console|network|application"
  }
}
```

### db_snapshot

Captures database state for verification.

```json
{
  "type": "db_snapshot",
  "format": "json",
  "metadata": {
    "query": "string",
    "table": "string"
  }
}
```

### network

Captures network request/response data.

```json
{
  "type": "network",
  "format": "json",
  "metadata": {
    "method": "GET|POST|...",
    "url": "string",
    "status": 200
  }
}
```
