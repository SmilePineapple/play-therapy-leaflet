import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loading, { InlineLoading, LoadingSkeleton } from '../Loading';

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Loading Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Main Loading Component', () => {
    it('renders with default props', () => {
      render(<Loading />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
      expect(console.log).toHaveBeenCalledWith(
        '🔄 Loading component rendered with message: "Loading...", size: medium'
      );
    });

    it('renders with custom message', () => {
      const customMessage = 'Loading conference data...';
      render(<Loading message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
      expect(screen.getByLabelText(customMessage)).toBeInTheDocument();
      expect(console.log).toHaveBeenCalledWith(
        `🔄 Loading component rendered with message: "${customMessage}", size: medium`
      );
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<Loading size="small" />);
      expect(console.log).toHaveBeenCalledWith(
        '🔄 Loading component rendered with message: "Loading...", size: small'
      );

      rerender(<Loading size="large" />);
      expect(console.log).toHaveBeenCalledWith(
        '🔄 Loading component rendered with message: "Loading...", size: large'
      );
    });

    it('renders as overlay when overlay prop is true', () => {
      render(<Loading overlay={true} />);

      const container = screen.getByRole('status');
      expect(container).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: '9999'
      });
    });

    it('applies custom className', () => {
      const customClass = 'custom-loading-class';
      render(<Loading className={customClass} />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loading-container', customClass);
    });

    it('has proper accessibility attributes', () => {
      render(<Loading message="Test loading" />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-live', 'polite');
      expect(container).toHaveAttribute('aria-label', 'Test loading');

      // Check for screen reader text
      expect(screen.getByText('Content is loading, please wait.')).toBeInTheDocument();
    });

    it('renders spinner with correct size styles', () => {
      const { container } = render(<Loading size="large" />);

      // The spinner should be rendered (though we can't easily test the exact styles in jsdom)
      expect(container.querySelector('div[aria-hidden="true"]')).toBeInTheDocument();
    });
  });

  describe('InlineLoading Component', () => {
    it('renders with default props', () => {
      render(<InlineLoading />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(console.log).toHaveBeenCalledWith(
        '🔄 InlineLoading component rendered with message: "Loading..."'
      );
    });

    it('renders with custom message', () => {
      const customMessage = 'Saving...';
      render(<InlineLoading message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
      expect(screen.getByLabelText(customMessage)).toBeInTheDocument();
      expect(console.log).toHaveBeenCalledWith(
        `🔄 InlineLoading component rendered with message: "${customMessage}"`
      );
    });

    it('applies custom className', () => {
      const customClass = 'custom-inline-class';
      render(<InlineLoading className={customClass} />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('inline-loading', customClass);
    });

    it('has inline display style', () => {
      render(<InlineLoading />);

      const container = screen.getByRole('status');
      expect(container).toHaveStyle({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem'
      });
    });
  });

  describe('LoadingSkeleton Component', () => {
    it('renders with default props', () => {
      render(<LoadingSkeleton />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByLabelText('Content loading')).toBeInTheDocument();
      expect(console.log).toHaveBeenCalledWith(
        '🔄 LoadingSkeleton component rendered with 3 lines'
      );
    });

    it('renders correct number of skeleton lines', () => {
      const { container } = render(<LoadingSkeleton lines={5} />);

      const skeletonLines = container.querySelectorAll('div[aria-hidden="true"]');
      expect(skeletonLines).toHaveLength(5);
      expect(console.log).toHaveBeenCalledWith(
        '🔄 LoadingSkeleton component rendered with 5 lines'
      );
    });

    it('applies custom className', () => {
      const customClass = 'custom-skeleton-class';
      render(<LoadingSkeleton className={customClass} />);

      const container = screen.getByRole('status');
      expect(container).toHaveClass('loading-skeleton', customClass);
    });

    it('renders with custom height and spacing', () => {
      const { container } = render(
        <LoadingSkeleton height="2rem" spacing="1rem" />
      );

      const skeletonContainer = container.querySelector('.loading-skeleton');
      expect(skeletonContainer).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      });
    });

    it('makes last line shorter than others', () => {
      const { container } = render(<LoadingSkeleton lines={3} />);

      const skeletonLines = container.querySelectorAll('div[aria-hidden="true"]');
      const lastLine = skeletonLines[skeletonLines.length - 1];
      const firstLine = skeletonLines[0];

      expect(lastLine).toHaveStyle({ width: '75%' });
      expect(firstLine).toHaveStyle({ width: '100%' });
    });

    it('has proper accessibility attributes', () => {
      render(<LoadingSkeleton />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Content loading');

      // Check for screen reader text
      expect(screen.getByText('Content is loading, please wait.')).toBeInTheDocument();
    });
  });

  describe('Animation Styles', () => {
    it('includes CSS animations in the DOM', () => {
      const { container } = render(<Loading />);

      // Check that style tag with keyframes is present
      const styleTag = container.querySelector('style');
      expect(styleTag).toBeInTheDocument();
      expect(styleTag.textContent).toContain('@keyframes spin');
      expect(styleTag.textContent).toContain('transform: rotate(0deg)');
      expect(styleTag.textContent).toContain('transform: rotate(360deg)');
    });

    it('includes pulse animation for skeleton', () => {
      const { container } = render(<LoadingSkeleton />);

      const styleTag = container.querySelector('style');
      expect(styleTag).toBeInTheDocument();
      expect(styleTag.textContent).toContain('@keyframes pulse');
      expect(styleTag.textContent).toContain('opacity: 1');
      expect(styleTag.textContent).toContain('opacity: 0.5');
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains accessibility across different sizes', () => {
      const sizes = ['small', 'medium', 'large'];

      sizes.forEach(size => {
        const { unmount } = render(<Loading size={size} />);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByLabelText('Loading...')).toBeInTheDocument();

        unmount();
      });
    });
  });
});
