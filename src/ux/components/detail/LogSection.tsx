import { type FC, useState, useCallback } from 'react';
import { LogViewer } from './LogViewer';

interface LogSectionProps {
  /** Section title */
  title: string;
  /** Log content to display */
  content: string | null;
  /** Whether section is expanded by default */
  defaultExpanded?: boolean;
  /** Line numbers containing errors */
  errorLines?: number[];
}

/**
 * Collapsible log section component
 * Features:
 * - Expand/collapse toggle
 * - Copy to clipboard with feedback
 * - Shows error count badge when collapsed
 */
export const LogSection: FC<LogSectionProps> = ({
  title,
  content,
  defaultExpanded = false,
  errorLines = [],
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copySuccess, setCopySuccess] = useState(false);

  // Count errors in content
  const errorCount = errorLines.length > 0
    ? errorLines.length
    : countErrors(content);

  const handleCopy = useCallback(async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [content]);

  // Don't render if no content
  if (!content) return null;

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Header/toggle button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors"
        aria-expanded={expanded}
        aria-controls="log-content"
      >
        <div className="flex items-center gap-2">
          <ChevronIcon expanded={expanded} />
          <span className="font-medium text-sm text-white">{title}</span>
          {errorCount > 0 && !expanded && (
            <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">
              {errorCount} error{errorCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {expanded ? 'Click to collapse' : 'Click to expand'}
        </span>
      </button>

      {/* Content */}
      {expanded && (
        <div id="log-content">
          <LogViewer
            content={content}
            errorLines={errorLines}
            onCopy={handleCopy}
            copySuccess={copySuccess}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Count error-like lines in content
 */
function countErrors(content: string | null): number {
  if (!content) return 0;

  const lines = content.split('\n');
  return lines.filter((line) => {
    const lower = line.toLowerCase();
    return (
      lower.includes('error') ||
      lower.includes('exception') ||
      lower.includes('failed') ||
      lower.includes('fatal')
    );
  }).length;
}

/**
 * Chevron icon component
 */
const ChevronIcon: FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5l7 7-7 7"
    />
  </svg>
);
