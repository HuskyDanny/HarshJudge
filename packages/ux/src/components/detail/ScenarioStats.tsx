import { type FC } from 'react';
import { type ScenarioStats as ScenarioStatsType } from '@harshjudge/shared';
import { formatDuration } from '@/lib';

interface ScenarioStatsProps {
  /** Scenario metadata containing run statistics */
  meta: ScenarioStatsType;
}

interface StatCardProps {
  label: string;
  value: string;
  color?: 'green' | 'red' | 'default';
}

const StatCard: FC<StatCardProps> = ({ label, value, color = 'default' }) => {
  const colorClass =
    color === 'green'
      ? 'text-green-400'
      : color === 'red'
        ? 'text-red-400'
        : 'text-white';

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
};

/**
 * Statistics display for scenario run metrics
 */
export const ScenarioStats: FC<ScenarioStatsProps> = ({ meta }) => {
  const passRate =
    meta.totalRuns > 0
      ? Math.round((meta.passCount / meta.totalRuns) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-800 rounded-lg">
      <StatCard label="Total Runs" value={meta.totalRuns.toString()} />
      <StatCard
        label="Passed"
        value={meta.passCount.toString()}
        color="green"
      />
      <StatCard label="Failed" value={meta.failCount.toString()} color="red" />
      <StatCard
        label="Avg Duration"
        value={meta.avgDuration > 0 ? formatDuration(meta.avgDuration) : '-'}
      />
      {meta.totalRuns > 0 && (
        <div className="col-span-2 sm:col-span-4 pt-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Pass Rate</span>
            <span
              className={`font-medium ${passRate >= 80 ? 'text-green-400' : passRate >= 50 ? 'text-yellow-400' : 'text-red-400'}`}
            >
              {passRate}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${passRate >= 80 ? 'bg-green-500' : passRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
