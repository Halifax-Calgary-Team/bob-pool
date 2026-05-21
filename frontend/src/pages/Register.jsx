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
import { UserAvatar } from '@carbon/icons-react';

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
            <UserAvatar size={48} style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Join Bob Pool</h1>
            <p style={{ color: '#525252' }}>Create your carpooling account</p>
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
                id="name"
                name="name"
                labelText="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange({ target: { name: 'name', value: e.target.value } })}
                required
                autoComplete="name"
                helperText="Your name as it appears on your IBM profile"
              />
            </div>

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
                helperText="Must be a valid @ibm.com email address"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <PasswordInput
                id="password"
                name="password"
                labelText="Password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleChange({ target: { name: 'password', value: e.target.value } })}
                required
                autoComplete="new-password"
                helperText="At least 8 characters"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                labelText="Confirm Password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange({ target: { name: 'confirmPassword', value: e.target.value } })}
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              kind="primary"
              size="lg"
              disabled={loading}
              style={{ width: '100%', maxWidth: '100%', marginBottom: '1rem' }}
            >
              {loading ? <InlineLoading description="Creating Account..." /> : 'Create Account'}
            </Button>
          </Form>

          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e0e0e0',
            textAlign: 'center'
          }}>
            <p style={{ color: '#525252', fontSize: '0.875rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#0f62fe', textDecoration: 'none', fontWeight: 600 }}>
                Log in here
              </Link>
            </p>
          </div>

          <Tile style={{
            marginTop: '1.5rem',
            backgroundColor: '#f4f4f4',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.25rem' }}>🔒</div>
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                  Your Privacy Matters
                </p>
                <p style={{ fontSize: '0.75rem', color: '#525252', lineHeight: 1.5, margin: 0 }}>
                  Your information is secure and only visible to other IBM employees
                  within the Bob Pool platform. We never share your data with third parties.
                </p>
              </div>
            </div>
          </Tile>
        </Tile>
      </div>
    </div>
  );
}

export default Register;

// Made with Bob