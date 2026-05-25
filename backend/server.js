// Environment variables should be set via compose.yml or system environment
// No .env file loading - configuration is explicit in compose.yml

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const WebAppStrategy = require('ibmcloud-appid').WebAppStrategy;
const routes = require('./routes');

// IBM App ID callback URL
// const CALLBACK_URL = '/ibm/cloud/appid/callback';
const CALLBACK_URL = '/callback';

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
  resave: true, // Required for IBM App ID
  saveUninitialized: true, // Required for IBM App ID
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    httpOnly: true, // Prevent client-side JS from accessing cookie
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Allow cross-site cookies for SSO
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport serialization
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

// Configure IBM App ID WebAppStrategy
if (process.env.STRAT_TENANT_ID && process.env.STRAT_CLIENT_ID && process.env.STRAT_SECRET) {
  passport.use(new WebAppStrategy({
    tenantId: process.env.STRAT_TENANT_ID,
    clientId: process.env.STRAT_CLIENT_ID,
    secret: process.env.STRAT_SECRET,
    oauthServerUrl: process.env.STRAT_OAUTH_URL,
    redirectUri: process.env.STRAT_REDIRECT_CB || `http://localhost:${PORT}${CALLBACK_URL}`
  }));
  
  console.log('✅ IBM App ID configured successfully');
} else {
  console.log('⚠️  IBM App ID not configured - SSO login will not be available');
}

// IBM App ID callback route
app.get(CALLBACK_URL, (req, res, next) => {  
  // Use custom callback to see what's happening
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, (err, user, info) => {    
    if (err) {
      console.log('Redirecting to error page due to error');
      return res.redirect('/api/ibm/auth/error');
    }
    
    if (!user) {
      console.log('Redirecting to error page - no user');
      return res.redirect('/api/ibm/auth/error');
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.log('Login error:', err);
        return res.redirect('/api/ibm/auth/error');
      }
      
      console.log('Login successful, redirecting to success page');
      return res.redirect('/api/ibm/auth/success');
    });
  })(req, res, next);
});

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
  console.log(`   ibmAuth:       http://localhost:${PORT}/api/ibm/auth/*`);
  console.log(`\n🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n✅ Ready to accept requests!\n`);
});

// Made with Bob
