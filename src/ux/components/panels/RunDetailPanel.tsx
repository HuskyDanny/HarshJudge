import { type FC, useState, useMemo, useCallback } from 'react';
import { useRunDetail, useScenarioDetail, useStepEvidence, useKeyboardNavigation } from '@/hooks';
import { StatusBadge } from '../common/StatusBadge';
import { StepSelector } from '../detail/StepSelector';
import { StepEvidenceView, type CategorizedEvidence } from '../detail/StepEvidenceView';
import { LogSection } from '../detail/LogSection';
import { EmptyState } from '../common/EmptyState';

interface RunDetailPanelProps {
  /** Path to the project */
  projectPath: string;
  /** Slug of the scenario */
  scenarioSlug: string;
  /** Run ID to display */
  runId: string;
  /** Callback to go back to scenario detail */
  onBack: () => void;
}

/**
 * Panel displaying run detail with step-centric evidence view.
 * Features:
 * - Horizontal step selector showing all scenario steps
 * - Tabbed evidence viewer (Images, Logs, DB Verification)
 * - Empty state messages for steps without evidence
 * - Keyboard navigation support
 */
export const RunDetailPanel: FC<RunDetailPanelProps> = ({
  projectPath,
  scenarioSlug,
  runId,
  onBack,
}) => {
  const { runDetail, loading: runLoading, error: runError } = useRunDetail(projectPath, scenarioSlug, runId);
  const { scenarioDetail, loading: scenarioLoading } = useScenarioDetail(projectPath, scenarioSlug);

  // Current selected step ID
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);

  // Get steps from scenario detail (v2 structure)
  const steps = useMemo(() => scenarioDetail?.steps || [], [scenarioDetail]);

  // Get step evidence using the hook
  const { evidence, stepsWithEvidence } = useStepEvidence(
    runDetail?.evidencePaths || [],
    currentStepId
  );

  // Convert evidence to the format expected by StepEvidenceView
  const categorizedEvidence: CategorizedEvidence = useMemo(() => ({
    images: evidence.images.map(e => ({
      path: e.path,
      name: e.name,
      type: e.type,
      extension: e.extension,
    })),
    logs: evidence.logs.map(e => ({
      path: e.path,
      name: e.name,
      type: e.type,
      extension: e.extension,
    })),
    dbSnapshots: evidence.dbSnapshots.map(e => ({
      path: e.path,
      name: e.name,
      type: e.type,
      extension: e.extension,
    })),
  }), [evidence]);

  // Auto-select first step when steps are loaded
  useMemo(() => {
    if (steps.length > 0 && !currentStepId) {
      setCurrentStepId(steps[0]?.id || null);
    }
  }, [steps, currentStepId]);

  // Get current step index for keyboard navigation
  const currentStepIndex = useMemo(() => {
    if (!currentStepId) return -1;
    return steps.findIndex(s => s.id === currentStepId);
  }, [steps, currentStepId]);

  // Get error message for current step if it failed
  const currentStepError = useMemo(() => {
    if (!runDetail?.result?.failedStep || !currentStepId) return null;
    // failedStep is zero-padded string like "01"
    if (runDetail.result.failedStep === currentStepId) {
      return runDetail.result.errorMessage ?? null;
    }
    return null;
  }, [runDetail, currentStepId]);

  // Calculate step completion stats
  const stepStats = useMemo(() => {
    if (!runDetail?.result?.steps || runDetail.result.steps.length === 0) {
      return null;
    }
    const stepResults = runDetail.result.steps;
    const passedCount = stepResults.filter(s => s.status === 'pass').length;
    const totalCount = stepResults.length;
    const allPassed = passedCount === totalCount;
    return { passedCount, totalCount, allPassed };
  }, [runDetail]);

  // Get current step result (for summary and status)
  const currentStepResult = useMemo(() => {
    if (!runDetail?.result?.steps || !currentStepId) return null;
    return runDetail.result.steps.find(s => s.id === currentStepId) ?? null;
  }, [runDetail, currentStepId]);

  // Keyboard navigation callback
  const handleKeyboardSelect = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepId(steps[index]?.id || null);
    }
  }, [steps]);

  // Keyboard navigation hook
  const { handleKeyDown, containerRef } = useKeyboardNavigation({
    items: steps,
    selectedIndex: currentStepIndex,
    onSelect: handleKeyboardSelect,
    enabled: steps.length > 0,
  });

  // Handle left/right arrow keys for horizontal step navigation
  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (steps.length === 0) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (currentStepIndex > 0) {
          setCurrentStepId(steps[currentStepIndex - 1]?.id || null);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepId(steps[currentStepIndex + 1]?.id || null);
        }
        break;
      default:
        handleKeyDown(e);
    }
  };

  // Loading state
  const loading = runLoading || scenarioLoading;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500 animate-pulse">
          Loading run details...
        </div>
      </div>
    );
  }

  // Error state
  if (runError) {
    return (
      <EmptyState
        title="Error loading run"
        description={runError}
      />
    );
  }

  // Not found state
  if (!runDetail) {
    return (
      <EmptyState
        title="Run not found"
        description="The selected run could not be loaded"
      />
    );
  }

  // Truncate run ID for display
  const shortRunId = runId.length > 8 ? runId.slice(0, 8) : runId;

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full"
      onKeyDown={handleContainerKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Run detail viewer"
    >
      {/* Header with back button */}
      <header className="p-4 border-b border-gray-700 flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          aria-label="Back to scenario"
        >
          <BackArrowIcon />
          <span className="text-sm">Back</span>
        </button>

        <h2 className="text-lg font-medium text-white">
          Run #{shortRunId}
        </h2>

        {runDetail.result && (
          <StatusBadge status={runDetail.result.status} showLabel />
        )}

        {/* Step completion stats */}
        {stepStats && (
          <span className={`text-sm font-medium ${
            stepStats.allPassed ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {stepStats.passedCount}/{stepStats.totalCount} steps passed
          </span>
        )}

        {/* Step counter */}
        {steps.length > 0 && currentStepIndex >= 0 && (
          <span className="ml-auto text-sm text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        )}
      </header>

      {/* Step selector - shows all steps from scenario meta */}
      {steps.length > 0 ? (
        <StepSelector
          steps={steps}
          currentStepId={currentStepId}
          onStepSelect={setCurrentStepId}
          stepsWithEvidence={stepsWithEvidence}
          failedStepId={runDetail.result?.failedStep ?? null}
        />
      ) : (
        <div className="p-4 bg-gray-800 border-b border-gray-700 text-center text-sm text-gray-500">
          No steps defined for this scenario
        </div>
      )}

      {/* Step evidence view - tabbed interface */}
      {currentStepId && (
        <StepEvidenceView
          stepId={currentStepId}
          evidence={categorizedEvidence}
          errorMessage={currentStepError}
          stepSummary={currentStepResult?.summary ?? null}
          stepStatus={currentStepResult?.status ?? null}
        />
      )}

      {/* Error log section for failed runs (show at bottom) */}
      {runDetail.result?.status === 'fail' && runDetail.result.errorMessage && !currentStepError && (
        <div className="p-4 border-t border-gray-700">
          <LogSection
            title="Error Log"
            content={runDetail.result.errorMessage}
            defaultExpanded={true}
          />
        </div>
      )}

      {/* Keyboard hint */}
      {steps.length > 1 && (
        <div className="p-2 border-t border-gray-700 text-center">
          <span className="text-xs text-gray-600">
            Use ← → arrow keys to navigate steps
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Back arrow icon component
 */
const BackArrowIcon: FC = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
);
