import { type FC } from 'react';
import { formatDuration, type ParsedStep } from '@/lib';

interface StepMetadataProps {
  /** Step data */
  step: ParsedStep;
  /** URL for the step (optional, from metadata file) */
  url?: string;
  /** Duration in milliseconds (optional, from metadata file) */
  duration?: number;
}

/**
 * Metadata display component for the current step
 * Shows action performed, duration, and URL
 */
export const StepMetadata: FC<StepMetadataProps> = ({
  step,
  url,
  duration,
}) => {
  // Capitalize first letter of action
  const formattedAction = step.action.charAt(0).toUpperCase() + step.action.slice(1);

  return (
    <div className="p-4 bg-gray-800 border-t border-gray-700">
      <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm">
        {/* Step number and action */}
        <span className="text-gray-400">
          Step {step.number}:{' '}
          <span className="text-white font-medium">{formattedAction}</span>
        </span>

        {/* Duration */}
        {duration !== undefined && duration > 0 && (
          <span className="text-gray-500 flex items-center gap-1">
            <ClockIcon />
            {formatDuration(duration)}
          </span>
        )}

        {/* URL */}
        {url && (
          <span
            className="text-gray-500 truncate max-w-md"
            title={url}
          >
            <LinkIcon className="inline-block mr-1" />
            {url}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Clock icon component
 */
const ClockIcon: FC = () => (
  <svg
    className="w-4 h-4 inline-block"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path strokeWidth="2" strokeLinecap="round" d="M12 6v6l4 2" />
  </svg>
);

/**
 * Link icon component
 */
const LinkIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={`w-4 h-4 ${className || ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
);
