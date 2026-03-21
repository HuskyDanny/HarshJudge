import { type FC, useState, useEffect } from 'react';
import type { ParsedEvidence, ParsedEvidenceCollection } from '@/lib';
import { LogSection } from './LogSection';

interface EvidencePanelProps {
  /** Parsed evidence collection */
  evidence: ParsedEvidenceCollection;
  /** Currently selected screenshot step (for highlighting related evidence) */
  currentStep?: number;
}

type TabId = 'logs' | 'db' | 'custom';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  items: ParsedEvidence[];
}

/**
 * Panel displaying non-screenshot evidence (logs, DB snapshots, etc.)
 * Features:
 * - Tabs for different evidence types
 * - Content fetched from API
 * - Collapsible sections
 */
export const EvidencePanel: FC<EvidencePanelProps> = ({
  evidence,
  currentStep,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('logs');

  // Define tabs configuration
  const tabs: TabConfig[] = [
    {
      id: 'logs',
      label: 'Logs',
      icon: <LogIcon />,
      items: evidence.logs,
    },
    {
      id: 'db',
      label: 'DB Verification',
      icon: <DatabaseIcon />,
      items: evidence.dbSnapshots,
    },
    {
      id: 'custom',
      label: 'Other',
      icon: <FileIcon />,
      items: [...evidence.networkLogs, ...evidence.htmlSnapshots, ...evidence.custom],
    },
  ];

  // Filter to only tabs with items
  const availableTabs = tabs.filter((tab) => tab.items.length > 0);

  // If no evidence, don't render
  if (availableTabs.length === 0) {
    return null;
  }

  // Set active tab to first available if current is empty
  const currentTab = availableTabs.find((t) => t.id === activeTab) || availableTabs[0];

  return (
    <div className="border-t border-gray-700 bg-gray-850">
      {/* Tab buttons */}
      <div className="flex border-b border-gray-700 bg-gray-800">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors
              ${currentTab?.id === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-850'
                : 'text-gray-400 hover:text-white hover:bg-gray-750'}
            `}
            aria-selected={currentTab?.id === tab.id}
            role="tab"
          >
            {tab.icon}
            {tab.label}
            <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded-full">
              {tab.items.length}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 max-h-64 overflow-y-auto" role="tabpanel">
        {currentTab && (
          <EvidenceList
            items={currentTab.items}
            currentStep={currentStep}
          />
        )}
      </div>
    </div>
  );
};

/**
 * List of evidence items
 */
const EvidenceList: FC<{ items: ParsedEvidence[]; currentStep?: number }> = ({
  items,
  currentStep,
}) => {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <EvidenceItem
          key={`${item.number}-${item.name}-${index}`}
          item={item}
          isHighlighted={currentStep !== undefined && item.number === currentStep}
        />
      ))}
    </div>
  );
};

/**
 * Single evidence item with lazy content loading
 */
const EvidenceItem: FC<{ item: ParsedEvidence; isHighlighted: boolean }> = ({
  item,
  isHighlighted,
}) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Fetch content when expanded
  useEffect(() => {
    if (expanded && !content && !loading) {
      setLoading(true);
      setError(null);

      fetch(item.path)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.text();
        })
        .then((text) => {
          // Format JSON nicely if applicable
          if (item.extension === 'json') {
            try {
              const parsed = JSON.parse(text);
              setContent(JSON.stringify(parsed, null, 2));
            } catch {
              setContent(text);
            }
          } else {
            setContent(text);
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [expanded, content, loading, item.path, item.extension]);

  // Format the name for display
  const displayName = item.name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      className={`
        border border-gray-700 rounded-lg overflow-hidden
        ${isHighlighted ? 'ring-2 ring-blue-500/50' : ''}
      `}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
            Step {item.number}
          </span>
          <span className="text-sm text-white font-medium">{displayName}</span>
          <span className="text-xs text-gray-500 uppercase">{item.extension}</span>
        </div>
        <ChevronIcon expanded={expanded} />
      </button>

      {expanded && (
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
      )}
    </div>
  );
};

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

/**
 * Log icon
 */
const LogIcon: FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

/**
 * Database icon
 */
const DatabaseIcon: FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

/**
 * File icon
 */
const FileIcon: FC = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
