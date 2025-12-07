import { type FC, useState, useRef, useEffect, useMemo } from 'react';

interface LogViewerProps {
  /** Log content to display */
  content: string;
  /** Line numbers that contain errors (0-indexed) */
  errorLines?: number[];
  /** Callback when copy button clicked */
  onCopy?: () => void;
  /** Whether copy was successful (for visual feedback) */
  copySuccess?: boolean;
}

/**
 * Log viewer component with syntax highlighting and search
 * Features:
 * - Line numbers
 * - Error line highlighting (red)
 * - Search with highlighting
 * - Copy to clipboard
 * - Auto-scroll to first error
 */
export const LogViewer: FC<LogViewerProps> = ({
  content,
  errorLines = [],
  onCopy,
  copySuccess = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);
  const logRef = useRef<HTMLPreElement>(null);
  const errorLineRef = useRef<HTMLDivElement>(null);

  // Split content into lines
  const lines = useMemo(() => content.split('\n'), [content]);

  // Detect error lines from content if not provided
  const detectedErrorLines = useMemo(() => {
    if (errorLines.length > 0) return errorLines;

    const detected: number[] = [];
    lines.forEach((line, i) => {
      const lower = line.toLowerCase();
      if (
        lower.includes('error') ||
        lower.includes('exception') ||
        lower.includes('failed') ||
        lower.includes('fatal')
      ) {
        detected.push(i);
      }
    });
    return detected;
  }, [lines, errorLines]);

  // Find matches for search
  const matchingLines = useMemo(() => {
    if (!searchTerm) return [];
    return lines
      .map((line, i) => ({ line, index: i }))
      .filter(({ line }) => line.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(({ index }) => index);
  }, [lines, searchTerm]);

  // Auto-scroll to first error on mount
  useEffect(() => {
    if (errorLineRef.current && typeof errorLineRef.current.scrollIntoView === 'function') {
      errorLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Navigate to current match
  useEffect(() => {
    if (matchingLines.length > 0 && logRef.current) {
      const matchElement = logRef.current.querySelector(`[data-line="${matchingLines[currentMatch]}"]`);
      if (matchElement && typeof matchElement.scrollIntoView === 'function') {
        matchElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatch, matchingLines]);

  const handlePrevMatch = () => {
    setCurrentMatch((prev) => (prev > 0 ? prev - 1 : matchingLines.length - 1));
  };

  const handleNextMatch = () => {
    setCurrentMatch((prev) => (prev < matchingLines.length - 1 ? prev + 1 : 0));
  };

  const firstErrorLine = detectedErrorLines[0];

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Header with search and copy */}
      <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex-1 flex items-center gap-2">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentMatch(0);
            }}
            className="flex-1 bg-gray-700 text-sm px-2 py-1 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Search logs"
          />
          {searchTerm && matchingLines.length > 0 && (
            <>
              <span className="text-xs text-gray-500">
                {currentMatch + 1}/{matchingLines.length}
              </span>
              <button
                onClick={handlePrevMatch}
                className="text-gray-400 hover:text-white p-1"
                aria-label="Previous match"
              >
                ↑
              </button>
              <button
                onClick={handleNextMatch}
                className="text-gray-400 hover:text-white p-1"
                aria-label="Next match"
              >
                ↓
              </button>
            </>
          )}
        </div>
        <button
          onClick={onCopy}
          className={`text-sm px-2 py-1 rounded transition-colors ${
            copySuccess
              ? 'bg-green-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          aria-label="Copy log content"
        >
          {copySuccess ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Log content */}
      <pre
        ref={logRef}
        className="p-4 overflow-auto max-h-96 text-sm font-mono"
        role="log"
        aria-label="Log content"
      >
        {lines.map((line, i) => {
          const isError = detectedErrorLines.includes(i);
          const isMatch = searchTerm && line.toLowerCase().includes(searchTerm.toLowerCase());
          const isCurrentMatch = matchingLines[currentMatch] === i;

          return (
            <div
              key={i}
              ref={i === firstErrorLine ? errorLineRef : undefined}
              data-line={i}
              className={`
                flex gap-4 py-0.5
                ${isError ? 'bg-red-900/30 text-red-300' : 'text-gray-300'}
                ${isMatch && !isError ? 'bg-yellow-900/30' : ''}
                ${isCurrentMatch ? 'ring-1 ring-yellow-500' : ''}
              `}
            >
              <span className="text-gray-600 select-none w-8 text-right flex-shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 whitespace-pre-wrap break-all">
                {highlightSearchTerm(line, searchTerm)}
              </span>
            </div>
          );
        })}
      </pre>

      {/* Error count indicator */}
      {detectedErrorLines.length > 0 && (
        <div className="px-4 py-2 bg-red-900/20 border-t border-gray-700 text-xs text-red-400">
          {detectedErrorLines.length} error{detectedErrorLines.length !== 1 ? 's' : ''} detected
        </div>
      )}
    </div>
  );
};

/**
 * Highlight search term in text
 */
function highlightSearchTerm(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm) return text;

  const parts = text.split(new RegExp(`(${escapeRegex(searchTerm)})`, 'gi'));

  return parts.map((part, i) =>
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <mark key={i} className="bg-yellow-500/50 text-yellow-200 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Search icon component
 */
const SearchIcon: FC = () => (
  <svg
    className="w-4 h-4 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
