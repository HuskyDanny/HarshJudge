import { type FC } from 'react';
import { useScenarioDetail } from '@/hooks';
import { MarkdownContent } from '../common/MarkdownContent';
import { TagChip } from '../common/TagChip';
import { EmptyState, EyeIcon } from '../common/EmptyState';
import { ScenarioStats } from '../detail/ScenarioStats';
import { RunHistoryList } from '../detail/RunHistoryList';
import { formatRelativeTime } from '@/lib';

interface ScenarioDetailPanelProps {
  /** Path to the project */
  projectPath: string | null;
  /** Slug of the selected scenario */
  scenarioSlug: string | null;
  /** Callback when a run is selected */
  onRunSelect?: (runId: string) => void;
}

/**
 * Detail panel showing scenario information, stats, and run history
 */
export const ScenarioDetailPanel: FC<ScenarioDetailPanelProps> = ({
  projectPath,
  scenarioSlug,
  onRunSelect,
}) => {
  const { scenarioDetail: scenario, loading, error } = useScenarioDetail(
    projectPath,
    scenarioSlug
  );

  // Empty state when no scenario selected
  if (!scenarioSlug) {
    return (
      <EmptyState
        icon={<EyeIcon />}
        title="Select a scenario"
        description="Choose a scenario to view its details, runs, and evidence"
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">Loading scenario details...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState title="Error loading scenario" description={error} />
    );
  }

  // Not found state
  if (!scenario) {
    return (
      <EmptyState
        icon={<EyeIcon />}
        title="Scenario not found"
        description="The selected scenario could not be loaded"
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header with title and tags */}
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-2">
          {scenario.title}
        </h2>

        {/* Tags */}
        {scenario.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {scenario.tags.map((tag) => (
              <TagChip key={tag} tag={tag} size="md" />
            ))}
          </div>
        )}

        {/* Last run info */}
        {scenario.meta.lastRun && (
          <p className="text-sm text-gray-500">
            Last run: {formatRelativeTime(scenario.meta.lastRun)}
          </p>
        )}
      </header>

      {/* Statistics section */}
      <section className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Statistics</h3>
        <ScenarioStats meta={scenario.meta} />
      </section>

      {/* Scenario content (Markdown) */}
      {scenario.content && (
        <section className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
            Scenario Steps
          </h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <MarkdownContent content={scenario.content} />
          </div>
        </section>
      )}

      {/* Run history section */}
      <section>
        <h3 className="text-sm font-medium text-gray-400 mb-3">
          Recent Runs ({scenario.recentRuns.length})
        </h3>
        <RunHistoryList runs={scenario.recentRuns} onRunSelect={onRunSelect} />
      </section>
    </div>
  );
};
