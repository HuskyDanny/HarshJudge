import { type FC, useState } from 'react';

interface ScreenshotViewerProps {
  /** Path to the screenshot image */
  imagePath: string;
  /** Whether the image is in zoomed (actual size) mode */
  isZoomed: boolean;
  /** Toggle zoom mode callback */
  onToggleZoom: () => void;
  /** Error message to display as overlay (for failed steps) */
  errorMessage: string | null;
}

/**
 * Main screenshot viewer component
 * Features:
 * - Click to toggle between fit-to-container and actual size
 * - Loading state while image loads
 * - Error overlay for failed steps
 * - Keyboard accessible (Enter/Space to toggle zoom)
 */
export const ScreenshotViewer: FC<ScreenshotViewerProps> = ({
  imagePath,
  isZoomed,
  onToggleZoom,
  errorMessage,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Reset loading state when image path changes
  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  // Handle keyboard activation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleZoom();
    }
  };

  return (
    <div
      className={`
        relative flex-1 overflow-auto bg-gray-900
        ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}
      `}
      onClick={onToggleZoom}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Screenshot viewer. ${isZoomed ? 'Click to fit to screen' : 'Click to view actual size'}`}
    >
      {/* Loading state */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm text-gray-500 animate-pulse">
            Loading screenshot...
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 text-4xl mb-2">📷</div>
            <div className="text-sm text-gray-500">
              Screenshot unavailable
            </div>
          </div>
        </div>
      )}

      {/* Screenshot image */}
      {!error && (
        <img
          key={imagePath} // Force remount on path change
          src={imagePath}
          alt="Test step screenshot"
          className={`
            ${loading ? 'opacity-0' : ''}
            ${isZoomed ? '' : 'max-w-full max-h-full object-contain mx-auto block'}
          `}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {/* Error message overlay */}
      {errorMessage && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-900/90 p-4 text-white">
          <h4 className="font-medium mb-1 flex items-center gap-2">
            <span className="text-red-400">✕</span>
            Step Failed
          </h4>
          <p className="text-sm text-red-200">{errorMessage}</p>
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none">
        {isZoomed ? 'Actual size' : 'Fit to screen'}
      </div>
    </div>
  );
};
