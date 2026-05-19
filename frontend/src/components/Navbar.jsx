import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Navbar Component
 * 
 * Responsive navigation bar that appears at the top of every page.
 * 
 * Features:
 * - Brand logo/name on the left
 * - Navigation links in the center
 * - Login/Register buttons on the right
 * - Responsive design (adapts to mobile/tablet/desktop)
 * 
 * Note: Links and buttons are placeholders for now.
 * Authentication functionality will be added in a future task.
 */
function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand/Logo Section */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link">
            <span className="brand-name">Bob Pool</span>
          </Link>
        </div>

        {/* Navigation Links Section */}
        <ul className="navbar-links">
          <li>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li>
            {/* Placeholder - will be implemented in future task */}
            <Link to="/find-rides" className="nav-link">
              Find Rides
            </Link>
          </li>
          <li>
            {/* Placeholder - will be implemented in future task */}
            <Link to="/my-rides" className="nav-link">
              My Rides
            </Link>
          </li>
        </ul>

        {/* Auth Buttons Section */}
        <div className="navbar-auth">
          {/* Placeholder buttons - authentication will be added in future task */}
          <button className="btn btn-secondary">
            Login
          </button>
          <button className="btn btn-primary">
            Register
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

// Made with Bob
