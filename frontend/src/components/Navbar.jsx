import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
} from '@carbon/react';
import { Login, Logout, UserAvatar } from '@carbon/icons-react';

/**
 * Navbar Component
 *
 * Responsive navigation bar using Carbon Design System that appears at the top of every page.
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

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <Header aria-label="Bob Pool">
          <SkipToContent />
          <HeaderName element={Link} to="/" prefix="">
            Bob Pool
          </HeaderName>
          <HeaderNavigation aria-label="Bob Pool">
            <HeaderMenuItem element={Link} to="/">
              Home
            </HeaderMenuItem>
            <HeaderMenuItem element={Link} to="/find-rides">
              Find Rides
            </HeaderMenuItem>
            <HeaderMenuItem element={Link} to="/my-rides">
              My Rides
            </HeaderMenuItem>
            {user && (
              <HeaderMenuItem element={Link} to="/create-ride">
                Create Ride
              </HeaderMenuItem>
            )}
          </HeaderNavigation>
          <HeaderGlobalBar>
            {loading ? (
              <span style={{ padding: '0 1rem', color: '#fff' }}>Loading...</span>
            ) : user ? (
              <>
                <span style={{ padding: '0 1rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
                  <UserAvatar size={20} style={{ marginRight: '0.5rem' }} />
                  Hi, {user.name}
                </span>
                <HeaderGlobalAction
                  aria-label="Logout"
                  onClick={handleLogout}
                  tooltipAlignment="end"
                >
                  <Logout size={20} />
                </HeaderGlobalAction>
              </>
            ) : (
              <>
                <HeaderGlobalAction
                  aria-label="Login"
                  onClick={handleLogin}
                  tooltipAlignment="end"
                >
                  <Login size={20} />
                </HeaderGlobalAction>
                <HeaderGlobalAction
                  aria-label="Register"
                  onClick={handleRegister}
                  tooltipAlignment="end"
                >
                  <UserAvatar size={20} />
                </HeaderGlobalAction>
              </>
            )}
          </HeaderGlobalBar>
        </Header>
      )}
    />
  );
}

export default Navbar;

// Made with Bob
