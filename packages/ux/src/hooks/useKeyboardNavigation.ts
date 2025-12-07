import { useCallback, useEffect, useRef } from 'react';

interface UseKeyboardNavigationOptions<T> {
  /** List of items to navigate */
  items: T[];
  /** Currently selected index (-1 for none) */
  selectedIndex: number;
  /** Callback when selection changes */
  onSelect: (index: number) => void;
  /** Callback when item is activated (Enter) */
  onActivate?: (item: T) => void;
  /** Whether navigation is enabled */
  enabled?: boolean;
}

interface UseKeyboardNavigationResult {
  /** Keyboard event handler to attach to container */
  handleKeyDown: (e: React.KeyboardEvent) => void;
  /** Ref to attach to container for focus management */
  containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Hook for keyboard navigation in lists
 * Supports: ArrowUp/Down for navigation, Enter for activation, Escape to clear
 */
export function useKeyboardNavigation<T>({
  items,
  selectedIndex,
  onSelect,
  onActivate,
  enabled = true,
}: UseKeyboardNavigationOptions<T>): UseKeyboardNavigationResult {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled || items.length === 0) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (selectedIndex > 0) {
            onSelect(selectedIndex - 1);
          } else if (selectedIndex === -1 && items.length > 0) {
            // Select last item if nothing selected
            onSelect(items.length - 1);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (selectedIndex < items.length - 1) {
            onSelect(selectedIndex + 1);
          } else if (selectedIndex === -1 && items.length > 0) {
            // Select first item if nothing selected
            onSelect(0);
          }
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < items.length && onActivate) {
            const item = items[selectedIndex];
            if (item !== undefined) {
              onActivate(item);
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          onSelect(-1);
          break;

        case 'Home':
          e.preventDefault();
          if (items.length > 0) {
            onSelect(0);
          }
          break;

        case 'End':
          e.preventDefault();
          if (items.length > 0) {
            onSelect(items.length - 1);
          }
          break;
      }
    },
    [items, selectedIndex, onSelect, onActivate, enabled]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && containerRef.current) {
      const container = containerRef.current;
      const selectedElement = container.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  return {
    handleKeyDown,
    containerRef,
  };
}
