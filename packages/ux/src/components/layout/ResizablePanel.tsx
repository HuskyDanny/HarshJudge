import { type FC, type ReactNode, useState, useEffect, useCallback, useRef } from 'react';

interface ResizablePanelProps {
  /** Current width in pixels */
  width: number;
  /** Minimum allowed width */
  minWidth: number;
  /** Maximum allowed width */
  maxWidth: number;
  /** Callback when width changes */
  onResize: (width: number) => void;
  /** Panel content */
  children: ReactNode;
  /** Optional CSS class for the panel */
  className?: string;
  /** Whether to show the resize handle */
  showHandle?: boolean;
}

/**
 * A panel with a draggable resize handle on the right edge
 */
export const ResizablePanel: FC<ResizablePanelProps> = ({
  width,
  minWidth,
  maxWidth,
  onResize,
  children,
  className = '',
  showHandle = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const clampedWidth = Math.min(maxWidth, Math.max(minWidth, newWidth));
      onResize(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Add listeners to document for global tracking
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, minWidth, maxWidth, onResize]);

  return (
    <div
      ref={panelRef}
      className={`relative flex flex-shrink-0 ${className}`}
      style={{ width }}
    >
      {/* Panel content */}
      <div className="flex-1 overflow-hidden">{children}</div>

      {/* Resize handle */}
      {showHandle && (
        <div
          className={`
            absolute right-0 top-0 bottom-0 w-1
            bg-gray-700 cursor-col-resize
            transition-colors duration-150
            hover:bg-blue-500
            ${isDragging ? 'bg-blue-500' : ''}
          `}
          onMouseDown={handleMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={width}
          aria-valuemin={minWidth}
          aria-valuemax={maxWidth}
          tabIndex={0}
          onKeyDown={(e) => {
            // Allow keyboard resize
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              onResize(Math.max(minWidth, width - 10));
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              onResize(Math.min(maxWidth, width + 10));
            }
          }}
        />
      )}
    </div>
  );
};
