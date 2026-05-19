import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components';
import { Home } from './pages';

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
          
          {/* Additional routes will be added here in future tasks:
              - /find-rides - Search for available rides
              - /my-rides - View user's rides
              - /login - User login
              - /register - User registration
          */}
        </Routes>
      </main>
    </div>
  );
}

export default App;

// Made with Bob
