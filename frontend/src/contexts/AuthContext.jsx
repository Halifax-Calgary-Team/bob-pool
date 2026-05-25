import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildApiUrl } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First try IBM SSO auth (check if user is logged in via IBM SSO)
      const ibmResponse = await fetch(buildApiUrl('/api/ibm/auth/user'), {
        credentials: 'include'
      });
      
      if (ibmResponse.ok) {
        const ibmData = await ibmResponse.json();
        // Set user from IBM SSO
        setUser({
          id: ibmData.data.id, // Include database user ID
          name: ibmData.data.name || ibmData.data.userInfo?.name || ibmData.data.email || ibmData.data.userInfo?.email,
          email: ibmData.data.email || ibmData.data.userInfo?.email,
          isIBMSSO: true
        });
        setLoading(false);
        return;
      }

      // If IBM SSO fails, try regular auth
      const response = await fetch(buildApiUrl('/api/auth/user'), {
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

  const logout = async () => {
    try {
      // Try regular logout first
      const response = await fetch(buildApiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });

      // Also try IBM SSO logout
      const ibmResponse = await fetch(buildApiUrl('/api/ibm/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok || ibmResponse.ok) {
        setUser(null);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to logout' };
      }
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error: 'Failed to logout' };
    }
  };

  const value = {
    user,
    loading,
    checkAuth,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Made with Bob
