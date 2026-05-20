import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

/**
 * Login Page Component
 * 
 * Allows users to log in to their Bob Pool account.
 * Validates IBM email addresses and handles authentication.
 */
function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate email format
      if (!formData.email.endsWith('@ibm.com')) {
        setError('Please use your IBM email address (@ibm.com)');
        setLoading(false);
        return;
      }

      // Validate password
      if (!formData.password) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      // Send login request
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Login successful - reload to update navbar and redirect
      window.location.href = '/find-rides';

    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Log in to your Bob Pool account</p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                IBM Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.name@ibm.com"
                className="form-input"
                required
                autoComplete="email"
              />
              <p className="form-hint">Use your IBM email address</p>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="form-input"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large btn-block"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </p>
          </div>

          <div className="auth-info">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <p className="info-title">IBM Employees Only</p>
              <p className="info-text">
                Bob Pool is an internal carpooling platform for IBM employees.
                You must use your IBM email address to access the platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

// Made with Bob