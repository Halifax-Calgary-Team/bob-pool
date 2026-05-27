import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PORT = parseInt(process.env.PORT || '3000', 10);
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '3001', 10);

// Vite configuration for local development (without Docker)
// https://vitejs.dev/config/
export default defineConfig({
  // Enable React plugin for JSX transformation and Fast Refresh
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: PORT,              // Run frontend on port 3000
    host: 'localhost',       // Listen on localhost only (local development)
    
    // Proxy API requests to backend server running locally
    // This allows frontend to make requests to /api/* which will be forwarded to backend
    proxy: {
      '/api': {
        target: `http://localhost:${ BACKEND_PORT }`,  // Backend running locally on port 3001
        changeOrigin: true,                // Change origin header to target URL
        secure: false                      // Allow self-signed certificates
      }
    }
  }
});

// Made with Bob