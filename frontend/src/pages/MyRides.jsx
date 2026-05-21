import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildApiUrl } from '../config/api';

/**
 * My Rides Page Component
 *
 * Displays rides created by the user and rides they've requested.
 * Shows two sections: "My Posted Rides" and "My Ride Requests"
 */
function MyRides() {
  const navigate = useNavigate();
  const [myPostedRides, setMyPostedRides] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [cancellingRequestId, setCancellingRequestId] = useState(null);
  const [cancellingRideId, setCancellingRideId] = useState(null);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [expandedRideId, setExpandedRideId] = useState(null);
  const [showRejectedRequests, setShowRejectedRequests] = useState(false);
  const [editingRide, setEditingRide] = useState(null);
  const [editFormData, setEditFormData] = useState({
    pickup_location: '',
    dropoff_location: '',
    ride_date: '',
    ride_time: '',
    seats_available: 1
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Fetch user info and rides on component mount
  useEffect(() => {
    fetchUserAndRides();
  }, []);

  const fetchUserAndRides = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get current user info
      const userResponse = await fetch(buildApiUrl('/api/auth/me'), {
        credentials: 'include'
      });

      if (!userResponse.ok) {
        throw new Error('Please log in to view your rides');
      }

      const userData = await userResponse.json();
      setUser(userData.user);

      // Fetch all rides to filter user's posted rides
      const ridesResponse = await fetch(buildApiUrl('/api/rides'), {
        credentials: 'include'
      });

      if (ridesResponse.ok) {
        const ridesData = await ridesResponse.json();
        // Filter rides created by current user
        const userRides = ridesData.rides.filter(
          ride => ride.driver_id === userData.user.id
        );
        
        // Fetch detailed info for each ride to get pending requests
        const ridesWithRequests = await Promise.all(
          userRides.map(async (ride) => {
            try {
              const rideDetailResponse = await fetch(buildApiUrl(`/api/rides/${ride.id}`), {
                credentials: 'include'
              });
              if (rideDetailResponse.ok) {
                const rideDetail = await rideDetailResponse.json();
                return { ...ride, requests: rideDetail.ride.requests || [] };
              }
              return { ...ride, requests: [] };
            } catch (err) {
              console.error(`Error fetching requests for ride ${ride.id}:`, err);
              return { ...ride, requests: [] };
            }
          })
        );
        
        setMyPostedRides(ridesWithRequests);
      }

      // Fetch ride requests made by user
      const requestsResponse = await fetch(buildApiUrl('/api/rides/requests/my-requests'), {
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

  // Handle cancel ride request
  const handleCancelRequest = async (requestId, rideId) => {
    if (!window.confirm('Are you sure you want to cancel this ride request?')) {
      return;
    }

    try {
      setCancellingRequestId(requestId);

      const response = await fetch(
        buildApiUrl(`/api/rides/${rideId}/requests/${requestId}`),
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to cancel ride request');
        return;
      }

      alert('Ride request cancelled successfully!');

      // Refresh the rides list
      await fetchUserAndRides();

    } catch (error) {
      console.error('Error cancelling ride request:', error);
      alert('Failed to cancel ride request. Please try again.');
    } finally {
      setCancellingRequestId(null);
    }
  };

  // Handle cancel ride (for drivers)
  const handleCancelRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to cancel this ride? All riders will be notified via email.')) {
      return;
    }

    try {
      setCancellingRideId(rideId);

      const response = await fetch(
        buildApiUrl(`/api/rides/${rideId}/cancel`),
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to cancel ride');
        return;
      }

      // Show success message with rider notification info
      if (data.riders && data.riders.length > 0) {
        const riderEmails = data.riders.map(r => r.rider_email).join(', ');
        alert(`Ride cancelled successfully!\n\nEmail notifications will be sent to: ${riderEmails}`);
      } else {
        alert('Ride cancelled successfully! No riders were booked for this ride.');
      }

      // Refresh the rides list
      await fetchUserAndRides();

    } catch (error) {
      console.error('Error cancelling ride:', error);
      alert('Failed to cancel ride. Please try again.');
    } finally {
      setCancellingRideId(null);
    }
  };

  // Handle accept/reject ride request
  const handleRequestAction = async (rideId, requestId, action) => {
    const actionText = action === 'accepted' ? 'accept' : 'reject';
    if (!window.confirm(`Are you sure you want to ${actionText} this ride request?`)) {
      return;
    }

    try {
      setProcessingRequestId(requestId);

      const response = await fetch(
        buildApiUrl(`/api/rides/${rideId}/requests/${requestId}`),
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: action })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || `Failed to ${actionText} ride request`);
        return;
      }

      alert(`Ride request ${action} successfully!`);

      // Refresh the rides list
      await fetchUserAndRides();

    } catch (error) {
      console.error(`Error ${actionText}ing ride request:`, error);
      alert(`Failed to ${actionText} ride request. Please try again.`);
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Toggle expanded ride to show/hide requests
  const toggleRideExpansion = (rideId) => {
    setExpandedRideId(expandedRideId === rideId ? null : rideId);
  };

  // Handle edit ride button click
  const handleEditRide = (ride) => {
    setEditingRide(ride);
    setEditFormData({
      pickup_location: ride.pickup_location,
      dropoff_location: ride.dropoff_location,
      ride_date: ride.ride_date,
      ride_time: ride.ride_time,
      seats_available: ride.seats_available
    });
  };

  // Handle edit form input changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save edited ride
  const handleSaveEdit = async () => {
    if (!editingRide) return;

    try {
      setSavingEdit(true);

      const response = await fetch(
        buildApiUrl(`/api/rides/${editingRide.id}`),
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editFormData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to update ride');
        return;
      }

      // Show success message with rider notification info
      if (data.riders && data.riders.length > 0) {
        const riderEmails = data.riders.map(r => r.rider_email).join(', ');
        alert(`Ride updated successfully!\n\nEmail notifications will be sent to: ${riderEmails}`);
      } else {
        alert('Ride updated successfully! No riders were booked for this ride.');
      }

      // Close modal and refresh rides
      setEditingRide(null);
      await fetchUserAndRides();

    } catch (error) {
      console.error('Error updating ride:', error);
      alert('Failed to update ride. Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRide(null);
    setEditFormData({
      pickup_location: '',
      dropoff_location: '',
      ride_date: '',
      ride_time: '',
      seats_available: 1
    });
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
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Login Here
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
              <a href="/create-ride" className="btn btn-primary">
                Create a Ride
              </a>
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

                  {/* Pending Requests Section */}
                  {ride.requests && ride.requests.length > 0 && (
                    <div className="ride-requests-section">
                      <button
                        className="btn btn-link"
                        onClick={() => toggleRideExpansion(ride.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px',
                          borderTop: '1px solid #e5e7eb',
                          marginTop: '10px'
                        }}
                      >
                        <span style={{ fontWeight: 'bold' }}>
                          {ride.requests.filter(r => r.status === 'pending').length} Pending Request(s)
                        </span>
                        <span style={{ float: 'right' }}>
                          {expandedRideId === ride.id ? '▼' : '▶'}
                        </span>
                      </button>

                      {expandedRideId === ride.id && (
                        <div className="requests-list" style={{
                          padding: '10px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '4px',
                          marginTop: '5px'
                        }}>
                          {ride.requests.map((request) => (
                            <div
                              key={request.id}
                              className="request-item"
                              style={{
                                padding: '10px',
                                marginBottom: '10px',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                border: '1px solid #e5e7eb'
                              }}
                            >
                              <div style={{ marginBottom: '8px' }}>
                                <strong>{request.rider_name}</strong>
                                <br />
                                <small style={{ color: '#6b7280' }}>{request.rider_email}</small>
                              </div>
                              <div style={{ marginBottom: '8px' }}>
                                <span className={`status-badge status-${request.status}`}>
                                  {request.status}
                                </span>
                              </div>
                              {request.status === 'pending' && ride.status === 'active' && (
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => handleRequestAction(ride.id, request.id, 'accepted')}
                                    disabled={processingRequestId === request.id || ride.seats_available <= 0}
                                    style={{ flex: 1, fontSize: '14px', padding: '6px 12px' }}
                                  >
                                    {processingRequestId === request.id ? 'Processing...' :
                                     ride.seats_available <= 0 ? 'No Seats' : 'Accept'}
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleRequestAction(ride.id, request.id, 'rejected')}
                                    disabled={processingRequestId === request.id}
                                    style={{ flex: 1, fontSize: '14px', padding: '6px 12px' }}
                                  >
                                    {processingRequestId === request.id ? 'Processing...' : 'Reject'}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="ride-actions">
                    <button
                      className="btn btn-secondary btn-block"
                      onClick={() => handleEditRide(ride)}
                    >
                      Edit Ride
                    </button>
                    {ride.status === 'active' && (
                      <button
                        className="btn btn-danger btn-block"
                        onClick={() => handleCancelRide(ride.id)}
                        disabled={cancellingRideId === ride.id}
                      >
                        {cancellingRideId === ride.id ? 'Cancelling...' : 'Cancel Ride'}
                      </button>
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
        </section>

        {/* My Ride Requests Section */}
        <section className="rides-section">
          <div className="section-header">
            <h2>My Ride Requests ({myRequests.filter(r => r.request_status !== 'rejected').length})</h2>
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
            <>
              <div className="rides-grid">
                {myRequests
                  .filter(request => request.request_status !== 'rejected')
                  .map((request) => (
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
                    {(request.request_status === 'pending' || request.request_status === 'accepted') && (
                      <button
                        className="btn btn-danger btn-block"
                        onClick={() => handleCancelRequest(request.request_id, request.ride_id)}
                        disabled={cancellingRequestId === request.request_id}
                      >
                        {cancellingRequestId === request.request_id ? 'Cancelling...' : 'Cancel Request'}
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

              {/* Rejected Requests Collapsible Section */}
              {myRequests.filter(r => r.request_status === 'rejected').length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <button
                    className="btn btn-link"
                    onClick={() => setShowRejectedRequests(!showRejectedRequests)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      marginBottom: showRejectedRequests ? '10px' : '0'
                    }}
                  >
                    <span style={{ fontWeight: 'bold', color: '#6b7280' }}>
                      {myRequests.filter(r => r.request_status === 'rejected').length} Rejected Request(s)
                    </span>
                    <span style={{ float: 'right' }}>
                      {showRejectedRequests ? '▼' : '▶'}
                    </span>
                  </button>

                  {showRejectedRequests && (
                    <div className="rides-grid">
                      {myRequests
                        .filter(request => request.request_status === 'rejected')
                        .map((request) => (
                          <article key={request.id} className="ride-card" style={{ opacity: 0.7 }}>
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

                            <div className="ride-status">
                              <span className={`status-badge status-${request.request_status}`}>
                                {request.request_status}
                              </span>
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

        {/* Edit Ride Modal */}
        {editingRide && (
          <div className="modal-overlay" onClick={handleCancelEdit}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Ride</h2>
                <button className="modal-close" onClick={handleCancelEdit}>×</button>
              </div>
              
              <div className="modal-body">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                  <div className="form-group">
                    <label htmlFor="edit-pickup">Pickup Location *</label>
                    <input
                      type="text"
                      id="edit-pickup"
                      name="pickup_location"
                      value={editFormData.pickup_location}
                      onChange={handleEditFormChange}
                      required
                      className="form-input"
                      placeholder="Enter pickup location"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-dropoff">Dropoff Location *</label>
                    <input
                      type="text"
                      id="edit-dropoff"
                      name="dropoff_location"
                      value={editFormData.dropoff_location}
                      onChange={handleEditFormChange}
                      required
                      className="form-input"
                      placeholder="Enter dropoff location"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="edit-date">Date *</label>
                      <input
                        type="date"
                        id="edit-date"
                        name="ride_date"
                        value={editFormData.ride_date}
                        onChange={handleEditFormChange}
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="edit-time">Time *</label>
                      <input
                        type="time"
                        id="edit-time"
                        name="ride_time"
                        value={editFormData.ride_time}
                        onChange={handleEditFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="edit-seats">Available Seats *</label>
                    <input
                      type="number"
                      id="edit-seats"
                      name="seats_available"
                      value={editFormData.seats_available}
                      onChange={handleEditFormChange}
                      min="1"
                      max="10"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                      disabled={savingEdit}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={savingEdit}
                    >
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRides;

// Made with Bob