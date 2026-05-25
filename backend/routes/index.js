// Main router that combines all API routes
const express = require('express');
const authRoutes = require('./auth');
const ridesRoutes = require('./rides');
const ibmAuth = require('./ibmauth');

const router = express.Router();

// ============================================
// MOUNT ROUTE MODULES
// ============================================

// Authentication routes - /api/auth/*
router.use('/auth', authRoutes);

// Ride management routes - /api/rides/*
router.use('/rides', ridesRoutes);

//ibm auth routes - /ibm/auth/*
router.use('/ibm/auth', ibmAuth);

// ============================================
// API INFO ENDPOINT
// ============================================

// GET /api - API information and available endpoints
router.get('/', (req, res) => {
  res.json({
    name: 'Bob Pool API',
    version: '1.0.0',
    description: 'IBM internal carpooling application API',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        user: 'GET /api/auth/user'
      },
      ibmAuth: {
        ssoLogin: 'GET /api/ibm/auth',
        check: 'GET /api/ibm/auth/check',
        user: 'GET /api/ibm/auth/user',
        logout: 'POST /api/ibm/auth/logout',
        error: 'GET /api/ibm/auth/error',
        success: 'GET /api/ibm/auth/success',
        callback: 'GET /api/ibm/auth/sso/callback'
      },
      rides: {
        list: 'GET /api/rides',
        create: 'POST /api/rides',
        get: 'GET /api/rides/:id',
        update: 'PUT /api/rides/:id',
        delete: 'DELETE /api/rides/:id',
        request: 'POST /api/rides/:id/request',
        handleRequest: 'PUT /api/rides/:id/requests/:requestId'
      }
    }
  });
});

// ============================================
// EXPORTS
// ============================================

module.exports = router;

// Made with Bob
