# Iteration Knowledge Base

> **Project:** {PROJECT_NAME}
> **Created:** {DATE}
> **Total Iterations:** {COUNT}

This document tracks all test iterations, capturing learnings that improve future test runs.

---

## Quick Reference

### Selector Mappings
Discovered mappings between logical elements and actual selectors:

| Logical Element | Selector | Discovered | Notes |
|----------------|----------|------------|-------|
| | | | |

### Timing Requirements
Operations that need explicit waits:

| Operation | Wait Strategy | Duration | Scenario |
|-----------|--------------|----------|----------|
| | | | |

### Common Failure Patterns
Patterns that cause test failures and their solutions:

| Pattern | Symptom | Solution | Scenarios Affected |
|---------|---------|----------|-------------------|
| | | | |

---

## Iteration Records

<!--
Each iteration follows this format:
- Date and unique ID
- Project and scenario context
- What changed and why
- Evidence-based learnings
- Status (resolved/ongoing)
-->

---

### ITR-{NUMBER}: {BRIEF_TITLE}

**Date:** {YYYY-MM-DD}
**Project:** {project_name}
**Scenario:** {scenario_slug}
**Run ID:** {run_id}
**Status:** {RESOLVED | ONGOING | BLOCKED}

#### Context
{What was being tested and what triggered this iteration}

#### Failure Analysis
- **Failed Step:** {step number and name}
- **Error:** {error message or symptom}
- **Root Cause:** {what actually caused the failure}

#### Evidence Reviewed
| Type | File | Key Finding |
|------|------|-------------|
| Screenshot | {filename} | {what it showed} |
| Log | {filename} | {relevant log entry} |
| DB | {filename} | {data state} |

#### Changes Made
```diff
- {what was removed/changed}
+ {what was added/changed to}
```

#### Learnings
- **Selector:** {if selector mapping discovered}
- **Timing:** {if timing requirement discovered}
- **Pattern:** {if common pattern identified}

#### Result
- **Re-run Status:** {PASS | FAIL}
- **Run ID:** {new_run_id}
- **Notes:** {any additional context}

---

<!-- ITERATION TEMPLATE - Copy this for new entries

### ITR-{NUMBER}: {BRIEF_TITLE}

**Date:** YYYY-MM-DD
**Project:**
**Scenario:**
**Run ID:**
**Status:** RESOLVED | ONGOING | BLOCKED

#### Context


#### Failure Analysis
- **Failed Step:**
- **Error:**
- **Root Cause:**

#### Evidence Reviewed
| Type | File | Key Finding |
|------|------|-------------|
| | | |

#### Changes Made
```diff
-
+
```

#### Learnings
- **Selector:**
- **Timing:**
- **Pattern:**

#### Result
- **Re-run Status:**
- **Run ID:**
- **Notes:**

---

-->

## Statistics

### By Scenario
| Scenario | Iterations | Pass Rate | Last Updated |
|----------|------------|-----------|--------------|
| | | | |

### By Failure Type
| Type | Count | Resolution Rate |
|------|-------|-----------------|
| Selector | | |
| Timing | | |
| App Bug | | |
| Env Issue | | |
| Scenario Design | | |

---

## Archive

Older iterations (>30 days) can be moved here for reference without cluttering the main section.

<!-- Archived iterations go here -->
