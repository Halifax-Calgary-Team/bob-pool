// Ride management routes for creating, viewing, and managing carpooling rides
const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('./auth');

const router = express.Router();

// ============================================
// HELPER FUNCTIONS
// ============================================

// Validate ride data
function validateRideData(data) {
  const { pickup_location, dropoff_location, ride_date, ride_time, seats_available } = data;
  
  if (!pickup_location || !dropoff_location || !ride_date || !ride_time || !seats_available) {
    return 'All fields are required: pickup_location, dropoff_location, ride_date, ride_time, seats_available';
  }
  
  if (seats_available < 1 || seats_available > 10) {
    return 'Seats available must be between 1 and 10';
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(ride_date)) {
    return 'Invalid date format. Use YYYY-MM-DD';
  }
  
  // Validate time format (HH:MM)
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(ride_time)) {
    return 'Invalid time format. Use HH:MM (24-hour format)';
  }
  
  return null; // No errors
}

// ============================================
// ROUTES
// ============================================

// GET /api/rides - List all available rides
router.get('/', async (req, res) => {
  try {
    // Get optional query filters
    const { date, pickup, dropoff, status = 'active' } = req.query;
    
    // Build query dynamically based on filters
    let query = `
      SELECT 
        r.id, r.driver_id, r.pickup_location, r.dropoff_location, 
        r.ride_date, r.ride_time, r.seats_available, r.status, r.created_at,
        u.name as driver_name, u.email as driver_email
      FROM rides r
      JOIN users u ON r.driver_id = u.id
      WHERE r.status = $1
    `;
    const params = [status];
    let paramCount = 1;
    
    // Add date filter if provided
    if (date) {
      paramCount++;
      query += ` AND r.ride_date = $${paramCount}`;
      params.push(date);
    }
    
    // Add pickup location filter if provided (case-insensitive partial match)
    if (pickup) {
      paramCount++;
      query += ` AND r.pickup_location ILIKE $${paramCount}`;
      params.push(`%${pickup}%`);
    }
    
    // Add dropoff location filter if provided (case-insensitive partial match)
    if (dropoff) {
      paramCount++;
      query += ` AND r.dropoff_location ILIKE $${paramCount}`;
      params.push(`%${dropoff}%`);
    }
    
    // Order by date and time
    query += ' ORDER BY r.ride_date, r.ride_time';
    
    const result = await pool.query(query, params);
    
    res.json({ 
      rides: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Get rides error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to fetch rides'
    });
  }
});

// POST /api/rides - Create a new ride (requires authentication)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { pickup_location, dropoff_location, ride_date, ride_time, seats_available } = req.body;
    
    // Validate ride data
    const validationError = validateRideData(req.body);
    if (validationError) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: validationError
      });
    }
    
    // Insert ride into database
    const result = await pool.query(
      `INSERT INTO rides (driver_id, pickup_location, dropoff_location, ride_date, ride_time, seats_available)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, driver_id, pickup_location, dropoff_location, ride_date, ride_time, seats_available, status, created_at`,
      [req.session.userId, pickup_location, dropoff_location, ride_date, ride_time, seats_available]
    );
    
    const ride = result.rows[0];
    
    res.status(201).json({
      message: 'Ride created successfully',
      ride
    });
    
  } catch (error) {
    console.error('Create ride error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to create ride'
    });
  }
});

// GET /api/rides/:id - Get specific ride details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get ride with driver info
    const rideResult = await pool.query(
      `SELECT 
        r.id, r.driver_id, r.pickup_location, r.dropoff_location, 
        r.ride_date, r.ride_time, r.seats_available, r.status, r.created_at,
        u.name as driver_name, u.email as driver_email
       FROM rides r
       JOIN users u ON r.driver_id = u.id
       WHERE r.id = $1`,
      [id]
    );
    
    if (rideResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Ride not found'
      });
    }
    
    const ride = rideResult.rows[0];
    
    // Get ride requests for this ride
    const requestsResult = await pool.query(
      `SELECT 
        rr.id, rr.rider_id, rr.status, rr.created_at,
        u.name as rider_name, u.email as rider_email
       FROM ride_requests rr
       JOIN users u ON rr.rider_id = u.id
       WHERE rr.ride_id = $1
       ORDER BY rr.created_at`,
      [id]
    );
    
    ride.requests = requestsResult.rows;
    
    res.json({ ride });
    
  } catch (error) {
    console.error('Get ride error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to fetch ride details'
    });
  }
});

// PUT /api/rides/:id - Update ride (requires authentication and ownership)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { pickup_location, dropoff_location, ride_date, ride_time, seats_available, status } = req.body;
    
    // Check if ride exists and user is the driver
    const checkResult = await pool.query(
      'SELECT driver_id FROM rides WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Ride not found'
      });
    }
    
    if (checkResult.rows[0].driver_id !== req.session.userId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only update your own rides'
      });
    }
    
    // Build update query dynamically based on provided fields
    const updates = [];
    const params = [];
    let paramCount = 0;
    
    if (pickup_location) {
      paramCount++;
      updates.push(`pickup_location = $${paramCount}`);
      params.push(pickup_location);
    }
    
    if (dropoff_location) {
      paramCount++;
      updates.push(`dropoff_location = $${paramCount}`);
      params.push(dropoff_location);
    }
    
    if (ride_date) {
      paramCount++;
      updates.push(`ride_date = $${paramCount}`);
      params.push(ride_date);
    }
    
    if (ride_time) {
      paramCount++;
      updates.push(`ride_time = $${paramCount}`);
      params.push(ride_time);
    }
    
    if (seats_available) {
      if (seats_available < 1 || seats_available > 10) {
        return res.status(400).json({ 
          error: 'Validation Error',
          message: 'Seats available must be between 1 and 10'
        });
      }
      paramCount++;
      updates.push(`seats_available = $${paramCount}`);
      params.push(seats_available);
    }
    
    if (status) {
      if (!['active', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ 
          error: 'Validation Error',
          message: 'Status must be active, completed, or cancelled'
        });
      }
      paramCount++;
      updates.push(`status = $${paramCount}`);
      params.push(status);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'No fields to update'
      });
    }
    
    // Add ride ID as last parameter
    paramCount++;
    params.push(id);
    
    // Execute update
    const result = await pool.query(
      `UPDATE rides SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, driver_id, pickup_location, dropoff_location, ride_date, ride_time, seats_available, status, created_at`,
      params
    );
    
    res.json({
      message: 'Ride updated successfully',
      ride: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update ride error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to update ride'
    });
  }
});

// DELETE /api/rides/:id - Delete ride (requires authentication and ownership)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ride exists and user is the driver
    const checkResult = await pool.query(
      'SELECT driver_id FROM rides WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Ride not found'
      });
    }
    
    if (checkResult.rows[0].driver_id !== req.session.userId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'You can only delete your own rides'
      });
    }
    
    // Delete ride (cascade will delete associated requests)
    await pool.query('DELETE FROM rides WHERE id = $1', [id]);
    
    res.json({ message: 'Ride deleted successfully' });
    
  } catch (error) {
    console.error('Delete ride error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to delete ride'
    });
  }
});

// POST /api/rides/:id/request - Request to join a ride (requires authentication)
router.post('/:id/request', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if ride exists and is active
    const rideResult = await pool.query(
      'SELECT driver_id, seats_available, status FROM rides WHERE id = $1',
      [id]
    );
    
    if (rideResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Ride not found'
      });
    }
    
    const ride = rideResult.rows[0];
    
    // Check if ride is active
    if (ride.status !== 'active') {
      return res.status(400).json({ 
        error: 'Invalid Request',
        message: 'This ride is no longer accepting requests'
      });
    }
    
    // Check if user is trying to request their own ride
    if (ride.driver_id === req.session.userId) {
      return res.status(400).json({ 
        error: 'Invalid Request',
        message: 'You cannot request your own ride'
      });
    }
    
    // Check if seats are available
    if (ride.seats_available < 1) {
      return res.status(400).json({ 
        error: 'Invalid Request',
        message: 'No seats available for this ride'
      });
    }
    
    // Create ride request
    const result = await pool.query(
      `INSERT INTO ride_requests (ride_id, rider_id)
       VALUES ($1, $2)
       RETURNING id, ride_id, rider_id, status, created_at`,
      [id, req.session.userId]
    );
    
    res.status(201).json({
      message: 'Ride request submitted successfully',
      request: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create ride request error:', error);
    
    // Handle duplicate request error
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Invalid Request',
        message: 'You have already requested this ride'
      });
    }
    
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to submit ride request'
    });
  }
});

// PUT /api/rides/:id/requests/:requestId - Accept or reject a ride request (requires authentication and ownership)
router.put('/:id/requests/:requestId', requireAuth, async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: 'Validation Error',
        message: 'Status must be either "accepted" or "rejected"'
      });
    }
    
    // Check if ride exists and user is the driver
    const rideResult = await pool.query(
      'SELECT driver_id, seats_available FROM rides WHERE id = $1',
      [id]
    );
    
    if (rideResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Ride not found'
      });
    }
    
    if (rideResult.rows[0].driver_id !== req.session.userId) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Only the driver can accept or reject requests'
      });
    }
    
    // Check if request exists and belongs to this ride
    const requestResult = await pool.query(
      'SELECT id, status FROM ride_requests WHERE id = $1 AND ride_id = $2',
      [requestId, id]
    );
    
    if (requestResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not Found',
        message: 'Ride request not found'
      });
    }
    
    // Check if request is still pending
    if (requestResult.rows[0].status !== 'pending') {
      return res.status(400).json({ 
        error: 'Invalid Request',
        message: 'This request has already been processed'
      });
    }
    
    // If accepting, check if seats are available
    if (status === 'accepted' && rideResult.rows[0].seats_available < 1) {
      return res.status(400).json({ 
        error: 'Invalid Request',
        message: 'No seats available for this ride'
      });
    }
    
    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update request status
      const updateResult = await client.query(
        `UPDATE ride_requests SET status = $1 WHERE id = $2
         RETURNING id, ride_id, rider_id, status, created_at`,
        [status, requestId]
      );
      
      // If accepted, decrease available seats
      if (status === 'accepted') {
        await client.query(
          'UPDATE rides SET seats_available = seats_available - 1 WHERE id = $1',
          [id]
        );
      }
      
      await client.query('COMMIT');
      
      res.json({
        message: `Ride request ${status} successfully`,
        request: updateResult.rows[0]
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Update ride request error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: 'Failed to update ride request'
    });
  }
});

// ============================================
// EXPORTS
// ============================================

module.exports = router;

// Made with Bob
