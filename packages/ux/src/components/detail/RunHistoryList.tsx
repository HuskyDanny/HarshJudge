import { type FC } from 'react';
import { type RunSummary } from '@harshjudge/shared';
import { StatusBadge } from '../common/StatusBadge';
import { formatRelativeTime, formatDuration } from '@/lib';

interface RunHistoryListProps {
  /** List of recent runs to display */
  runs: RunSummary[];
  /** Callback when a run is selected */
  onRunSelect?: (runId: string) => void;
}

/**
 * List of recent test runs for a scenario
 */
export const RunHistoryList: FC<RunHistoryListProps> = ({
  runs,
  onRunSelect,
}) => {
  // Return null for empty state - parent component can handle messaging if needed
  if (runs.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-2" role="list" aria-label="Run history">
      {runs.map((run) => (
        <li
          key={run.id}
          className={`
            flex items-center justify-between p-3 bg-gray-800 rounded-lg
            transition-colors duration-150
            ${onRunSelect ? 'hover:bg-gray-750 cursor-pointer' : ''}
          `}
          onClick={() => onRunSelect?.(run.id)}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onRunSelect) {
              e.preventDefault();
              onRunSelect(run.id);
            }
          }}
          tabIndex={onRunSelect ? 0 : undefined}
          role={onRunSelect ? 'button' : undefined}
        >
          <div className="flex items-center gap-3">
            <StatusBadge status={run.status} />
            <div className="flex flex-col">
              <span className="text-sm text-gray-300">
                Run #{run.runNumber}
              </span>
              <span className="text-xs text-gray-500">
                {formatRelativeTime(run.completedAt || run.startedAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {formatDuration(run.duration)}
            </span>
            {run.errorMessage && (
              <span
                className="text-xs text-red-400 max-w-32 truncate"
                title={run.errorMessage}
              >
                {run.errorMessage}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
