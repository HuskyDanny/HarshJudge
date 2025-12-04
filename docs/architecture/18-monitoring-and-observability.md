# 18. Monitoring and Observability

## 18.1 Monitoring Stack

- **Frontend Monitoring:** Console logging for development, no production analytics
- **Backend Monitoring:** stderr logging for MCP server operations
- **Error Tracking:** Local only, no external services
- **Performance Monitoring:** Manual timing logs for development

## 18.2 Logging Strategy

```typescript
// packages/mcp-server/src/utils/logger.ts
export const logger = {
  info: (msg: string, data?: unknown) => {
    console.error(`[INFO] ${msg}`, data ? JSON.stringify(data) : '');
  },
  error: (msg: string, error?: unknown) => {
    console.error(`[ERROR] ${msg}`, error);
  },
  debug: (msg: string, data?: unknown) => {
    if (process.env.DEBUG) {
      console.error(`[DEBUG] ${msg}`, data ? JSON.stringify(data) : '');
    }
  },
};

// Usage in handlers
logger.info('initProject called', { projectName });
logger.error('File write failed', error);
```

## 18.3 Key Metrics (Manual)

**MCP Server Metrics:**
- Tool call count per session
- Average tool response time
- Error rate by tool

**Dashboard Metrics:**
- File watcher event count
- Data load time
- Component render time (React DevTools)

---
