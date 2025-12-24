import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RunDetailPanel } from '../../../src/components/panels/RunDetailPanel';
import type { RunDetail } from '../../../src/services/DataService';
import type { ScenarioDetail } from '@harshjudge/shared';

// Mock run detail data
const mockRunDetail: RunDetail = {
  runId: 'test-run-123',
  scenarioSlug: 'login-test',
  result: {
    runId: 'test-run-123',
    status: 'pass',
    duration: 5000,
    completedAt: '2025-01-15T10:00:00Z',
    startedAt: '2025-01-15T09:59:55Z',
    failedStep: null,
    errorMessage: null,
  },
  evidencePaths: [
    '/project/.harshJudge/scenarios/login-test/runs/test-run-123/step-01/evidence/screenshot.png',
    '/project/.harshJudge/scenarios/login-test/runs/test-run-123/step-02/evidence/screenshot.png',
    '/project/.harshJudge/scenarios/login-test/runs/test-run-123/step-03/evidence/screenshot.png',
  ],
};

const mockScenarioDetail: ScenarioDetail = {
  slug: 'login-test',
  title: 'Login Test',
  starred: false,
  tags: ['auth'],
  stepCount: 3,
  steps: [
    { id: '01', title: 'Navigate to login' },
    { id: '02', title: 'Enter credentials' },
    { id: '03', title: 'Submit form' },
  ],
  content: '',
  meta: {
    totalRuns: 5,
    passCount: 4,
    failCount: 1,
    lastRun: '2025-01-15T10:00:00Z',
    lastResult: 'pass',
    avgDuration: 4500,
  },
  recentRuns: [],
};

const mockFailedRunDetail: RunDetail = {
  runId: 'test-run-456',
  scenarioSlug: 'login-test',
  result: {
    runId: 'test-run-456',
    status: 'fail',
    duration: 3000,
    completedAt: '2025-01-15T11:00:00Z',
    startedAt: '2025-01-15T10:59:57Z',
    failedStep: '02',
    errorMessage: 'Element not found: #submit-button',
  },
  evidencePaths: [
    '/project/.harshJudge/scenarios/login-test/runs/test-run-456/step-01/evidence/screenshot.png',
    '/project/.harshJudge/scenarios/login-test/runs/test-run-456/step-02/evidence/screenshot.png',
  ],
};

let mockUseRunDetail = vi.fn();
let mockUseScenarioDetail = vi.fn();

vi.mock('../../../src/hooks', () => ({
  useRunDetail: (projectPath: string, scenarioSlug: string, runId: string) =>
    mockUseRunDetail(projectPath, scenarioSlug, runId),
  useScenarioDetail: (projectPath: string, scenarioSlug: string) =>
    mockUseScenarioDetail(projectPath, scenarioSlug),
  useStepEvidence: () => ({
    evidence: { images: [], logs: [], dbSnapshots: [] },
    stepsWithEvidence: new Set(),
    hasEvidence: false,
  }),
  useKeyboardNavigation: () => ({
    handleKeyDown: vi.fn(),
    containerRef: { current: null },
  }),
}));

// Mock FileWatcherContext
vi.mock('../../../src/contexts/FileWatcherContext', () => ({
  useFileWatcherOptional: () => null,
}));

describe('RunDetailPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mockUseScenarioDetail.mockReturnValue({
      scenarioDetail: mockScenarioDetail,
      loading: false,
      error: null,
    });
  });

  describe('loading state', () => {
    it('shows loading message when loading', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: null,
        loading: true,
        error: null,
      });

      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-123"
          onBack={vi.fn()}
        />
      );

      expect(screen.getByText('Loading run details...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error message when error occurs', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: null,
        loading: false,
        error: 'Failed to load run',
      });

      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-123"
          onBack={vi.fn()}
        />
      );

      expect(screen.getByText('Error loading run')).toBeInTheDocument();
      expect(screen.getByText('Failed to load run')).toBeInTheDocument();
    });
  });

  describe('not found state', () => {
    it('shows not found message when run is null', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: null,
        loading: false,
        error: null,
      });

      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-123"
          onBack={vi.fn()}
        />
      );

      expect(screen.getByText('Run not found')).toBeInTheDocument();
    });
  });

  describe('successful render', () => {
    it('displays run ID in header', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: mockRunDetail,
        loading: false,
        error: null,
      });

      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-123"
          onBack={vi.fn()}
        />
      );

      expect(screen.getByText('Run #test-run')).toBeInTheDocument();
    });

    it('displays step counter when steps are available', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: mockRunDetail,
        loading: false,
        error: null,
      });

      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-123"
          onBack={vi.fn()}
        />
      );

      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();
    });

    it('displays keyboard navigation hint for multiple steps', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: mockRunDetail,
        loading: false,
        error: null,
      });

      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-123"
          onBack={vi.fn()}
        />
      );

      expect(
        screen.getByText('Use ← → arrow keys to navigate steps')
      ).toBeInTheDocument();
    });
  });

  describe('back button', () => {
    it('calls onBack when back button clicked', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: mockRunDetail,
        loading: false,
        error: null,
      });

      const handleBack = vi.fn();
      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-123"
          onBack={handleBack}
        />
      );

      fireEvent.click(screen.getByText('Back'));

      expect(handleBack).toHaveBeenCalled();
    });
  });

  describe('step selector', () => {
    it('renders step tabs from scenario detail', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: mockRunDetail,
        loading: false,
        error: null,
      });

      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-123"
          onBack={vi.fn()}
        />
      );

      expect(screen.getByText('Navigate to login')).toBeInTheDocument();
      expect(screen.getByText('Enter credentials')).toBeInTheDocument();
      expect(screen.getByText('Submit form')).toBeInTheDocument();
    });
  });

  describe('failed run display', () => {
    it('shows fail status badge for failed runs', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: mockFailedRunDetail,
        loading: false,
        error: null,
      });

      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-456"
          onBack={vi.fn()}
        />
      );

      expect(screen.getByText('Some tests failing')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has application role', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: mockRunDetail,
        loading: false,
        error: null,
      });

      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-123"
          onBack={vi.fn()}
        />
      );

      expect(screen.getByRole('application')).toBeInTheDocument();
    });

    it('has accessible label for back button', () => {
      mockUseRunDetail.mockReturnValue({
        runDetail: mockRunDetail,
        loading: false,
        error: null,
      });

      render(
        <RunDetailPanel
          projectPath="/project"
          scenarioSlug="login-test"
          runId="test-run-123"
          onBack={vi.fn()}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Back to scenario' })
      ).toBeInTheDocument();
    });
  });
});
