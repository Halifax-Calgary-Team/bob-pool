import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock fetch
global.fetch = vi.fn();

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useAuth hook', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleError.mockRestore();
    });

    it('provides auth context when used within AuthProvider', () => {
      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      
      // Mock successful auth check
      global.fetch.mockResolvedValueOnce({
        ok: false
      });
      
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('checkAuth');
      expect(result.current).toHaveProperty('logout');
    });
  });

  describe('checkAuth', () => {
    it('sets user when IBM SSO auth succeeds', async () => {
      const mockUser = {
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john@ibm.com'
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@ibm.com',
        isIBMSSO: true
      });
    });

    it('falls back to regular auth when IBM SSO fails', async () => {
      const mockUser = {
        user: {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@ibm.com'
        }
      };

      // First call (IBM SSO) fails
      global.fetch.mockResolvedValueOnce({
        ok: false
      });

      // Second call (regular auth) succeeds
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual({
        id: 2,
        name: 'Jane Smith',
        email: 'jane@ibm.com'
      });
    });

    it('sets user to null when both auth methods fail', async () => {
      global.fetch.mockResolvedValue({
        ok: false
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });

    it('handles missing user ID in IBM SSO response', async () => {
      const mockUser = {
        data: {
          name: 'John Doe',
          email: 'john@ibm.com'
          // Missing id
        }
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      });

      // Second call (regular auth) fails
      global.fetch.mockResolvedValueOnce({
        ok: false
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });

    it('handles network errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      global.fetch.mockRejectedValue(new Error('Network error'));

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      
      consoleError.mockRestore();
    });
  });

  describe('logout', () => {
    it('logs out IBM SSO user successfully', async () => {
      // Setup: authenticated IBM SSO user
      const mockUser = {
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john@ibm.com'
        }
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser
        })
        .mockResolvedValueOnce({
          ok: true
        });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
      });

      // Logout
      const logoutResult = await result.current.logout();

      expect(logoutResult).toEqual({ success: true });
      expect(result.current.user).toBeNull();
    });

    it('logs out regular user successfully', async () => {
      // Setup: authenticated regular user
      const mockUser = {
        user: {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@ibm.com'
        }
      };

      global.fetch
        .mockResolvedValueOnce({ ok: false }) // IBM SSO fails
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser
        })
        .mockResolvedValueOnce({
          ok: true
        });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
      });

      // Logout
      const logoutResult = await result.current.logout();

      expect(logoutResult).toEqual({ success: true });
      expect(result.current.user).toBeNull();
    });

    it('handles logout failure', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Setup: authenticated user
      const mockUser = {
        user: {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@ibm.com'
        }
      };

      global.fetch
        .mockResolvedValueOnce({ ok: false }) // IBM SSO fails
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser
        })
        .mockResolvedValueOnce({
          ok: false
        });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
      });

      // Logout fails
      const logoutResult = await result.current.logout();

      expect(logoutResult).toEqual({ 
        success: false, 
        error: 'Failed to logout' 
      });
      
      consoleError.mockRestore();
    });

    it('handles logout network error', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Setup: authenticated user
      const mockUser = {
        user: {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@ibm.com'
        }
      };

      global.fetch
        .mockResolvedValueOnce({ ok: false }) // IBM SSO fails
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockUser
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
      });

      // Logout fails with network error
      const logoutResult = await result.current.logout();

      expect(logoutResult).toEqual({ 
        success: false, 
        error: 'Failed to logout' 
      });
      
      consoleError.mockRestore();
    });
  });

  describe('loading state', () => {
    it('starts with loading true', () => {
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.loading).toBe(true);
    });

    it('sets loading to false after auth check completes', async () => {
      global.fetch.mockResolvedValue({
        ok: false
      });

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});

// Made with Bob