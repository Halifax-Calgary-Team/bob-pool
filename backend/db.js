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
// SAMPLE DATA SEEDING
// ============================================

// Seed sample rides data
async function seedSampleData(client) {
  try {
    console.log('🌱 Seeding sample data...');
    
    // Check if sample user already exists
    const userCheck = await client.query(
      "SELECT id FROM users WHERE email = 'driver@ibm.com'"
    );
    
    let driverId;
    
    if (userCheck.rows.length === 0) {
      // Create sample driver user (password: password123)
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const userResult = await client.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['Test Driver', 'driver@ibm.com', hashedPassword]
      );
      driverId = userResult.rows[0].id;
      console.log('  ✓ Sample user created');
    } else {
      driverId = userCheck.rows[0].id;
      console.log('  ✓ Sample user already exists');
    }
    
    // Check if sample rides already exist
    const ridesCheck = await client.query(
      'SELECT COUNT(*) as count FROM rides WHERE driver_id = $1',
      [driverId]
    );
    
    if (parseInt(ridesCheck.rows[0].count) === 0) {
      // Insert 3 sample rides
      await client.query(
        `INSERT INTO rides (driver_id, pickup_location_full, dropoff_location, ride_date, ride_time, seats_available, status)
         VALUES
         ($1, 'IBM Office Downtown', 'Airport Terminal 1', CURRENT_DATE + INTERVAL '1 day', '06:00', 3, 'active'),
         ($1, 'Central Station', 'IBM Research Lab', CURRENT_DATE + INTERVAL '2 days', '08:30', 2, 'active'),
         ($1, 'Suburban Mall', 'IBM Office Downtown', CURRENT_DATE + INTERVAL '3 days', '17:45', 4, 'active')`,
        [driverId]
      );
      console.log('  ✓ Sample rides created');
    } else {
      console.log('  ✓ Sample rides already exist');
    }
    
    console.log('✅ Sample data seeded successfully\n');
    
  } catch (error) {
    console.error('⚠️  Sample data seeding failed:', error.message);
    // Don't throw error - seeding is optional
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
    
    // Migrate existing constraint to allow 0 seats
    await client.query(`
      DO $$ 
      BEGIN
        -- Drop old constraint if it exists
        ALTER TABLE rides DROP CONSTRAINT IF EXISTS rides_seats_available_check;
        -- Add new constraint that allows 0
        ALTER TABLE rides ADD CONSTRAINT rides_seats_available_check CHECK (seats_available >= 0);
      EXCEPTION
        WHEN undefined_table THEN
          -- Table doesn't exist yet, will be created below
          NULL;
      END $$;
    `);
    console.log('  ✓ Seats constraint migrated');
    
    // Create rides table
    await client.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id SERIAL PRIMARY KEY,
        driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pickup_location_full TEXT NOT NULL,
        pickup_location_name VARCHAR(500),
        dropoff_location VARCHAR(500) NOT NULL,
        ride_date DATE NOT NULL,
        ride_time TIME NOT NULL,
        seats_available INTEGER NOT NULL CHECK (seats_available >= 0),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✓ Rides table ready');
    
    // Migrate existing pickup_location column to new structure
    await client.query(`
      DO $$
      BEGIN
        -- Check if old pickup_location column exists
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'rides' AND column_name = 'pickup_location'
          AND column_name NOT IN ('pickup_location_full', 'pickup_location_name')
        ) THEN
          -- Add new columns if they don't exist
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rides' AND column_name = 'pickup_location_full'
          ) THEN
            ALTER TABLE rides ADD COLUMN pickup_location_full TEXT;
          END IF;
          
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'rides' AND column_name = 'pickup_location_name'
          ) THEN
            ALTER TABLE rides ADD COLUMN pickup_location_name VARCHAR(500);
          END IF;
          
          -- Migrate data from old column to new columns
          UPDATE rides
          SET pickup_location_full = pickup_location,
              pickup_location_name = NULL
          WHERE pickup_location_full IS NULL;
          
          -- Drop old column
          ALTER TABLE rides DROP COLUMN pickup_location;
          
          -- Make pickup_location_full NOT NULL after migration
          ALTER TABLE rides ALTER COLUMN pickup_location_full SET NOT NULL;
        END IF;
      END $$;
    `);
    console.log('  ✓ Pickup location columns migrated');
    
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
  
  // Seed sample data after schema is initialized
  const seedClient = await pool.connect();
  try {
    await seedSampleData(seedClient);
  } finally {
    seedClient.release();
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
