// PostgreSQL database connection pool
const { Pool } = require('pg');
const fs = require('fs');

// ============================================
// DATABASE CONNECTION POOL
// ============================================

// Helper function to read secrets from files
function readSecret(envVar, fileEnvVar) {
  // Check if *_FILE environment variable is set
  const secretFile = process.env[fileEnvVar];
  if (secretFile && fs.existsSync(secretFile)) {
    return fs.readFileSync(secretFile, 'utf8').trim();
  }
  // Fall back to regular environment variable
  return process.env[envVar];
}

// Create connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'bobpool',
  password: readSecret('DB_PASSWORD', 'DB_PASSWORD_FILE') || 'bobpool_dev',
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
// EXPORTS
// ============================================

module.exports = {
  pool,
  testConnection
};

// Made with Bob
