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
 * Artifacts captured during test execution
 */
export interface Evidence {
  runId: string;
  step: number;
  type: EvidenceType;
  name: string;
  filePath: string;
  capturedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Metadata stored alongside evidence files as `.meta.json`
 */
export interface EvidenceMeta {
  runId: string;
  step: number;
  type: EvidenceType;
  name: string;
  capturedAt: string;
  fileSize: number;
  metadata?: Record<string, unknown>;
}
