import { type FC, useRef, useEffect } from 'react';
import { type ParsedStep } from '@/lib';
import { StepThumbnail } from './StepThumbnail';

interface StepTimelineProps {
  /** Array of parsed steps */
  steps: ParsedStep[];
  /** Index of currently selected step */
  currentIndex: number;
  /** Callback when a step is selected */
  onStepSelect: (index: number) => void;
  /** Step ID that failed (zero-padded string like "01"), or null if none */
  failedStep: string | null;
}

/**
 * Horizontal scrollable timeline of step thumbnails
 * Features:
 * - Horizontal scroll with overflow
 * - Auto-scroll to keep selected step visible
 * - Status indicators on each thumbnail
 */
export const StepTimeline: FC<StepTimelineProps> = ({
  steps,
  currentIndex,
  onStepSelect,
  failedStep,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep selected step visible
  useEffect(() => {
    if (currentIndex >= 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selectedElement = container.querySelector(
        `[data-index="${currentIndex}"]`
      );
      if (selectedElement && typeof selectedElement.scrollIntoView === 'function') {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex]);

  if (steps.length === 0) {
    return (
      <div className="p-4 bg-gray-800 border-b border-gray-700 text-center text-sm text-gray-500">
        No screenshots available
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex gap-2 p-4 overflow-x-auto bg-gray-800 border-b border-gray-700"
      role="listbox"
      aria-label="Step timeline"
      aria-orientation="horizontal"
    >
      {steps.map((step, index) => {
        // Convert step number to zero-padded string for comparison with failedStep ID
        const stepId = String(step.number).padStart(2, '0');
        return (
          <StepThumbnail
            key={`${step.number}-${step.action}`}
            step={step}
            isSelected={index === currentIndex}
            isFailed={stepId === failedStep}
            onClick={() => onStepSelect(index)}
            dataIndex={index}
          />
        );
      })}
    </div>
  );
};
