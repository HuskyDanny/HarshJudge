import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarButton } from '../../src/components/common/StarButton';

describe('StarButton', () => {
  describe('Visual states', () => {
    it('renders filled star when starred', () => {
      render(<StarButton starred={true} onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-yellow-400');
    });

    it('renders outline star when not starred', () => {
      render(<StarButton starred={false} onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-gray-500');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const onClick = vi.fn();
      render(<StarButton starred={false} onClick={onClick} />);
      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalled();
    });

    it('stops event propagation when clicked', () => {
      const onClick = vi.fn();
      const parentClick = vi.fn();

      render(
        <div onClick={parentClick}>
          <StarButton starred={false} onClick={onClick} />
        </div>
      );

      fireEvent.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalled();
      expect(parentClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn();
      render(<StarButton starred={false} onClick={onClick} disabled />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Size variants', () => {
    it('renders medium size by default', () => {
      render(<StarButton starred={false} onClick={() => {}} />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveClass('w-5', 'h-5');
    });

    it('renders small size when specified', () => {
      render(<StarButton starred={false} onClick={() => {}} size="sm" />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4');
    });

    it('renders large size when specified', () => {
      render(<StarButton starred={false} onClick={() => {}} size="lg" />);
      const svg = screen.getByRole('button').querySelector('svg');
      expect(svg).toHaveClass('w-6', 'h-6');
    });
  });

  describe('Accessibility', () => {
    it('has correct aria-label when not starred', () => {
      render(<StarButton starred={false} onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Add to favorites');
    });

    it('has correct aria-label when starred', () => {
      render(<StarButton starred={true} onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Remove from favorites');
    });

    it('has aria-pressed attribute', () => {
      render(<StarButton starred={true} onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-pressed', 'true');
    });

    it('has title attribute for tooltip', () => {
      render(<StarButton starred={false} onClick={() => {}} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Add to favorites');
    });
  });

  describe('Disabled state', () => {
    it('has reduced opacity when disabled', () => {
      render(<StarButton starred={false} onClick={() => {}} disabled />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('has disabled attribute when disabled', () => {
      render(<StarButton starred={false} onClick={() => {}} disabled />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});
