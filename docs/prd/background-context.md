# Background Context

End-to-end testing remains one of the most painful aspects of software development. Writing comprehensive E2E tests typically takes 2-3x longer than building the feature itself, and maintaining those tests consumes 20-40% of development time. Existing solutions like Cypress and Playwright are powerful but fully manual, while record-and-replay tools like TestSprite don't understand code context or verify data integrity.

HarshJudge addresses this gap with a **three-component architecture**:

1. **Claude Skill** - Structured prompts that guide Claude through test workflows with consistent patterns
2. **Lightweight MCP Server** - A data tunnel that provides deterministic file storage for scenarios and evidence
3. **Read-Only Dashboard** - Visual interface for browsing test results and evidence

This architecture leverages Claude Code's native capabilities and existing tools (Playwright MCP for browser automation, database tools for verification) rather than duplicating them. The file-system-as-database approach keeps everything local, git-friendly, and portable—no cloud dependencies required.

---
