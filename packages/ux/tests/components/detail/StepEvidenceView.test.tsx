import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StepEvidenceView, type CategorizedEvidence } from '../../../src/components/detail/StepEvidenceView';

describe('StepEvidenceView', () => {
  const emptyEvidence: CategorizedEvidence = {
    images: [],
    logs: [],
    dbSnapshots: [],
  };

  const mockEvidence: CategorizedEvidence = {
    images: [
      { path: '/api/file?path=test.png', name: 'screenshot', type: 'screenshot', extension: 'png' },
    ],
    logs: [
      { path: '/api/file?path=console.txt', name: 'console', type: 'console_log', extension: 'txt' },
    ],
    dbSnapshots: [
      { path: '/api/file?path=db.json', name: 'db-snapshot', type: 'db_snapshot', extension: 'json' },
    ],
  };

  describe('Tab Rendering', () => {
    it('renders all three tabs', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={emptyEvidence}
        />
      );

      expect(screen.getByRole('tab', { name: /images/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /logs/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /db verification/i })).toBeInTheDocument();
    });

    it('shows count badges for tabs with evidence', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={mockEvidence}
        />
      );

      // Each tab should show count "1"
      const ones = screen.getAllByText('1');
      expect(ones).toHaveLength(3);
    });
  });

  describe('Empty States', () => {
    it('shows "No screenshots for this step" when images tab is empty', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={emptyEvidence}
        />
      );

      expect(screen.getByText('No screenshots for this step')).toBeInTheDocument();
    });

    it('shows "No logs captured for this step" when logs tab is empty', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={emptyEvidence}
        />
      );

      fireEvent.click(screen.getByRole('tab', { name: /logs/i }));
      expect(screen.getByText('No logs captured for this step')).toBeInTheDocument();
    });

    it('shows "No database snapshots for this step" when db tab is empty', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={emptyEvidence}
        />
      );

      fireEvent.click(screen.getByRole('tab', { name: /db verification/i }));
      expect(screen.getByText('No database snapshots for this step')).toBeInTheDocument();
    });
  });

  describe('Tab Switching', () => {
    it('switches between tabs', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={emptyEvidence}
        />
      );

      // Initially on Images tab
      expect(screen.getByText('No screenshots for this step')).toBeInTheDocument();

      // Switch to Logs tab
      fireEvent.click(screen.getByRole('tab', { name: /logs/i }));
      expect(screen.getByText('No logs captured for this step')).toBeInTheDocument();

      // Switch to DB tab
      fireEvent.click(screen.getByRole('tab', { name: /db verification/i }));
      expect(screen.getByText('No database snapshots for this step')).toBeInTheDocument();
    });

    it('highlights active tab', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={emptyEvidence}
        />
      );

      const imagesTab = screen.getByRole('tab', { name: /images/i });
      const logsTab = screen.getByRole('tab', { name: /logs/i });

      // Initially Images tab is active
      expect(imagesTab).toHaveClass('text-blue-400');

      // Switch to Logs
      fireEvent.click(logsTab);
      expect(logsTab).toHaveClass('text-blue-400');
    });
  });

  describe('Loading State', () => {
    it('shows loading indicator when loading', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={emptyEvidence}
          loading={true}
        />
      );

      expect(screen.getByText('Loading evidence...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has tab roles for tab buttons', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={emptyEvidence}
        />
      );

      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('has tabpanel role for content area', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={emptyEvidence}
        />
      );

      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('marks active tab with aria-selected', () => {
      render(
        <StepEvidenceView
          stepId="01"
          evidence={emptyEvidence}
        />
      );

      const imagesTab = screen.getByRole('tab', { name: /images/i });
      const logsTab = screen.getByRole('tab', { name: /logs/i });

      expect(imagesTab).toHaveAttribute('aria-selected', 'true');
      expect(logsTab).toHaveAttribute('aria-selected', 'false');
    });
  });
});
