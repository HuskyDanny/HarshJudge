# 4. Data Models

## 4.1 HarshJudgeConfig

**Purpose:** Project-level configuration stored in `.harshJudge/config.yaml`

**Key Attributes:**
- `projectName`: string - Human-readable project name
- `baseUrl`: string - Base URL for the target application
- `version`: string - Config schema version
- `createdAt`: string - ISO timestamp of initialization

```typescript
// packages/shared/src/types/config.ts
export interface HarshJudgeConfig {
  projectName: string;
  baseUrl: string;
  version: string;
  createdAt: string;
}
```

**Relationships:**
- Parent of all Scenarios
- One per project

---

## 4.2 ProjectPRD

**Purpose:** Project-level context stored in `.harshJudge/prd.md` to avoid duplication across scenarios

**Key Attributes:**
- `appType`: 'backend' | 'fullstack' | 'frontend' | 'other' - Type of application
- `ports`: object - Port configuration for services
- `scenarios`: string[] - High-level list of main scenarios
- `auth`: object - Authentication requirements for testing
- `techStack`: string[] - Frameworks, libraries, tools

```typescript
// packages/shared/src/types/config.ts
export interface ProjectPRD {
  appType: 'backend' | 'fullstack' | 'frontend' | 'other';
  ports: {
    frontend?: number;
    backend?: number;
    database?: number;
  };
  scenarios: string[];
  auth: {
    required: boolean;
    loginUrl?: string;
    testCredentials?: {
      username: string;
      password: string;
    };
  };
  techStack: string[];
}
```

**Relationships:**
- One per project
- Referenced by all scenarios for context

---

## 4.3 Scenario

**Purpose:** Test scenario definition with step references stored in `meta.yaml`

**Key Attributes:**
- `slug`: string - Unique identifier (URL-safe)
- `title`: string - Human-readable title
- `starred`: boolean - Whether scenario is marked as important
- `tags`: string[] - Categorization tags
- `estimatedDuration`: number - Expected duration in seconds
- `steps`: StepReference[] - Ordered list of step references

```typescript
// packages/shared/src/types/scenario.ts
export interface StepReference {
  id: string;           // Zero-padded: "01", "02", etc.
  title: string;        // Human-readable step title
  file: string;         // Filename: "01-navigate-to-login.md"
}

export interface Scenario {
  slug: string;
  title: string;
  starred: boolean;
  tags: string[];
  estimatedDuration: number;
  steps: StepReference[];
}

// Legacy - kept for backward compatibility reference
export interface ScenarioFrontmatter {
  id: string;
  title: string;
  tags: string[];
  estimatedDuration: number;
}
```

**Relationships:**
- Belongs to one Project (via directory structure)
- Has many Steps
- Has many Runs
- Has one ScenarioMeta

---

## 4.4 Step

**Purpose:** Individual test step stored as `{id}-{slug}.md` in `steps/` folder

**Key Attributes:**
- `id`: string - Zero-padded identifier ("01", "02")
- `title`: string - Step title
- `description`: string - What this step does
- `preconditions`: string - Expected state before step
- `actions`: string - Actions to perform (Playwright code/instructions)
- `expectedOutcome`: string - What should happen after step

```typescript
// packages/shared/src/types/scenario.ts
export interface Step {
  id: string;
  title: string;
  description: string;
  preconditions: string;
  actions: string;
  expectedOutcome: string;
}

export interface StepFile {
  id: string;
  title: string;
  content: string;  // Full markdown content
}
```

**Relationships:**
- Belongs to one Scenario
- Has many Evidence artifacts (per run)

---

## 4.5 ScenarioMeta

**Purpose:** Machine-updated statistics stored in `meta.yaml` (merged with Scenario)

**Key Attributes:**
- `totalRuns`: number - Count of all runs
- `passCount`: number - Count of passed runs
- `failCount`: number - Count of failed runs
- `lastRun`: string | null - ISO timestamp of last run
- `lastResult`: 'pass' | 'fail' | null - Result of last run
- `avgDuration`: number - Average run duration in ms

```typescript
// packages/shared/src/types/scenario.ts
export interface ScenarioMeta {
  // Scenario definition
  slug: string;
  title: string;
  starred: boolean;
  tags: string[];
  estimatedDuration: number;
  steps: StepReference[];

  // Statistics (machine-updated)
  totalRuns: number;
  passCount: number;
  failCount: number;
  lastRun: string | null;
  lastResult: 'pass' | 'fail' | null;
  avgDuration: number;
}
```

**Relationships:**
- One-to-one with Scenario

---

## 4.6 Run

**Purpose:** Single execution of a scenario

**Key Attributes:**
- `id`: string - Unique run ID (nanoid)
- `scenarioSlug`: string - Parent scenario identifier
- `runNumber`: number - Sequential run number for this scenario
- `startedAt`: string - ISO timestamp
- `status`: 'running' | 'completed' - Current status

```typescript
// packages/shared/src/types/run.ts
export interface Run {
  id: string;
  scenarioSlug: string;
  runNumber: number;
  startedAt: string;
  status: 'running' | 'completed';
}
```

**Relationships:**
- Belongs to one Scenario
- Has many StepResults
- Has many Evidence artifacts (organized by step)
- Has one RunResult (when completed)

---

## 4.7 StepResult

**Purpose:** Result of a single step execution within a run

**Key Attributes:**
- `id`: string - Step ID ("01", "02")
- `status`: 'pass' | 'fail' | 'skipped' - Step outcome
- `duration`: number - Step duration in ms
- `error`: string | null - Error message if failed
- `evidenceFiles`: string[] - Paths to evidence files

```typescript
// packages/shared/src/types/run.ts
export interface StepResult {
  id: string;
  status: 'pass' | 'fail' | 'skipped';
  duration: number;
  error: string | null;
  evidenceFiles: string[];
}
```

**Relationships:**
- Belongs to one Run
- Has many Evidence artifacts

---

## 4.8 RunResult

**Purpose:** Final outcome of a run stored in `result.json`

**Key Attributes:**
- `runId`: string - Reference to parent run
- `scenarioSlug`: string - Parent scenario
- `status`: 'pass' | 'fail' - Final status
- `startedAt`: string - ISO timestamp
- `completedAt`: string - ISO timestamp
- `duration`: number - Total duration in ms
- `steps`: StepResult[] - Per-step results
- `failedStep`: string | null - Step ID that failed
- `errorMessage`: string | null - Error description

```typescript
// packages/shared/src/types/run.ts
export interface RunResult {
  runId: string;
  scenarioSlug: string;
  status: 'pass' | 'fail';
  startedAt: string;
  completedAt: string;
  duration: number;
  steps: StepResult[];
  failedStep: string | null;
  errorMessage: string | null;
}
```

**Relationships:**
- One-to-one with Run

---

## 4.9 Evidence

**Purpose:** Artifacts captured during test execution, organized by step

**Key Attributes:**
- `runId`: string - Parent run ID
- `stepId`: string - Step ID ("01", "02")
- `type`: EvidenceType - Type of evidence
- `name`: string - Descriptive name
- `filePath`: string - Relative path to file
- `capturedAt`: string - ISO timestamp

```typescript
// packages/shared/src/types/evidence.ts
export type EvidenceType =
  | 'screenshot'
  | 'db_snapshot'
  | 'console_log'
  | 'network_log'
  | 'html_snapshot'
  | 'custom';

export interface Evidence {
  runId: string;
  stepId: string;
  type: EvidenceType;
  name: string;
  filePath: string;
  capturedAt: string;
  metadata?: Record<string, unknown>;
}

export interface EvidenceMeta {
  runId: string;
  stepId: string;
  type: EvidenceType;
  name: string;
  capturedAt: string;
  fileSize: number;
  metadata?: Record<string, unknown>;
}
```

**Relationships:**
- Belongs to one Run
- Belongs to one Step (within the run)
- Stored in `runs/{runId}/step-{stepId}/evidence/`

---

## 4.10 ProjectStatus

**Purpose:** Aggregated status for dashboard queries

```typescript
// packages/shared/src/types/status.ts
export interface ScenarioSummary {
  slug: string;
  title: string;
  starred: boolean;
  tags: string[];
  stepCount: number;
  lastResult: 'pass' | 'fail' | null;
  lastRun: string | null;
  totalRuns: number;
  passRate: number;
}

export interface ProjectStatus {
  projectName: string;
  scenarioCount: number;
  passing: number;
  failing: number;
  neverRun: number;
  scenarios: ScenarioSummary[];
}

export interface ScenarioDetail {
  slug: string;
  title: string;
  starred: boolean;
  tags: string[];
  steps: StepReference[];
  meta: ScenarioMeta;
  recentRuns: RunSummary[];
}

export interface RunSummary {
  id: string;
  runNumber: number;
  status: 'pass' | 'fail';
  duration: number;
  completedAt: string;
  steps: StepResult[];
  failedStep: string | null;
  errorMessage: string | null;
}
```

---
