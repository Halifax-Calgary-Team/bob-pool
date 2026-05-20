import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    dropoff_location: '',
    ride_date: '',
    ride_time: '',
    seats_available: 1
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.pickup_location.trim()) {
      setError('Pickup location is required');
      return false;
    }

    if (!formData.dropoff_location.trim()) {
      setError('Dropoff location is required');
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
      const response = await fetch('http://localhost:3001/api/rides', {
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
                Pickup Location
              </label>
              <input
                type="text"
                id="pickup_location"
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleChange}
                placeholder="e.g., IBM Office Downtown"
                className="form-input"
                required
              />
              <p className="form-hint">Where will you pick up passengers?</p>
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
                onChange={handleChange}
                placeholder="e.g., IBM Research Center"
                className="form-input"
                required
              />
              <p className="form-hint">Where will you drop off passengers?</p>
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
                min={new Date().toISOString().split('T')[0]}
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