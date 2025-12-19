import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepTimeline } from '../../../src/components/detail/StepTimeline';
import type { ParsedStep } from '../../../src/lib/parseEvidence';

const mockSteps: ParsedStep[] = [
  { number: 1, action: 'navigate', path: '/evidence/step-01-navigate.png' },
  { number: 2, action: 'click', path: '/evidence/step-02-click.png' },
  { number: 3, action: 'fill', path: '/evidence/step-03-fill.png' },
];

describe('StepTimeline', () => {
  describe('rendering', () => {
    it('renders all steps as thumbnails', () => {
      render(
        <StepTimeline
          steps={mockSteps}
          currentIndex={0}
          onStepSelect={vi.fn()}
          failedStep={null}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('shows empty message when no steps', () => {
      render(
        <StepTimeline
          steps={[]}
          currentIndex={0}
          onStepSelect={vi.fn()}
          failedStep={null}
        />
      );

      expect(screen.getByText('No screenshots available')).toBeInTheDocument();
    });

    it('has listbox role for accessibility', () => {
      render(
        <StepTimeline
          steps={mockSteps}
          currentIndex={0}
          onStepSelect={vi.fn()}
          failedStep={null}
        />
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('has accessible label', () => {
      render(
        <StepTimeline
          steps={mockSteps}
          currentIndex={0}
          onStepSelect={vi.fn()}
          failedStep={null}
        />
      );

      expect(screen.getByRole('listbox')).toHaveAttribute(
        'aria-label',
        'Step timeline'
      );
    });
  });

  describe('selection', () => {
    it('calls onStepSelect when thumbnail clicked', () => {
      const handleSelect = vi.fn();
      render(
        <StepTimeline
          steps={mockSteps}
          currentIndex={0}
          onStepSelect={handleSelect}
          failedStep={null}
        />
      );

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[1]); // Click second step

      expect(handleSelect).toHaveBeenCalledWith(1);
    });

    it('highlights current step', () => {
      render(
        <StepTimeline
          steps={mockSteps}
          currentIndex={1}
          onStepSelect={vi.fn()}
          failedStep={null}
        />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons[1]).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('status indication', () => {
    it('marks failed step', () => {
      render(
        <StepTimeline
          steps={mockSteps}
          currentIndex={0}
          onStepSelect={vi.fn()}
          failedStep="02" // v2: zero-padded string
        />
      );

      const buttons = screen.getAllByRole('button');
      // Step 2 (index 1) should be marked as failed
      expect(buttons[1]).toHaveAttribute(
        'aria-label',
        expect.stringContaining('(failed)')
      );
    });

    it('does not mark non-failed steps as failed', () => {
      render(
        <StepTimeline
          steps={mockSteps}
          currentIndex={0}
          onStepSelect={vi.fn()}
          failedStep="02" // v2: zero-padded string
        />
      );

      const buttons = screen.getAllByRole('button');
      // Step 1 (index 0) should not be marked as failed
      expect(buttons[0]).not.toHaveAttribute(
        'aria-label',
        expect.stringContaining('(failed)')
      );
    });
  });
});
