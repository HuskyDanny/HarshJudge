# PM/Architect Handoff: HarshJudge Restructure Proposal

**Prepared by:** Bob (Scrum Master)
**Date:** 2025-12-18
**Type:** Major Architectural Redesign Request

---

## 1. Executive Summary

The user proposes a significant restructure of HarshJudge to make it more **robust and scalable**. The main architecture stays the same (3-component: Skill + MCP Server + Dashboard), but internal structures need optimization for better granularity, clarity, and maintainability.

---

## 2. Proposed Changes

### 2.1 Project Initialization (`initProject`)

| Current | Proposed |
|---------|----------|
| Creates basic `.harshJudge/` structure | Create `.harshJudge/prd.md` from template |
| Generic config.yaml | Interactive PRD questionnaire |

**New PRD Template Questions:**
1. Type of app (backend, fullstack, other)
2. Port for frontend and backend
3. Main function scenarios
4. Auth requirements (login, etc.)
5. Tech stack

**Rationale:** Centralize project context in `prd.md` to avoid duplication across scenarios.

---

### 2.2 Scenario Structure Redesign

**Current:**
```
.harshJudge/scenarios/{slug}/
├── scenario.md        # All steps in one file
├── meta.yaml          # Run statistics
└── runs/{runId}/
    └── evidence/      # All evidence flat
```

**Proposed:**
```
.harshJudge/scenarios/{slug}/
├── meta.yaml          # Lists steps in order, references step MDs
├── steps/
│   ├── 01-navigate-to-login.md
│   ├── 02-enter-credentials.md
│   └── 03-verify-dashboard.md
└── runs/{runId}/
    ├── result.json    # Granular per-step status
    ├── step-01/
    │   └── evidence/
    ├── step-02/
    │   └── evidence/
    └── step-03/
        └── evidence/
```

**Key Changes:**
- Each step in its own `.md` file under `steps/`
- `meta.yaml` references steps in order by title
- Per-run evidence organized by step directories
- `result.json` tracks granular per-step status

---

### 2.3 New MCP Tool: `createScenario`

**Purpose:** Programmatically create scenario structure from context or user input

**Inputs:**
- Scenario title/slug
- Steps (from conversation context or explicit input)
- Reads `prd.md` for big-picture context

**Outputs:**
- Creates `steps/` folder with individual step `.md` files
- Creates `meta.yaml` with ordered step references
- Initializes scenario structure

---

### 2.4 Skill File Restructure

| File | Change |
|------|--------|
| `SKILL.md` | Embed agent-pattern guidance (spawn agent for inspections) |
| `create.md` | Call new `createScenario` MCP tool, reflect new structure |
| `run.md` | Spawn agent per step, read `meta.yaml` for order, track `result.json` |
| `agent-pattern.md` | **DELETE** — embed in `SKILL.md` |
| `playwright-tools.md` | **DELETE** — embed in `run.md` |

---

### 2.5 Asset Changes

| File | Change |
|------|--------|
| `assets/prd.md` | New template with questionnaire |
| `assets/iterations.md` | **DELETE** — no longer needed |

---

## 3. Impact Assessment

| Area | Impact Level | Notes |
|------|--------------|-------|
| PRD | 🔴 **High** | New requirements, new structure |
| Architecture | 🔴 **High** | Data models, file structure, MCP tools |
| Existing Stories | 🟡 **Medium** | Stories 5.1, 5.2 may need revision |
| Dashboard/UX | 🟡 **Medium** | Must adapt to new data structure |
| Skill Files | 🔴 **High** | Major restructure |

---

## 4. Questions for PM/Architect

### For PM:
1. Should this be a new Epic 6, or replace/extend Epic 5?
2. What is the priority vs. existing stories (5.1, 5.2)?
3. Are there MVP implications?

### For Architect:
1. How should `meta.yaml` schema change to reference steps?
2. What's the `result.json` schema for per-step tracking?
3. How does the dashboard adapt to the new structure?
4. Should `createScenario` be a new MCP tool or extend `saveScenario`?

---

## 5. Recommended Next Steps

| Step | Owner | Action |
|------|-------|--------|
| 1 | **PM** | Review proposal, decide epic placement, update PRD |
| 2 | **Architect** | Design new data models, file structures, MCP tool schema |
| 3 | **SM (Bob)** | Create stories from updated PRD/Architecture |

---

## 6. Original User Requirements (Verbatim)

> the entrypoint is SKILL.md, it should 1.init the proejct where we should create a template of prd.md, and having questions that user need to fill in. 1. type of app, backend, fullstack, or others... 2.port for frontend and backend. 3.main functions scenario 4.auth needed for login etc 5. tech stack and this prd.md should be root of .harshjudge. there should be no dups for scenario test, I do not want date duplication since each scenario will have this info. you can find the template in the asset prd.md 2.let's remove iteration.md in assets. 3.for create md , be sure to put each steps more granular at its own scope I want for each scenario, besides runs, we have steps/ folder, where each step got its own md also the meta.ymal should list out the steps orderly referncing the titles of the mk. . And inside each run, each step is in its own directory with its evidence, also the outside result.json should also be granular about the each steps and its status. In addition, we should have a mcp method, which is to createScneario, which process info either from previous context or users can pass in custom message so the tool will setup the secnario files like the descirbed and the create.md in the skill should call it and relfect the structure and update accordingly, and it will read the prd.md for big picture. 4. for run.md it should update accordingly so to spawn new agent for each step and read its relevant files. it should do it first by reading the meta know which steps we have in order and check the result.json for the next in order and mark the completed one. 5. I do not like agent-patterns.md and playwriht-tools.md, embed the previous one in SKILL.md to ensure spawn agent patterns, and later one in run.md on how to use the mcp tools
