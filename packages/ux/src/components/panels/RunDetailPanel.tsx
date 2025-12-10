import { type FC, useState, useMemo, useCallback } from 'react';
import { useRunDetail, useKeyboardNavigation } from '@/hooks';
import { parseEvidencePaths, parseAllEvidence } from '@/lib';
import { StatusBadge } from '../common/StatusBadge';
import { StepTimeline } from '../detail/StepTimeline';
import { ScreenshotViewer } from '../detail/ScreenshotViewer';
import { StepMetadata } from '../detail/StepMetadata';
import { LogSection } from '../detail/LogSection';
import { EvidencePanel } from '../detail/EvidencePanel';
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
 * Panel displaying run detail with screenshot timeline viewer
 * Features:
 * - Horizontal timeline of step thumbnails
 * - Full-size screenshot viewer with zoom toggle
 * - Step metadata display
 * - Keyboard navigation (left/right arrows)
 * - Error overlay for failed steps
 */
export const RunDetailPanel: FC<RunDetailPanelProps> = ({
  projectPath,
  scenarioSlug,
  runId,
  onBack,
}) => {
  const { runDetail, loading, error } = useRunDetail(projectPath, scenarioSlug, runId);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Parse evidence paths to extract step info (screenshots only for timeline)
  const steps = useMemo(
    () => parseEvidencePaths(runDetail?.evidencePaths || []),
    [runDetail]
  );

  // Parse all evidence types for the evidence panel
  const allEvidence = useMemo(
    () => parseAllEvidence(runDetail?.evidencePaths || []),
    [runDetail]
  );

  // Check if there's non-screenshot evidence to show
  const hasNonScreenshotEvidence = useMemo(
    () =>
      allEvidence.logs.length > 0 ||
      allEvidence.dbSnapshots.length > 0 ||
      allEvidence.networkLogs.length > 0 ||
      allEvidence.htmlSnapshots.length > 0 ||
      allEvidence.custom.length > 0,
    [allEvidence]
  );

  // Get current step
  const currentStep = steps[currentStepIndex];

  // Check if current step is the failed one
  const isCurrentStepFailed =
    runDetail?.result?.failedStep !== null &&
    currentStep?.number === runDetail?.result?.failedStep;

  // Keyboard navigation callback
  const handleKeyboardSelect = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);

  // Keyboard navigation hook (horizontal for timeline)
  const { handleKeyDown, containerRef } = useKeyboardNavigation({
    items: steps,
    selectedIndex: currentStepIndex,
    onSelect: handleKeyboardSelect,
    enabled: steps.length > 0,
  });

  // Handle left/right arrow keys specifically for horizontal navigation
  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (steps.length === 0) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (currentStepIndex > 0) {
          setCurrentStepIndex(currentStepIndex - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        }
        break;
      default:
        // Delegate to general keyboard navigation for other keys
        handleKeyDown(e);
    }
  };

  // Loading state
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
  if (error) {
    return (
      <EmptyState
        title="Error loading run"
        description={error}
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

        {/* Step counter */}
        {steps.length > 0 && (
          <span className="ml-auto text-sm text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        )}
      </header>

      {/* Timeline */}
      <StepTimeline
        steps={steps}
        currentIndex={currentStepIndex}
        onStepSelect={setCurrentStepIndex}
        failedStep={runDetail.result?.failedStep ?? null}
      />

      {/* Main screenshot area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentStep ? (
          <>
            <ScreenshotViewer
              imagePath={currentStep.path}
              isZoomed={isZoomed}
              onToggleZoom={() => setIsZoomed(!isZoomed)}
              errorMessage={
                isCurrentStepFailed ? runDetail.result?.errorMessage ?? null : null
              }
            />
            <StepMetadata step={currentStep} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-sm text-gray-500">
              No screenshots available for this run
            </div>
          </div>
        )}
      </div>

      {/* Error log section for failed runs */}
      {runDetail.result?.status === 'fail' && runDetail.result.errorMessage && (
        <div className="p-4 border-t border-gray-700">
          <LogSection
            title="Error Log"
            content={runDetail.result.errorMessage}
            defaultExpanded={true}
          />
        </div>
      )}

      {/* Evidence panel for logs, DB verification, etc. */}
      {hasNonScreenshotEvidence && (
        <EvidencePanel
          evidence={allEvidence}
          currentStep={currentStep?.number}
        />
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
