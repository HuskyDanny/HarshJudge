# Epic 3: UX Dashboard

**Goal:** Build the Vite + React dashboard with 3-column layout, file watcher live updates, screenshot timeline viewer, and log viewer for test diagnostics. This read-only interface provides visibility into test status and results.

## Story 3.1: Set Up UX Package with Vite + React + TailwindCSS

**As a** developer,
**I want** a properly scaffolded UX package with modern tooling,
**so that** I can efficiently build the dashboard interface.

**Acceptance Criteria:**

1. `packages/ux` initialized with Vite, React 18, and TypeScript
2. TailwindCSS configured with custom theme extending default palette
3. Dark mode as default with CSS variables for theme switching
4. Path aliases configured (`@/components`, `@/hooks`, `@/lib`)
5. ESLint + Prettier integrated with project-wide rules
6. Development server runs on configurable port (default 5173)
7. Production build outputs static files to `dist/`
8. Basic `App.tsx` renders "HarshJudge Dashboard" placeholder
9. Package scripts: `dev`, `build`, `preview`, `lint`

---

## Story 3.2: Implement File System Data Layer

**As a** developer,
**I want** the dashboard to read data directly from `.harshJudge/` files,
**so that** no backend API is required for data access.

**Acceptance Criteria:**

1. Data layer module reads `.harshJudge/` directory structure
2. `useProjects()` hook returns list of discovered projects
3. `useScenarios(projectPath)` hook returns scenarios for given project
4. `useScenarioDetail(scenarioSlug)` hook returns full scenario with runs
5. `useRunDetail(scenarioSlug, runId)` hook returns run results and evidence paths
6. Data layer handles missing files gracefully (empty state, not errors)
7. TypeScript types imported from `@harshjudge/shared`
8. Unit tests mock file system reads and verify data transformation

---

## Story 3.3: Implement File Watcher for Live Updates

**As a** dashboard user,
**I want** the UI to update automatically when test results change,
**so that** I don't need to manually refresh to see new data.

**Acceptance Criteria:**

1. File watcher monitors `.harshJudge/` directory for changes
2. Watcher uses chokidar with appropriate debouncing (300ms)
3. File changes trigger React state updates via context/subscription pattern
4. Watched events: file add, file change, file delete
5. Watcher ignores irrelevant files (e.g., temporary files, `.swp`)
6. UI updates within 2 seconds of file system change (per NFR2)
7. Watcher cleans up properly on component unmount
8. Integration test verifies UI updates when scenario file modified

---

## Story 3.4: Build 3-Column Layout Shell

**As a** dashboard user,
**I want** a clean 3-column layout for navigating projects, scenarios, and details,
**so that** I can efficiently browse test information.

**Acceptance Criteria:**

1. Layout consists of: Project List (left), Scenario List (middle), Detail Panel (right)
2. Column widths: 200px (projects), 300px (scenarios), remaining (details)
3. Columns are resizable via drag handles
4. Layout responsive: collapses to stacked view on screens < 1024px
5. Header bar with HarshJudge logo and minimal controls (theme toggle)
6. Empty states shown when no data (e.g., "No projects found")
7. Selected item highlighted in each column
8. Keyboard navigation: arrow keys navigate lists, Enter selects
9. WCAG AA compliance: focus indicators, sufficient contrast

---

## Story 3.5: Implement Project List Panel

**As a** dashboard user,
**I want** to see all my projects with status indicators,
**so that** I can quickly identify which projects need attention.

**Acceptance Criteria:**

1. Panel displays list of discovered projects from file system
2. Each project shows: name, scenario count, overall status indicator
3. Status indicator: green (all pass), red (any fail), gray (never run)
4. Projects sorted alphabetically by name
5. Clicking project selects it and populates Scenario List
6. Selected project visually highlighted
7. Empty state: "No HarshJudge projects found" with setup hint
8. Panel header shows total project count

---

## Story 3.6: Implement Scenario List Panel

**As a** dashboard user,
**I want** to see all scenarios for a selected project with their status,
**so that** I can identify which scenarios are passing or failing.

**Acceptance Criteria:**

1. Panel displays scenarios for currently selected project
2. Each scenario shows: title, last run status, last run time (relative)
3. Status badges: ✓ Pass (green), ✗ Fail (red), — Never Run (gray)
4. Scenarios sorted by last run time (most recent first)
5. Clicking scenario selects it and populates Detail Panel
6. Scenario tags displayed as small chips below title
7. Quick stats shown: total runs, pass rate percentage
8. Empty state when project has no scenarios
9. Scenario list updates live when new runs complete

---

## Story 3.7: Implement Scenario Detail View

**As a** dashboard user,
**I want** to see scenario details including content and run history,
**so that** I can understand what the test does and how it has performed.

**Acceptance Criteria:**

1. Detail panel shows scenario information when scenario selected
2. Scenario content section: rendered Markdown of `scenario.md`
3. Statistics section: total runs, pass/fail counts, average duration
4. Run history section: list of recent runs (last 10)
5. Each run row shows: timestamp, result, duration, click to expand
6. Clicking a run navigates to Run Detail view
7. "No runs yet" empty state for scenarios never executed
8. Scenario metadata displayed: created date, last updated, tags

---

## Story 3.8: Implement Screenshot Timeline Viewer

**As a** dashboard user,
**I want** to view screenshots from a test run in timeline order,
**so that** I can visually trace the test execution step by step.

**Acceptance Criteria:**

1. Run Detail view shows horizontal timeline of steps
2. Each step represented as thumbnail with step number
3. Clicking thumbnail shows full-size screenshot in main area
4. Step status indicated on thumbnail: green border (pass), red (fail)
5. Current step highlighted in timeline
6. Arrow keys navigate between steps
7. Step metadata shown below screenshot: action, duration, URL
8. Failed step shows error message overlay on screenshot
9. Screenshot zoom: click to toggle fit-to-width vs actual size
10. Performance: thumbnails lazy-loaded, full images loaded on demand

---

## Story 3.9: Implement Log Viewer for Failed Runs

**As a** dashboard user,
**I want** to view captured logs when tests fail,
**so that** I can diagnose the root cause of failures.

**Acceptance Criteria:**

1. Log viewer appears in Run Detail for failed runs
2. Tabbed interface: Console, Network, HTML, Error tabs
3. Console tab: displays browser console entries with level indicators
4. Network tab: shows request/response data if captured
5. HTML tab: renders captured HTML in scrollable code block
6. Error tab: shows error message and stack trace
7. Logs searchable via filter input box
8. Large logs paginated or virtualized for performance
9. Copy-to-clipboard button for each log section
10. Logs hidden for passing runs (not captured)

---

## Story 3.10: Implement Dashboard Server

**As a** developer,
**I want** the dashboard to be servable as a standalone application,
**so that** users can view results in their browser.

**Acceptance Criteria:**

1. Dashboard builds to static files in `dist/`
2. CLI command `harshjudge dashboard` starts local server
3. Server serves static files and handles client-side routing
4. Server auto-detects `.harshJudge/` path from current directory
5. Server opens browser automatically on start
6. Server runs on configurable port (default 5678)
7. Graceful shutdown on Ctrl+C

---
