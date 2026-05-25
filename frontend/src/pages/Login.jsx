import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { buildApiUrl } from '../config/api';
import {
  Form,
  TextInput,
  PasswordInput,
  Button,
  InlineNotification,
  InlineLoading,
  Tile,
} from '@carbon/react';
import { Login as LoginIcon } from '@carbon/icons-react';

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
      const response = await fetch(buildApiUrl('/api/auth/login'), {
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
    <div style={{
      minHeight: 'calc(100vh - 48px)',
      background: 'linear-gradient(135deg, #0f62fe 0%, #002d9c 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Tile style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <LoginIcon size={48} style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
            <p style={{ color: '#525252' }}>Log in to your Bob Pool account</p>
          </div>

          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onCloseButtonClick={() => setError('')}
              style={{ marginBottom: '1rem', maxWidth: '100%' }}
            />
          )}

          <Form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <TextInput
                id="email"
                name="email"
                labelText="IBM Email Address"
                placeholder="your.name@ibm.com"
                value={formData.email}
                onChange={(e) => handleChange({ target: { name: 'email', value: e.target.value } })}
                required
                autoComplete="email"
                helperText="Use your IBM email address"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <PasswordInput
                id="password"
                name="password"
                labelText="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleChange({ target: { name: 'password', value: e.target.value } })}
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              kind="primary"
              size="lg"
              disabled={loading}
              style={{ width: '100%', maxWidth: '100%', marginBottom: '1rem' }}
            >
              {loading ? <InlineLoading description="Logging in..." /> : 'Log In'}
            </Button>
          </Form>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center'
          }}>
            <p style={{ color: '#525252', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Or
            </p>
            <Button
              kind="tertiary"
              size="lg"
              onClick={() => {
                window.location.href = buildApiUrl('/api/ibm/auth');
              }}
              style={{ width: '100%', maxWidth: '100%' }}
            >
              Sign in with IBM SSO
            </Button>
          </div>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center'
          }}>
            <p style={{ color: '#525252', fontSize: '0.875rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#0f62fe', textDecoration: 'none', fontWeight: 600 }}>
                Register here
              </Link>
            </p>
          </div>

          <Tile style={{
            marginTop: '1.5rem',
            backgroundColor: '#f4f4f4',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.25rem' }}>ℹ️</div>
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  IBM Employees Only
                </p>
                <p style={{ fontSize: '0.75rem', color: '#525252', lineHeight: 1.5, margin: 0 }}>
                  Bob Pool is an internal carpooling platform for IBM employees.
                  You must use your IBM email address to access the platform.
                </p>
              </div>
            </div>
          </Tile>
        </Tile>
      </div>
    </div>
  );
}

export default Login;

// Made with Bob