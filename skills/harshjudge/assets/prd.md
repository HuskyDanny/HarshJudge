# Product Requirements Document (PRD)

> **Project:** {PROJECT_NAME}
> **Created:** {DATE}
> **Last Updated:** {DATE}

## Product Overview

### What is this product?
{Brief description of the application under test}

### Core Purpose
{What problem does it solve? Who uses it?}

### Tech Stack
- **Frontend:** {e.g., React, Vue, Next.js}
- **Backend:** {e.g., FastAPI, Node.js, Django}
- **Database:** {e.g., PostgreSQL, MongoDB}
- **Key Dependencies:** {e.g., OpenAI API, Stripe}

---

## User Flows to Test

### Critical Flows (P0)
Must work for product to function:

| Flow | Entry Point | Success Criteria |
|------|-------------|------------------|
| {flow_name} | {URL/action} | {what defines success} |

### Important Flows (P1)
Core features that should work:

| Flow | Entry Point | Success Criteria |
|------|-------------|------------------|

### Nice-to-Have Flows (P2)
Secondary features:

| Flow | Entry Point | Success Criteria |
|------|-------------|------------------|

---

## Test Environment

### URLs
- **Local Dev:** {http://localhost:3000}
- **Staging:** {URL if applicable}
- **Production:** {URL if applicable}

### Credentials
| User Type | Username | Password | Notes |
|-----------|----------|----------|-------|
| Admin | {username} | {password} | {access level} |
| Regular User | {username} | {password} | {access level} |

### Environment Setup
```bash
# Commands to start the application for testing
{startup commands}
```

### Required Services
- [ ] {Service 1} - {how to verify it's running}
- [ ] {Service 2} - {how to verify it's running}

---

## Architecture Notes for Testing

### Key UI Patterns
{Notes about UI that affect test selectors}

- **Button pattern:** {e.g., "Primary actions use .btn-primary"}
- **Form pattern:** {e.g., "Inputs have data-testid attributes"}
- **Navigation:** {e.g., "Sidebar on left, main content right"}

### API Patterns
{Notes about API behavior relevant to testing}

- **Auth:** {e.g., "JWT tokens stored in localStorage"}
- **Loading states:** {e.g., "Shows spinner during API calls"}
- **Error handling:** {e.g., "Toast notifications for errors"}

### Timing Considerations
{Known slow operations that need waits}

| Operation | Typical Duration | Notes |
|-----------|-----------------|-------|
| {operation} | {time} | {when to expect} |

---

## Known Constraints

### Testing Limitations
- {Limitation 1}
- {Limitation 2}

### Flaky Areas
{Parts of the app known to be inconsistent}

### Out of Scope
{What we're NOT testing and why}

---

## Scenario Registry

Scenarios created for this product:

| Slug | Title | Priority | Status |
|------|-------|----------|--------|
| {slug} | {title} | P0/P1/P2 | Active/Deprecated |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| {date} | Initial PRD creation | {author} |
