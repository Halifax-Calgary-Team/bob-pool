import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on component mount
  useEffect(() => {
    checkAuth();
  }, []);

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
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
        navigate('/');
        alert('Logged out successfully!');
      } else {
        alert('Failed to logout. Please try again.');
      }
    } catch (error) {
      console.error('Error logging out:', error);
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
          <li>
            <Link to="/create-ride" className="nav-link">
              Create Ride
            </Link>
          </li>
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
