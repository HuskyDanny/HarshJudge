import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagChip } from '../../src/components/common/TagChip';

describe('TagChip', () => {
  describe('Rendering', () => {
    it('renders the tag text', () => {
      render(<TagChip tag="auth" />);
      expect(screen.getByText('auth')).toBeInTheDocument();
    });

    it('renders as inline-block', () => {
      render(<TagChip tag="test" />);
      expect(screen.getByText('test')).toHaveClass('inline-block');
    });

    it('has rounded-full styling', () => {
      render(<TagChip tag="critical" />);
      expect(screen.getByText('critical')).toHaveClass('rounded-full');
    });
  });

  describe('Size variants', () => {
    it('renders small size by default', () => {
      render(<TagChip tag="small" />);
      expect(screen.getByText('small')).toHaveClass('px-1.5', 'py-0.5', 'text-xs');
    });

    it('renders medium size when specified', () => {
      render(<TagChip tag="medium" size="md" />);
      expect(screen.getByText('medium')).toHaveClass('px-2', 'py-1', 'text-sm');
    });
  });

  describe('Styling', () => {
    it('has gray background color', () => {
      render(<TagChip tag="styled" />);
      expect(screen.getByText('styled')).toHaveClass('bg-gray-700');
    });

    it('has gray text color', () => {
      render(<TagChip tag="styled" />);
      expect(screen.getByText('styled')).toHaveClass('text-gray-300');
    });

    it('has font-medium weight', () => {
      render(<TagChip tag="styled" />);
      expect(screen.getByText('styled')).toHaveClass('font-medium');
    });
  });
});
