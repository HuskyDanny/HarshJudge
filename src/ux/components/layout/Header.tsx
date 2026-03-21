import { type FC, useState } from 'react';
import { useFileWatcherOptional } from '@/contexts/FileWatcherContext';

interface HeaderProps {
  /** Application title */
  title?: string;
}

/**
 * Application header with logo and theme toggle
 */
export const Header: FC<HeaderProps> = ({ title = 'HarshJudge' }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileWatcher = useFileWatcherOptional();

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    // Theme toggle functionality will be implemented in a future story
  };

  const handleRefresh = () => {
    if (fileWatcher?.triggerRefresh) {
      setIsRefreshing(true);
      fileWatcher.triggerRefresh();
      // Reset animation after a short delay
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <header className="flex items-center justify-between h-12 px-4 bg-gray-900 border-b border-gray-700">
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center justify-center w-8 h-8 text-lg font-bold text-white bg-blue-600 rounded">
          HJ
        </div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded hover:text-white hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          aria-label="Refresh data"
          title="Refresh data"
        >
          <svg
            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center justify-center w-8 h-8 text-gray-400 transition-colors rounded hover:text-white hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? (
            // Sun icon
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            // Moon icon
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
