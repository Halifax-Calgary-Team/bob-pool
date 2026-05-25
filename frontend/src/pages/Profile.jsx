import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Tile, Tag } from '@carbon/react';
import { UserAvatar, Email, Calendar, Logout } from '@carbon/icons-react';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl } from '../config/api';

const formatDate = (dateValue) => {
  if (!dateValue) {
    return 'Not available';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not available';
  }

  return parsedDate.toLocaleString(undefined, {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

function Profile() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [rideSummary, setRideSummary] = useState({
    posted: 0,
    activePosted: 0,
    requested: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    rejectedRequests: 0,
  });

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const profileItems = [
    {
      label: 'Full Name',
      value: user.name || 'Not available',
      icon: <UserAvatar size={20} />
    },
    {
      label: 'Email Address',
      value: user.email || 'Not available',
      icon: <Email size={20} />
    },
    {
      label: 'User ID',
      value: user.id ? String(user.id) : 'Not available',
      icon: <UserAvatar size={20} />
    },
    {
      label: 'Account Created',
      value: formatDate(user.created_at),
      icon: <Calendar size={20} />
    }
  ];

  useEffect(() => {
    const fetchRideSummary = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const [ridesResponse, requestsResponse] = await Promise.all([
          fetch(buildApiUrl('/api/rides'), {
            credentials: 'include',
          }),
          fetch(buildApiUrl('/api/rides/requests/my-requests'), {
            credentials: 'include',
          }),
        ]);

        const ridesData = ridesResponse.ok ? await ridesResponse.json() : { rides: [] };
        const requestsData = requestsResponse.ok ? await requestsResponse.json() : { requests: [] };

        const myPostedRides = (ridesData.rides || []).filter((ride) => ride.driver_id === user.id);
        const myRequests = requestsData.requests || [];

        setRideSummary({
          posted: myPostedRides.length,
          activePosted: myPostedRides.filter((ride) => ride.status === 'active').length,
          requested: myRequests.length,
          pendingRequests: myRequests.filter((request) => request.request_status === 'pending').length,
          acceptedRequests: myRequests.filter((request) => request.request_status === 'accepted').length,
          rejectedRequests: myRequests.filter((request) => request.request_status === 'rejected').length,
        });
      } catch (error) {
        console.error('Error fetching ride summary:', error);
      }
    };

    fetchRideSummary();
  }, [user]);

  const rideSummaryItems = [
    {
      label: 'Posted Rides',
      value: rideSummary.posted,
    },
    {
      label: 'Active Posted Rides',
      value: rideSummary.activePosted,
    },
    {
      label: 'Ride Requests',
      value: rideSummary.requested,
    },
    {
      label: 'Pending Requests',
      value: rideSummary.pendingRequests,
    },
    {
      label: 'Accepted Requests',
      value: rideSummary.acceptedRequests,
    },
    {
      label: 'Rejected Requests',
      value: rideSummary.rejectedRequests,
    },
  ];

  const handleLogout = async () => {
    const result = await logout();

    if (result.success) {
      navigate('/');
      return;
    }

    alert('Failed to logout. Please try again.');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 48px)',
        background: 'linear-gradient(135deg, #f4f4f4 0%, #ffffff 100%)',
        padding: '2rem 1rem'
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Tile style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                backgroundColor: '#0f62fe',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UserAvatar size={32} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>{user.name || 'My Profile'}</h1>
              <p style={{ margin: '0.5rem 0 0', color: '#525252' }}>
                View your Bob Pool account information.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Tag type="blue">{user.isIBMSSO ? 'IBM SSO Account' : 'Registered Account'}</Tag>
            <Tag type="cool-gray">Authenticated</Tag>
          </div>
        </Tile>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem'
          }}
        >
          {profileItems.map((item) => (
            <Tile key={item.label} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ color: '#0f62fe', display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#525252', fontWeight: 600 }}>
                  {item.label}
                </p>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  color: '#161616',
                  wordBreak: 'break-word',
                  lineHeight: 1.5
                }}
              >
                {item.value}
              </p>
            </Tile>
          ))}
        </div>

        <Tile style={{ padding: '2rem', marginTop: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>My Rides Summary</h2>
            <p style={{ margin: '0.5rem 0 0', color: '#525252' }}>
              Quick stats from your posted rides and ride requests.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            {rideSummaryItems.map((item) => (
              <Tile key={item.label} style={{ padding: '1.25rem', backgroundColor: '#f4f4f4' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#525252', fontWeight: 600 }}>
                  {item.label}
                </p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#0f62fe', fontWeight: 700 }}>
                  {item.value}
                </p>
              </Tile>
            ))}
          </div>
        </Tile>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button kind="danger" renderIcon={Logout} onClick={handleLogout}>
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Profile;

// Made with Bob