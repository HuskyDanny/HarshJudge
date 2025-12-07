---
id: "demo-logout-001"
slug: "logout-flow"
title: "User Logout Flow"
tags: ["auth", "smoke"]
estimatedDuration: 20
---

# Overview

Tests the user logout flow for the HarshJudge demo application.
This scenario verifies that authenticated users can successfully
log out and are redirected back to the login page.

# Prerequisites

- Demo application running at http://localhost:3000
- User must be logged in first (run login-flow scenario first)
- Demo user credentials: demo@example.com / demo123

# Steps

## Step 1: Navigate to Dashboard (Authenticated)

**Action:** Login and navigate to the dashboard page

**Playwright:**
```javascript
// First login
await page.goto('http://localhost:3000/login');
await page.fill('[data-testid="email-input"]', 'demo@example.com');
await page.fill('[data-testid="password-input"]', 'demo123');
await page.click('[data-testid="login-button"]');
await page.waitForURL('**/dashboard');
```

**Verify:** User is on the dashboard page, logged in

---

## Step 2: Verify User is Logged In

**Action:** Confirm the dashboard shows the logged-in user

**Playwright:**
```javascript
await page.waitForSelector('[data-testid="user-name"]');
const userName = await page.textContent('[data-testid="user-name"]');
```

**Verify:** User name "Demo User" is displayed in the header

---

## Step 3: Click Logout Button

**Action:** Click the logout button in the header

**Playwright:**
```javascript
await page.click('[data-testid="logout-button"]');
await page.waitForURL('**/login');
```

**Verify:** Browser navigates to /login URL

---

## Step 4: Verify Redirect to Login Page

**Action:** Confirm the login page is displayed

**Playwright:**
```javascript
await page.waitForSelector('[data-testid="email-input"]');
```

**Verify:** Login form is displayed with email and password fields

---

## Step 5: Verify Session is Cleared

**Action:** Try to access dashboard directly - should redirect to login

**Playwright:**
```javascript
await page.goto('http://localhost:3000/dashboard');
await page.waitForURL('**/login');
```

**Verify:** Accessing /dashboard redirects back to /login (session cleared)

# Expected Final State

- User is logged out
- Session cookie is cleared
- Attempting to access protected routes redirects to login
- Login page is displayed
