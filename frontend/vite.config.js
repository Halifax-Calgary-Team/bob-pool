import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PORT = parseInt(process.env.PORT || '3000', 10);
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '3001', 10);

// Vite configuration for Bob Pool frontend
// https://vitejs.dev/config/
export default defineConfig({
  // Enable React plugin for JSX transformation and Fast Refresh
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: PORT,              // Run frontend on port 3000
    host: '0.0.0.0',         // Listen on all network interfaces (needed for Docker)

    // Enable HMR for development
    hmr: {
      clientPort: PORT,
    },
    
    // Enable polling-based file watching for Docker containers
    // Docker volume mounts don't propagate file system events reliably
    watch: {
      usePolling: true,
      interval: 1000,
    },
    
    // Proxy API requests to backend server
    // This allows frontend to make requests to /api/* which will be forwarded to backend
    proxy: {
      '/api': {
        target: `http://backend:${ BACKEND_PORT }`,  // Backend service name in Docker Compose
        changeOrigin: true,              // Change origin header to target URL
        secure: false                    // Allow self-signed certificates
      }
    }
  }
});

// Made with Bob
