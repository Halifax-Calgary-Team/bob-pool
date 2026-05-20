import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for Bob Pool frontend
// https://vitejs.dev/config/
export default defineConfig({
  // Enable React plugin for JSX transformation and Fast Refresh
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 3000,              // Run frontend on port 3000
    host: '0.0.0.0',         // Listen on all network interfaces (needed for Docker)
    
    // Proxy API requests to backend server
    // This allows frontend to make requests to /api/* which will be forwarded to backend
    proxy: {
      '/api': {
        target: 'http://backend:3001',  // Backend service name in Docker Compose
        changeOrigin: true,              // Change origin header to target URL
        secure: false                    // Allow self-signed certificates
      }
    }
  }
});

// Made with Bob
