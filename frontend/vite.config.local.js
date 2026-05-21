import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for local development (without Docker)
// https://vitejs.dev/config/
export default defineConfig({
  // Enable React plugin for JSX transformation and Fast Refresh
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 3000,              // Run frontend on port 3000
    host: 'localhost',       // Listen on localhost only (local development)
    
    // Proxy API requests to backend server running locally
    // This allows frontend to make requests to /api/* which will be forwarded to backend
    proxy: {
      '/api': {
        target: 'http://localhost:3001',  // Backend running locally on port 3001
        changeOrigin: true,                // Change origin header to target URL
        secure: false                      // Allow self-signed certificates
      }
    }
  }
});

// Made with Bob