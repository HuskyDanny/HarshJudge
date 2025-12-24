import { type FC, useState, useEffect } from 'react';
import type { EvidenceType } from '@harshjudge/shared';
import { ScreenshotViewer } from './ScreenshotViewer';
import { LogSection } from './LogSection';

/**
 * Evidence item for display
 */
export interface StepEvidence {
  /** Path to the evidence file (API URL) */
  path: string;
  /** Display name */
  name: string;
  /** Evidence type */
  type: EvidenceType;
  /** File extension */
  extension: string;
}

/**
 * Categorized evidence for a step
 */
export interface CategorizedEvidence {
  images: StepEvidence[];
  logs: StepEvidence[];
  dbSnapshots: StepEvidence[];
}

interface StepEvidenceViewProps {
  /** Step ID (zero-padded, e.g., "01") */
  stepId: string;
  /** Categorized evidence for this step */
  evidence: CategorizedEvidence;
  /** Error message if this step failed */
  errorMessage?: string | null;
  /** Loading state */
  loading?: boolean;
  /** AI-generated summary for this step */
  stepSummary?: string | null;
  /** Step status (pass/fail/skipped) */
  stepStatus?: 'pass' | 'fail' | 'skipped' | null;
}

type EvidenceTab = 'images' | 'logs' | 'db';

const TAB_CONFIG: Record<EvidenceTab, { label: string; icon: React.ReactNode }> = {
  images: {
    label: 'Images',
    icon: <ImageIcon />,
  },
  logs: {
    label: 'Logs',
    icon: <LogIcon />,
  },
  db: {
    label: 'DB Verification',
    icon: <DatabaseIcon />,
  },
};

const EMPTY_MESSAGES: Record<EvidenceTab, string> = {
  images: 'No screenshots for this step',
  logs: 'No logs captured for this step',
  db: 'No database snapshots for this step',
};

/**
 * Tabbed evidence viewer for a single step.
 * Features:
 * - Three tabs: Images, Logs, DB Verification
 * - Shows "No [type] for this step" if empty
 * - Image zoom support
 * - Expandable log/DB content
 */
export const StepEvidenceView: FC<StepEvidenceViewProps> = ({
  stepId,
  evidence,
  errorMessage,
  loading = false,
  stepSummary,
  stepStatus,
}) => {
  const [activeTab, setActiveTab] = useState<EvidenceTab>('images');
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get counts for badges
  const counts: Record<EvidenceTab, number> = {
    images: evidence.images.length,
    logs: evidence.logs.length,
    db: evidence.dbSnapshots.length,
  };

  // Auto-select first non-empty tab when step changes (Images → Logs → DB)
  useEffect(() => {
    if (evidence.images.length > 0) {
      setActiveTab('images');
    } else if (evidence.logs.length > 0) {
      setActiveTab('logs');
    } else if (evidence.dbSnapshots.length > 0) {
      setActiveTab('db');
    } else {
      setActiveTab('images'); // Default to images if all empty
    }
    // Reset image selection when step changes
    setSelectedImageIndex(0);
  }, [stepId, evidence.images.length, evidence.logs.length, evidence.dbSnapshots.length]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-sm text-gray-500 animate-pulse">
          Loading evidence...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-900">
      {/* AI Summary Section - shown when summary is available */}
      {stepSummary && (
        <div className={`p-4 border-b ${
          stepStatus === 'pass' ? 'border-green-800 bg-green-950/30' :
          stepStatus === 'fail' ? 'border-red-800 bg-red-950/30' :
          'border-gray-700 bg-gray-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              stepStatus === 'pass' ? 'bg-green-600' :
              stepStatus === 'fail' ? 'bg-red-600' :
              'bg-gray-600'
            }`}>
              {stepStatus === 'pass' ? (
                <CheckIcon />
              ) : stepStatus === 'fail' ? (
                <XIcon />
              ) : (
                <SkipIcon />
              )}
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                <SparklesIcon />
                AI Summary
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">
                {stepSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        {(Object.keys(TAB_CONFIG) as EvidenceTab[]).map((tabId) => {
          const config = TAB_CONFIG[tabId];
          const count = counts[tabId];
          const isActive = activeTab === tabId;

          return (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors
                ${isActive
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-850'
                  : 'text-gray-400 hover:text-white hover:bg-gray-750'
                }
              `}
              aria-selected={isActive}
              role="tab"
            >
              {config.icon}
              {config.label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto" role="tabpanel">
        {activeTab === 'images' && (
          <ImagesTabContent
            images={evidence.images}
            selectedIndex={selectedImageIndex}
            onSelectImage={setSelectedImageIndex}
            isZoomed={isZoomed}
            onToggleZoom={() => setIsZoomed(!isZoomed)}
            errorMessage={errorMessage}
          />
        )}
        {activeTab === 'logs' && (
          <LogsTabContent logs={evidence.logs} />
        )}
        {activeTab === 'db' && (
          <DbTabContent snapshots={evidence.dbSnapshots} />
        )}
      </div>
    </div>
  );
};

/**
 * Images tab content
 */
const ImagesTabContent: FC<{
  images: StepEvidence[];
  selectedIndex: number;
  onSelectImage: (index: number) => void;
  isZoomed: boolean;
  onToggleZoom: () => void;
  errorMessage?: string | null;
}> = ({ images, selectedIndex, onSelectImage, isZoomed, onToggleZoom, errorMessage }) => {
  if (images.length === 0) {
    return <EmptyTabState message={EMPTY_MESSAGES.images} />;
  }

  const currentImage = images[selectedIndex] || images[0];

  return (
    <div className="flex flex-col h-full">
      {/* Multiple image selector if more than one */}
      {images.length > 1 && (
        <div className="flex gap-2 p-2 bg-gray-800 border-b border-gray-700 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={img.path}
              onClick={() => onSelectImage(index)}
              className={`
                px-3 py-1.5 text-xs rounded whitespace-nowrap
                ${index === selectedIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {img.name}
            </button>
          ))}
        </div>
      )}

      {/* Screenshot viewer */}
      {currentImage && (
        <ScreenshotViewer
          imagePath={currentImage.path}
          isZoomed={isZoomed}
          onToggleZoom={onToggleZoom}
          errorMessage={errorMessage ?? null}
        />
      )}
    </div>
  );
};

/**
 * Logs tab content
 */
const LogsTabContent: FC<{ logs: StepEvidence[] }> = ({ logs }) => {
  if (logs.length === 0) {
    return <EmptyTabState message={EMPTY_MESSAGES.logs} />;
  }

  return (
    <div className="p-4 space-y-3">
      {logs.map((log, index) => (
        <EvidenceContentItem
          key={`${log.path}-${index}`}
          evidence={log}
        />
      ))}
    </div>
  );
};

/**
 * DB Verification tab content
 */
const DbTabContent: FC<{ snapshots: StepEvidence[] }> = ({ snapshots }) => {
  if (snapshots.length === 0) {
    return <EmptyTabState message={EMPTY_MESSAGES.db} />;
  }

  return (
    <div className="p-4 space-y-3">
      {snapshots.map((snapshot, index) => (
        <EvidenceContentItem
          key={`${snapshot.path}-${index}`}
          evidence={snapshot}
        />
      ))}
    </div>
  );
};

/**
 * Single evidence item with auto-expanded content (no collapse)
 * Content loads immediately and is always visible
 */
const EvidenceContentItem: FC<{ evidence: StepEvidence }> = ({ evidence }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch content on mount
  useEffect(() => {
    let cancelled = false;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(evidence.path);
        if (!res.ok) throw new Error('Failed to fetch');
        let text = await res.text();

        // Format JSON nicely if applicable
        if (evidence.extension === 'json') {
          try {
            const parsed = JSON.parse(text);
            text = JSON.stringify(parsed, null, 2);
          } catch {
            // Keep as-is if not valid JSON
          }
        }
        if (!cancelled) {
          setContent(text);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchContent();
    return () => { cancelled = true; };
  }, [evidence.path, evidence.extension]);

  // Format the name for display
  const displayName = evidence.name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Header - always visible, non-collapsible */}
      <div className="flex items-center justify-between p-3 bg-gray-800">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white font-medium">{displayName}</span>
          <span className="text-xs text-gray-500 uppercase">{evidence.extension}</span>
        </div>
      </div>

      {/* Content - always expanded */}
      <div className="bg-gray-900">
        {loading && (
          <div className="p-4 text-sm text-gray-500 animate-pulse">
            Loading...
          </div>
        )}
        {error && (
          <div className="p-4 text-sm text-red-400">
            Error: {error}
          </div>
        )}
        {content && (
          <LogSection
            title=""
            content={content}
            defaultExpanded={true}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Empty state for tabs
 */
const EmptyTabState: FC<{ message: string }> = ({ message }) => (
  <div className="flex-1 flex items-center justify-center h-48">
    <div className="text-sm text-gray-500">{message}</div>
  </div>
);

/**
 * Image icon
 */
function ImageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

/**
 * Log icon
 */
function LogIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

/**
 * Database icon
 */
function DatabaseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  );
}

/**
 * Check icon for passed steps
 */
function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/**
 * X icon for failed steps
 */
function XIcon() {
  return (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/**
 * Skip icon for skipped steps
 */
function SkipIcon() {
  return (
    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  );
}

/**
 * Sparkles icon for AI summary
 */
function SparklesIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}
