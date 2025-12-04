# Brainstorming Session Results

**Session Date:** 2024-12-03
**Facilitator:** Business Analyst Mary
**Participant:** Allen Pan

---

## Executive Summary

**Topic:** AI-Driven E2E Testing Platform (HarshJudge)

**Session Goals:** Design a comprehensive architecture for an AI-native end-to-end testing platform that is smarter than traditional tools like TestSprite. The system should automatically analyze codebases, generate test scenarios, execute tests with full evidence capture, and provide a clean management UX.

**Techniques Used:** Mind Mapping, First Principles Thinking

**Total Ideas Generated:** 35+

### Key Themes Identified:
- **AI-Native Philosophy**: Claude Code does all thinking; MCP tools are just "hands and eyes"
- **File-System First**: No database needed; `.harshJudge/` folder structure is the source of truth
- **Autonomous with Review**: AI generates everything; humans review and refine
- **Smart Evidence Capture**: Capture what matters, when it matters (screenshots always, logs on failure)
- **Read-Only UX**: Dashboard is purely for visibility; all actions happen through Claude Code

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      Claude Code (THE BRAIN)                  │
│                                                               │
│  • Reads source code, docs, CLAUDE.md                        │
│  • Generates scenario.md files                               │
│  • Analyzes failures via screenshots + logs                  │
│  • Suggests fixes                                            │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                MCP Server (THE HANDS & EYES)                  │
│                                                               │
│  Tools: analyzeProject, createScenario, runScenario, getStatus│
│  Also: Spawns local UX server, runs Playwright               │
└──────────────────────────────┬───────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
     │ .harshJudge/│   │  Playwright │   │  UX Server  │
     │   (Files)   │   │   Runtime   │   │ (Read-Only) │
     └─────────────┘   └─────────────┘   └─────────────┘
```

---

## Technique Sessions

### Mind Mapping - Component Architecture

**Duration:** 45 minutes

**Central Concept:** HarshJudge (AI E2E Test Suite)

**Branch 1: MCP Server & Tools**
- 4 coarse-grained tools (not fine-grained primitives)
- `analyzeProject(projectPath)` → Returns tech stack, flows, components
- `createScenario(flowDescription, projectId)` → Writes .md/.yaml to folder
- `runScenario(scenarioId)` → Executes Playwright, captures evidence
- `getStatus(projectId?, scenarioId?)` → Reads folder, returns summary
- Embedded UX server auto-spawns on local port
- Workspace scanner finds all `.harshJudge/` folders

**Branch 2: AI Engine**
- Claude Code IS the AI engine (no embedded LLM in MCP)
- Multi-source intelligence: code analysis + CLAUDE.md + README + architecture docs + API docs
- Code-based verification inference (reads handlers to know what to verify)
- Natural language DB queries (Claude translates to SQL at runtime)

**Branch 3: Execution Runtime**
- Fully autonomous execution (run all steps, return results at end)
- Docker-based log capture (`docker logs <container>`)
- Auto-detection: docker-compose, .env files, database connections
- Smart evidence capture strategy
- Automatic runtime context tracking ($userId, $cartId, etc.)

**Branch 4: Data Layer (File-System)**
- Three-layer data model:
  - `scenario.md` - Human-authored content (rarely changes)
  - `scenario.meta.yaml` - Computed statistics (auto-updated)
  - `runs/*/` - Run history with evidence
- Hierarchical project isolation (nested `.harshJudge/` = independent project)
- Git-friendly design

**Branch 5: UX Dashboard**
- Vite + React stack
- 3-column layout: Projects → Scenarios → Detail Panel
- Tag grouping and time-based sorting
- Vertical timeline for run steps
- Side panel for screenshot + verification details
- Toast notifications for live updates (non-jarring)

---

## Key Design Decisions

### 1. File-System as Database

```
.harshJudge/
├── config.yaml
├── analysis/
│   └── project-analysis.yaml
└── scenarios/
    └── checkout-flow/
        ├── scenario.md           # Human-readable flow
        ├── scenario.meta.yaml    # Auto-updated stats
        └── runs/
            └── 2024-12-03_15-30-00/
                ├── run.yaml
                ├── screenshots/
                ├── failures/     # Only if failed
                └── verifications/
```

**Rationale:**
- Claude Code already knows how to read/write files
- No database setup required
- Git-friendly (scenario content rarely changes)
- UX just reads files (no backend API needed)

### 2. Evidence Capture Strategy

| Evidence | When Captured |
|----------|---------------|
| Screenshot | Every step (always) |
| Console Logs | On failure only |
| Network Requests | On failure only |
| DOM Snapshot | On failure only |
| Backend Logs | On failure only |
| DB Query Result | At verification points |
| API Response | At verification points |

### 3. Three-Layer Data Model

| Layer | File | Who Writes | When Changes |
|-------|------|------------|--------------|
| Content | `scenario.md` | Claude / User | When test logic changes |
| Stats | `scenario.meta.yaml` | MCP (auto) | After every run |
| History | `runs/*/run.yaml` | MCP (auto) | Each run creates new |

### 4. Documentation Priority for AI Analysis

1. **CLAUDE.md / .cursorrules** - Project-specific AI instructions
2. **README.md** - High-level overview, setup
3. **docs/architecture.md** - System design, relationships
4. **docs/api/*.md** - API contracts, behaviors

### 5. Auto-Detection Configuration

```yaml
# .harshJudge/config.yaml
docker:
  composeFile: auto    # Detects docker-compose*.yaml
  services:
    frontend: auto     # Detects by port
    backend: auto

database:
  type: auto           # From prisma schema or docker-compose
  connectionString: auto  # From .env → .env.development → .env.local

browser:
  baseUrl: auto        # From frontend service port
```

---

## Idea Categorization

### Immediate Opportunities (Core MVP)

| # | Idea | Component | Description |
|---|------|-----------|-------------|
| 1 | Coarse-grained MCP tools | MCP | 4 main tools: analyzeProject, createScenario, runScenario, getStatus |
| 2 | File-system as database | Data | `.harshJudge/` folder holds everything - no database |
| 3 | Claude as brain | AI Engine | Claude Code does all thinking, MCP tools execute |
| 4 | Auto-detect configuration | Runtime | Detect docker-compose, env files, DB connections |
| 5 | Automatic context capture | Runtime | MCP captures IDs, totals, tokens from responses |
| 6 | Smart evidence capture | Runtime | Screenshots always; logs on failure; DB at verify points |
| 7 | Basic dashboard | UX | Vite+React, 3-column layout, file watcher |

### Future Innovations (V1.1)

| # | Idea | Component | Description |
|---|------|-----------|-------------|
| 1 | Natural language DB queries | AI Engine | Claude translates "Order created" → SQL |
| 2 | Tag grouping | UX | Group scenarios by tag, collapsible sections |
| 3 | Time-based sorting | UX | Sort by latest run, last failed, created |
| 4 | Toast notifications | UX | Non-jarring alerts for run completion |
| 5 | Side panel timeline | UX | Click step → full details on right panel |

### Moonshots (Future Vision)

| # | Idea | Component | Description |
|---|------|-----------|-------------|
| 1 | AI auto-fix suggestions | AI Engine | Analyze failure + suggest code changes |
| 2 | Cross-project analytics | UX | Aggregate stats across all projects |
| 3 | CI/CD integration | Infra | GitHub Actions trigger, PR comments |

---

## Technical Specifications

### MCP Tool: `analyzeProject`

**Input:** `projectPath: string`

**Output:**
```yaml
project:
  name: string
  path: string

techStack:
  frontend: { framework, ui, styling }
  backend: { runtime, api }
  database: { type, orm }
  auth: { provider, methods }

entryPoints:
  pages: [{ path, route, description }]
  apiRoutes: [{ path, methods, description }]

components:
  - { name, path, props }

database:
  models: [{ name, fields }]
  relationships: [string]

auth:
  pattern: string
  protectedRoutes: [string]
  loginPage: string

environment:
  required: [{ name, description }]
  devServer: { command, port }

suggestedFlows:
  - { name, priority, steps }
```

### Scenario File Format: `scenario.md`

```markdown
# Scenario: [Name]

## Metadata
- **ID:** [unique-id]
- **Priority:** critical | high | medium | low
- **Tags:** [tag1, tag2]

## Prerequisites
- [Required setup conditions]

## Flow

### Step 1: [Step Name]
**Action:** [What to do]
**URL:** [Target URL if navigation]
**Element:** [Selector if interaction]
**Verify:**
- [ ] [Visual verification]
- [ ] **DB:** [Database verification in natural language]
- [ ] **API:** [API response verification]

### Step 2: [Step Name]
...

## Teardown
- [Cleanup actions]
```

### Run Result Format: `run.yaml`

```yaml
id: string
scenarioId: string
status: passed | failed
startedAt: ISO8601
completedAt: ISO8601
duration: string

context:
  $userId: string
  $cartId: string
  # ... auto-captured values

steps:
  - step: number
    name: string
    status: passed | failed | skipped
    duration: string
    screenshot: string
    captured: { key: value }
    verifications:
      - type: db | api
        description: string
        expected: any
        actual: any
        result: passed | failed
```

### UX Layout Structure

```
┌─────────────┬─────────────────────┬─────────────────────────────┐
│  PROJECTS   │  SCENARIOS          │  DETAIL PANEL               │
│  (Sidebar)  │  (List + Filters)   │  (Screenshot + Timeline)    │
│             │                     │                             │
│  • Filter   │  • Sort by time     │  • Large screenshot         │
│    by tag   │  • Group by tag     │  • Step timeline            │
│  • Filter   │  • Run history      │  • Verification results     │
│    by status│                     │  • Log tabs                 │
└─────────────┴─────────────────────┴─────────────────────────────┘
```

---

## Action Planning

### Top 3 Priority Ideas

#### #1 Priority: MCP Server with 4 Core Tools

**Rationale:** This is the foundation - without MCP tools, Claude Code can't interact with the system.

**Next Steps:**
1. Set up Node.js MCP server project
2. Implement `analyzeProject` tool first (most complex)
3. Add `createScenario` with file writing
4. Add `runScenario` with Playwright integration
5. Add `getStatus` for folder reading

**Resources Needed:**
- MCP SDK documentation
- Playwright API reference
- Docker SDK for Node.js

**Timeline:** 2-3 weeks

---

#### #2 Priority: File-System Data Structure

**Rationale:** Must define the folder structure before tools can read/write to it.

**Next Steps:**
1. Finalize `.harshJudge/` folder schema
2. Create TypeScript interfaces for all file formats
3. Build file reader/writer utilities
4. Implement auto-detection logic for config

**Resources Needed:**
- YAML parser (js-yaml)
- Markdown parser (marked or remark)
- File watcher (chokidar)

**Timeline:** 1 week

---

#### #3 Priority: Basic UX Dashboard

**Rationale:** Users need visibility into test results from the start.

**Next Steps:**
1. Scaffold Vite + React project
2. Implement file system reader for `.harshJudge/`
3. Build 3-column layout with routing
4. Add file watcher for live updates
5. Implement toast notification system

**Resources Needed:**
- Vite + React + TypeScript
- TailwindCSS or similar
- React Router
- Chokidar for file watching

**Timeline:** 2 weeks

---

## Reflection & Follow-up

### What Worked Well
- Mind mapping helped visualize all components before diving deep
- First principles approach clarified what each component MUST do
- Progressive refinement of ideas through Q&A

### Areas for Further Exploration
- **CI/CD Integration:** How to run HarshJudge in GitHub Actions
- **Multi-browser Testing:** Support for Firefox, Safari in addition to Chrome
- **Test Data Management:** How to seed/reset test data between runs
- **Parallel Execution:** Run multiple scenarios concurrently

### Recommended Follow-up Techniques
- **Morphological Analysis:** Explore combinations for test data strategies
- **Role Playing:** Think from perspective of different users (solo dev vs. team)

### Questions That Emerged
- Should there be a "watch mode" that re-runs tests on code change?
- How to handle flaky tests (retry logic)?
- Should scenarios support parameterization (same flow, different data)?
- How to handle authentication token refresh during long test runs?

### Next Session Planning
- **Suggested Topics:** Test data management, CI/CD integration design
- **Recommended Timeframe:** After MVP is built and validated
- **Preparation Needed:** Real-world usage feedback from initial testing

---

*Session facilitated using the BMAD-METHOD brainstorming framework*
