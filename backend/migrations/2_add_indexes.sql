-- Up Migration
-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_date ON rides(ride_date);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_requests_ride ON ride_requests(ride_id);
CREATE INDEX IF NOT EXISTS idx_requests_rider ON ride_requests(rider_id);

-- Down Migration
-- Drop indexes
DROP INDEX IF EXISTS idx_requests_rider;
DROP INDEX IF EXISTS idx_requests_ride;
DROP INDEX IF EXISTS idx_rides_status;
DROP INDEX IF EXISTS idx_rides_date;
DROP INDEX IF EXISTS idx_rides_driver;

-- Made with Bob
