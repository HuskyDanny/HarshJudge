# Epic 5: Post-POC Improvements

> **⚠️ ARCHIVED:** This epic has been superseded by **Epic 6: Core Structure Optimization**.
>
> - Story 5.1 (Token Optimization) → Absorbed into Story 6.5 (Step-Based Agent Execution)
> - Story 5.2 (Starred Scenarios) → Absorbed into Stories 6.2 (Step Schema) and 6.7 (Dashboard)
>
> See `epic-6-core-structure-optimization.md` for the current implementation plan.

---

**Original Goal:** Address issues discovered during real-world usage of HarshJudge, ensuring bug-free, robust core functionality with optimized token usage and improved scenario management.

**Status:** Archived (2025-12-18)

**Reason:** A more comprehensive restructure was needed. Epic 6 addresses all Epic 5 goals through a foundational redesign rather than incremental patches.

---

## Archived Stories

### Story 5.1: Playwright Spawned Agent Integration (→ Epic 6.5)

*Absorbed into Story 6.5: Step-Based Agent Execution*

The per-step agent spawning approach provides automatic token isolation without requiring manual tool-by-tool management.

---

### Story 5.2: Scenario Starred/Important Flag (→ Epic 6.2, 6.7)

*Absorbed into Stories 6.2 (Step Schema) and 6.7 (Dashboard)*

The `starred` field is now part of the new `meta.yaml` schema, and the dashboard adaptation includes the star UI.

---
