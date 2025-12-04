# 14. Security and Performance

## 14.1 Security Requirements

**Frontend Security:**
- CSP Headers: Not applicable (local server)
- XSS Prevention: React's default escaping, marked sanitization
- Secure Storage: Not applicable (no sensitive data)

**Backend Security:**
- Input Validation: Zod schemas for all MCP tool inputs
- Path Traversal: Resolve paths relative to `.harshJudge/` only
- File Size Limits: Max 10MB per evidence file

**Authentication Security:**
- Not applicable: HarshJudge is local-only, no auth required

**Data Privacy:**
- No data leaves the local machine (NFR7)
- No analytics or telemetry
- No cloud services

## 14.2 Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 200KB gzipped (excluding images)
- Loading Strategy: Lazy load evidence files, virtualize long lists
- Caching Strategy: In-memory cache for parsed YAML/JSON

**Backend Performance:**
- Response Time Target: < 500ms for all MCP tools (NFR1)
- File Operations: Async with proper error handling
- Evidence Storage: Stream large files, don't load into memory

**Dashboard Performance:**
- Live Updates: Debounced file watcher (300ms)
- Screenshot Loading: Thumbnails first, full-size on demand
- List Virtualization: For 100+ scenarios/runs

---
