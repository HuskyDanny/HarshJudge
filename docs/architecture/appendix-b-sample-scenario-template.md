# Appendix B: Sample Scenario Template

```markdown
---
id: user-login
title: User Login Flow
tags: [auth, critical, smoke]
estimatedDuration: 30
---

# Overview

Test the complete user login flow from landing page to dashboard.

# Prerequisites

- Test user exists: test@example.com / password123
- Application running at configured baseUrl
- Database accessible for verification

# Steps

## Step 1: Navigate to Landing Page

**Action:** Open the application landing page

**Playwright:**
```javascript
await page.goto('/');
await page.waitForLoadState('networkidle');
```

**Verify:** Landing page loads with login button visible

---

## Step 2: Click Login Button

**Action:** Click the login button to open login form

**Playwright:**
```javascript
await page.click('[data-testid="login-button"]');
await page.waitForSelector('[data-testid="login-form"]');
```

**Verify:** Login form is displayed

---

## Step 3: Enter Credentials

**Action:** Fill in email and password

**Playwright:**
```javascript
await page.fill('[data-testid="email-input"]', 'test@example.com');
await page.fill('[data-testid="password-input"]', 'password123');
```

**Verify:** Both fields contain entered values

---

## Step 4: Submit Login

**Action:** Click submit and wait for navigation

**Playwright:**
```javascript
await page.click('[data-testid="submit-button"]');
await page.waitForURL('**/dashboard');
```

**Verify:** Redirected to dashboard page

**DB Verification:**
```sql
SELECT last_login FROM users WHERE email = 'test@example.com';
-- Verify: last_login is within the last minute
```

---

# Expected Final State

- User is authenticated
- Dashboard page is displayed
- Session cookie is set
- Database last_login is updated
```

---
