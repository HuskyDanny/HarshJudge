# User Interface Design Goals

## Overall UX Vision

HarshJudge's dashboard embodies a **"visibility without friction"** philosophy. The UX serves as a passive monitoring layer—a window into test status, run history, and diagnostic evidence—while deliberately avoiding action buttons or workflows. This reinforces the AI-native paradigm where Claude Code is the sole interface for performing operations. The design should feel like a sophisticated developer tool: information-dense but clean, fast to scan, and technically precise.

## Key Interaction Paradigms

- **Browse-Only Navigation:** Users navigate hierarchically (Projects → Scenarios → Run Details) but cannot create, edit, or trigger actions from the UI
- **Live Data Streaming:** File system watchers push updates to the UI in real-time; users never need to manually refresh
- **Drill-Down Exploration:** Click-to-expand pattern for exploring test runs, viewing screenshots, and examining failure logs
- **Timeline Scrubbing:** Step-by-step timeline for test runs allows users to "replay" the test visually via captured screenshots
- **Contextual Details:** Hovering or selecting items reveals additional metadata without page transitions

## Core Screens and Views

1. **Project List Panel** — Left column showing all discovered projects with status indicators (pass/fail/running)
2. **Scenario List Panel** — Middle column displaying scenarios for selected project with recent run status
3. **Detail Panel** — Right column showing:
   - Scenario content (rendered Markdown)
   - Run history list
   - Selected run details with step timeline
4. **Screenshot Viewer** — Full-screen or expanded view for examining captured screenshots with step navigation
5. **Log Viewer** — Expandable panel showing console, network, and error logs for failed runs

## Accessibility: WCAG AA

The dashboard shall meet WCAG AA accessibility standards including:
- Sufficient color contrast ratios (4.5:1 for text)
- Keyboard navigation support for all interactive elements
- Screen reader compatible with proper ARIA labels
- Focus indicators for interactive elements

## Branding

**Visual Identity:**
- **Aesthetic:** Clean, modern developer tooling aesthetic—inspired by VS Code, GitHub, and Vercel dashboards
- **Color Palette:** Dark mode primary (developer preference), with light mode as secondary option
- **Typography:** Monospace fonts for code/logs, sans-serif for UI text
- **Iconography:** Minimal, functional icons (status indicators, navigation)
- **Name Treatment:** "HarshJudge" conveys rigorous, uncompromising test evaluation—the UI should feel precise and trustworthy

## Target Devices and Platforms: Web Responsive

- **Primary:** Desktop browsers (Chrome, Firefox, Safari, Edge) at 1280px+ width
- **Secondary:** Tablet landscape mode (1024px+) for monitoring scenarios
- **Consideration:** The 3-column layout may collapse to 2-column or stacked views on narrower screens, but the primary use case is desktop developer workstations

---
