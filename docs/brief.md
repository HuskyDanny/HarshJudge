# Project Brief: HarshJudge

## Executive Summary

**HarshJudge** is an AI-native end-to-end testing orchestration platform built on three components: a **Claude Skill** that guides structured test workflows, a **lightweight MCP server** that provides deterministic file storage, and a **read-only dashboard** for test management visibility.

Unlike traditional E2E testing tools that require manual test authoring, or heavyweight automation frameworks that duplicate AI capabilities, HarshJudge embraces a "Claude does the work, we organize the results" philosophy. Claude Code—enhanced with the HarshJudge skill—analyzes codebases, generates test scenarios, executes tests via Playwright MCP, and captures evidence. The HarshJudge MCP serves as a clean data tunnel, ensuring all artifacts are stored in a deterministic, git-friendly file structure.

**Primary Problem:** E2E testing is time-consuming to write, brittle to maintain, and requires deep expertise in both the application and testing frameworks.

**Target Market:** Development teams using Claude Code who want AI-driven testing with organized, reviewable results.

**Key Value Proposition:** "Claude runs your E2E tests. HarshJudge keeps them organized."

---

## Problem Statement

### Current State & Pain Points

1. **Manual Test Authoring is Slow:** Writing comprehensive E2E tests takes significant developer time - often 2-3x longer than building the feature itself.

2. **Tests Break Constantly:** UI changes, selector updates, and flow modifications cause cascading test failures that require manual fixes.

3. **Verification is Incomplete:** Developers often test the "happy path" but miss critical verifications like database state, API responses, and edge cases.

4. **Evidence is Scattered:** When tests fail, developers must manually gather screenshots, logs, and database states to diagnose issues.

5. **No AI Integration:** Existing tools (Cypress, Playwright, TestSprite) don't leverage AI for test generation or failure diagnosis.

### Impact of the Problem

- **Time Cost:** Teams spend 20-40% of development time on test maintenance
- **Quality Cost:** Incomplete test coverage leads to production bugs
- **Cognitive Cost:** Developers context-switch between building features and debugging tests

### Why Existing Solutions Fall Short

| Tool | Limitation |
|------|------------|
| **Cypress/Playwright** | Powerful but fully manual - no AI assistance |
| **TestSprite** | Record-and-replay, but doesn't understand code or verify data |
| **Copilot/AI Assistants** | Can help write tests, but not integrated into execution or verification |
| **Custom MCP + Playwright** | Duplicates what Claude + Playwright MCP already does |

### Urgency

With Claude Code becoming the standard AI development environment and Playwright MCP available for browser automation, there's an opportunity to build the orchestration layer that ties AI-driven testing together.

---

## Proposed Solution

### Core Concept

HarshJudge is a **three-component system** that orchestrates AI-driven testing:

```
┌─────────────────────────────────────────────────────────────────┐
│                   HARSHJUDGE ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   CLAUDE SKILL              MCP SERVER            DASHBOARD      │
│   (The Brain)               (The Tunnel)          (The View)     │
│                                                                  │
│   ┌─────────────┐          ┌─────────────┐      ┌───────────┐   │
│   │ Workflows   │          │ initProject │      │ Projects  │   │
│   │ Patterns    │ ───────► │ saveScenario│ ───► │ Scenarios │   │
│   │ Protocols   │          │ startRun    │      │ Runs      │   │
│   │ Setup Guide │          │ recordEvid. │      │ Evidence  │   │
│   └─────────────┘          │ completeRun │      └───────────┘   │
│         │                  │ getStatus   │            ▲         │
│         │                  └─────────────┘            │         │
│         │                        │                    │         │
│         ▼                        ▼                    │         │
│   ┌─────────────┐          ┌─────────────┐           │         │
│   │ Playwright  │          │ .harshJudge/│ ──────────┘         │
│   │ MCP         │          │ (filesystem)│                      │
│   └─────────────┘          └─────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Component 1: Claude Skill

A set of structured prompts that guide Claude's behavior:

- **`/harshjudge:setup`** - Guide users through installation and configuration
- **`/harshjudge:analyze`** - Analyze project structure, suggest test scenarios
- **`/harshjudge:create`** - Create well-structured scenario files
- **`/harshjudge:run`** - Execute scenarios with deterministic evidence capture
- **`/harshjudge:status`** - Check project and scenario status

The skill ensures Claude follows consistent patterns, captures complete evidence, and uses the MCP tools correctly.

#### Component 2: Lightweight MCP Server

A minimal MCP server that provides **data tunnel** operations only:

| Tool | Purpose |
|------|---------|
| `initProject` | Create `.harshJudge/` directory structure |
| `saveScenario` | Validate and persist scenario files |
| `startRun` | Create run directory, return evidence paths |
| `recordEvidence` | Store screenshots, logs, DB snapshots |
| `completeRun` | Finalize run, update statistics |
| `getStatus` | Query project/scenario state |

The MCP does NOT:
- Analyze code (Claude does this)
- Execute tests (Playwright MCP does this)
- Run database queries (Claude uses DB tools)
- Make decisions (Skill guides Claude)

#### Component 3: Read-Only Dashboard

A React-based dashboard that reads the `.harshJudge/` filesystem:

- 3-column layout: Projects → Scenarios → Details
- Live updates via file watchers
- Screenshot timeline viewer
- Log viewer for failed runs
- No write operations - purely for visibility

### Key Differentiators

1. **Skill-Driven Consistency:** Claude Skill ensures deterministic workflows while allowing AI flexibility in execution.

2. **Minimal MCP Footprint:** We don't duplicate Playwright or database capabilities that already exist as MCPs.

3. **File-System as Database:** `.harshJudge/` folder is the single source of truth - readable, git-friendly, portable.

4. **Separation of Concerns:** Skill = behavior, MCP = storage, Dashboard = visibility.

5. **Composable Architecture:** Works with any Playwright MCP, any database tools Claude has access to.

### Why This Will Succeed

- **Leverage Existing Tools:** Don't rebuild what Playwright MCP already does
- **Lower Development Cost:** 70% less code than full-featured approach
- **Faster MVP:** 3-4 weeks instead of 6-8 weeks
- **AI-Native Philosophy:** Let Claude do what Claude does best
- **Future-Proof:** As Claude improves, HarshJudge improves

---

## Target Users

### Primary User Segment: Solo Developers & Small Teams Using Claude Code

**Profile:**
- Individual developers or teams of 2-5 engineers
- Building web applications (React, Next.js, Vue, etc.)
- Already using Claude Code as their AI development assistant
- Have Playwright MCP configured (or willing to add it)
- Comfortable with terminal-based workflows

**Current Behaviors:**
- Write minimal or no E2E tests due to time constraints
- Rely on manual testing before deploys
- Use Claude Code for feature development, code review, debugging

**Pain Points:**
- "I know I should write E2E tests, but I don't have time"
- "My tests break every time I change the UI"
- "I'm not sure what I should be testing"

**Goals:**
- Ship features faster with confidence
- Catch regressions before production
- Reduce manual QA time

### Secondary User Segment: Tech Leads at Mid-Size Companies

**Profile:**
- Engineering managers or tech leads
- Teams of 10-50 engineers
- Evaluating AI tools to improve team productivity
- Need visibility into test coverage and quality

**Current Behaviors:**
- Have existing test suites (often incomplete/neglected)
- Struggle with test maintenance burden
- Want to adopt AI tools but need enterprise-ready solutions

**Pain Points:**
- "Our test suite is more trouble than it's worth"
- "We can't hire enough QA engineers"
- "I need visibility into what's tested and what's not"

**Goals:**
- Reduce test maintenance overhead
- Improve test coverage systematically
- Get actionable insights from test results

---

## Goals & Success Metrics

### Business Objectives

- **Adoption:** 500 active users within 6 months of launch
- **Retention:** 60% monthly active user retention
- **Engagement:** Average 10+ test runs per user per week
- **Community:** 100+ GitHub stars, 20+ contributors

### User Success Metrics

- **Time Saved:** Users report 50%+ reduction in test authoring time
- **Coverage Improved:** Users achieve 2x more test scenarios than before
- **Confidence Increased:** Users report higher confidence in deployments
- **Maintenance Reduced:** Test maintenance time reduced by 70%

### Key Performance Indicators (KPIs)

- **Scenario Creation Rate:** Average scenarios created per project
- **Test Pass Rate:** Percentage of test runs that pass
- **Mean Time to Diagnosis:** Time from test failure to root cause identification
- **Skill Adoption:** Percentage of runs using HarshJudge skill vs manual
- **Evidence Completeness:** Percentage of runs with full evidence captured

---

## MVP Scope

### Core Features (Must Have)

#### Claude Skill Package
- **Setup Skill (`/harshjudge:setup`):** Guide MCP installation and configuration
- **Analyze Skill (`/harshjudge:analyze`):** Project analysis workflow with structured output
- **Create Skill (`/harshjudge:create`):** Scenario creation with template enforcement
- **Run Skill (`/harshjudge:run`):** Test execution protocol with evidence capture
- **Status Skill (`/harshjudge:status`):** Quick status check workflow

#### MCP Server Tools
- **`initProject`:** Create `.harshJudge/` structure with config
- **`saveScenario`:** Validate and persist scenario.md + meta.yaml
- **`startRun`:** Create run directory, return paths for evidence
- **`recordEvidence`:** Store artifacts with validation
- **`completeRun`:** Finalize run, update scenario statistics
- **`getStatus`:** Query project or scenario status

#### File-System Structure
```
.harshJudge/
├── config.yaml
├── scenarios/
│   └── {slug}/
│       ├── scenario.md
│       ├── meta.yaml
│       └── runs/
│           └── {run-id}/
│               ├── result.json
│               └── evidence/
└── .gitignore
```

#### Basic UX Dashboard
- Vite + React application
- 3-column layout (Projects → Scenarios → Details)
- File watcher for live updates
- Screenshot viewer with step timeline
- Log viewer for failed runs

### Prerequisites (User Must Have)

- Claude Code installed and configured
- Playwright MCP installed (`@anthropic/playwright-mcp` or equivalent)
- Node.js 18+ for MCP server
- Target application running locally

### Out of Scope for MVP

- Code analysis engine (Claude does this natively)
- Playwright integration (use existing Playwright MCP)
- Database query execution (Claude uses DB tools directly)
- Docker container management (Playwright MCP handles this)
- CI/CD integration (requires headless skill execution)
- Multi-browser support
- Parallel test execution
- Test parameterization
- Team collaboration features
- Cloud storage/sync

### MVP Success Criteria

1. User can install HarshJudge (MCP + Skill) in < 5 minutes
2. `/harshjudge:setup` successfully guides configuration
3. `/harshjudge:analyze` produces actionable test suggestions
4. `/harshjudge:create` generates valid scenario files
5. `/harshjudge:run` executes scenarios with complete evidence capture
6. Dashboard displays projects, scenarios, and run results correctly
7. End-to-end flow works for a standard login scenario

---

## Post-MVP Vision

### Phase 2 Features

- **Scenario Templates:** Pre-built templates for common flows (auth, CRUD, checkout)
- **Evidence Diff Viewer:** Compare screenshots between runs
- **Tag Grouping & Filtering:** Organize scenarios by tag in dashboard
- **Run Comparison:** Side-by-side comparison of two runs
- **Export Reports:** Generate PDF/HTML test reports

### Long-term Vision (1-2 Years)

- **Headless Skill Executor:** Run skills in CI without interactive Claude
- **CI/CD Integration:** GitHub Actions workflow for automated testing
- **AI Auto-Fix:** Claude analyzes failures and suggests code fixes
- **Cross-Project Analytics:** Aggregate insights across all projects
- **Team Collaboration:** Shared dashboards, role-based access
- **Cloud Sync:** Optional cloud storage for run history
- **Visual Regression Testing:** Pixel-diff comparison between runs

### Expansion Opportunities

- **Enterprise Edition:** SSO, audit logs, compliance features
- **Skill Marketplace:** Community-contributed skill variations
- **API Testing Mode:** Extend beyond E2E to API-only testing
- **Mobile Testing:** React Native, Flutter support
- **Performance Testing:** Lighthouse integration

---

## Technical Considerations

### Platform Requirements

- **Target Platforms:** macOS, Windows, Linux (anywhere Claude Code runs)
- **Node.js Version:** 18+ (LTS)
- **Prerequisites:** Playwright MCP, Claude Code

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **MCP Server** | Node.js + TypeScript | File operations, validation |
| **Skill Files** | Markdown | Claude behavior patterns |
| **Dashboard** | Vite + React + TailwindCSS | Results visualization |
| **File Watching** | chokidar | Live dashboard updates |
| **YAML/Markdown** | js-yaml, marked | File parsing |

### Architecture

```
HarshJudge/
├── packages/
│   ├── mcp-server/        # @harshjudge/mcp - lightweight MCP
│   ├── ux/                # @harshjudge/dashboard - React app
│   └── shared/            # @harshjudge/shared - types
├── skills/
│   └── harshjudge/        # Claude skill files
│       ├── skill.md
│       ├── setup.md
│       ├── analyze.md
│       ├── create.md
│       ├── run.md
│       └── status.md
└── turbo.json             # Monorepo config
```

### Integration Points

- **Claude Code:** MCP protocol (stdio) for tools
- **Playwright MCP:** Claude calls directly for browser automation
- **Database Tools:** Claude calls directly for DB verification
- **Filesystem:** MCP reads/writes `.harshJudge/` directory
- **Dashboard:** Watches filesystem, serves React app

### Security/Compliance

- No data leaves local machine (privacy-first)
- Credentials read from .env files, never stored
- MCP validates all inputs before writing
- Dashboard is read-only, cannot modify test data

---

## Constraints & Assumptions

### Constraints

- **Budget:** Open-source project, no infrastructure costs for MVP
- **Timeline:** MVP target 3-4 weeks (reduced from 6-8 due to simpler architecture)
- **Resources:** Solo developer initially, community contributions welcome
- **Technical:** Must work offline, no cloud dependencies for core features

### Key Assumptions

- Users have Claude Code installed and configured
- Users have (or will install) Playwright MCP for browser automation
- Users have access to database tools if DB verification is needed
- Target projects use common tech stacks (React, Next.js, Node.js)
- Users are comfortable with Claude Code workflows
- Users want AI to do the heavy lifting, not just assist

### Dependencies

| Dependency | Required For | Risk Level |
|------------|--------------|------------|
| Claude Code | Everything | Low (stable) |
| Playwright MCP | Test execution | Medium (external) |
| Node.js 18+ | MCP server | Low (standard) |
| Database access | DB verification | Low (optional) |

---

## Risks & Open Questions

### Key Risks

- **Playwright MCP Dependency:** HarshJudge requires external Playwright MCP
  - *Mitigation:* Document compatible MCPs, test with official Anthropic version

- **Skill Consistency:** Claude may not follow skill instructions perfectly
  - *Mitigation:* Clear, explicit skill protocols with validation in MCP

- **Evidence Format Drift:** Different Playwright MCPs may return different formats
  - *Mitigation:* Normalize evidence in recordEvidence tool

- **Adoption Barrier:** Two-component install (MCP + Skill) vs single install
  - *Mitigation:* `harshjudge init` command installs both automatically

### Open Questions

- What is the best Playwright MCP to recommend/support?
- Should skills be bundled with MCP or installed separately?
- How to handle skill versioning as protocols evolve?
- Should we provide a "skill validator" to check Claude is following protocol?
- What's the migration path if users have existing test suites?

### Resolved Questions

- ~~Should HarshJudge include Playwright?~~ No - use existing Playwright MCP
- ~~Should HarshJudge analyze code?~~ No - Claude does this natively
- ~~How to ensure deterministic execution?~~ Claude Skill provides patterns
- ~~What's the unique value?~~ Orchestration + Organization + Visibility

---

## Appendices

### A. Architecture Decision Record

**Decision:** Skill + Lightweight MCP instead of Full-Featured MCP

**Context:** Original design had HarshJudge implementing Playwright integration, code analysis, and test execution. This duplicated capabilities Claude already has via Playwright MCP and native code understanding.

**Decision:** Pivot to three-component model:
1. Claude Skill for workflow patterns
2. Lightweight MCP for file operations only
3. Dashboard for visibility

**Consequences:**
- 70% reduction in code to write
- 50% reduction in MVP timeline
- Dependency on external Playwright MCP
- More aligned with "AI-native" philosophy

### B. Competitive Landscape

| Competitor | Approach | HarshJudge Advantage |
|------------|----------|---------------------|
| Cypress | Manual test authoring | AI generates and runs tests |
| Playwright | Manual test authoring | AI generates and runs tests |
| TestSprite | Record & replay | Understands code context |
| Custom Scripts | Fragmented, no structure | Organized, visible, consistent |

### C. References

- [MCP SDK Documentation](https://github.com/anthropics/mcp)
- [Playwright MCP](https://github.com/anthropics/playwright-mcp)
- [Claude Code Documentation](https://claude.ai/code)
- Brainstorming Results: `docs/brainstorming-session-results.md`

---

## Next Steps

### Immediate Actions

1. **Design MCP Tool Schemas** - Define exact TypeScript interfaces for all tools
2. **Design Skill Files** - Write complete skill markdown files
3. **Design File Schemas** - Define YAML/JSON formats for all files
4. **Implement MCP Server** - Lightweight file operations only
5. **Implement Skills** - Test with Claude Code
6. **Build Dashboard** - React app with file watching
7. **Create Installation Flow** - `harshjudge init` command
8. **End-to-end Testing** - Test complete flow with sample project

### Development Phases

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Phase 1** | Week 1 | MCP server with all tools, file schemas |
| **Phase 2** | Week 2 | Claude skills, installation flow |
| **Phase 3** | Week 3 | Dashboard with live updates |
| **Phase 4** | Week 4 | Integration testing, documentation |

### Architect Handoff

This Project Brief provides the full context for **HarshJudge v2** with the Skill + MCP + Dashboard architecture. The Architect should create:

1. Full-stack architecture document
2. MCP tool specifications
3. Skill file templates
4. File schema definitions
5. Dashboard component design
