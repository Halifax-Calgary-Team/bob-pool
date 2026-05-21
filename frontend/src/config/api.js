// API Configuration
// Use relative URLs in production (same origin as frontend)
// Use localhost:3001 in development (separate dev server)
export const API_BASE_URL = import.meta.env.PROD
  ? '' // Empty string = relative URLs (same origin)
  : 'http://localhost:3001';

// Helper function to build API URLs
export const buildApiUrl = (path) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Made with Bob
