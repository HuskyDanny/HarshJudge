import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScenarioStats } from '../../../src/components/detail/ScenarioStats';
import { type ScenarioMeta } from '@harshjudge/shared';

const mockMeta: ScenarioMeta = {
  totalRuns: 20,
  passCount: 16,
  failCount: 4,
  lastRun: '2025-01-15T12:00:00Z',
  lastResult: 'pass',
  avgDuration: 5500, // 5.5 seconds
};

describe('ScenarioStats', () => {
  describe('Statistics display', () => {
    it('displays total runs', () => {
      render(<ScenarioStats meta={mockMeta} />);
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('Total Runs')).toBeInTheDocument();
    });

    it('displays pass count in green', () => {
      render(<ScenarioStats meta={mockMeta} />);
      expect(screen.getByText('16')).toBeInTheDocument();
      expect(screen.getByText('Passed')).toBeInTheDocument();
    });

    it('displays fail count in red', () => {
      render(<ScenarioStats meta={mockMeta} />);
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });

    it('displays formatted average duration', () => {
      render(<ScenarioStats meta={mockMeta} />);
      expect(screen.getByText('5s')).toBeInTheDocument();
      expect(screen.getByText('Avg Duration')).toBeInTheDocument();
    });
  });

  describe('Pass rate calculation', () => {
    it('displays pass rate percentage', () => {
      render(<ScenarioStats meta={mockMeta} />);
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('shows pass rate label', () => {
      render(<ScenarioStats meta={mockMeta} />);
      expect(screen.getByText('Pass Rate')).toBeInTheDocument();
    });
  });

  describe('Zero runs handling', () => {
    it('displays zeros when no runs', () => {
      const zeroMeta: ScenarioMeta = {
        totalRuns: 0,
        passCount: 0,
        failCount: 0,
        lastRun: null,
        lastResult: null,
        avgDuration: 0,
      };

      render(<ScenarioStats meta={zeroMeta} />);

      // Should show 0 for all counts
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(3);
    });

    it('shows dash for avg duration when zero', () => {
      const zeroMeta: ScenarioMeta = {
        totalRuns: 0,
        passCount: 0,
        failCount: 0,
        lastRun: null,
        lastResult: null,
        avgDuration: 0,
      };

      render(<ScenarioStats meta={zeroMeta} />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('does not show pass rate bar when no runs', () => {
      const zeroMeta: ScenarioMeta = {
        totalRuns: 0,
        passCount: 0,
        failCount: 0,
        lastRun: null,
        lastResult: null,
        avgDuration: 0,
      };

      render(<ScenarioStats meta={zeroMeta} />);
      expect(screen.queryByText('Pass Rate')).not.toBeInTheDocument();
    });
  });

  describe('Different pass rate colors', () => {
    it('shows green for 80%+ pass rate', () => {
      const highPassMeta: ScenarioMeta = {
        ...mockMeta,
        totalRuns: 10,
        passCount: 9,
        failCount: 1,
      };

      render(<ScenarioStats meta={highPassMeta} />);
      expect(screen.getByText('90%')).toHaveClass('text-green-400');
    });

    it('shows yellow for 50-79% pass rate', () => {
      const medPassMeta: ScenarioMeta = {
        ...mockMeta,
        totalRuns: 10,
        passCount: 6,
        failCount: 4,
      };

      render(<ScenarioStats meta={medPassMeta} />);
      expect(screen.getByText('60%')).toHaveClass('text-yellow-400');
    });

    it('shows red for under 50% pass rate', () => {
      const lowPassMeta: ScenarioMeta = {
        ...mockMeta,
        totalRuns: 10,
        passCount: 3,
        failCount: 7,
      };

      render(<ScenarioStats meta={lowPassMeta} />);
      expect(screen.getByText('30%')).toHaveClass('text-red-400');
    });
  });
});
