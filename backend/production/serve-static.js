// Express middleware for serving built frontend static files
// Implements SPA routing: redirect all non-API requests to index.html
const path = require('path');
const express = require('express');

/**
 * Configure Express app to serve static files and handle SPA routing
 * @param {express.Application} app - Express application instance
 */
module.exports = function serveStatic(app) {
  // Serve static files from the public directory
  app.use(express.static(path.join(__dirname, '..', 'public')));
  
  // SPA routing: redirect all non-API requests to index.html
  // This allows client-side routing to work properly
  app.get('*', (req, res, next) => {
    // Preserve API routes and health check
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    
    // Send index.html for all other routes (SPA routing)
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
};

// Made with Bob