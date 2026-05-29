import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// Custom render function that includes common providers
export function renderWithProviders(ui, options = {}) {
  const {
    initialAuthState = { user: null, loading: false },
    ...renderOptions
  } = options;

  // Mock AuthContext value
  const mockAuthValue = {
    user: initialAuthState.user,
    loading: initialAuthState.loading,
    checkAuth: vi.fn(),
    logout: vi.fn().mockResolvedValue({ success: true })
  };

  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <AuthProvider value={mockAuthValue}>
          {children}
        </AuthProvider>
      </BrowserRouter>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    mockAuthValue
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };

// Made with Bob
