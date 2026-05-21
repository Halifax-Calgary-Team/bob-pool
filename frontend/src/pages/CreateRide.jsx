import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RideMap } from '../components';
import { buildApiUrl } from '../config/api';

/**
 * Create Ride Page Component
 * 
 * Allows drivers to create a new ride offering.
 * Collects pickup/dropoff locations, date, time, and available seats.
 */
function CreateRide() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickup_location: '',
    dropoff_location: 'IBM Client Innovation Centre Nova Scotia', // Fixed dropoff location
    ride_time: '',
    seats_available: 1
  });
  const [selectedDates, setSelectedDates] = useState([]);
  const [existingRideDates, setExistingRideDates] = useState([]);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [addressError, setAddressError] = useState('');
  const abortControllerRef = useRef(null);
  const geocodeCacheRef = useRef(new Map());
  const lastGeocodingTimeRef = useRef(0);

  // Fetch existing ride dates for the current user
  useEffect(() => {
    const fetchExistingRides = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/rides'), {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          const userResponse = await fetch(buildApiUrl('/api/auth/me'), {
            credentials: 'include'
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            // Get dates of rides created by current user
            const userRideDates = data.rides
              .filter(ride => ride.driver_id === userData.user.id && ride.status === 'active')
              .map(ride => ride.ride_date);
            setExistingRideDates(userRideDates);
          }
        }
      } catch (err) {
        console.error('Error fetching existing rides:', err);
      }
    };
    fetchExistingRides();
  }, []);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
    if (addressError) setAddressError('');

    if (name === 'pickup_location') {
      setPickupCoords(null);
    }
  };

  // Geocode address using Nominatim (OpenStreetMap)
  const geocodeAddress = async (address) => {
    if (!address.trim()) {
      setAddressError('Please enter an address');
      return;
    }

    // Check cache first
    const cacheKey = address.toLowerCase().trim();
    if (geocodeCacheRef.current.has(cacheKey)) {
      const cachedResult = geocodeCacheRef.current.get(cacheKey);
      handlePickupSelect(cachedResult);
      return;
    }

    // Rate limiting: Ensure at least 1 second between requests (Nominatim policy)
    const now = Date.now();
    const timeSinceLastRequest = now - lastGeocodingTimeRef.current;
    if (timeSinceLastRequest < 1000) {
      const waitTime = 1000 - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastGeocodingTimeRef.current = Date.now();

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setGeocoding(true);
    setAddressError('');

    try {
      // Add "Nova Scotia, Canada" to the search to limit results
      const searchQuery = `${address}, Nova Scotia, Canada`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=ca`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            'User-Agent': 'BobPool-Carpooling-App/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();

      if (data.length === 0) {
        setAddressError('Address not found in Nova Scotia. Please enter a valid Nova Scotia address.');
        setGeocoding(false);
        return;
      }

      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      // Validate coordinates are within Nova Scotia bounds
      // Nova Scotia approximate bounds: 43.4°N to 47.0°N, -66.5°W to -59.7°W
      const isInNovaScotia =
        lat >= 43.4 && lat <= 47.0 &&
        lng >= -66.5 && lng <= -59.7;

      if (!isInNovaScotia) {
        setAddressError('Address must be within Nova Scotia. Please enter a valid Nova Scotia address.');
        setGeocoding(false);
        return;
      }

      // Cache the result
      const locationData = {
        lat,
        lng,
        address: result.display_name
      };
      geocodeCacheRef.current.set(cacheKey, locationData);

      // Update pickup coordinates
      handlePickupSelect(locationData);

      setGeocoding(false);
      abortControllerRef.current = null;
    } catch (err) {
      // Don't show error if request was aborted (user started a new search)
      if (err.name === 'AbortError') {
        console.log('Geocoding request cancelled');
        return;
      }
      console.error('Geocoding error:', err);
      setAddressError('Failed to find address. Please try again or drag the marker on the map.');
      setGeocoding(false);
      abortControllerRef.current = null;
    }
  };

  // Handle "Find Address" button click
  const handleFindAddress = (e) => {
    e.preventDefault();
    geocodeAddress(formData.pickup_location);
  };

  // Handle pickup location selection from map
  const handlePickupSelect = (location) => {
    setPickupCoords([location.lat, location.lng]);
    setFormData(prev => ({
      ...prev,
      pickup_location: location.address
    }));
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.pickup_location.trim()) {
      setError('Pickup location is required - drag the marker or click on the map');
      return false;
    }

    if (!formData.ride_date) {
      setError('Ride date is required');
      return false;
    }

    if (!formData.ride_time) {
      setError('Ride time is required');
      return false;
    }

    const seats = parseInt(formData.seats_available);
    if (isNaN(seats) || seats < 1 || seats > 10) {
      setError('Seats available must be between 1 and 10');
      return false;
    }

    // Check if date is not in the past
    const selectedDate = new Date(formData.ride_date + 'T' + formData.ride_time);
    const now = new Date();
    if (selectedDate < now) {
      setError('Ride date and time must be in the future');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Send create ride request
      const response = await fetch(buildApiUrl('/api/rides'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          pickup_location: formData.pickup_location.trim(),
          dropoff_location: formData.dropoff_location.trim(),
          ride_date: formData.ride_date,
          ride_time: formData.ride_time,
          seats_available: parseInt(formData.seats_available)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create ride. Please try again.');
        setLoading(false);
        return;
      }

      // Ride created successfully - redirect to my rides page
      alert('Ride created successfully!');
      navigate('/my-rides');

    } catch (err) {
      console.error('Create ride error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Create a Ride</h1>
            <p className="auth-subtitle">Offer a ride to your colleagues</p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="pickup_location" className="form-label">
                Pickup Location (Nova Scotia only)
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  id="pickup_location"
                  name="pickup_location"
                  value={formData.pickup_location}
                  onChange={handleChange}
                  placeholder="e.g., 1234 Main St, Halifax, NS"
                  className="form-input"
                  style={{ flex: 1 }}
                  required
                />
                <button
                  type="button"
                  onClick={handleFindAddress}
                  className="btn btn-secondary"
                  disabled={geocoding || !formData.pickup_location.trim()}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {geocoding ? 'Finding...' : 'Find Address'}
                </button>
              </div>
              {addressError && (
                <p className="form-hint" style={{ color: '#ef4444', marginTop: '5px' }}>
                  ⚠️ {addressError}
                </p>
              )}
              <p className="form-hint">
                Enter a Nova Scotia address and click "Find Address" to locate it on the map, or drag the marker manually.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="dropoff_location" className="form-label">
                Dropoff Location
              </label>
              <input
                type="text"
                id="dropoff_location"
                name="dropoff_location"
                value={formData.dropoff_location}
                className="form-input"
                disabled
                style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
              />
              <p className="form-hint">Dropoff location is fixed for all rides</p>
            </div>

            <div className="form-group">
              <label htmlFor="ride_date" className="form-label">
                Ride Date
              </label>
              <input
                type="date"
                id="ride_date"
                name="ride_date"
                value={formData.ride_date}
                onChange={handleChange}
                className="form-input"
                required
                min={new Date().toLocaleDateString().split('T')[0]}
              />
              <p className="form-hint">When will this ride take place?</p>
            </div>

            <div className="form-group">
              <label htmlFor="ride_time" className="form-label">
                Ride Time
              </label>
              <input
                type="time"
                id="ride_time"
                name="ride_time"
                value={formData.ride_time}
                onChange={handleChange}
                className="form-input"
                required
              />
              <p className="form-hint">What time will you depart?</p>
            </div>

            <div className="form-group">
              <label htmlFor="seats_available" className="form-label">
                Available Seats
              </label>
              <input
                type="number"
                id="seats_available"
                name="seats_available"
                value={formData.seats_available}
                onChange={handleChange}
                className="form-input"
                required
                min="1"
                max="10"
              />
              <p className="form-hint">How many passengers can you take? (1-10)</p>
            </div>

            {/* Interactive map for selecting pickup location */}
            <div className="form-group">
              <label className="form-label">
                Route Preview - Drag the green pickup marker to select your location
              </label>
              <RideMap
                pickupLocation={formData.pickup_location}
                pickupCoords={pickupCoords}
                dropoffLocation={formData.dropoff_location}
                height="400px"
                interactive={true}
                onPickupSelect={handlePickupSelect}
              />
              <p className="form-hint">
                <strong>Drag the green "P" marker</strong> to set your pickup location. The route will automatically update to show the path to the fixed dropoff point.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? 'Creating Ride...' : 'Create Ride'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Want to find a ride instead?{' '}
              <a href="/find-rides" className="auth-link">
                Browse Available Rides
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRide;

// Made with Bob