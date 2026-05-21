// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const routes = require('./routes');

// Import db.js to trigger schema initialization (has side effects)
require('./db');

// Create Express application
const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Enable CORS for frontend (running on localhost:3000)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // Allow cookies to be sent with requests
}));

// Parse JSON request bodies
app.use(express.json());

// Configure session management
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    httpOnly: true, // Prevent client-side JS from accessing cookie
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ============================================
// ROUTES
// ============================================

// Mount API routes at /api
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bob Pool API is running' });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler - catch requests to undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler - catch all errors
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Send error response
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🚗 Bob Pool API Server running on port ${PORT}`);
  console.log(`\n📍 Available endpoints:`);
  console.log(`   Health Check:  http://localhost:${PORT}/health`);
  console.log(`   Auth:          http://localhost:${PORT}/api/auth/*`);
  console.log(`   Rides:         http://localhost:${PORT}/api/rides/*`);
  console.log(`\n🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n✅ Ready to accept requests!\n`);
});

// Made with Bob
