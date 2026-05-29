const test = require('node:test');
const assert = require('node:assert/strict');

// Prevent database initialization during tests
process.env.AUTO_INIT_DB = 'false';

const rideRoutes = require('../routes/rides');
const { validateRideData } = rideRoutes;

// ============================================
// RIDE DATA VALIDATION TESTS
// ============================================

test('validateRideData accepts valid ride data', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 3
  });

  assert.equal(result, null);
});

test('validateRideData accepts minimum valid seats (1)', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 1
  });

  assert.equal(result, null);
});

test('validateRideData accepts maximum valid seats (10)', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 10
  });

  assert.equal(result, null);
});

// ============================================
// MISSING FIELDS TESTS
// ============================================

test('validateRideData rejects missing pickup_location_full', () => {
  const result = validateRideData({
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 3
  });

  assert.equal(
    result,
    'All fields are required: pickup_location_full, dropoff_location, ride_date, ride_time, seats_available'
  );
});

test('validateRideData rejects missing dropoff_location', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 3
  });

  assert.equal(
    result,
    'All fields are required: pickup_location_full, dropoff_location, ride_date, ride_time, seats_available'
  );
});

test('validateRideData rejects missing ride_date', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_time: '08:30',
    seats_available: 3
  });

  assert.equal(
    result,
    'All fields are required: pickup_location_full, dropoff_location, ride_date, ride_time, seats_available'
  );
});

test('validateRideData rejects missing ride_time', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    seats_available: 3
  });

  assert.equal(
    result,
    'All fields are required: pickup_location_full, dropoff_location, ride_date, ride_time, seats_available'
  );
});

test('validateRideData rejects missing seats_available', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30'
  });

  assert.equal(
    result,
    'All fields are required: pickup_location_full, dropoff_location, ride_date, ride_time, seats_available'
  );
});

test('validateRideData rejects zero seats', () => {
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

// ============================================
// SEAT COUNT VALIDATION TESTS
// ============================================

test('validateRideData rejects negative seat count', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: -1
  });

  assert.equal(result, 'Seats available must be between 1 and 10');
});

test('validateRideData rejects seat count above maximum', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 11
  });

  assert.equal(result, 'Seats available must be between 1 and 10');
});

test('validateRideData rejects very large seat count', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 100
  });

  assert.equal(result, 'Seats available must be between 1 and 10');
});

// ============================================
// DATE FORMAT VALIDATION TESTS
// ============================================

test('validateRideData rejects invalid date format (MM-DD-YYYY)', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '06-01-2026',
    ride_time: '08:30',
    seats_available: 2
  });

  assert.equal(result, 'Invalid date format. Use YYYY-MM-DD');
});

test('validateRideData rejects invalid date format (DD/MM/YYYY)', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '01/06/2026',
    ride_time: '08:30',
    seats_available: 2
  });

  assert.equal(result, 'Invalid date format. Use YYYY-MM-DD');
});

test('validateRideData rejects date without separators', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '20260601',
    ride_time: '08:30',
    seats_available: 2
  });

  assert.equal(result, 'Invalid date format. Use YYYY-MM-DD');
});

test('validateRideData rejects date with wrong separator', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026/06/01',
    ride_time: '08:30',
    seats_available: 2
  });

  assert.equal(result, 'Invalid date format. Use YYYY-MM-DD');
});

test('validateRideData rejects incomplete date', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06',
    ride_time: '08:30',
    seats_available: 2
  });

  assert.equal(result, 'Invalid date format. Use YYYY-MM-DD');
});

// ============================================
// TIME FORMAT VALIDATION TESTS
// ============================================

test('validateRideData rejects 12-hour time format', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '8:30 AM',
    seats_available: 2
  });

  assert.equal(result, 'Invalid time format. Use HH:MM (24-hour format)');
});

test('validateRideData rejects time without leading zero', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '8:30',
    seats_available: 2
  });

  assert.equal(result, 'Invalid time format. Use HH:MM (24-hour format)');
});

test('validateRideData rejects time with seconds', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30:00',
    seats_available: 2
  });

  assert.equal(result, 'Invalid time format. Use HH:MM (24-hour format)');
});

test('validateRideData rejects time without separator', () => {
  const result = validateRideData({
    pickup_location_full: '123 Main St, Halifax, NS',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '0830',
    seats_available: 2
  });

  assert.equal(result, 'Invalid time format. Use HH:MM (24-hour format)');
});

test('validateRideData accepts valid 24-hour times', () => {
  const times = ['00:00', '08:30', '12:00', '18:45', '23:59'];
  
  times.forEach(time => {
    const result = validateRideData({
      pickup_location_full: '123 Main St, Halifax, NS',
      dropoff_location: 'IBM Office',
      ride_date: '2026-06-01',
      ride_time: time,
      seats_available: 2
    });
    
    assert.equal(result, null, `Time ${time} should be valid`);
  });
});

// ============================================
// EDGE CASES
// ============================================

test('validateRideData handles empty strings as missing fields', () => {
  const result = validateRideData({
    pickup_location_full: '',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 2
  });

  assert.equal(
    result,
    'All fields are required: pickup_location_full, dropoff_location, ride_date, ride_time, seats_available'
  );
});

test('validateRideData handles whitespace-only strings', () => {
  const result = validateRideData({
    pickup_location_full: '   ',
    dropoff_location: 'IBM Office',
    ride_date: '2026-06-01',
    ride_time: '08:30',
    seats_available: 2
  });

  // Note: Current implementation doesn't trim, so whitespace passes the truthy check
  // This test documents current behavior
  assert.equal(result, null);
});

// Made with Bob