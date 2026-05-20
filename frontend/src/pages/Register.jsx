import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

/**
 * Register Page Component
 * 
 * Allows new users to create a Bob Pool account.
 * Validates IBM email addresses and password requirements.
 */
function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  // Validate form data
  const validateForm = () => {
    // Validate name
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    // Validate email
    if (!formData.email.endsWith('@ibm.com')) {
      setError('Please use your IBM email address (@ibm.com)');
      return false;
    }

    // Validate password
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Send registration request
      const response = await fetch(buildApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Registration successful - reload to update navbar and redirect
      window.location.href = '/find-rides';

    } catch (err) {
      console.error('Registration error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Join Bob Pool</h1>
            <p className="auth-subtitle">Create your carpooling account</p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="form-input"
                required
                autoComplete="name"
              />
              <p className="form-hint">Your name as it appears on your IBM profile</p>
            </div>

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
              <p className="form-hint">Must be a valid @ibm.com email address</p>
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
                placeholder="Create a strong password"
                className="form-input"
                required
                autoComplete="new-password"
                minLength="8"
              />
              <p className="form-hint">At least 8 characters</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="form-input"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-large btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Log in here
              </Link>
            </p>
          </div>

          <div className="auth-info">
            <div className="info-icon">🔒</div>
            <div className="info-content">
              <p className="info-title">Your Privacy Matters</p>
              <p className="info-text">
                Your information is secure and only visible to other IBM employees
                within the Bob Pool platform. We never share your data with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

// Made with Bob