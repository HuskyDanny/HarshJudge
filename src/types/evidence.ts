/**
 * Types of evidence that can be captured during test execution
 */
export type EvidenceType =
  | 'screenshot'
  | 'db_snapshot'
  | 'console_log'
  | 'network_log'
  | 'html_snapshot'
  | 'custom';

/**
 * Artifacts captured during test execution (v2)
 */
export interface Evidence {
  runId: string;
  stepId: string; // Changed from step: number to stepId: string
  type: EvidenceType;
  name: string;
  filePath: string;
  capturedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Metadata stored alongside evidence files as `.meta.json` (v2)
 */
export interface EvidenceMeta {
  runId: string;
  stepId: string; // Changed from step: number to stepId: string
  type: EvidenceType;
  name: string;
  capturedAt: string;
  fileSize: number;
  metadata?: Record<string, unknown>;
}

/**
 * @deprecated Use Evidence instead (stepId: string)
 */
export interface EvidenceV1 {
  runId: string;
  step: number;
  type: EvidenceType;
  name: string;
  filePath: string;
  capturedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * @deprecated Use EvidenceMeta instead (stepId: string)
 */
export interface EvidenceMetaV1 {
  runId: string;
  step: number;
  type: EvidenceType;
  name: string;
  capturedAt: string;
  fileSize: number;
  metadata?: Record<string, unknown>;
}
