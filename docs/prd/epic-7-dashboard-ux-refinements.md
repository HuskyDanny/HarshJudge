# Epic 7: Dashboard UX Refinements

## Goal

Improve dashboard usability by creating a step-centric evidence view and removing confusing UI elements. The current dashboard shows evidence in a disconnected way (images separate from logs) making it hard to understand what happened at each step.

## Background

Real-world testing revealed several UX issues:
1. Screenshots are displayed sequentially without step context - if step 1 has no image, step 2 appears first
2. Logs/DB verification are in a separate section, disconnected from their steps
3. "No runs yet" label appears even when runs exist
4. "Never run" status is confusing
5. Stats section shows incorrect values and isn't synced with runs

## Stories

### Story 7.1: Step-Centric Evidence View

**As a** HarshJudge user viewing test results,
**I want** evidence organized by step with tabs for different evidence types,
**so that** I can easily see all evidence for each step without hunting through different sections.

**Acceptance Criteria:**
1. Horizontal step navigation showing all steps (1:1 mapping with scenario steps)
   - Each step shows title
   - Click to select step
   - Steps without any evidence still appear (for completeness)
2. Selected step shows tabbed evidence sections:
   - Images tab (screenshots, before/after)
   - Logs tab (console, network logs)
   - DB Verification tab (database snapshots)
3. Each tab shows "No [type] for this step" if empty (not hidden)
4. Tabs use horizontal layout to minimize user friction
5. Remove/fix broken UI elements:
   - Remove "No runs yet" label (shows incorrectly)
   - Remove "Never run" status from StatusBadge (confusing)
   - Remove Stats section (values not synced with runs)
   - Order runs by datetime (newest first)

---

## Dependencies

- Story 6.7 (Dashboard Adaptation) - provides v2 structure support
- Existing components: StepTimeline, EvidencePanel, RunDetailPanel

## Technical Notes

### Current Structure (to refactor)
```
RunDetailPanel
├── StepTimeline (thumbnails only for steps WITH screenshots)
├── ScreenshotViewer (single image)
├── StepMetadata
├── LogSection (error only)
└── EvidencePanel (non-screenshot evidence, separate)
```

### Target Structure
```
RunDetailPanel
├── StepSelector (horizontal tabs, ALL steps, shows title)
└── StepEvidenceView
    └── TabPanel (Images | Logs | DB)
        └── Content or "No [type] for this step"
```

---

## Success Metrics

1. **Reduced confusion:** Users can immediately find all evidence for any step
2. **Complete visibility:** All steps visible even without screenshots
3. **Cleaner UI:** Removed non-functional/confusing elements (stats, "Never run")

---
