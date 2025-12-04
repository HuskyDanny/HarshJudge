# 1. Introduction

This document outlines the complete fullstack architecture for **HarshJudge**, an AI-native end-to-end testing orchestration platform. It serves as the single source of truth for development, ensuring consistency across all components.

HarshJudge embraces a three-component architecture where Claude Code performs the heavy lifting (code analysis, test execution via Playwright MCP, database verification), while HarshJudge provides:
1. **Claude Skill** - Structured workflow patterns
2. **MCP Server** - Deterministic file storage
3. **Dashboard** - Read-only visibility

## 1.1 Starter Template Evaluation

**Decision: Greenfield with Turborepo**

After evaluating the requirements, a greenfield approach with Turborepo is selected over existing starter templates because:

1. **Unique Architecture:** The Skill + MCP + Dashboard model doesn't match any standard fullstack starter
2. **Minimal Dependencies:** We need very few libraries - no database ORM, no auth library, no Playwright integration
3. **MCP Protocol Specifics:** MCP server requires specific patterns not found in web app starters
4. **Simplicity:** Starting fresh avoids removing unused features from complex starters

**Turborepo Selected Over:**
- **Nx:** More enterprise-focused, heavier configuration
- **Lerna:** Less active development, Turborepo has better caching
- **npm Workspaces alone:** Lacks build orchestration

---
