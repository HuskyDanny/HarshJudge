import { type FC, useState } from 'react';
import { type ParsedStep } from '@/lib';

interface StepThumbnailProps {
  /** Step data */
  step: ParsedStep;
  /** Whether this step is currently selected */
  isSelected: boolean;
  /** Whether this step failed */
  isFailed: boolean;
  /** Click handler */
  onClick: () => void;
  /** Data index for scroll-into-view */
  dataIndex?: number;
}

/**
 * Thumbnail component for a single step in the timeline
 * Features:
 * - Lazy loading of thumbnail image
 * - Status border (green for pass, red for fail)
 * - Selection ring highlight
 * - Step number badge overlay
 */
export const StepThumbnail: FC<StepThumbnailProps> = ({
  step,
  isSelected,
  isFailed,
  onClick,
  dataIndex,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Border color based on status
  const borderClass = isFailed ? 'border-red-500' : 'border-green-500';

  // Ring highlight for selection
  const ringClass = isSelected ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-900' : '';

  return (
    <button
      onClick={onClick}
      data-index={dataIndex}
      aria-label={`Step ${step.number}: ${step.action}${isFailed ? ' (failed)' : ''}`}
      aria-pressed={isSelected}
      className={`
        relative w-24 h-16 rounded overflow-hidden flex-shrink-0
        border-2 ${borderClass} ${ringClass}
        transition-all duration-150
        hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400
      `}
    >
      {/* Lazy loaded thumbnail */}
      {!error ? (
        <img
          src={step.path}
          alt={`Step ${step.number}: ${step.action}`}
          className={`w-full h-full object-cover ${loaded ? '' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
          <span className="text-xs text-gray-500">No image</span>
        </div>
      )}

      {/* Step number badge */}
      <span className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
        {step.number}
      </span>

      {/* Loading placeholder */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse" />
      )}

      {/* Failed indicator */}
      {isFailed && (
        <span className="absolute bottom-1 right-1 text-red-400 text-xs">✕</span>
      )}
    </button>
  );
};
