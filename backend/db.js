// PostgreSQL database connection and schema initialization
const { Pool } = require('pg');

// ============================================
// DATABASE CONNECTION POOL
// ============================================

// Create connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'bobpool',
  password: process.env.DB_PASSWORD || 'bobpool_dev',
  database: process.env.DB_NAME || 'bobpool',
  port: process.env.DB_PORT || 5432,
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection not available
});

// ============================================
// CONNECTION TEST
// ============================================

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// ============================================
// SCHEMA INITIALIZATION
// ============================================

// Initialize database schema (create tables if they don't exist)
async function initializeSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing database schema...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL CHECK (email LIKE '%@ibm.com'),
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ Users table ready');
    
    // Create rides table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id SERIAL PRIMARY KEY,
        driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pickup_location VARCHAR(500) NOT NULL,
        dropoff_location VARCHAR(500) NOT NULL,
        ride_date DATE NOT NULL,
        ride_time TIME NOT NULL,
        seats_available INTEGER NOT NULL CHECK (seats_available > 0),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ Rides table ready');
    
    // Create ride_requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ride_requests (
        id SERIAL PRIMARY KEY,
        ride_id INTEGER NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
        rider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(ride_id, rider_id)
      )
    `);
    console.log('  ✓ Ride requests table ready');
    
    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
      CREATE INDEX IF NOT EXISTS idx_rides_date ON rides(ride_date);
      CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
      CREATE INDEX IF NOT EXISTS idx_requests_ride ON ride_requests(ride_id);
      CREATE INDEX IF NOT EXISTS idx_requests_rider ON ride_requests(rider_id);
    `);
    console.log('  ✓ Indexes created');
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('✅ Database schema initialized successfully\n');
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Schema initialization failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// ============================================
// AUTO-INITIALIZE ON IMPORT
// ============================================

// Run initialization when module is imported
(async () => {
  await testConnection();
  await initializeSchema();
})();

// ============================================
// EXPORTS
// ============================================

module.exports = {
  pool,
  testConnection,
  initializeSchema
};

// Made with Bob
