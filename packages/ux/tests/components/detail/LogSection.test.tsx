import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogSection } from '../../../src/components/detail/LogSection';

const sampleLog = `[INFO] Starting test
[ERROR] Test failed
[INFO] Completed`;

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(navigator, { clipboard: mockClipboard });
});

describe('LogSection', () => {
  describe('rendering', () => {
    it('renders section title', () => {
      render(<LogSection title="Error Log" content={sampleLog} />);

      expect(screen.getByText('Error Log')).toBeInTheDocument();
    });

    it('returns null when content is null', () => {
      const { container } = render(<LogSection title="Log" content={null} />);

      expect(container.firstChild).toBeNull();
    });

    it('shows error badge when collapsed', () => {
      render(<LogSection title="Error Log" content={sampleLog} />);

      // Should show error count badge
      expect(screen.getByText(/1 error/)).toBeInTheDocument();
    });
  });

  describe('expand/collapse behavior', () => {
    it('is collapsed by default', () => {
      render(<LogSection title="Error Log" content={sampleLog} />);

      // Log content should not be visible
      expect(screen.queryByRole('log')).not.toBeInTheDocument();
    });

    it('expands when defaultExpanded is true', () => {
      render(<LogSection title="Error Log" content={sampleLog} defaultExpanded={true} />);

      // Log content should be visible
      expect(screen.getByRole('log')).toBeInTheDocument();
    });

    it('toggles on button click', () => {
      render(<LogSection title="Error Log" content={sampleLog} />);

      // Initially collapsed
      expect(screen.queryByRole('log')).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(screen.getByText('Error Log'));
      expect(screen.getByRole('log')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(screen.getByText('Error Log'));
      expect(screen.queryByRole('log')).not.toBeInTheDocument();
    });

    it('has aria-expanded attribute', () => {
      render(<LogSection title="Error Log" content={sampleLog} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('copy functionality', () => {
    it('copies content to clipboard when expanded', async () => {
      render(<LogSection title="Error Log" content={sampleLog} defaultExpanded={true} />);

      const copyButton = screen.getByRole('button', { name: 'Copy log content' });
      fireEvent.click(copyButton);

      expect(mockClipboard.writeText).toHaveBeenCalledWith(sampleLog);
    });
  });

  describe('error count display', () => {
    it('shows singular error when one error', () => {
      const oneError = '[ERROR] Single error';
      render(<LogSection title="Log" content={oneError} />);

      expect(screen.getByText('1 error')).toBeInTheDocument();
    });

    it('shows plural errors when multiple', () => {
      const twoErrors = '[ERROR] First error\n[ERROR] Second error';
      render(<LogSection title="Log" content={twoErrors} />);

      expect(screen.getByText('2 errors')).toBeInTheDocument();
    });

    it('hides error badge in header when expanded', () => {
      render(<LogSection title="Error Log" content={sampleLog} defaultExpanded={true} />);

      // Error badge in the header should not be visible when expanded
      // The "errors detected" indicator in LogViewer is different from the badge
      const headerButton = screen.getByRole('button', { name: /Error Log/i });
      const badgeInHeader = headerButton.querySelector('.bg-red-900');
      expect(badgeInHeader).not.toBeInTheDocument();
    });

    it('shows no error badge when no errors', () => {
      const noErrors = '[INFO] All good\n[INFO] Still good';
      render(<LogSection title="Log" content={noErrors} />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has aria-controls attribute', () => {
      render(<LogSection title="Error Log" content={sampleLog} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-controls', 'log-content');
    });
  });
});
