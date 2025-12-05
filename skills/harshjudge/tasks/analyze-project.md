# Analyze Project Task

## Purpose

Analyze the current project to understand its structure, identify testable flows, and suggest prioritized test scenarios.

## Triggers

- "analyze project"
- "suggest tests"
- "what should I test"
- `/harshjudge:analyze`

## Sequential Task Execution

### Phase 1: Tech Stack Detection

**Action:** Identify the project's technology stack

**Steps:**
1. Read `package.json` for dependencies
2. Detect framework:
   - Next.js: `next` in dependencies
   - React: `react` without `next`
   - Vue: `vue` in dependencies
   - Angular: `@angular/core` in dependencies
   - Express: `express` in dependencies
3. Detect language:
   - TypeScript: `typescript` in devDependencies or `tsconfig.json` exists
   - JavaScript: No TypeScript indicators
4. Detect testing tools:
   - Jest, Vitest, Mocha, Playwright, Cypress

**Output:**
```
📦 Tech Stack Detection
━━━━━━━━━━━━━━━━━━━━━━
Framework: {detected}
Language: {TypeScript|JavaScript}
Testing: {existing tools}
```

**Checkpoint:** ✓ Tech stack identified

---

### Phase 2: Route/Page Discovery

**Action:** Find all user-facing routes and pages

**Detection Strategies:**

**Next.js (App Router):**
```bash
ls -R app/**/page.{tsx,jsx,js,ts}
```

**Next.js (Pages Router):**
```bash
ls -R pages/**/*.{tsx,jsx,js,ts}
```

**React Router:**
- Search for `<Route` components
- Search for `createBrowserRouter` calls

**Express:**
- Search for `app.get`, `app.post`, `router.get`, etc.

**Output:**
```
🗺️ Route Discovery
━━━━━━━━━━━━━━━━━
Found {count} routes:

| Route | Type | File |
|-------|------|------|
| / | Page | app/page.tsx |
| /login | Page | app/login/page.tsx |
| /api/users | API | app/api/users/route.ts |
```

**Checkpoint:** ✓ Routes discovered

---

### Phase 3: API Endpoint Scanning

**Action:** Identify API endpoints for integration testing

**Detection Methods:**
1. Next.js API Routes: `app/api/**/route.ts`
2. Express routes: `routes/*.js`, `controllers/*.js`
3. OpenAPI/Swagger: `openapi.yaml`, `swagger.json`
4. GraphQL: `schema.graphql`, `resolvers/`

**For Each Endpoint:**
- Method (GET, POST, PUT, DELETE)
- Path
- Authentication required (look for middleware)
- Request/response types (if TypeScript)

**Output:**
```
🔌 API Endpoints
━━━━━━━━━━━━━━━
Found {count} endpoints:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | No | User login |
| GET | /api/users | Yes | List users |
```

**Checkpoint:** ✓ API endpoints scanned

---

### Phase 4: Database Schema Analysis

**Action:** Understand data models for DB verification testing

**Detection Sources:**
1. Prisma: `prisma/schema.prisma`
2. Drizzle: `drizzle/schema.ts`
3. TypeORM: `entities/*.ts`
4. Mongoose: `models/*.js`
5. SQL migrations: `migrations/*.sql`

**If Found:**
- List all models/tables
- Identify key fields
- Note relationships

**Output:**
```
🗄️ Database Schema
━━━━━━━━━━━━━━━━━
ORM: {Prisma|Drizzle|TypeORM|None detected}

Models found:
| Model | Key Fields | Relations |
|-------|------------|-----------|
| User | id, email, name | hasMany: Post |
| Post | id, title, userId | belongsTo: User |
```

**Checkpoint:** ✓ Database schema analyzed (or skipped if none)

---

### Phase 5: Auth Configuration Detection

**Action:** Identify authentication setup for auth flow testing

**Detection Sources:**
1. NextAuth: `auth.ts`, `[...nextauth]/route.ts`
2. Clerk: `clerk` in dependencies
3. Auth0: `@auth0` in dependencies
4. Custom: `middleware.ts` with auth checks
5. JWT: `jsonwebtoken` in dependencies

**Identify:**
- Auth providers (Google, GitHub, credentials, etc.)
- Protected routes
- Login/logout endpoints
- Session storage method

**Output:**
```
🔐 Authentication
━━━━━━━━━━━━━━━━
Method: {NextAuth|Clerk|Custom|None}
Providers: {Google, GitHub, Credentials}
Protected Routes: {list}
```

**Checkpoint:** ✓ Auth configuration detected

---

## Output: Analysis Summary

Use template: `templates/analysis-output-tmpl.md`

**Required Sections:**
1. Tech Stack Summary Table
2. Discovered Entry Points Table
3. Prioritized Test Scenario Suggestions

**Priority Criteria:**
- **Critical:** Auth flows, payment flows, data mutations
- **High:** Core user journeys, API endpoints
- **Medium:** Secondary features, edge cases
- **Low:** Static pages, informational content

---

## User Confirmation

**Before Proceeding:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Analysis Complete

I've identified {X} potential test scenarios.

Would you like me to:
1. Create all suggested scenarios
2. Select specific scenarios to create
3. Modify suggestions before creating
4. Export analysis only (no scenario creation)

Please choose an option or provide guidance.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Wait for user response before proceeding to scenario creation.**

---

## Rules

- Report progress after each phase
- Skip phases gracefully if not applicable (e.g., no database)
- Never assume - ask for clarification on ambiguous patterns
- Always wait for user confirmation before creating scenarios
- Output should be actionable and prioritized
