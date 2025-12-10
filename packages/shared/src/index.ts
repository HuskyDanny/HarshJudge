// @harshjudge/shared - Shared utilities and types

// Config types
export type { HarshJudgeConfig } from './types/config.js';

// Scenario types
export type { Scenario, ScenarioFrontmatter, ScenarioMeta } from './types/scenario.js';

// Run types
export type { Run, RunResult } from './types/run.js';

// Evidence types
export type { EvidenceType, Evidence, EvidenceMeta } from './types/evidence.js';

// Status types
export type {
  ScenarioSummary,
  ProjectStatus,
  RunSummary,
  ScenarioDetail,
} from './types/status.js';

// MCP tool types - Zod schemas and inferred types
export {
  InitProjectParamsSchema,
  SaveScenarioParamsSchema,
  StartRunParamsSchema,
  RecordEvidenceParamsSchema,
  CompleteRunParamsSchema,
  GetStatusParamsSchema,
  OpenDashboardParamsSchema,
  CloseDashboardParamsSchema,
  GetDashboardStatusParamsSchema,
} from './types/mcp-tools.js';

export type {
  InitProjectParams,
  InitProjectResult,
  SaveScenarioParams,
  SaveScenarioResult,
  StartRunParams,
  StartRunResult,
  RecordEvidenceParams,
  RecordEvidenceResult,
  CompleteRunParams,
  CompleteRunResult,
  GetStatusParams,
  GetStatusResult,
  OpenDashboardParams,
  OpenDashboardResult,
  CloseDashboardParams,
  CloseDashboardResult,
  GetDashboardStatusParams,
  GetDashboardStatusResult,
} from './types/mcp-tools.js';

// Result utility
export { ok, err, isOk, isErr } from './utils/result.js';
export type { Result } from './utils/result.js';
