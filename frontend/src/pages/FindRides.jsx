import React, { useState, useEffect } from 'react';

/**
 * Find Rides Page Component
 * 
 * Displays all available rides and allows users to search/filter them.
 * Fetches rides from the backend API and displays them in a card layout.
 */
function FindRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    pickup: '',
    dropoff: ''
  });
  const [requestingRideId, setRequestingRideId] = useState(null);

  // Fetch rides from the API
  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query string from filters
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.pickup) params.append('pickup', filters.pickup);
      if (filters.dropoff) params.append('dropoff', filters.dropoff);
      
      const queryString = params.toString();
      const url = `http://localhost:3001/api/rides${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch rides');
      }
      
      const data = await response.json();
      setRides(data.rides || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching rides:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search button click
  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      date: '',
      pickup: '',
      dropoff: ''
    });
    // Fetch all rides again
    setTimeout(() => fetchRides(), 0);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Handle ride request
  const handleRequestRide = async (rideId) => {
    try {
      setRequestingRideId(rideId);
      
      const response = await fetch(`http://localhost:3001/api/rides/${rideId}/request`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        alert(data.message || 'Failed to request ride');
        return;
      }
      
      alert('Ride request submitted successfully! Check "My Rides" to see your requests.');
      
      // Refresh rides list to update available seats
      await fetchRides();
      
    } catch (error) {
      console.error('Error requesting ride:', error);
      alert('Failed to request ride. Please try again.');
    } finally {
      setRequestingRideId(null);
    }
  };

  return (
    <div className="find-rides-page">
      <div className="page-container">
        <h1 className="page-title">Find Rides</h1>
        <p className="page-description">
          Search for available rides and connect with colleagues
        </p>

        {/* Search Filters */}
        <section className="filters-section">
          <form className="filters-form" onSubmit={handleSearch}>
            <div className="filter-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="pickup">Pickup Location</label>
              <input
                type="text"
                id="pickup"
                name="pickup"
                value={filters.pickup}
                onChange={handleFilterChange}
                placeholder="e.g., IBM Office"
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="dropoff">Dropoff Location</label>
              <input
                type="text"
                id="dropoff"
                name="dropoff"
                value={filters.dropoff}
                onChange={handleFilterChange}
                placeholder="e.g., Airport"
                className="filter-input"
              />
            </div>

            <div className="filter-actions">
              <button type="submit" className="btn btn-primary">
                Search
              </button>
              <button 
                type="button" 
                onClick={handleClearFilters}
                className="btn btn-secondary"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <p>Loading rides...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p className="error-message">Error: {error}</p>
            <button onClick={fetchRides} className="btn btn-primary">
              Try Again
            </button>
          </div>
        )}

        {/* Rides List */}
        {!loading && !error && (
          <section className="rides-section">
            <div className="rides-header">
              <h2>Available Rides ({rides.length})</h2>
            </div>

            {rides.length === 0 ? (
              <div className="no-rides">
                <p>No rides found matching your criteria.</p>
                <p>Try adjusting your filters or check back later.</p>
              </div>
            ) : (
              <div className="rides-grid">
                {rides.map((ride) => (
                  <article key={ride.id} className="ride-card">
                    <div className="ride-header">
                      <div className="ride-route">
                        <div className="route-point">
                          <span className="route-icon">📍</span>
                          <span className="route-location">{ride.pickup_location}</span>
                        </div>
                        <div className="route-arrow">→</div>
                        <div className="route-point">
                          <span className="route-icon">🎯</span>
                          <span className="route-location">{ride.dropoff_location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ride-details">
                      <div className="detail-item">
                        <span className="detail-icon">📅</span>
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{formatDate(ride.ride_date)}</span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">🕐</span>
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{formatTime(ride.ride_time)}</span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">💺</span>
                        <span className="detail-label">Seats:</span>
                        <span className="detail-value">{ride.seats_available} available</span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-icon">👤</span>
                        <span className="detail-label">Driver:</span>
                        <span className="detail-value">{ride.driver_name}</span>
                      </div>
                    </div>

                    <div className="ride-actions">
                      <button
                        className="btn btn-primary btn-block"
                        onClick={() => handleRequestRide(ride.id)}
                        disabled={requestingRideId === ride.id}
                      >
                        {requestingRideId === ride.id ? 'Requesting...' : 'Request Ride'}
                      </button>
                      <a
                        href={`mailto:${ride.driver_email}?subject=Bob Pool Ride Request - ${formatDate(ride.ride_date)}`}
                        className="btn btn-secondary btn-block"
                      >
                        Email Driver
                      </a>
                    </div>

                    <div className="ride-status">
                      <span className={`status-badge status-${ride.status}`}>
                        {ride.status}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default FindRides;

// Made with Bob