import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../src/App';
import type { ProjectSummary } from '../src/services/DataService';
import type { ScenarioSummary } from '@harshjudge/shared';

// Mock the hooks module
const mockProjects: ProjectSummary[] = [
  {
    name: 'Sample Project',
    path: '/projects/sample',
    scenarioCount: 3,
    overallStatus: 'pass',
  },
];

const mockScenarios: ScenarioSummary[] = [];

vi.mock('../src/hooks', () => ({
  useProjects: () => ({
    projects: mockProjects,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useScenarios: () => ({
    scenarios: mockScenarios,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useScenarioDetail: () => ({
    scenarioDetail: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useRunDetail: () => ({
    runDetail: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useKeyboardNavigation: () => ({
    handleKeyDown: vi.fn(),
    containerRef: { current: null },
  }),
}));

// Mock the FileWatcherContext
vi.mock('../src/contexts/FileWatcherContext', () => ({
  FileWatcherProvider: ({ children }: { children: React.ReactNode }) => children,
  useFileWatcher: () => ({
    lastUpdate: null,
    isWatching: false,
  }),
  useFileWatcherOptional: () => null,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders HarshJudge heading', () => {
    render(<App />);
    expect(screen.getByText('HarshJudge')).toBeInTheDocument();
  });

  it('renders 3-column layout with panels', () => {
    render(<App />);
    // Check header sections exist
    expect(screen.getByText(/Projects/)).toBeInTheDocument();
    expect(screen.getByText(/Scenarios/)).toBeInTheDocument();
  });

  it('renders empty states when no selection', () => {
    render(<App />);
    expect(screen.getByText('Select a project')).toBeInTheDocument();
    expect(screen.getByText('Select a scenario')).toBeInTheDocument();
  });

  it('renders project data from hook', () => {
    render(<App />);
    expect(screen.getByText('Sample Project')).toBeInTheDocument();
    expect(screen.getByText('3 scenarios')).toBeInTheDocument();
  });

  it('displays project count in header', () => {
    render(<App />);
    expect(screen.getByText('Projects (1)')).toBeInTheDocument();
  });
});
