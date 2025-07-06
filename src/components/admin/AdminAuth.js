import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './AdminAuth.css';

const AdminAuth = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!credentials.email) {
      setError('Email is required');
      return;
    }
    
    if (!credentials.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await onLogin(credentials);

      if (!result.success) {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <h1>Admin Login</h1>
          <p>Communication Matters Conference Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-auth-form" role="form" data-testid="admin-login-form">
          {error && (
            <div className="auth-error" data-testid="login-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="admin@communicationmatters.org"
              required
              autoComplete="email"
              disabled={loading}
              data-testid="email-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
                data-testid="password-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !credentials.email || !credentials.password}
            data-testid="login-submit"
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="admin-auth-footer">
          <p className="security-notice">
            🔒 This is a secure admin area. All login attempts are logged.
          </p>
          <div className="help-links">
            <a href="mailto:support@communicationmatters.org" className="help-link">
              Need help? Contact Support
            </a>
          </div>
        </div>
      </div>

      <div className="admin-auth-background">
        <div className="bg-pattern" />
      </div>
    </div>
  );
};

AdminAuth.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default AdminAuth;
