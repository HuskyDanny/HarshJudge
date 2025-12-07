import { type FC, useMemo } from 'react';
import { type ScenarioSummary } from '@harshjudge/shared';
import { StatusBadge } from '../common/StatusBadge';
import { TagChip } from '../common/TagChip';
import { EmptyState, DocumentIcon } from '../common/EmptyState';
import { formatRelativeTime } from '@/lib';

interface ScenarioListPanelProps {
  /** List of scenarios to display */
  scenarios: ScenarioSummary[];
  /** Currently selected scenario slug */
  selectedScenario: string | null;
  /** Callback when a scenario is selected */
  onSelect: (scenarioSlug: string) => void;
  /** Whether data is loading */
  loading?: boolean;
  /** Error message if any */
  error?: string | null;
}

/**
 * Panel displaying list of scenarios for a project
 */
export const ScenarioListPanel: FC<ScenarioListPanelProps> = ({
  scenarios,
  selectedScenario,
  onSelect,
  loading = false,
  error = null,
}) => {
  // Sort by last run time (most recent first), null values last
  const sortedScenarios = useMemo(() => {
    return [...scenarios].sort((a, b) => {
      if (!a.lastRun && !b.lastRun) return 0;
      if (!a.lastRun) return 1;
      if (!b.lastRun) return -1;
      return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
    });
  }, [scenarios]);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Scenarios</h2>
        </header>
        <div className="flex items-center justify-center flex-1">
          <div className="text-sm text-gray-500">Loading scenarios...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Scenarios</h2>
        </header>
        <EmptyState
          title="Error loading scenarios"
          description={error}
        />
      </div>
    );
  }

  // Empty state
  if (scenarios.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center justify-between p-3 border-b border-gray-700">
          <h2 className="text-sm font-medium text-gray-400">Scenarios (0)</h2>
        </header>
        <EmptyState
          icon={<DocumentIcon />}
          title="No scenarios"
          description="Create scenarios with /harshjudge:init"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header with count */}
      <header className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-medium text-gray-400">
          Scenarios ({scenarios.length})
        </h2>
      </header>

      {/* Scenario list */}
      <ul
        className="flex-1 overflow-y-auto"
        role="listbox"
        aria-label="Scenarios"
      >
        {sortedScenarios.map((scenario) => {
          const isSelected = selectedScenario === scenario.slug;
          const statusValue = scenario.lastResult || 'never_run';

          return (
            <li
              key={scenario.slug}
              role="option"
              aria-selected={isSelected}
              className={`
                p-3 cursor-pointer border-b border-gray-800
                transition-colors duration-150
                hover:bg-gray-800
                focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 focus-visible:outline-none
                ${isSelected ? 'bg-gray-800' : ''}
              `}
              onClick={() => onSelect(scenario.slug)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(scenario.slug);
                }
              }}
              tabIndex={0}
            >
              {/* Title and status */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-200 truncate">
                  {scenario.title}
                </span>
                <StatusBadge status={statusValue} />
              </div>

              {/* Tags */}
              {scenario.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {scenario.tags.slice(0, 3).map((tag) => (
                    <TagChip key={tag} tag={tag} size="sm" />
                  ))}
                  {scenario.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{scenario.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Stats row */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {scenario.totalRuns > 0
                    ? `${scenario.totalRuns} runs · ${Math.round(scenario.passRate)}% pass`
                    : 'No runs yet'}
                </span>
                <span>{formatRelativeTime(scenario.lastRun)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
