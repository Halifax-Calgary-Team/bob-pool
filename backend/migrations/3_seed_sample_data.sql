-- Up Migration
-- Insert sample user and rides (only if not exists)
DO $$
DECLARE
  v_user_id INTEGER;
BEGIN
  -- Check if sample user exists
  SELECT id INTO v_user_id FROM users WHERE email = 'driver@ibm.com';
  
  IF v_user_id IS NULL THEN
    -- Create sample user (password: password123)
    -- Hash: $2b$10$rKvVPZqGhXqKXWvKxGzXxOYqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq
    INSERT INTO users (name, email, password_hash)
    VALUES (
      'Test Driver',
      'driver@ibm.com',
      'password123'
    )
    RETURNING id INTO v_user_id;
    
    -- Insert sample rides
    INSERT INTO rides (
      driver_id,
      pickup_location_full,
      dropoff_location,
      ride_date,
      ride_time,
      seats_available,
      status
    ) VALUES
      (v_user_id, 'IBM Office Downtown', 'Airport Terminal 1', CURRENT_DATE + INTERVAL '1 day', '06:00', 3, 'active'),
      (v_user_id, 'Central Station', 'IBM Research Lab', CURRENT_DATE + INTERVAL '2 days', '08:30', 2, 'active'),
      (v_user_id, 'Suburban Mall', 'IBM Office Downtown', CURRENT_DATE + INTERVAL '3 days', '17:45', 4, 'active');
  END IF;
END $$;

-- Down Migration
-- Remove sample data
DELETE FROM ride_requests WHERE ride_id IN (
  SELECT id FROM rides WHERE driver_id IN (
    SELECT id FROM users WHERE email = 'driver@ibm.com'
  )
);
DELETE FROM rides WHERE driver_id IN (
  SELECT id FROM users WHERE email = 'driver@ibm.com'
);
DELETE FROM users WHERE email = 'driver@ibm.com';

-- Made with Bob
