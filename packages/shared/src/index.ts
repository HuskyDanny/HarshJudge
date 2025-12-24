// @harshjudge/shared - Shared utilities and types

// Config types
export type { HarshJudgeConfig } from './types/config.js';

// Scenario types (v2)
export type {
  Step,
  StepReference,
  StepFile,
  Scenario,
  ScenarioMeta,
  ScenarioStats,
  // Legacy (v1 - deprecated)
  ScenarioV1,
  ScenarioFrontmatter,
  ScenarioMetaV1,
} from './types/scenario.js';
export {
  StepReferenceSchema,
  ScenarioMetaSchema,
  DEFAULT_SCENARIO_STATS,
  padStepId,
  generateStepFilename,
} from './types/scenario.js';

// Run types (v2)
export type { Run, RunResult, StepResult, RunResultV1 } from './types/run.js';
export { StepResultSchema, RunResultSchema } from './types/run.js';

// Evidence types
export type { EvidenceType, Evidence, EvidenceMeta } from './types/evidence.js';

// Status types
export type {
  ScenarioSummary,
  ProjectStatus,
  RunSummary,
  ScenarioDetail,
  StepInfo,
} from './types/status.js';

// MCP tool types - Zod schemas and inferred types
export {
  InitProjectParamsSchema,
  // createScenario (new)
  StepInputSchema,
  CreateScenarioParamsSchema,
  // toggleStar (new)
  ToggleStarParamsSchema,
  // saveScenario (deprecated)
  SaveScenarioParamsSchema,
  StartRunParamsSchema,
  RecordEvidenceParamsSchema,
  CompleteRunParamsSchema,
  CompleteStepParamsSchema,
  GetStatusParamsSchema,
  OpenDashboardParamsSchema,
  CloseDashboardParamsSchema,
  GetDashboardStatusParamsSchema,
} from './types/mcp-tools.js';

export type {
  InitProjectParams,
  InitProjectResult,
  // createScenario (new)
  StepInput,
  CreateScenarioParams,
  CreateScenarioResult,
  // toggleStar (new)
  ToggleStarParams,
  ToggleStarResult,
  // saveScenario (deprecated)
  SaveScenarioParams,
  SaveScenarioResult,
  StartRunParams,
  StartRunResult,
  StartRunStepInfo,
  RecordEvidenceParams,
  RecordEvidenceResult,
  CompleteRunParams,
  CompleteRunResult,
  CompleteStepParams,
  CompleteStepResult,
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
