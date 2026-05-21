// Production server entry point
// Combines frontend serving + backend API in a single server
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const serveStatic = require('./serve-static');

// Create Express application
const app = express();
const PORT = process.env.PORT || 8080;

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper function to read secrets from files
function readSecret(envVar, fileEnvVar) {
  const secretFile = process.env[fileEnvVar];
  if (secretFile && fs.existsSync(secretFile)) {
    return fs.readFileSync(secretFile, 'utf8').trim();
  }
  return process.env[envVar];
}

// Parse comma-separated CORS origins
function parseCorsOrigins() {
  const originsEnv = process.env.FRONTEND_ORIGIN || process.env.CORS_ORIGINS;
  if (originsEnv) {
    return originsEnv.split(',').map(origin => origin.trim());
  }
  // Default: allow both development (3000) and production (8080) localhost
  return ['http://localhost:3000', 'http://localhost:8080'];
}

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Enable CORS with configurable origins
const allowedOrigins = parseCorsOrigins();
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow cookies to be sent with requests
}));

// Trust proxy when in production (for secure cookies behind reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Parse JSON request bodies
app.use(express.json());

// Configure session management with secrets support
const sessionSecret = readSecret('SESSION_SECRET', 'SESSION_SECRET_FILE') || 'your-secret-key-change-in-production';

app.use(session({
  secret: sessionSecret,
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    secure: false, // Set to true only when using HTTPS (behind reverse proxy)
    httpOnly: true, // Prevent client-side JS from accessing cookie
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax' // CSRF protection
  }
}));

// ============================================
// DATABASE AND ROUTES INITIALIZATION
// ============================================

// Note: For single-container deployment (Containerfile.single),
// DB_HOST defaults to 'localhost' since PostgreSQL runs in the same container.
// For multi-container deployment, DB_HOST should be set to the database service name.

let dbAvailable = false;

// Initialize database and load routes
(async () => {
  try {
    // Import db-safe.js which doesn't have IIFE side effects
    const db = require('./db-safe');
    
    // Test database connection
    const connected = await db.testConnection();
    
    if (connected) {
      // Initialize database schema
      await db.initializeSchema();
      
      // Load and mount API routes
      const routes = require('../routes');
      app.use('/api', routes);
      
      dbAvailable = true;
      console.log('✅ Database routes loaded successfully');
    } else {
      throw new Error('Database connection failed');
    }
  } catch (error) {
    console.warn('⚠️  Database not available - API routes disabled');
    console.warn('   Error:', error.message);
    console.warn('   To enable API, configure database connection:');
    console.warn('   DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT');
    
    // Provide fallback API handler that returns 503
    app.use('/api', (req, res) => {
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Database connection not configured. API endpoints are disabled.'
      });
    });
  }
  
  // ============================================
  // HEALTH CHECK ENDPOINT
  // ============================================
  
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Bob Pool Application is running',
      database: dbAvailable ? 'connected' : 'not configured',
      timestamp: new Date().toISOString()
    });
  });
  
  // ============================================
  // STATIC FILE SERVING (SPA ROUTING)
  // ============================================
  
  // Serve frontend static files and handle SPA routing
  serveStatic(app);
  
  // ============================================
  // ERROR HANDLING MIDDLEWARE
  // ============================================
  
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
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚗 Bob Pool Application running on port ${PORT}`);
    console.log(`\n📍 Available endpoints:`);
    console.log(`   Frontend:      http://localhost:${PORT}`);
    console.log(`   Health Check:  http://localhost:${PORT}/health`);
    
    if (dbAvailable) {
      console.log(`   API:           http://localhost:${PORT}/api/*`);
    } else {
      console.log(`   API:           http://localhost:${PORT}/api/* (disabled - no database)`);
    }
    
    console.log(`\n🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS Origins: ${allowedOrigins.join(', ')}`);
    console.log(`\n✅ Ready to accept requests!\n`);
  });
})();

// Made with Bob