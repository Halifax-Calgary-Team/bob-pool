import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the AuthContext
const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Helper to render Navbar with auth context
function renderNavbar(authState = { user: null, loading: false }) {
  const mockAuthValue = {
    ...authState,
    logout: mockLogout,
    checkAuth: vi.fn()
  };

  return render(
    <BrowserRouter>
      <AuthProvider value={mockAuthValue}>
        <Navbar />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the brand name', () => {
      renderNavbar();
      expect(screen.getByText('Bob Pool')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
      renderNavbar();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Find Rides')).toBeInTheDocument();
      expect(screen.getByText('My Rides')).toBeInTheDocument();
    });

    it('shows login and register buttons when not authenticated', () => {
      renderNavbar({ user: null, loading: false });
      expect(screen.getByLabelText('Login')).toBeInTheDocument();
      expect(screen.getByLabelText('Register')).toBeInTheDocument();
    });

    it('shows user greeting when authenticated', () => {
      const user = { id: 1, name: 'John Doe', email: 'john@ibm.com' };
      renderNavbar({ user, loading: false });
      expect(screen.getByText(/Hi, John Doe/i)).toBeInTheDocument();
    });

    it('shows logout button when authenticated', () => {
      const user = { id: 1, name: 'John Doe', email: 'john@ibm.com' };
      renderNavbar({ user, loading: false });
      expect(screen.getByLabelText('Logout')).toBeInTheDocument();
    });

    it('shows Create Ride link when authenticated', () => {
      const user = { id: 1, name: 'John Doe', email: 'john@ibm.com' };
      renderNavbar({ user, loading: false });
      const createRideLinks = screen.getAllByText('Create Ride');
      expect(createRideLinks.length).toBeGreaterThan(0);
    });

    it('does not show Create Ride link when not authenticated', () => {
      renderNavbar({ user: null, loading: false });
      expect(screen.queryByText('Create Ride')).not.toBeInTheDocument();
    });

    it('shows loading state', () => {
      renderNavbar({ user: null, loading: true });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('navigates to login page when login button is clicked', async () => {
      const user = userEvent.setup();
      renderNavbar({ user: null, loading: false });
      
      const loginButton = screen.getByLabelText('Login');
      await user.click(loginButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('navigates to register page when register button is clicked', async () => {
      const user = userEvent.setup();
      renderNavbar({ user: null, loading: false });
      
      const registerButton = screen.getByLabelText('Register');
      await user.click(registerButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('navigates to profile page when user name is clicked', async () => {
      const user = userEvent.setup();
      const authUser = { id: 1, name: 'John Doe', email: 'john@ibm.com' };
      renderNavbar({ user: authUser, loading: false });
      
      const profileButton = screen.getByText(/Hi, John Doe/i);
      await user.click(profileButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('calls logout when logout button is clicked', async () => {
      const user = userEvent.setup();
      const authUser = { id: 1, name: 'John Doe', email: 'john@ibm.com' };
      mockLogout.mockResolvedValue({ success: true });
      
      // Mock window.alert
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      renderNavbar({ user: authUser, loading: false });
      
      const logoutButton = screen.getByLabelText('Logout');
      await user.click(logoutButton);
      
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
      
      alertMock.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for icon buttons', () => {
      renderNavbar({ user: null, loading: false });
      expect(screen.getByLabelText('Login')).toBeInTheDocument();
      expect(screen.getByLabelText('Register')).toBeInTheDocument();
    });

    it('has proper ARIA label for logout button when authenticated', () => {
      const user = { id: 1, name: 'John Doe', email: 'john@ibm.com' };
      renderNavbar({ user, loading: false });
      expect(screen.getByLabelText('Logout')).toBeInTheDocument();
    });

    it('has proper ARIA label for profile button when authenticated', () => {
      const user = { id: 1, name: 'John Doe', email: 'john@ibm.com' };
      renderNavbar({ user, loading: false });
      expect(screen.getByLabelText('Open profile')).toBeInTheDocument();
    });
  });
});

// Made with Bob