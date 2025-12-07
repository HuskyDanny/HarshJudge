import { type FC, type ReactNode } from 'react';

interface EmptyStateProps {
  /** Main title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional icon element */
  icon?: ReactNode;
  /** Optional action button */
  action?: ReactNode;
}

/**
 * Empty state placeholder for panels with no data
 */
export const EmptyState: FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {icon && (
        <div className="mb-4 text-gray-500" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-400">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

/**
 * Default icon for empty projects state
 */
export const FolderIcon: FC = () => (
  <svg
    className="w-12 h-12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
  </svg>
);

/**
 * Default icon for empty scenarios state
 */
export const DocumentIcon: FC = () => (
  <svg
    className="w-12 h-12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

/**
 * Default icon for empty detail state
 */
export const EyeIcon: FC = () => (
  <svg
    className="w-12 h-12"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);
