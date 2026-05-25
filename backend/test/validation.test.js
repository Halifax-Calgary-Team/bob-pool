const test = require('node:test');
const assert = require('node:assert/strict');

// Prevent database initialization during tests
// The validation functions don't need database access
process.env.AUTO_INIT_DB = 'false';

const authRoutes = require('../routes/auth');
const rideRoutes = require('../routes/rides');

const { isValidIBMEmail } = authRoutes;
const { validateRideData } = rideRoutes;

test('isValidIBMEmail accepts valid ibm.com addresses', () => {
  assert.equal(isValidIBMEmail('user@ibm.com'), true);
  assert.equal(isValidIBMEmail('USER@IBM.COM'), true);
  assert.equal(isValidIBMEmail('first.last@ibm.com'), true);
});

test('isValidIBMEmail rejects non-IBM or malformed addresses', () => {
  assert.equal(isValidIBMEmail('user@example.com'), false);
  assert.equal(isValidIBMEmail('user@ibm.co'), false);
  assert.equal(isValidIBMEmail('user@notibm.com'), false);
  assert.equal(isValidIBMEmail('not-an-email'), false);
  assert.equal(isValidIBMEmail(''), false);
});

test('validateRideData accepts valid ride payloads', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 3
  });

  assert.equal(result, null);
});

test('validateRideData rejects missing required fields', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 0
  });

  assert.equal(
    result,
    'All fields are required: pickup_location_full, dropoff_location, ride_date, ride_time, seats_available'
  );
});

test('validateRideData rejects seat counts outside the allowed range', () => {
  assert.equal(
    validateRideData({
      pickup_location_full: '123 Main St, Halifax, NS',
      dropoff_location: 'IBM Office',
      ride_date: '2026-06-01',
      ride_time: '08:30',
      seats_available: -1
    }),
    'Seats available must be between 1 and 10'
  );

  assert.equal(
    validateRideData({
      pickup_location_full: '123 Main St, Halifax, NS',
      dropoff_location: 'IBM Office',
      ride_date: '2026-06-01',
      ride_time: '08:30',
      seats_available: 11
    }),
    'Seats available must be between 1 and 10'
  );
});

test('validateRideData rejects invalid date format', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '06-01-2026',
    ride_time: '08:30',
    seats_available: 2
  });

  assert.equal(result, 'Invalid date format. Use YYYY-MM-DD');
});

test('validateRideData rejects invalid time format', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '8:30 AM',
    seats_available: 2
  });

  assert.equal(result, 'Invalid time format. Use HH:MM (24-hour format)');
});

// Made with Bob
