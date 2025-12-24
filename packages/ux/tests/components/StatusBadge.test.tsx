import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../../src/components/common/StatusBadge';

describe('StatusBadge', () => {
  describe('Status colors', () => {
    it('renders green for pass status', () => {
      render(<StatusBadge status="pass" />);
      const badge = screen.getByRole('img');
      expect(badge).toHaveClass('bg-green-500');
    });

    it('renders red for fail status', () => {
      render(<StatusBadge status="fail" />);
      const badge = screen.getByRole('img');
      expect(badge).toHaveClass('bg-red-500');
    });

    it('renders yellow for running status', () => {
      render(<StatusBadge status="running" />);
      const badge = screen.getByRole('img');
      expect(badge).toHaveClass('bg-yellow-500');
    });
  });

  describe('Size variants', () => {
    it('renders small size by default', () => {
      render(<StatusBadge status="pass" />);
      const badge = screen.getByRole('img');
      expect(badge).toHaveClass('w-2', 'h-2');
    });

    it('renders medium size when specified', () => {
      render(<StatusBadge status="pass" size="md" />);
      const badge = screen.getByRole('img');
      expect(badge).toHaveClass('w-3', 'h-3');
    });

    it('renders large size when specified', () => {
      render(<StatusBadge status="pass" size="lg" />);
      const badge = screen.getByRole('img');
      expect(badge).toHaveClass('w-4', 'h-4');
    });
  });

  describe('Labels', () => {
    it('does not show label by default', () => {
      render(<StatusBadge status="pass" />);
      expect(screen.queryByText('All tests passing')).not.toBeInTheDocument();
    });

    it('shows label text for pass status when showLabel is true', () => {
      render(<StatusBadge status="pass" showLabel />);
      expect(screen.getByText('All tests passing')).toBeInTheDocument();
    });

    it('shows label text for fail status when showLabel is true', () => {
      render(<StatusBadge status="fail" showLabel />);
      expect(screen.getByText('Some tests failing')).toBeInTheDocument();
    });

    it('shows label text for running status when showLabel is true', () => {
      render(<StatusBadge status="running" showLabel />);
      expect(screen.getByText('In progress')).toBeInTheDocument();
    });

    it('hides the dot from screen readers when showing label', () => {
      render(<StatusBadge status="pass" showLabel />);
      const dot = document.querySelector('.rounded-full');
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has img role for screen readers when no label shown', () => {
      render(<StatusBadge status="pass" />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('has aria-label describing the status', () => {
      render(<StatusBadge status="pass" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'All tests passing'
      );
    });

    it('has correct aria-label for fail status', () => {
      render(<StatusBadge status="fail" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'Some tests failing'
      );
    });

    it('has correct aria-label for running status', () => {
      render(<StatusBadge status="running" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'aria-label',
        'In progress'
      );
    });

    it('has title attribute for mouse hover tooltip', () => {
      render(<StatusBadge status="pass" />);
      expect(screen.getByRole('img')).toHaveAttribute(
        'title',
        'All tests passing'
      );
    });
  });

  describe('Rendering', () => {
    it('renders as rounded circle', () => {
      render(<StatusBadge status="pass" />);
      expect(screen.getByRole('img')).toHaveClass('rounded-full');
    });

    it('renders as inline-block when no label', () => {
      render(<StatusBadge status="pass" />);
      expect(screen.getByRole('img')).toHaveClass('inline-block');
    });
  });
});
