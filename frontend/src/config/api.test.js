import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApiUrl } from './api';

describe('API Configuration', () => {
  const originalEnv = import.meta.env;

  afterEach(() => {
    import.meta.env = originalEnv;
  });

  describe('buildApiUrl', () => {
    it('builds URL with default backend URL in development', () => {
      import.meta.env = { ...originalEnv, MODE: 'development' };
      const url = buildApiUrl('/api/auth/user');
      expect(url).toBe('http://localhost:3001/api/auth/user');
    });

    it('handles paths without leading slash', () => {
      import.meta.env = { ...originalEnv, MODE: 'development' };
      const url = buildApiUrl('api/auth/user');
      expect(url).toBe('http://localhost:3001/api/auth/user');
    });

    it('handles empty path', () => {
      import.meta.env = { ...originalEnv, MODE: 'development' };
      const url = buildApiUrl('');
      expect(url).toBe('http://localhost:3001');
    });

    it('handles root path', () => {
      import.meta.env = { ...originalEnv, MODE: 'development' };
      const url = buildApiUrl('/');
      expect(url).toBe('http://localhost:3001/');
    });

    it('preserves query parameters', () => {
      import.meta.env = { ...originalEnv, MODE: 'development' };
      const url = buildApiUrl('/api/rides?date=2026-06-01&status=active');
      expect(url).toBe('http://localhost:3001/api/rides?date=2026-06-01&status=active');
    });

    it('handles multiple slashes correctly', () => {
      import.meta.env = { ...originalEnv, MODE: 'development' };
      const url = buildApiUrl('//api//auth//user');
      expect(url).toBe('http://localhost:3001//api//auth//user');
    });

    it('uses custom backend URL from environment variable', () => {
      import.meta.env = { 
        ...originalEnv, 
        MODE: 'development',
        VITE_BACKEND_URL: 'http://custom-backend:8080'
      };
      const url = buildApiUrl('/api/auth/user');
      expect(url).toBe('http://custom-backend:8080/api/auth/user');
    });

    it('uses relative path in production mode', () => {
      import.meta.env = { ...originalEnv, MODE: 'production' };
      const url = buildApiUrl('/api/auth/user');
      expect(url).toBe('/api/auth/user');
    });

    it('handles special characters in path', () => {
      import.meta.env = { ...originalEnv, MODE: 'development' };
      const url = buildApiUrl('/api/rides/search?pickup=Main St&dropoff=IBM Office');
      expect(url).toBe('http://localhost:3001/api/rides/search?pickup=Main St&dropoff=IBM Office');
    });
  });
});

// Made with Bob