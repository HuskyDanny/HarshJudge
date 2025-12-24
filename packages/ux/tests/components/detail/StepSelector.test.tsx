import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepSelector } from '../../../src/components/detail/StepSelector';

describe('StepSelector', () => {
  const mockSteps = [
    { id: '01', title: 'Navigate to login' },
    { id: '02', title: 'Enter credentials' },
    { id: '03', title: 'Submit form' },
  ];

  describe('Rendering', () => {
    it('renders all steps', () => {
      render(
        <StepSelector
          steps={mockSteps}
          currentStepId={null}
          onStepSelect={() => {}}
        />
      );

      expect(screen.getByText('Navigate to login')).toBeInTheDocument();
      expect(screen.getByText('Enter credentials')).toBeInTheDocument();
      expect(screen.getByText('Submit form')).toBeInTheDocument();
    });

    it('renders step IDs', () => {
      render(
        <StepSelector
          steps={mockSteps}
          currentStepId={null}
          onStepSelect={() => {}}
        />
      );

      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('02')).toBeInTheDocument();
      expect(screen.getByText('03')).toBeInTheDocument();
    });

    it('shows empty message when no steps', () => {
      render(
        <StepSelector
          steps={[]}
          currentStepId={null}
          onStepSelect={() => {}}
        />
      );

      expect(screen.getByText('No steps defined')).toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('highlights selected step', () => {
      render(
        <StepSelector
          steps={mockSteps}
          currentStepId="02"
          onStepSelect={() => {}}
        />
      );

      const buttons = screen.getAllByRole('tab');
      const selectedButton = buttons[1];
      expect(selectedButton).toHaveClass('bg-blue-600');
    });

    it('calls onStepSelect when step is clicked', () => {
      const handleSelect = vi.fn();
      render(
        <StepSelector
          steps={mockSteps}
          currentStepId={null}
          onStepSelect={handleSelect}
        />
      );

      fireEvent.click(screen.getByText('Enter credentials'));
      expect(handleSelect).toHaveBeenCalledWith('02');
    });
  });

  describe('Evidence indicators', () => {
    it('shows evidence indicator for steps with evidence', () => {
      const stepsWithEvidence = new Set(['01', '03']);

      render(
        <StepSelector
          steps={mockSteps}
          currentStepId={null}
          onStepSelect={() => {}}
          stepsWithEvidence={stepsWithEvidence}
        />
      );

      // Steps with evidence should have indicator dot
      const buttons = screen.getAllByRole('tab');
      const step1Button = buttons[0];
      const step2Button = buttons[1];
      const step3Button = buttons[2];

      expect(step1Button.querySelector('.rounded-full')).toBeInTheDocument();
      expect(step2Button.querySelector('.rounded-full')).not.toBeInTheDocument();
      expect(step3Button.querySelector('.rounded-full')).toBeInTheDocument();
    });
  });

  describe('Failed step', () => {
    it('shows failed step with red styling', () => {
      render(
        <StepSelector
          steps={mockSteps}
          currentStepId={null}
          onStepSelect={() => {}}
          failedStepId="02"
        />
      );

      const buttons = screen.getAllByRole('tab');
      const failedButton = buttons[1];
      expect(failedButton).toHaveClass('bg-red-900/50');
    });
  });

  describe('Accessibility', () => {
    it('has tablist role', () => {
      render(
        <StepSelector
          steps={mockSteps}
          currentStepId={null}
          onStepSelect={() => {}}
        />
      );

      expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('has tab role for each step', () => {
      render(
        <StepSelector
          steps={mockSteps}
          currentStepId={null}
          onStepSelect={() => {}}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('marks selected step with aria-selected', () => {
      render(
        <StepSelector
          steps={mockSteps}
          currentStepId="02"
          onStepSelect={() => {}}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    });
  });
});
