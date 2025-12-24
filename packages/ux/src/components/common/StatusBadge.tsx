import { type FC } from 'react';

export type StatusType = 'pass' | 'fail' | 'running';

interface StatusBadgeProps {
  /** Status to display */
  status: StatusType;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show text label */
  showLabel?: boolean;
}

const STATUS_COLORS: Record<StatusType, string> = {
  pass: 'bg-green-500',
  running: 'bg-yellow-500',
  fail: 'bg-red-500',
};

const STATUS_LABELS: Record<StatusType, string> = {
  pass: 'All tests passing',
  running: 'In progress',
  fail: 'Some tests failing',
};

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

/**
 * Status indicator badge for pass/fail/running states
 */
export const StatusBadge: FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  showLabel = false,
}) => {
  const colorClass = STATUS_COLORS[status];
  const sizeClass = SIZE_CLASSES[size];
  const label = STATUS_LABELS[status];

  if (showLabel) {
    return (
      <span className="flex items-center gap-2">
        <span
          className={`${colorClass} ${sizeClass} rounded-full flex-shrink-0`}
          aria-hidden="true"
        />
        <span className="text-xs text-gray-400">{label}</span>
      </span>
    );
  }

  return (
    <span
      className={`${colorClass} ${sizeClass} rounded-full inline-block`}
      aria-label={label}
      title={label}
      role="img"
    />
  );
};
