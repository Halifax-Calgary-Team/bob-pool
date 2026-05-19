// Main router that combines all API routes
const express = require('express');
const authRoutes = require('./auth');
const ridesRoutes = require('./rides');

const router = express.Router();

// ============================================
// MOUNT ROUTE MODULES
// ============================================

// Authentication routes - /api/auth/*
router.use('/auth', authRoutes);

// Ride management routes - /api/rides/*
router.use('/rides', ridesRoutes);

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
        me: 'GET /api/auth/me'
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
