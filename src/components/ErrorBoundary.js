import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    console.error('🚨 ErrorBoundary caught an error:', error);
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ErrorBoundary componentDidCatch:', {
      error: error,
      errorInfo: errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: this
    });

    // Save error details for debugging
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {

      // Custom error UI
      return (
        <div
          className="error-boundary"
          style={{
            padding: '2rem',
            margin: '1rem',
            border: '2px solid #dc2626',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            textAlign: 'center',
            fontFamily: 'Arial, sans-serif'
          }}
          role="alert"
          aria-live="assertive"
        >
          <h2 style={{ marginTop: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
            ⚠️ Something went wrong
          </h2>

          <p style={{ margin: '1rem 0', fontSize: '1rem', lineHeight: '1.5' }}>
            We&apos;re sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
          </p>

          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
                marginRight: '1rem'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#b91c1c';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#dc2626';
              }}
            >
              Try Again
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'transparent',
                color: '#dc2626',
                border: '2px solid #dc2626',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#dc2626';
              }}
            >
              Refresh Page
            </button>
          </div>

          {/* Show error details in development */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              style={{
                marginTop: '2rem',
                textAlign: 'left',
                backgroundColor: '#fee2e2',
                padding: '1rem',
                borderRadius: '4px',
                border: '1px solid #fca5a5'
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                🔍 Error Details (Development Only)
              </summary>

              <div style={{ marginTop: '1rem' }}>
                <h4>Error Message:</h4>
                <pre style={{
                  backgroundColor: '#fff',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '0.875rem'
                }}>
                  {this.state.error.toString()}
                </pre>

                {this.state.errorInfo && (
                  <>
                    <h4>Component Stack:</h4>
                    <pre style={{
                      backgroundColor: '#fff',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '0.875rem'
                    }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
