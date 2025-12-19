import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RunDetailPanel } from '../../../src/components/panels/RunDetailPanel';
import type { RunDetail } from '../../../src/services/DataService';

// Mock the hooks
const mockRunDetail: RunDetail = {
  runId: 'test-run-123',
  scenarioSlug: 'login-test',
  result: {
    runId: 'test-run-123',
    status: 'pass',
    duration: 5000,
    completedAt: '2025-01-15T10:00:00Z',
    failedStep: null,
    errorMessage: null,
  },
  evidencePaths: [
    '/evidence/step-01-navigate.png',
    '/evidence/step-02-click.png',
    '/evidence/step-03-fill.png',
  ],
};

const mockFailedRunDetail: RunDetail = {
  runId: 'test-run-456',
  scenarioSlug: 'login-test',
  result: {
    runId: 'test-run-456',
    status: 'fail',
    duration: 3000,
    completedAt: '2025-01-15T11:00:00Z',
    failedStep: '02', // v2: zero-padded string
    errorMessage: 'Element not found: #submit-button',
  },
  evidencePaths: [
    '/evidence/step-01-navigate.png',
    '/evidence/step-02-click.png',
  ],
};

let mockUseRunDetail = vi.fn();

vi.mock('../../../src/hooks', () => ({
  useRunDetail: (projectPath: string, scenarioSlug: string, runId: string) =>
    mockUseRunDetail(projectPath, scenarioSlug, runId),
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

    it('displays step counter', () => {
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

  describe('timeline interaction', () => {
    it('renders step thumbnails', () => {
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

      // Should have 3 step thumbnails
      const stepButtons = screen.getAllByRole('button', { name: /Step \d/ });
      expect(stepButtons).toHaveLength(3);
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
