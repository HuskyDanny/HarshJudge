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

## 4.2 Scenario

**Purpose:** Test scenario definition stored as `scenario.md` with YAML frontmatter

**Key Attributes:**
- `id`: string - Unique identifier (same as slug)
- `title`: string - Human-readable title
- `tags`: string[] - Categorization tags
- `estimatedDuration`: number - Expected duration in seconds
- `content`: string - Markdown content with test steps

```typescript
// packages/shared/src/types/scenario.ts
export interface Scenario {
  id: string;
  title: string;
  tags: string[];
  estimatedDuration: number;
  content: string;
}

export interface ScenarioFrontmatter {
  id: string;
  title: string;
  tags: string[];
  estimatedDuration: number;
}
```

**Relationships:**
- Belongs to one Project (via directory structure)
- Has many Runs
- Has one ScenarioMeta

---

## 4.3 ScenarioMeta

**Purpose:** Machine-updated statistics stored in `meta.yaml`

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

## 4.4 Run

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
- Has many Evidence artifacts
- Has one RunResult (when completed)

---

## 4.5 RunResult

**Purpose:** Final outcome of a run stored in `result.json`

**Key Attributes:**
- `runId`: string - Reference to parent run
- `status`: 'pass' | 'fail' - Final status
- `duration`: number - Total duration in ms
- `completedAt`: string - ISO timestamp
- `failedStep`: number | null - Step number that failed
- `errorMessage`: string | null - Error description

```typescript
// packages/shared/src/types/run.ts
export interface RunResult {
  runId: string;
  status: 'pass' | 'fail';
  duration: number;
  completedAt: string;
  failedStep: number | null;
  errorMessage: string | null;
  stepCount: number;
  evidenceCount: number;
}
```

**Relationships:**
- One-to-one with Run

---

## 4.6 Evidence

**Purpose:** Artifacts captured during test execution

**Key Attributes:**
- `runId`: string - Parent run ID
- `step`: number - Step number (1-based)
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
  step: number;
  type: EvidenceType;
  name: string;
  filePath: string;
  capturedAt: string;
  metadata?: Record<string, unknown>;
}

export interface EvidenceMeta {
  runId: string;
  step: number;
  type: EvidenceType;
  name: string;
  capturedAt: string;
  fileSize: number;
  metadata?: Record<string, unknown>;
}
```

**Relationships:**
- Belongs to one Run
- Stored as file with accompanying `.meta.json`

---

## 4.7 ProjectStatus

**Purpose:** Aggregated status for dashboard queries

```typescript
// packages/shared/src/types/status.ts
export interface ScenarioSummary {
  slug: string;
  title: string;
  tags: string[];
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
  tags: string[];
  content: string;
  meta: ScenarioMeta;
  recentRuns: RunSummary[];
}

export interface RunSummary {
  id: string;
  runNumber: number;
  status: 'pass' | 'fail';
  duration: number;
  completedAt: string;
  errorMessage: string | null;
}
```

---
