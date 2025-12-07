import { type FC, type ReactNode, useState, useEffect } from 'react';
import { ResizablePanel } from './ResizablePanel';

interface ThreeColumnLayoutProps {
  /** Content for the left panel (projects) */
  leftPanel: ReactNode;
  /** Content for the middle panel (scenarios) */
  middlePanel: ReactNode;
  /** Content for the right panel (details) */
  rightPanel: ReactNode;
  /** Initial width for left panel */
  initialLeftWidth?: number;
  /** Initial width for middle panel */
  initialMiddleWidth?: number;
}

const STORAGE_KEY = 'harshjudge-panel-widths';
const BREAKPOINT_LG = 1024;

interface PanelWidths {
  left: number;
  middle: number;
}

/**
 * Load panel widths from localStorage
 */
function loadWidths(defaultLeft: number, defaultMiddle: number): PanelWidths {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as PanelWidths;
      return {
        left: parsed.left ?? defaultLeft,
        middle: parsed.middle ?? defaultMiddle,
      };
    }
  } catch {
    // Ignore storage errors
  }
  return { left: defaultLeft, middle: defaultMiddle };
}

/**
 * Save panel widths to localStorage
 */
function saveWidths(widths: PanelWidths): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Three-column layout with resizable panels
 * Collapses to stacked view on screens < 1024px
 */
export const ThreeColumnLayout: FC<ThreeColumnLayoutProps> = ({
  leftPanel,
  middlePanel,
  rightPanel,
  initialLeftWidth = 200,
  initialMiddleWidth = 300,
}) => {
  const [widths, setWidths] = useState<PanelWidths>(() =>
    loadWidths(initialLeftWidth, initialMiddleWidth)
  );
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < BREAKPOINT_LG);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Persist widths to localStorage
  useEffect(() => {
    saveWidths(widths);
  }, [widths]);

  const handleLeftResize = (width: number) => {
    setWidths((prev) => ({ ...prev, left: width }));
  };

  const handleMiddleResize = (width: number) => {
    setWidths((prev) => ({ ...prev, middle: width }));
  };

  // Mobile/tablet: stacked layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-1/4 min-h-[150px] border-b border-gray-700 overflow-auto">
          {leftPanel}
        </div>
        <div className="h-1/4 min-h-[150px] border-b border-gray-700 overflow-auto">
          {middlePanel}
        </div>
        <div className="flex-1 overflow-auto">{rightPanel}</div>
      </div>
    );
  }

  // Desktop: three-column layout
  return (
    <div className="flex h-full">
      {/* Left Panel: Projects */}
      <ResizablePanel
        width={widths.left}
        minWidth={150}
        maxWidth={300}
        onResize={handleLeftResize}
        className="bg-gray-900 border-r border-gray-700"
      >
        {leftPanel}
      </ResizablePanel>

      {/* Middle Panel: Scenarios */}
      <ResizablePanel
        width={widths.middle}
        minWidth={200}
        maxWidth={500}
        onResize={handleMiddleResize}
        className="bg-gray-900 border-r border-gray-700"
      >
        {middlePanel}
      </ResizablePanel>

      {/* Right Panel: Details */}
      <div className="flex-1 overflow-auto bg-gray-900">{rightPanel}</div>
    </div>
  );
};
