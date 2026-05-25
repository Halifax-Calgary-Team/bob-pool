import React, { useEffect, useState } from 'react';
import { Loading } from '@carbon/react';

/**
 * BlockingPage Component
 * 
 * This component blocks access to the entire application if the w3.ibm.com
 * endpoint is not accessible. It displays a centered message informing users
 * that the service is unavailable.
 */
const BlockingPage = ({ children }) => {
  const [isAccessible, setIsAccessible] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        // Attempt to fetch from w3.ibm.com
        // Using a HEAD request or GET with no-cors mode to avoid CORS issues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch('https://w3.ibm.com', {
          method: 'HEAD',
          mode: 'no-cors', // This allows the request but limits response access
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        // With no-cors mode, we can't read the response, but if the fetch completes
        // without error, we know the endpoint is reachable
        setIsAccessible(true);
        setIsChecking(false);
      } catch (error) {
        // If fetch fails (network error, timeout, etc.), endpoint is not accessible
        console.error('w3.ibm.com is not accessible:', error);
        setIsAccessible(false);
        setIsChecking(false);
      }
    };

    checkConnectivity();

    // Optionally, recheck periodically (every 30 seconds)
    const intervalId = setInterval(checkConnectivity, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f4',
      }}>
        <Loading description="Checking connectivity..." withOverlay={false} />
      </div>
    );
  }

  // Show blocking message if not accessible
  if (!isAccessible) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#ffffff',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: '600px',
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '600',
            color: '#161616',
            marginBottom: '1rem',
          }}>
            Service Unavailable. Please use VPN
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#525252',
            lineHeight: '1.5',
          }}>
            The application cannot connect to the required IBM network services (w3.ibm.com).
            Please check your VPN connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '2rem',
              padding: '0.875rem 1.5rem',
              backgroundColor: '#0f62fe',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0',
              fontSize: '0.875rem',
              fontWeight: '400',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0353e9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0f62fe'}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // If accessible, render the children (the actual app)
  return <>{children}</>;
};

export default BlockingPage;

// Made with Bob
