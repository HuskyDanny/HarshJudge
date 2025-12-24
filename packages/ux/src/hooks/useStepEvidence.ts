import { useMemo } from 'react';
import { getEvidenceForStep, getStepsWithEvidence, type CategorizedStepEvidence } from '@/lib';

interface UseStepEvidenceResult {
  /** Categorized evidence for the current step */
  evidence: CategorizedStepEvidence;
  /** Set of step IDs that have evidence */
  stepsWithEvidence: Set<string>;
  /** Whether the current step has any evidence */
  hasEvidence: boolean;
}

/**
 * Hook to get evidence for a specific step from run evidence paths.
 *
 * @param evidencePaths - Array of all evidence file paths for the run
 * @param stepId - Current step ID (zero-padded, e.g., "01")
 * @returns Categorized evidence for the step and metadata
 */
export function useStepEvidence(
  evidencePaths: string[],
  stepId: string | null
): UseStepEvidenceResult {
  // Get set of steps that have evidence
  const stepsWithEvidence = useMemo(
    () => getStepsWithEvidence(evidencePaths),
    [evidencePaths]
  );

  // Get evidence for the current step
  const evidence = useMemo(() => {
    if (!stepId) {
      return { images: [], logs: [], dbSnapshots: [] };
    }
    return getEvidenceForStep(evidencePaths, stepId);
  }, [evidencePaths, stepId]);

  // Check if current step has any evidence
  const hasEvidence = useMemo(() => {
    return (
      evidence.images.length > 0 ||
      evidence.logs.length > 0 ||
      evidence.dbSnapshots.length > 0
    );
  }, [evidence]);

  return {
    evidence,
    stepsWithEvidence,
    hasEvidence,
  };
}
