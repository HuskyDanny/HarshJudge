---
id: "demo-login-001"
slug: "login-flow"
title: "User Login Flow"
tags: ["auth", "critical", "smoke"]
estimatedDuration: 30
---

# Overview

Tests the complete user login flow for the HarshJudge demo application.
This scenario verifies that users can successfully authenticate using
valid credentials and are redirected to the dashboard.

# Prerequisites

- Demo application running at http://localhost:3000
- Demo user exists: demo@example.com / demo123

# Steps

## Step 1: Navigate to Login Page

**Action:** Open the login page in the browser

**Playwright:**
```javascript
await page.goto('http://localhost:3000/login');
```

**Verify:** Login form is displayed with email and password input fields

---

## Step 2: Enter Email Address

**Action:** Fill in the email field with the demo user's email

**Playwright:**
```javascript
await page.fill('[data-testid="email-input"]', 'demo@example.com');
```

**Verify:** Email field contains "demo@example.com"

---

## Step 3: Enter Password

**Action:** Fill in the password field with the demo user's password

**Playwright:**
```javascript
await page.fill('[data-testid="password-input"]', 'demo123');
```

**Verify:** Password field is filled (masked input)

---

## Step 4: Submit Login Form

**Action:** Click the login button and wait for navigation to dashboard

**Playwright:**
```javascript
await page.click('[data-testid="login-button"]');
await page.waitForURL('**/dashboard');
```

**Verify:** Browser navigates to /dashboard URL

---

## Step 5: Verify Dashboard Display

**Action:** Confirm the dashboard page is displayed with user information

**Playwright:**
```javascript
await page.waitForSelector('[data-testid="login-success"]');
const userName = await page.textContent('[data-testid="user-name"]');
```

**Verify:**
- Success message "Successfully logged in!" is visible
- User name "Demo User" is displayed in header

# Expected Final State

- User is authenticated and logged in
- Dashboard page is displayed at /dashboard
- User name "Demo User" is shown in the header
- Session cookie is set
- Success message is visible
