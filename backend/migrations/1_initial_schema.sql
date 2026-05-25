-- Up Migration
-- Create sequences for primary keys
CREATE SEQUENCE IF NOT EXISTS users_id_seq;
CREATE SEQUENCE IF NOT EXISTS rides_id_seq;
CREATE SEQUENCE IF NOT EXISTS ride_requests_id_seq;

-- Create users table with IBM email constraint
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY DEFAULT nextval('users_id_seq'),
  email VARCHAR(255) UNIQUE NOT NULL CHECK (email LIKE '%@ibm.com'),
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rides table with current structure
CREATE TABLE IF NOT EXISTS rides (
  id INTEGER PRIMARY KEY DEFAULT nextval('rides_id_seq'),
  driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pickup_location_full TEXT NOT NULL,
  pickup_location_name VARCHAR(500),
  dropoff_location VARCHAR(500) NOT NULL,
  ride_date DATE NOT NULL,
  ride_time TIME NOT NULL,
  seats_available INTEGER NOT NULL CHECK (seats_available >= 0),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ride_requests table
CREATE TABLE IF NOT EXISTS ride_requests (
  id INTEGER PRIMARY KEY DEFAULT nextval('ride_requests_id_seq'),
  ride_id INTEGER NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ride_id, rider_id)
);

-- Down Migration
-- Drop tables in reverse order (respecting foreign keys)
DROP TABLE IF EXISTS ride_requests;
DROP TABLE IF EXISTS rides;
DROP TABLE IF EXISTS users;

-- Drop sequences
DROP SEQUENCE IF EXISTS ride_requests_id_seq;
DROP SEQUENCE IF EXISTS rides_id_seq;
DROP SEQUENCE IF EXISTS users_id_seq;

-- Made with Bob
