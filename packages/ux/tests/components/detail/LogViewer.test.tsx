import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogViewer } from '../../../src/components/detail/LogViewer';

const sampleLog = `[INFO] Starting test execution
[INFO] Navigating to https://example.com
[ERROR] Element not found: #submit-button
[ERROR] Test failed at step 3
[INFO] Cleanup completed`;

describe('LogViewer', () => {
  describe('rendering', () => {
    it('renders log content with line numbers', () => {
      render(<LogViewer content={sampleLog} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays all log lines', () => {
      render(<LogViewer content={sampleLog} />);

      expect(screen.getByText(/Starting test execution/)).toBeInTheDocument();
      expect(screen.getByText(/Element not found/)).toBeInTheDocument();
      expect(screen.getByText(/Cleanup completed/)).toBeInTheDocument();
    });

    it('has log role for accessibility', () => {
      render(<LogViewer content={sampleLog} />);
      expect(screen.getByRole('log')).toBeInTheDocument();
    });
  });

  describe('error detection', () => {
    it('auto-detects error lines', () => {
      render(<LogViewer content={sampleLog} />);

      // Should show error count indicator
      expect(screen.getByText(/2 errors detected/)).toBeInTheDocument();
    });

    it('highlights error lines with red background', () => {
      render(<LogViewer content={sampleLog} />);

      // Error lines should have red styling
      const errorLine = screen.getByText(/Element not found/).closest('div');
      expect(errorLine).toHaveClass('bg-red-900/30');
    });

    it('uses provided errorLines prop', () => {
      render(<LogViewer content="Line 1\nLine 2\nLine 3" errorLines={[1]} />);

      // Only line 2 (index 1) should be highlighted
      expect(screen.getByText(/1 error detected/)).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('renders search input', () => {
      render(<LogViewer content={sampleLog} />);

      expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
    });

    it('shows match count when searching', () => {
      render(<LogViewer content={sampleLog} />);

      const searchInput = screen.getByPlaceholderText('Search logs...');
      fireEvent.change(searchInput, { target: { value: 'INFO' } });

      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    it('shows navigation buttons when matches found', () => {
      render(<LogViewer content={sampleLog} />);

      const searchInput = screen.getByPlaceholderText('Search logs...');
      fireEvent.change(searchInput, { target: { value: 'INFO' } });

      expect(screen.getByRole('button', { name: 'Previous match' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next match' })).toBeInTheDocument();
    });

    it('navigates to next match on button click', () => {
      render(<LogViewer content={sampleLog} />);

      const searchInput = screen.getByPlaceholderText('Search logs...');
      fireEvent.change(searchInput, { target: { value: 'INFO' } });

      const nextButton = screen.getByRole('button', { name: 'Next match' });
      fireEvent.click(nextButton);

      expect(screen.getByText('2/3')).toBeInTheDocument();
    });
  });

  describe('copy functionality', () => {
    it('renders copy button', () => {
      render(<LogViewer content={sampleLog} />);

      expect(screen.getByRole('button', { name: 'Copy log content' })).toBeInTheDocument();
    });

    it('calls onCopy when copy button clicked', () => {
      const handleCopy = vi.fn();
      render(<LogViewer content={sampleLog} onCopy={handleCopy} />);

      const copyButton = screen.getByRole('button', { name: 'Copy log content' });
      fireEvent.click(copyButton);

      expect(handleCopy).toHaveBeenCalled();
    });

    it('shows success state when copySuccess is true', () => {
      render(<LogViewer content={sampleLog} copySuccess={true} />);

      expect(screen.getByText('✓ Copied')).toBeInTheDocument();
    });
  });

  describe('empty content', () => {
    it('renders empty log with no lines', () => {
      render(<LogViewer content="" />);

      expect(screen.getByRole('log')).toBeInTheDocument();
    });
  });
});
