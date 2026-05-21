import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components';
import { Home, FindRides, MyRides, CreateRide, Login, Register } from './pages';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Content, Loading } from '@carbon/react';

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
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <Navbar />
        <Content style={{ padding: '2rem', textAlign: 'center' }}>
          <Loading description="Loading application..." withOverlay={false} />
        </Content>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Navigation bar - visible on all pages */}
      <Navbar />
      
      {/* Main content area - renders different pages based on route */}
      <Content>
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
      </Content>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

// Made with Bob
