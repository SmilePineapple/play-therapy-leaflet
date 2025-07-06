import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return <div>No error occurred</div>;
};

// Component that throws an error on button click
const ThrowErrorOnClick = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  if (shouldThrow) {
    throw new Error('Test error triggered by user action');
  }

  return (
    <button onClick={() => setShouldThrow(true)}>
      Trigger Error
    </button>
  );
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error occurred')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('🛡️ ErrorBoundary component initialized');
  });

  it('renders error UI when child component throws an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
  });

  it('logs error information when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      '🚨 ErrorBoundary caught an error:',
      expect.any(Error)
    );
    expect(console.error).toHaveBeenCalledWith(
      '🚨 ErrorBoundary componentDidCatch:',
      expect.objectContaining({
        error: expect.any(Error),
        errorInfo: expect.any(Object)
      })
    );
  });

  it('shows error details in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('🔍 Error Details (Development Only)')).toBeInTheDocument();
    expect(screen.getByText('Error Message:')).toBeInTheDocument();
    expect(screen.getByText('Component Stack:')).toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('hides error details in production mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('🔍 Error Details (Development Only)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('resets error state when retry button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error UI should be visible
    expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();

    // Click retry button
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error occurred')).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith('🔄 ErrorBoundary retry button clicked');
  });

  it('has proper accessibility attributes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
    expect(errorContainer).toHaveClass('error-boundary');
  });

  it('handles errors triggered by user interactions', () => {
    render(
      <ErrorBoundary>
        <ThrowErrorOnClick />
      </ErrorBoundary>
    );

    // Initially no error
    expect(screen.getByText('Trigger Error')).toBeInTheDocument();

    // Click to trigger error
    fireEvent.click(screen.getByText('Trigger Error'));

    // Error UI should appear
    expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();
  });

  it('applies correct styling to error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveStyle({
      padding: '2rem',
      margin: '1rem',
      border: '2px solid #dc2626',
      borderRadius: '8px',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      textAlign: 'center'
    });
  });

  it('renders multiple children correctly when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>First child</div>
        <div>Second child</div>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
    expect(screen.getByText('No error occurred')).toBeInTheDocument();
  });

  it('catches errors from any child component', () => {
    render(
      <ErrorBoundary>
        <div>Safe component</div>
        <ThrowError shouldThrow={true} />
        <div>Another safe component</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('⚠️ Something went wrong')).toBeInTheDocument();
    expect(screen.queryByText('Safe component')).not.toBeInTheDocument();
    expect(screen.queryByText('Another safe component')).not.toBeInTheDocument();
  });
});
