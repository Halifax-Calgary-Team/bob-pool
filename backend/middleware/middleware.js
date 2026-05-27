const { pool } = require('../db');

const getIpAddress = (req, res, next) => {
  req.headers.ip =
    req.header("x-forwarded-for") || req.connection.remoteAddress;

  return next();
};

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.status(401).send({ success: false, code: "UNAUTHORIZED" });
};

/**
 * Unified authentication middleware that supports both:
 * 1. Regular session-based auth (req.session.userId)
 * 2. IBM SSO auth via Passport (req.isAuthenticated() and req.user)
 *
 * This middleware ensures req.session.userId is set for both auth methods,
 * creating a database user record for SSO users if needed.
 */
const requireAuth = async (req, res, next) => {
  try {
    // Check regular session auth first
    if (req.session.userId) {
      return next();
    }
    
    // Check IBM SSO auth via Passport
    if (req.isAuthenticated() && req.user) {
      const ssoEmail = req.user.userinfo?.email || req.user.email;
      const ssoName = req.user.userinfo?.name || req.user.name || ssoEmail;
      
      if (!ssoEmail) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'SSO authentication incomplete - no email found'
        });
      }
      
      // Validate email format and IBM domain
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(ssoEmail) || !ssoEmail.toLowerCase().endsWith('@ibm.com')) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only valid IBM email addresses are allowed'
        });
      }
      
      // Find or create user in database
      let userResult = await pool.query(
        'SELECT id, email, name, password_hash FROM users WHERE email = $1',
        [ssoEmail.toLowerCase()]
      );
      
      let userId;
      
      if (userResult.rows.length === 0) {
        // Create new user for SSO login with a secure random password hash
        const bcrypt = require('bcrypt');
        const randomPassword = require('crypto').randomBytes(32).toString('hex');
        const secureHash = await bcrypt.hash(randomPassword, 10);
        
        const insertResult = await pool.query(
          `INSERT INTO users (email, name, password_hash)
           VALUES ($1, $2, $3)
           RETURNING id, email, name`,
          [ssoEmail.toLowerCase(), ssoName, secureHash]
        );
        userId = insertResult.rows[0].id;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Created new user for SSO login: ${ssoEmail} (ID: ${userId})`);
        }
      } else {
        userId = userResult.rows[0].id;
        
        // Check if this is an SSO-only account trying to use regular login
        // (password_hash would be a bcrypt hash, not 'SSO_AUTH')
        // This is handled in the login route, but we mark SSO accounts
      }
      
      // Set session userId for consistency with regular auth
      req.session.userId = userId;
      req.session.userEmail = ssoEmail.toLowerCase();
      req.session.isSSO = true;
      
      // Save session to ensure it persists
      return req.session.save((err) => {
        if (err) {
          console.error('Session save error in requireAuth:', err);
          return res.status(500).json({
            error: 'Server Error',
            message: 'Failed to save session'
          });
        }
        next();
      });
    }
    
    // No authentication found
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be logged in to access this resource'
    });
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Authentication check failed'
    });
  }
};

module.exports = { getIpAddress, isAuthenticated, requireAuth };
