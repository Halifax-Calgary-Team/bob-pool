import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderNavigation,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderSideNavItems,
  SideNav,
  SideNavItems,
  SideNavLink,
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
        <>
          <Header aria-label="Bob Pool">
            <SkipToContent />
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
              isActive={isSideNavExpanded}
              onClick={onClickSideNavExpand}
            />
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
                <>
                  <HeaderMenuItem element={Link} to="/create-ride">
                    Create Ride
                  </HeaderMenuItem>
                </>
              )}
            </HeaderNavigation>
            <HeaderGlobalBar>
              {loading ? (
                <span style={{ padding: '0 1rem', color: '#fff' }}>Loading...</span>
              ) : user ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    style={{
                      padding: '0 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      background: 'transparent',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer'
                    }}
                    aria-label="Open profile"
                  >
                    <UserAvatar size={20} style={{ marginRight: '0.5rem' }} />
                    Hi, {user.name}
                  </button>
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
            <SideNav
              aria-label="Side navigation"
              expanded={isSideNavExpanded}
              isPersistent={false}
              onOverlayClick={onClickSideNavExpand}
              onSideNavBlur={onClickSideNavExpand}
            >
              <HeaderSideNavItems>
                <SideNavItems>
                  <SideNavLink element={Link} to="/" onClick={onClickSideNavExpand}>
                    Home
                  </SideNavLink>
                  <SideNavLink element={Link} to="/find-rides" onClick={onClickSideNavExpand}>
                    Find Rides
                  </SideNavLink>
                  <SideNavLink element={Link} to="/my-rides" onClick={onClickSideNavExpand}>
                    My Rides
                  </SideNavLink>
                  {user && (
                    <>
                      <SideNavLink element={Link} to="/create-ride" onClick={onClickSideNavExpand}>
                        Create Ride
                      </SideNavLink>
                    </>
                  )}
                  {!loading && !user && (
                    <>
                      <SideNavLink element={Link} to="/login" onClick={onClickSideNavExpand}>
                        Login
                      </SideNavLink>
                      <SideNavLink element={Link} to="/register" onClick={onClickSideNavExpand}>
                        Register
                      </SideNavLink>
                    </>
                  )}
                </SideNavItems>
              </HeaderSideNavItems>
            </SideNav>
          </Header>
        </>
      )}
    />
  );
}

export default Navbar;

// Made with Bob
