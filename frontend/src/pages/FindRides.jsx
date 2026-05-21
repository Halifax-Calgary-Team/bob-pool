import React, { useState, useEffect } from 'react';
import { RideMap } from '../components';
import { buildApiUrl } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Find Rides Page Component
 * 
 * Displays all available rides and allows users to search/filter them.
 * Fetches rides from the backend API and displays them in a card layout.
 */
function FindRides() {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    pickup: '',
    dropoff: ''
  });
  const [requestingRideId, setRequestingRideId] = useState(null);
  const [showFullRides, setShowFullRides] = useState(false);
  const [selectedRideForRequest, setSelectedRideForRequest] = useState(null);
  const [similarRides, setSimilarRides] = useState([]);
  const [selectedDatesForRequest, setSelectedDatesForRequest] = useState([]);
  const [existingRequestDates, setExistingRequestDates] = useState([]);

  // Fetch existing request dates for the current user
  useEffect(() => {
    const fetchExistingRequests = async () => {
      try {
        const response = await fetch(buildApiUrl('/api/rides/requests/my-requests'), {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          // Get dates of rides user has requested (pending or accepted)
          const requestDates = data.requests
            .filter(req => req.request_status === 'pending' || req.request_status === 'accepted')
            .map(req => req.ride_date);
          setExistingRequestDates(requestDates);
        }
      } catch (err) {
        console.error('Error fetching existing requests:', err);
      }
    };
    fetchExistingRequests();
  }, []);

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
      const url = buildApiUrl(`/api/rides${queryString ? '?' + queryString : ''}`);
      
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

  // Option to format date for display
  const formatDate = (dateString) => {
    return dateString;
  };

  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Open date selection modal for ride request
  const handleOpenRequestModal = (ride) => {
    setSelectedRideForRequest(ride);
    console.log('ride date: ');
    console.log('ride date: ' + ride.ride_date);
    setSelectedDatesForRequest([ride.ride_date]);
    
    // Find similar rides (same route, time, driver)
    const similar = rides.filter(r =>
      r.id !== ride.id &&
      r.driver_id === ride.driver_id &&
      r.pickup_location === ride.pickup_location &&
      r.dropoff_location === ride.dropoff_location &&
      r.ride_time === ride.ride_time &&
      r.seats_available > 0 &&
      r.status === 'active'
    ).sort((a, b) => new Date(a.ride_date) - new Date(b.ride_date));
    
    setSimilarRides(similar);
  };

  // Handle date selection for request
  const handleDateToggleForRequest = (date) => {
    // Check if user already has a request on this date
    if (existingRequestDates.includes(date) && !selectedDatesForRequest.includes(date)) {
      alert(`You already have a ride request on ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Only one ride request per day is allowed.`);
      return;
    }

    setSelectedDatesForRequest(prev => {
      if (prev.includes(date)) {
        // Don't allow deselecting if it's the only date
        if (prev.length === 1) return prev;
        return prev.filter(d => d !== date);
      } else {
        if (prev.length >= 5) {
          alert('You can select up to 5 dates maximum');
          return prev;
        }
        return [...prev, date].sort();
      }
    });
  };

  // Submit ride requests for selected dates
  const handleSubmitRequests = async () => {
    try {
      setRequestingRideId(selectedRideForRequest.id);
      
      // Find ride IDs for selected dates
      const ridesToRequest = [selectedRideForRequest, ...similarRides]
        .filter(r => selectedDatesForRequest.includes(r.ride_date));
      
      // Submit request for each selected ride
      const requestPromises = ridesToRequest.map(ride =>
        fetch(buildApiUrl(`/api/rides/${ride.id}/request`), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );
      
      const responses = await Promise.all(requestPromises);
      const failedCount = responses.filter(r => !r.ok).length;
      
      if (failedCount > 0) {
        alert(`Failed to request ${failedCount} out of ${selectedDatesForRequest.length} rides. Some may have already been requested.`);
      } else {
        alert(`Successfully requested ${selectedDatesForRequest.length} ride(s)! Check "My Rides" to see your requests.`);
      }
      
      // Close modal and refresh
      setSelectedRideForRequest(null);
      setSelectedDatesForRequest([]);
      setSimilarRides([]);
      await fetchRides();
      
    } catch (error) {
      console.error('Error requesting rides:', error);
      alert('Failed to request rides. Please try again.');
    } finally {
      setRequestingRideId(null);
    }
  };

  // Filter rides based on seat availability
  const ridesWithSeats = rides.filter(ride => ride.seats_available > 0);
  const fullRides = rides.filter(ride => ride.seats_available === 0);

  return (
    <div className="find-rides-page">
      <div className="page-container">
        <h1 className="page-title">Find Rides</h1>
        <p className="page-description">
          Search for available rides and connect with colleagues
        </p>

        {/* Info Banner */}
        {!user && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '20px' }}>ℹ️</span>
            <span style={{ color: '#1e40af', fontSize: '14px' }}>
              <strong>Tip:</strong> Log in to request rides and contact drivers directly
            </span>
          </div>
        )}

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
              <h2>Available Rides ({ridesWithSeats.length})</h2>
              {fullRides.length > 0 && (
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                  {fullRides.length} ride(s) with no seats available
                </p>
              )}
            </div>

            {rides.length === 0 ? (
              <div className="no-rides" style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '2px dashed #d1d5db'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ marginBottom: '8px', color: '#374151' }}>No rides found</h3>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                  No rides match your search criteria at the moment.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="btn btn-primary"
                  style={{ marginTop: '8px' }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Rides with available seats */}
                {ridesWithSeats.length === 0 ? (
                  <div className="no-rides" style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    backgroundColor: '#fef3c7',
                    borderRadius: '12px',
                    border: '2px dashed #f59e0b'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💺</div>
                    <h3 style={{ marginBottom: '8px', color: '#92400e' }}>All rides are full</h3>
                    <p style={{ color: '#78350f', marginBottom: '8px' }}>
                      No rides with available seats at the moment.
                    </p>
                    <p style={{ color: '#78350f', fontSize: '14px' }}>
                      Check the full rides section below or try adjusting your search.
                    </p>
                  </div>
                ) : (
                  <div className="rides-grid">
                    {ridesWithSeats.map((ride) => (
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
                        <span className="detail-icon">👤</span>
                        <span className="detail-label">Driver:</span>
                        <span className="detail-value">{ride.driver_name}</span>
                      </div>

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
                        <span
                          className="detail-value"
                          style={{
                            fontWeight: 'bold',
                            color: ride.seats_available <= 2 ? '#dc2626' : ride.seats_available <= 5 ? '#f59e0b' : '#10b981'
                          }}
                        >
                          {ride.seats_available} available
                        </span>
                      </div>
                    </div>

                    {/* Map showing route */}
                    <div className="ride-map">
                      <RideMap
                        pickupLocation={ride.pickup_location}
                        dropoffLocation={ride.dropoff_location}
                        height="250px"
                      />
                    </div>

                      <div className="ride-actions">
                        {user ? (
                          <>
                            <button
                              className="btn btn-primary btn-block"
                              onClick={() => handleOpenRequestModal(ride)}
                              disabled={requestingRideId === ride.id}
                              title="Request to join this ride"
                            >
                              {requestingRideId === ride.id ? 'Requesting...' : '🚗 Request Ride'}
                            </button>
                            <a
                              href={`mailto:${ride.driver_email}?subject=Bob Pool Ride Request - ${formatDate(ride.ride_date)}`}
                              className="btn btn-secondary btn-block"
                              title={`Contact ${ride.driver_name} via email`}
                            >
                              ✉️ Contact Driver
                            </a>
                          </>
                        ) : (
                          <>
                            <a
                              href="/login"
                              className="btn btn-primary btn-block"
                              title="You must be logged in to request rides"
                            >
                              🔒 Login to Request
                            </a>
                            <a
                              href="/login"
                              className="btn btn-secondary btn-block"
                              title="You must be logged in to contact drivers"
                            >
                              🔒 Login to Contact
                            </a>
                          </>
                        )}
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

                {/* Full Rides Section (Collapsible) */}
                {fullRides.length > 0 && (
                  <div style={{ marginTop: '30px' }}>
                    <button
                      className="btn btn-link"
                      onClick={() => setShowFullRides(!showFullRides)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '15px',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      <span>Full Rides - No Seats Available ({fullRides.length})</span>
                      <span style={{ float: 'right' }}>
                        {showFullRides ? '▼' : '▶'}
                      </span>
                    </button>

                    {showFullRides && (
                      <div className="rides-grid" style={{ marginTop: '15px', opacity: 0.7 }}>
                        {fullRides.map((ride) => (
                          <article key={ride.id} className="ride-card" style={{ border: '2px solid #fecaca' }}>
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
                                <span className="detail-value" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                  FULL - 0 available
                                </span>
                              </div>

                              <div className="detail-item">
                                <span className="detail-icon">👤</span>
                                <span className="detail-label">Driver:</span>
                                <span className="detail-value">{ride.driver_name}</span>
                              </div>
                            </div>

                            <div className="ride-map">
                              <RideMap
                                pickupLocation={ride.pickup_location}
                                dropoffLocation={ride.dropoff_location}
                                height="250px"
                              />
                            </div>

                            <div className="ride-actions">
                              <button
                                className="btn btn-secondary btn-block"
                                disabled
                                style={{ cursor: 'not-allowed', opacity: 0.5 }}
                              >
                                No Seats Available
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Date Selection Modal */}
        {selectedRideForRequest && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ marginTop: 0 }}>Select Ride Dates</h2>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                Select up to 5 dates for this ride route. You can request multiple dates at once.
              </p>

              <div style={{
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Route:</strong> {selectedRideForRequest.pickup_location} → {selectedRideForRequest.dropoff_location}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Time:</strong> {formatTime(selectedRideForRequest.ride_time)}
                </div>
                <div>
                  <strong>Driver:</strong> {selectedRideForRequest.driver_name}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong>Available Dates:</strong>
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '8px',
                  marginTop: '8px'
                }}>
                  {[selectedRideForRequest, ...similarRides].map(ride => {
                    const isSelected = selectedDatesForRequest.includes(ride.ride_date);
                    const hasExistingRequest = existingRequestDates.includes(ride.ride_date);
                    const displayDate = new Date(ride.ride_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    
                    return (
                      <div
                        key={ride.id}
                        onClick={() => !hasExistingRequest && handleDateToggleForRequest(ride.ride_date)}
                        style={{
                          padding: '10px',
                          margin: '4px 0',
                          backgroundColor: hasExistingRequest ? '#fee2e2' : (isSelected ? '#3b82f6' : 'white'),
                          color: hasExistingRequest ? '#991b1b' : (isSelected ? 'white' : '#1f2937'),
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          cursor: hasExistingRequest ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          opacity: hasExistingRequest ? 0.6 : 1
                        }}
                      >
                        <span>
                          {isSelected && '✓ '}
                          {hasExistingRequest && '🚫 '}
                          {displayDate}
                          {hasExistingRequest && ' (Already requested)'}
                        </span>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>
                          {ride.seats_available} seat(s)
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
                  Selected {selectedDatesForRequest.length} date(s)
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitRequests}
                  disabled={requestingRideId !== null}
                  style={{ flex: 1 }}
                >
                  {requestingRideId ? 'Requesting...' : `Request ${selectedDatesForRequest.length} Ride(s)`}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedRideForRequest(null);
                    setSelectedDatesForRequest([]);
                    setSimilarRides([]);
                  }}
                  disabled={requestingRideId !== null}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FindRides;

// Made with Bob