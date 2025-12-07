import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScreenshotViewer } from '../../../src/components/detail/ScreenshotViewer';

describe('ScreenshotViewer', () => {
  describe('rendering', () => {
    it('renders image with correct src', () => {
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={vi.fn()}
          errorMessage={null}
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/evidence/step-01.png');
    });

    it('shows loading state initially', () => {
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={vi.fn()}
          errorMessage={null}
        />
      );

      expect(screen.getByText('Loading screenshot...')).toBeInTheDocument();
    });

    it('shows zoom indicator for fit mode', () => {
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={vi.fn()}
          errorMessage={null}
        />
      );

      expect(screen.getByText('Fit to screen')).toBeInTheDocument();
    });

    it('shows zoom indicator for zoomed mode', () => {
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={true}
          onToggleZoom={vi.fn()}
          errorMessage={null}
        />
      );

      expect(screen.getByText('Actual size')).toBeInTheDocument();
    });
  });

  describe('zoom interaction', () => {
    it('calls onToggleZoom when clicked', () => {
      const handleToggle = vi.fn();
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={handleToggle}
          errorMessage={null}
        />
      );

      const viewer = screen.getByRole('button');
      fireEvent.click(viewer);

      expect(handleToggle).toHaveBeenCalled();
    });

    it('calls onToggleZoom on Enter key', () => {
      const handleToggle = vi.fn();
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={handleToggle}
          errorMessage={null}
        />
      );

      const viewer = screen.getByRole('button');
      fireEvent.keyDown(viewer, { key: 'Enter' });

      expect(handleToggle).toHaveBeenCalled();
    });

    it('calls onToggleZoom on Space key', () => {
      const handleToggle = vi.fn();
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={handleToggle}
          errorMessage={null}
        />
      );

      const viewer = screen.getByRole('button');
      fireEvent.keyDown(viewer, { key: ' ' });

      expect(handleToggle).toHaveBeenCalled();
    });
  });

  describe('error overlay', () => {
    it('shows error message when provided', () => {
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={vi.fn()}
          errorMessage="Element not found"
        />
      );

      expect(screen.getByText('Step Failed')).toBeInTheDocument();
      expect(screen.getByText('Element not found')).toBeInTheDocument();
    });

    it('does not show error overlay when no error', () => {
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={vi.fn()}
          errorMessage={null}
        />
      );

      expect(screen.queryByText('Step Failed')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has button role', () => {
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={vi.fn()}
          errorMessage={null}
        />
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('is focusable', () => {
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={vi.fn()}
          errorMessage={null}
        />
      );

      const viewer = screen.getByRole('button');
      expect(viewer).toHaveAttribute('tabIndex', '0');
    });

    it('has accessible label', () => {
      render(
        <ScreenshotViewer
          imagePath="/evidence/step-01.png"
          isZoomed={false}
          onToggleZoom={vi.fn()}
          errorMessage={null}
        />
      );

      const viewer = screen.getByRole('button');
      expect(viewer).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Screenshot viewer')
      );
    });
  });
});
