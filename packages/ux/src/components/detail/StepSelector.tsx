import { type FC, useRef, useEffect } from 'react';
import type { StepInfo } from '@harshjudge/shared';

interface StepSelectorProps {
  /** Array of steps from scenario meta */
  steps: StepInfo[];
  /** Currently selected step ID (zero-padded, e.g., "01") */
  currentStepId: string | null;
  /** Callback when a step is selected */
  onStepSelect: (stepId: string) => void;
  /** Set of step IDs that have evidence (optional) */
  stepsWithEvidence?: Set<string>;
  /** Step ID that failed (optional) */
  failedStepId?: string | null;
}

/**
 * Horizontal step navigation showing all scenario steps.
 * Features:
 * - Shows all steps regardless of evidence presence
 * - Highlights selected step
 * - Visual indicator for steps with evidence
 * - Auto-scroll to keep selected step visible
 */
export const StepSelector: FC<StepSelectorProps> = ({
  steps,
  currentStepId,
  onStepSelect,
  stepsWithEvidence,
  failedStepId,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep selected step visible
  useEffect(() => {
    if (currentStepId && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selectedElement = container.querySelector(
        `[data-step-id="${currentStepId}"]`
      );
      if (selectedElement && typeof selectedElement.scrollIntoView === 'function') {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentStepId]);

  if (steps.length === 0) {
    return (
      <div className="p-4 bg-gray-800 border-b border-gray-700 text-center text-sm text-gray-500">
        No steps defined
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex gap-2 p-3 overflow-x-auto bg-gray-800 border-b border-gray-700"
      role="tablist"
      aria-label="Test steps"
      aria-orientation="horizontal"
    >
      {steps.map((step) => {
        const isSelected = currentStepId === step.id;
        const hasEvidence = stepsWithEvidence?.has(step.id) ?? false;
        const isFailed = failedStepId === step.id;

        return (
          <button
            key={step.id}
            data-step-id={step.id}
            onClick={() => onStepSelect(step.id)}
            role="tab"
            aria-selected={isSelected}
            className={`
              px-3 py-2 rounded text-sm whitespace-nowrap transition-colors
              flex items-center gap-2 min-w-fit
              ${isSelected
                ? 'bg-blue-600 text-white'
                : isFailed
                  ? 'bg-red-900/50 text-red-300 hover:bg-red-800/50'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            <span className="font-mono text-xs opacity-70">{step.id}</span>
            <span>{step.title}</span>
            {/* Evidence indicator */}
            {hasEvidence && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? 'bg-blue-300' : 'bg-green-400'
                }`}
                title="Has evidence"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
