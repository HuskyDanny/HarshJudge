import { type FC, useMemo, useState } from 'react';
import { type ScenarioSummary } from '@harshjudge/shared';
import { StatusBadge } from '../common/StatusBadge';
import { StarButton } from '../common/StarButton';
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
  /** Callback when star is toggled (optional - display-only if not provided) */
  onToggleStar?: (scenarioSlug: string) => void;
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
  onToggleStar,
  loading = false,
  error = null,
}) => {
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Sort by starred (starred first), then by last run time (most recent first)
  const sortedScenarios = useMemo(() => {
    let filtered = scenarios;

    // Filter to starred only if enabled
    if (showStarredOnly) {
      filtered = scenarios.filter((s) => s.starred);
    }

    return [...filtered].sort((a, b) => {
      // Starred scenarios first
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;

      // Then by last run time
      if (!a.lastRun && !b.lastRun) return 0;
      if (!a.lastRun) return 1;
      if (!b.lastRun) return -1;
      return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
    });
  }, [scenarios, showStarredOnly]);

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

  // Count starred scenarios
  const starredCount = scenarios.filter((s) => s.starred).length;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header with count and filter toggle */}
      <header className="flex items-center justify-between p-3 border-b border-gray-700">
        <h2 className="text-sm font-medium text-gray-400">
          Scenarios ({showStarredOnly ? sortedScenarios.length : scenarios.length})
        </h2>
        {starredCount > 0 && (
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={`
              text-xs px-2 py-1 rounded transition-colors
              ${showStarredOnly
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'text-gray-500 hover:text-gray-400'}
            `}
            aria-pressed={showStarredOnly}
          >
            ★ {starredCount}
          </button>
        )}
      </header>

      {/* Scenario list */}
      <ul
        className="flex-1 overflow-y-auto"
        role="listbox"
        aria-label="Scenarios"
      >
        {sortedScenarios.map((scenario) => {
          const isSelected = selectedScenario === scenario.slug;

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
              {/* Title row with star and status */}
              <div className="flex items-center gap-2 mb-1">
                {onToggleStar && (
                  <StarButton
                    starred={scenario.starred}
                    onClick={() => onToggleStar(scenario.slug)}
                    size="sm"
                  />
                )}
                {!onToggleStar && scenario.starred && (
                  <span className="text-yellow-400 text-sm" aria-label="Starred">★</span>
                )}
                <span className="text-sm font-medium text-gray-200 truncate flex-1">
                  {scenario.title}
                </span>
                {/* Only show status badge if scenario has been run */}
                {scenario.lastResult && (
                  <StatusBadge status={scenario.lastResult} />
                )}
              </div>

              {/* Tags and step count */}
              <div className="flex items-center gap-2 mb-1">
                {scenario.stepCount > 0 && (
                  <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                    {scenario.stepCount} {scenario.stepCount === 1 ? 'step' : 'steps'}
                  </span>
                )}
                {scenario.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {scenario.tags.slice(0, 2).map((tag) => (
                      <TagChip key={tag} tag={tag} size="sm" />
                    ))}
                    {scenario.tags.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{scenario.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

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
