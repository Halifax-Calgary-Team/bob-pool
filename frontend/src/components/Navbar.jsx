import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Navbar Component
 *
 * Responsive navigation bar that appears at the top of every page.
 *
 * Features:
 * - Brand logo/name on the left
 * - Navigation links in the center
 * - Login/Register buttons when not authenticated
 * - User greeting and logout button when authenticated
 * - Responsive design (adapts to mobile/tablet/desktop)
 */
function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/');
      alert('Logged out successfully!');
    } else {
      alert('Failed to logout. Please try again.');
    }
  };

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
            <Link to="/find-rides" className="nav-link">
              Find Rides
            </Link>
          </li>
          <li>
            <Link to="/my-rides" className="nav-link">
              My Rides
            </Link>
          </li>
          {user && (
            <li>
              <Link to="/create-ride" className="nav-link">
                Create Ride
              </Link>
            </li>
          )}
        </ul>

        {/* Auth Section */}
        <div className="navbar-auth">
          {loading ? (
            <span className="nav-loading">Loading...</span>
          ) : user ? (
            <>
              <span className="user-greeting">Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

// Made with Bob
