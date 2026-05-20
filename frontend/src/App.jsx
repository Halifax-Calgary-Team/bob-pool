import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components';
import { Home, FindRides, MyRides, CreateRide, Login, Register } from './pages';

/**
 * Main App Component
 * 
 * This is the root component of the Bob Pool application.
 * It sets up the routing structure and renders the navigation bar
 * along with the appropriate page component based on the current route.
 * 
 * Structure:
 * - Navbar: Always visible at the top
 * - Routes: Renders different page components based on URL
 */
function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/me', {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (authLoading) {
    return (
      <div className="app">
        <Navbar />
        <main className="main-content">
          <p style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Navigation bar - visible on all pages */}
      <Navbar />
      
      {/* Main content area - renders different pages based on route */}
      <main className="main-content">
        <Routes>
          {/* Home page route */}
          <Route path="/" element={<Home />} />
          
          {/* Find Rides page route */}
          <Route path="/find-rides" element={<FindRides />} />
          
          {/* My Rides page route */}
          <Route path="/my-rides" element={<MyRides />} />
          
          {/* Create Ride page route */}
          <Route
            path="/create-ride"
            element={user ? <CreateRide /> : <Navigate to="/login" replace />}
          />
          
          {/* Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

// Made with Bob
