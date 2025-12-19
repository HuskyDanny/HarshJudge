# Epic 6: Core Structure Optimization

**Goal:** Restructure HarshJudge for granular step-based execution with built-in token optimization and improved scenario management.

**Priority:** High — This epic should be completed before any new feature work, as it establishes the foundational structure.

**Supersedes:** Epic 5 (Post-POC Improvements) — Stories 5.1 and 5.2 are absorbed into this epic.

---

## Background

During real-world usage of HarshJudge, several structural limitations emerged:

1. **Token bloat:** Running entire scenarios in one context exhausts Claude's token limits
2. **Flat evidence:** All evidence in one folder makes debugging difficult
3. **Monolithic scenarios:** Single `scenario.md` files are hard to maintain and update
4. **Duplicated context:** Each scenario repeats project-level information
5. **Too many skill files:** Scattered documentation confuses AI agents

This epic addresses all these issues through a fundamental restructure that maintains the same 3-component architecture (Skill + MCP Server + Dashboard) while optimizing internal organization.

---

## Story 6.1: Project PRD Template

**As a** HarshJudge user,
**I want** project initialization to create a structured PRD with key project information,
**so that** this context is centralized and not duplicated across scenarios.

**Acceptance Criteria:**

1. `initProject` creates `.harshJudge/prd.md` from template
2. PRD template includes sections for:
   - App type (backend, fullstack, frontend, other)
   - Ports (frontend, backend, database)
   - Main function scenarios (high-level list)
   - Auth requirements (login flow, credentials for testing)
   - Tech stack (frameworks, libraries, tools)
3. Template uses clear placeholder prompts for user to fill in
4. Remove `assets/iterations.md` from skill files (no longer needed)
5. Update `assets/prd.md` template to match new structure

---

## Story 6.2: Granular Step Schema

**As a** HarshJudge user,
**I want** scenarios to have individual step files with a structured meta.yaml,
**so that** steps are maintainable, reorderable, and clearly scoped.

**Acceptance Criteria:**

1. New scenario structure:
   ```
   .harshJudge/scenarios/{slug}/
   ├── meta.yaml
   └── steps/
       ├── 01-{step-slug}.md
       ├── 02-{step-slug}.md
       └── ...
   ```
2. `meta.yaml` schema includes:
   ```yaml
   title: "Scenario Title"
   slug: "scenario-slug"
   starred: false          # For filtering important scenarios
   tags: []
   estimatedDuration: 60
   steps:
     - id: "01"
       title: "Navigate to login page"
       file: "01-navigate-to-login.md"
     - id: "02"
       title: "Enter credentials"
       file: "02-enter-credentials.md"
   ```
3. Each step `.md` file contains:
   - Step title and description
   - Expected preconditions
   - Actions to perform
   - Expected outcomes/assertions
4. `starred` field enables scenario filtering (absorbed from Story 5.2)
5. Steps are numbered with zero-padded prefixes (01, 02, ... 99)

---

## Story 6.3: Per-Step Run Structure

**As a** HarshJudge user,
**I want** run evidence organized by step,
**so that** I can easily debug specific step failures.

**Acceptance Criteria:**

1. New run structure:
   ```
   .harshJudge/scenarios/{slug}/runs/{runId}/
   ├── result.json
   ├── step-01/
   │   └── evidence/
   │       ├── before.png
   │       ├── after.png
   │       └── console.json
   ├── step-02/
   │   └── evidence/
   └── ...
   ```
2. `result.json` schema includes per-step status:
   ```json
   {
     "runId": "run_abc123",
     "scenarioSlug": "login-flow",
     "status": "fail",
     "startedAt": "2024-01-15T10:30:00Z",
     "completedAt": "2024-01-15T10:31:15Z",
     "duration": 75000,
     "steps": [
       { "id": "01", "status": "pass", "duration": 5000 },
       { "id": "02", "status": "pass", "duration": 8000 },
       { "id": "03", "status": "fail", "duration": 12000, "error": "Element not found" }
     ],
     "failedStep": "03",
     "errorMessage": "Element not found: Submit button"
   }
   ```
3. Evidence files use consistent naming: `before.png`, `after.png`, `console.json`, `network.json`
4. `recordEvidence` MCP tool updated to accept `stepId` parameter
5. `completeRun` MCP tool updated to accept per-step results

---

## Story 6.4: `createScenario` MCP Tool

**As a** HarshJudge user,
**I want** an MCP tool that creates scenario structure from conversation context,
**so that** scenario setup is automated and consistent.

**Acceptance Criteria:**

1. New MCP tool `createScenario` with schema:
   ```typescript
   {
     slug: string,
     title: string,
     steps: Array<{
       title: string,
       description: string,
       actions: string,
       expectedOutcome: string
     }>,
     tags?: string[],
     estimatedDuration?: number
   }
   ```
2. Tool creates full scenario structure:
   - `meta.yaml` with ordered step references
   - Individual step `.md` files in `steps/` folder
3. Tool reads `.harshJudge/prd.md` for project context (if exists)
4. Returns created file paths for confirmation
5. `saveScenario` tool deprecated/removed (replaced by `createScenario`)

---

## Story 6.5: Step-Based Agent Execution

**As a** HarshJudge user,
**I want** each step to execute in its own spawned agent,
**so that** token context is naturally isolated and managed.

**Acceptance Criteria:**

1. `run.md` workflow spawns a new Task agent for each step
2. Each agent receives only:
   - The step's `.md` file content
   - Project `prd.md` context (summarized)
   - Previous step result (pass/fail, not full evidence)
3. Agent returns concise result:
   - Status (pass/fail)
   - Evidence file paths (not content)
   - Error message (if failed)
4. Main agent tracks progress via `result.json`:
   - Reads `meta.yaml` for step order
   - Updates `result.json` after each step
   - Determines next step or stops on failure
5. Token optimization is automatic — no manual management needed
6. (Absorbs Story 5.1 token optimization goals)

---

## Story 6.6: Skill File Consolidation

**As a** HarshJudge user,
**I want** fewer, more comprehensive skill files,
**so that** AI agents have clearer guidance without file-hopping.

**Acceptance Criteria:**

1. `SKILL.md` updated to include:
   - Agent spawning pattern (from `agent-pattern.md`)
   - Core principles and workflow overview
   - Quick reference for all MCP tools
2. `run.md` updated to include:
   - Playwright tool usage (from `playwright-tools.md`)
   - Step-based execution workflow
   - Evidence capture patterns
3. Delete redundant files:
   - `references/agent-pattern.md`
   - `references/playwright-tools.md`
4. Update `create.md` to call `createScenario` MCP tool
5. Remaining skill structure:
   ```
   skills/harshjudge/
   ├── SKILL.md              # Main entry, includes agent patterns
   ├── assets/
   │   └── prd.md            # PRD template
   └── references/
       ├── setup.md          # Project initialization
       ├── create.md         # Scenario creation (uses createScenario)
       ├── run.md            # Step execution (includes Playwright tools)
       ├── status.md         # Status checking
       └── iterate.md        # Scenario editing
   ```

---

## Story 6.7: Dashboard Adaptation

**As a** HarshJudge user,
**I want** the dashboard to display the new granular structure,
**so that** I can navigate steps and per-step evidence easily.

**Acceptance Criteria:**

1. ScenarioListPanel shows:
   - Star icon for `starred` scenarios (click to toggle)
   - Starred scenarios sorted to top (or filter option)
   - Step count badge
2. RunDetailPanel shows:
   - Per-step status timeline (pass/fail indicators)
   - Click step to expand evidence
   - Step-level timing breakdown
3. EvidencePanel updated:
   - Navigate between steps
   - Show before/after screenshots side-by-side for each step
   - Display console/network logs per step
4. `getStatus` MCP tool returns `starred` field
5. New filter option: show only starred scenarios
6. (Absorbs Story 5.2 starred scenario UI)

---

## Story Dependencies

```
6.1 (PRD Template) ─────────────────────────────┐
                                                │
6.2 (Step Schema) ──┬─► 6.4 (createScenario) ◄──┘
                    │
6.3 (Run Structure) ┴─► 6.5 (Agent Execution) ─► 6.6 (Skill Consolidation)
                    │
                    └─► 6.7 (Dashboard)
```

**Recommended Order:**
1. 6.1 (PRD Template) — Independent
2. 6.2 (Step Schema) — Schema design
3. 6.3 (Run Structure) — Schema design
4. 6.4 (createScenario) — Depends on 6.2
5. 6.5 (Agent Execution) — Depends on 6.2, 6.3
6. 6.6 (Skill Consolidation) — Depends on 6.5
7. 6.7 (Dashboard) — Depends on 6.2, 6.3

---

## Migration Notes

- **Clean break:** No automatic migration from old structure
- Existing `.harshJudge/` projects will need to be re-initialized
- Old scenarios can be manually converted if needed

---

## Success Metrics

1. **Token efficiency:** Complete scenario runs without token exhaustion
2. **Debug time:** 50% reduction in time to identify failing step
3. **Maintenance:** Steps can be reordered/edited independently
4. **Clarity:** AI agents execute correctly without file-hopping

---

## Implementation Status

**Epic Status:** ✅ Complete (2025-12-19)

| Story | Status | Notes |
|-------|--------|-------|
| 6.1 | ✅ Done | PRD template in initProject |
| 6.2 | ✅ Done | Granular step schema |
| 6.3 | ✅ Done | Per-step run structure |
| 6.4 | ✅ Done | createScenario + toggleStar tools |
| 6.5 | ⚠️ Partial | Skill files updated, agent pattern documented but not enforced |
| 6.6 | ✅ Done | Files consolidated, redundant files deleted |
| 6.7 | ✅ Done | Dashboard adapted with v2 support |

---

## Discovered Requirements (Course Correction 2025-12-19)

The following requirements were discovered during real-world testing:

1. **`'running'` Status** - Dashboard needed to display in-progress runs
2. **`projectPath` Parameter** - MCP called from different repo needs explicit path
3. **`startedAt` Field** - In-progress runs need start time, optional completedAt
4. **v1/v2 Backward Compatibility** - DataService handles both evidence structures
5. **Evidence Path Parsing** - v2 uses `step-XX/evidence/` not flat structure
6. **Run Completion Check** - Check status value, not just file existence

---
