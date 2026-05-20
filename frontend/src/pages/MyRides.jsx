import React, { useState, useEffect } from 'react';

/**
 * My Rides Page Component
 * 
 * Displays rides created by the user and rides they've requested.
 * Shows two sections: "My Posted Rides" and "My Ride Requests"
 */
function MyRides() {
  const [myPostedRides, setMyPostedRides] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch user info and rides on component mount
  useEffect(() => {
    fetchUserAndRides();
  }, []);

  const fetchUserAndRides = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get current user info
      const userResponse = await fetch('http://localhost:3001/api/auth/me', {
        credentials: 'include'
      });

      if (!userResponse.ok) {
        throw new Error('Please log in to view your rides');
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      // Fetch all rides to filter user's posted rides
      const ridesResponse = await fetch('http://localhost:3001/api/rides', {
        credentials: 'include'
      });

      if (ridesResponse.ok) {
        const ridesData = await ridesResponse.json();
        // Filter rides created by current user
        const userRides = ridesData.rides.filter(
          ride => ride.driver_id === userData.user.id
        );
        setMyPostedRides(userRides);
      }

      // Fetch ride requests made by user
      const requestsResponse = await fetch('http://localhost:3001/api/rides/requests/my-requests', {
        credentials: 'include'
      });

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setMyRequests(requestsData.requests);
      }

    } catch (err) {
      setError(err.message);
      console.error('Error fetching rides:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="my-rides-page">
        <div className="page-container">
          <div className="loading-state">
            <p>Loading your rides...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-rides-page">
        <div className="page-container">
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button onClick={fetchUserAndRides} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-rides-page">
      <div className="page-container">
        <h1 className="page-title">My Rides</h1>
        {user && (
          <p className="page-description">
            Welcome back, {user.name}!
          </p>
        )}

        {/* My Posted Rides Section */}
        <section className="rides-section">
          <div className="section-header">
            <h2>My Posted Rides ({myPostedRides.length})</h2>
            <p className="section-description">Rides you've created as a driver</p>
          </div>

          {myPostedRides.length === 0 ? (
            <div className="no-rides">
              <p>You haven't posted any rides yet.</p>
              <button className="btn btn-primary">
                Create a Ride
              </button>
            </div>
          ) : (
            <div className="rides-grid">
              {myPostedRides.map((ride) => (
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
                  </div>

                  <div className="ride-actions">
                    <button className="btn btn-secondary btn-block">
                      Edit Ride
                    </button>
                    <button className="btn btn-danger btn-block">
                      Cancel Ride
                    </button>
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

        {/* My Ride Requests Section */}
        <section className="rides-section">
          <div className="section-header">
            <h2>My Ride Requests ({myRequests.length})</h2>
            <p className="section-description">Rides you've requested as a passenger</p>
          </div>

          {myRequests.length === 0 ? (
            <div className="no-rides">
              <p>You haven't requested any rides yet.</p>
              <a href="/find-rides" className="btn btn-primary">
                Find Rides
              </a>
            </div>
          ) : (
            <div className="rides-grid">
              {myRequests.map((request) => (
                <article key={request.id} className="ride-card">
                  <div className="ride-header">
                    <div className="ride-route">
                      <div className="route-point">
                        <span className="route-icon">📍</span>
                        <span className="route-location">{request.pickup_location}</span>
                      </div>
                      <div className="route-arrow">→</div>
                      <div className="route-point">
                        <span className="route-icon">🎯</span>
                        <span className="route-location">{request.dropoff_location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ride-details">
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{formatDate(request.ride_date)}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">🕐</span>
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">{formatTime(request.ride_time)}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">👤</span>
                      <span className="detail-label">Driver:</span>
                      <span className="detail-value">{request.driver_name}</span>
                    </div>

                    <div className="detail-item">
                      <span className="detail-icon">📊</span>
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value status-${request.request_status}`}>
                        {request.request_status}
                      </span>
                    </div>
                  </div>

                  <div className="ride-actions">
                    <a 
                      href={`mailto:${request.driver_email}?subject=Bob Pool Ride - ${formatDate(request.ride_date)}`}
                      className="btn btn-secondary btn-block"
                    >
                      Email Driver
                    </a>
                    {request.request_status === 'pending' && (
                      <button className="btn btn-danger btn-block">
                        Cancel Request
                      </button>
                    )}
                  </div>

                  <div className="ride-status">
                    <span className={`status-badge status-${request.request_status}`}>
                      {request.request_status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default MyRides;

// Made with Bob