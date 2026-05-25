// Authentication routes for user registration, login, and session management
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const WebAppStrategy = require('ibmcloud-appid').WebAppStrategy;
const { pool } = require('../db');
const { requireAuth } = require('../middleware/middleware');

const router = express.Router();

// ============================================
// MIDDLEWARE: Require Authentication
// ============================================
// Note: requireAuth is now imported from middleware.js for unified SSO + regular auth support

// ============================================
// HELPER FUNCTIONS
// ============================================

// Validate email format and IBM domain
function isValidIBMEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.toLowerCase().endsWith('@ibm.com');
}

// ============================================
// ROUTES
// ============================================

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    // Validate required fields
    if (!email || !name || !password) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Email, name, and password are required'
      });
    }
    
    // Validate IBM email
    if (!isValidIBMEmail(email)) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Email must be a valid IBM email address (@ibm.com)'
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Hash password (10 salt rounds is a good balance of security and performance)
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email.toLowerCase(), name, passwordHash]
    );
    
    const user = result.rows[0];
    
    // Create session for the new user
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    
    // Return user info (without password hash)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate email error
    if (error.code === '23505') { // PostgreSQL unique violation error code
      return res.status(400).json({ 
        error: 'Registration Failed',
        message: 'An account with this email already exists'
      });
    }
    
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to register user'
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Email and password are required'
      });
    }
    
    // Find user by email
    const result = await pool.query(
      'SELECT id, email, name, password_hash, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    }
    
    // Create session
    req.session.userId = user.id;
    req.session.userEmail = user.email;
    
    // Return user info (without password hash)
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to login'
    });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', (req, res) => {
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        error: 'Server Error',
        message: 'Failed to logout'
      });
    }
    
    res.json({ message: 'Logout successful' });
  });
});

// GET /api/auth/user - Get current user info
router.get('/user', requireAuth, async (req, res) => {
  try {
    // Get user info from database
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [req.session.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    res.json({ user: result.rows[0] });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to get user info'
    });
  }
});

// ============================================
// IBM APP ID SSO ROUTES
// ============================================

// GET /api/auth/sso/login - Initiate IBM App ID SSO login
router.get('/sso/login', passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
  successRedirect: '/',
  forceLogin: true
}));

// GET /api/auth/sso/callback - IBM App ID callback (handled by passport middleware in server.js)
// This route is documented here but the actual handler is in server.js at /ibm/cloud/appid/callback

// GET /api/auth/protected - Example protected endpoint using IBM App ID
router.get('/protected', passport.authenticate(WebAppStrategy.STRATEGY_NAME), (req, res) => {
  res.json({
    message: 'This is a protected resource',
    user: req.user
  });
});

// ============================================
// EXPORTS
// ============================================

module.exports = router;
module.exports.requireAuth = requireAuth; // Export middleware for use in other routes

// Made with Bob
