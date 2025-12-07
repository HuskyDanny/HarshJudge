import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RunHistoryList } from '../../../src/components/detail/RunHistoryList';
import { type RunSummary } from '@harshjudge/shared';

const mockRuns: RunSummary[] = [
  {
    id: 'run-1',
    runNumber: 3,
    status: 'pass',
    duration: 3500,
    completedAt: '2025-01-15T10:00:00Z',
    errorMessage: null,
  },
  {
    id: 'run-2',
    runNumber: 2,
    status: 'fail',
    duration: 2000,
    completedAt: '2025-01-14T15:30:00Z',
    errorMessage: 'Element not found',
  },
  {
    id: 'run-3',
    runNumber: 1,
    status: 'pass',
    duration: 4200,
    completedAt: '2025-01-13T09:00:00Z',
    errorMessage: null,
  },
];

describe('RunHistoryList', () => {
  describe('Empty state', () => {
    it('shows empty message when no runs', () => {
      render(<RunHistoryList runs={[]} />);

      expect(
        screen.getByText('No runs yet. Run this scenario to see results here.')
      ).toBeInTheDocument();
    });
  });

  describe('Run list rendering', () => {
    it('renders all runs in the list', () => {
      render(<RunHistoryList runs={mockRuns} />);

      expect(screen.getByText('Run #3')).toBeInTheDocument();
      expect(screen.getByText('Run #2')).toBeInTheDocument();
      expect(screen.getByText('Run #1')).toBeInTheDocument();
    });

    it('displays formatted duration for each run', () => {
      render(<RunHistoryList runs={mockRuns} />);

      expect(screen.getByText('3s')).toBeInTheDocument();
      expect(screen.getByText('2s')).toBeInTheDocument();
      expect(screen.getByText('4s')).toBeInTheDocument();
    });

    it('shows error message for failed runs', () => {
      render(<RunHistoryList runs={mockRuns} />);

      expect(screen.getByText('Element not found')).toBeInTheDocument();
    });

    it('displays status badges for each run', () => {
      render(<RunHistoryList runs={mockRuns} />);

      // Should have 3 status badges (role="img")
      const statusBadges = screen.getAllByRole('img');
      expect(statusBadges).toHaveLength(3);
    });
  });

  describe('Selection behavior', () => {
    it('calls onRunSelect when run is clicked', () => {
      const handleSelect = vi.fn();
      render(<RunHistoryList runs={mockRuns} onRunSelect={handleSelect} />);

      fireEvent.click(screen.getByText('Run #3').closest('li')!);
      expect(handleSelect).toHaveBeenCalledWith('run-1');
    });

    it('calls onRunSelect when Enter key is pressed', () => {
      const handleSelect = vi.fn();
      render(<RunHistoryList runs={mockRuns} onRunSelect={handleSelect} />);

      const firstRun = screen.getByText('Run #3').closest('li');
      fireEvent.keyDown(firstRun!, { key: 'Enter' });
      expect(handleSelect).toHaveBeenCalledWith('run-1');
    });

    it('calls onRunSelect when Space key is pressed', () => {
      const handleSelect = vi.fn();
      render(<RunHistoryList runs={mockRuns} onRunSelect={handleSelect} />);

      const firstRun = screen.getByText('Run #3').closest('li');
      fireEvent.keyDown(firstRun!, { key: ' ' });
      expect(handleSelect).toHaveBeenCalledWith('run-1');
    });

    it('makes items focusable when onRunSelect provided', () => {
      const handleSelect = vi.fn();
      render(<RunHistoryList runs={mockRuns} onRunSelect={handleSelect} />);

      const firstRun = screen.getByText('Run #3').closest('li');
      expect(firstRun).toHaveAttribute('tabIndex', '0');
    });

    it('does not make items focusable when onRunSelect not provided', () => {
      render(<RunHistoryList runs={mockRuns} />);

      const firstRun = screen.getByText('Run #3').closest('li');
      expect(firstRun).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Accessibility', () => {
    it('has accessible list role', () => {
      render(<RunHistoryList runs={mockRuns} />);

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('has aria-label on the list', () => {
      render(<RunHistoryList runs={mockRuns} />);

      expect(screen.getByRole('list')).toHaveAttribute(
        'aria-label',
        'Run history'
      );
    });
  });
});
