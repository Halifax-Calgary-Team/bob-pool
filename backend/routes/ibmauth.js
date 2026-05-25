const express = require('express');
const { sendResponse } = require("../helpers/payloadHelper.js");
const { isAuthenticated } = require("../middleware/middleware.js");
const passport = require("passport");
const WebAppStrategy = require('ibmcloud-appid').WebAppStrategy;

const router = express.Router();

const auth = passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
  scope: "openid",
  session: true,
  forceLogin: true
});

const authCheck = (req, res) => {
  const response = {
    ...req.user.userinfo,
    token: req.user.id_token,
  };
  return sendResponse(res, 200, response);
};

const authFail = (req, res) => {
  return sendResponse(res, 200, "OK");
};

const authSuccess = (req, res) => {
  // User is already authenticated by Passport at this point
  console.log('IBM SSO Login successful for user:', JSON.stringify(req.user, null, 2));
  console.log('IBM SSO authSuccess - req.isAuthenticated():', req.isAuthenticated());
  console.log('IBM SSO authSuccess - session ID:', req.sessionID);
  console.log('IBM SSO authSuccess - session data:', JSON.stringify(req.session, null, 2));
  
  // Save session before redirecting to ensure user data persists
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
      return sendResponse(res, 500, { error: 'Session save failed', details: err.message });
    }
    
    console.log('Session saved successfully');
    console.log('Session after save:', JSON.stringify(req.session, null, 2));
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log(`Redirecting to: ${frontendUrl}/find-rides`);
    return res.redirect(`${frontendUrl}/find-rides`);
  });
};

// Note: The callback is handled directly in server.js at /callback
// This authCallback function is not currently used but kept for reference
const authCallback = (req, res, next) => {
  passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    failureMessage: true,
    failWithError: true,
    successRedirect: '/api/ibm/auth/success',
    session: true,
  })(req, res, next);
};

// Get current user information
const getUserInfo = (req, res) => {
  // Check if user is authenticated via Passport
  if (!req.isAuthenticated() || !req.user) {
    return sendResponse(res, 401, {
      error: 'Not authenticated',
      message: 'Please login first'
    });
  }
  
  console.log('IBM SSO getUserInfo - req.user:', JSON.stringify(req.user, null, 2));
  console.log('IBM SSO getUserInfo - req.isAuthenticated():', req.isAuthenticated());
  console.log('IBM SSO getUserInfo - req.session:', JSON.stringify(req.session, null, 2));
  
  // Return complete user information including database user ID
  const response = {
    authenticated: true,
    id: req.session.userId, // Include database user ID for ride filtering
    user: req.user || {},
    userInfo: req.user?.userinfo || null,
    token: req.user?.id_token || req.user?.accessToken || null,
    email: req.user?.userinfo?.email || req.user?.email || null,
    name: req.user?.userinfo?.name || req.user?.name || null
  };
  
  return sendResponse(res, 200, response);
};

// Logout handler for IBM SSO
const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return sendResponse(res, 500, { error: 'Logout failed', details: err.message });
    }
    
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      
      console.log('IBM SSO Logout successful');
      return sendResponse(res, 200, { success: true, message: 'Logged out successfully' });
    });
  });
};

// Define routes
router.get('/', auth); // Initiate SSO login
router.get('/check', isAuthenticated, authCheck);
router.get('/user', getUserInfo); // endpoint to get user info
router.post('/logout', logout); // Logout endpoint
router.get('/error', authFail); // Error handler
router.get('/success', authSuccess); // Success handler - redirects to frontend
// Note: /sso/callback route removed - callback is handled in server.js at /callback

module.exports = router;

// Made with Bob
