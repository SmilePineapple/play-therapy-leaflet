import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading component with accessibility features and customizable appearance
 * @param {object} props - Component props
 * @param {string} props.message - Loading message to display
 * @param {string} props.size - Size of the spinner ('small', 'medium', 'large')
 * @param {boolean} props.overlay - Whether to show as an overlay
 * @param {string} props.className - Additional CSS classes
 */
const Loading = ({
  message = 'Loading...',
  size = 'medium',
  overlay = false,
  className = ''
}) => {

  // Size classes for different loading spinner sizes (removed unused sizeClasses)

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    padding: overlay ? '2rem' : '1rem',
    ...(overlay && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      zIndex: 9999
    })
  };

  const spinnerStyles = {
    width: size === 'small' ? '1rem' : size === 'large' ? '3rem' : '2rem',
    height: size === 'small' ? '1rem' : size === 'large' ? '3rem' : '2rem',
    border: '2px solid #e5e7eb',
    borderTop: '2px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const messageStyles = {
    fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.25rem' : '1rem',
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center'
  };

  return (
    <div
      className={`loading-container ${className}`}
      style={containerStyles}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {/* CSS-in-JS keyframes for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Spinner */}
      <div
        style={spinnerStyles}
        aria-hidden="true"
      />

      {/* Loading message */}
      <div
        style={messageStyles}
        id="loading-message"
      >
        {message}
      </div>

      {/* Screen reader only text */}
      <div
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
        aria-live="assertive"
      >
        Content is loading, please wait.
      </div>
    </div>
  );
};

/**
 * Inline loading spinner for use within other components
 */
export const InlineLoading = ({ message = 'Loading...', className = '' }) => {

  return (
    <span
      className={`inline-loading ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}
      role="status"
      aria-label={message}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      <div
        style={{
          width: '1rem',
          height: '1rem',
          border: '2px solid #e5e7eb',
          borderTop: '2px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
        aria-hidden="true"
      />

      <span>{message}</span>
    </span>
  );
};

/**
 * Loading skeleton for content placeholders
 */
export const LoadingSkeleton = ({
  lines = 3,
  className = '',
  height = '1rem',
  spacing = '0.5rem'
}) => {

  return (
    <div
      className={`loading-skeleton ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap: spacing }}
      role="status"
      aria-label="Content loading"
    >
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>

      {Array.from({ length: lines }, (_, index) => (
        <div
          key={`skeleton-line-${index}`}
          style={{
            height: height,
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            width: index === lines - 1 ? '75%' : '100%' // Last line is shorter
          }}
          aria-hidden="true"
        />
      ))}

      <div
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        Content is loading, please wait.
      </div>
    </div>
  );
};

// PropTypes for type checking
Loading.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  overlay: PropTypes.bool,
  className: PropTypes.string
};

InlineLoading.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string
};

LoadingSkeleton.propTypes = {
  lines: PropTypes.number,
  className: PropTypes.string,
  height: PropTypes.string,
  spacing: PropTypes.string
};

export default Loading;
