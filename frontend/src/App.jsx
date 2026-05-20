import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
          <Route path="/create-ride" element={<CreateRide />} />
          
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
