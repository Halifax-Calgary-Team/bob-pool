import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

/**
 * RideMap Component
 * 
 * Displays an interactive map with pickup and dropoff locations.
 * Shows a route line between the two points.
 * 
 * Props:
 * - pickupLocation: string - Name of pickup location
 * - dropoffLocation: string - Name of dropoff location
 * - height: string - Height of map container (default: '400px')
 */
function RideMap({ pickupLocation, dropoffLocation, height = '400px' }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Only initialize map once
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize map centered on a default location (IBM locations)
      // In a real app, you would geocode the addresses to get coordinates
      mapInstanceRef.current = L.map(mapRef.current).setView([40.7128, -74.0060], 12);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    // Clean up function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers and lines
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // For demo purposes, we'll use approximate coordinates
    // In production, you would use a geocoding service to convert addresses to coordinates
    const pickupCoords = getApproximateCoordinates(pickupLocation);
    const dropoffCoords = getApproximateCoordinates(dropoffLocation);

    // Add pickup marker (green)
    const pickupIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">P</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const pickupMarker = L.marker(pickupCoords, { icon: pickupIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`<b>Pickup:</b><br>${pickupLocation}`);

    // Add dropoff marker (red)
    const dropoffIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">D</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const dropoffMarker = L.marker(dropoffCoords, { icon: dropoffIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`<b>Dropoff:</b><br>${dropoffLocation}`);

    // Draw a line between pickup and dropoff
    const routeLine = L.polyline([pickupCoords, dropoffCoords], {
      color: '#0f62fe',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10',
    }).addTo(mapInstanceRef.current);

    // Fit map bounds to show both markers
    const bounds = L.latLngBounds([pickupCoords, dropoffCoords]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

  }, [pickupLocation, dropoffLocation]);

  // Helper function to get approximate coordinates based on location name
  // In production, replace this with a real geocoding service
  function getApproximateCoordinates(location) {
    const locationLower = location.toLowerCase();
    
    // IBM office locations (approximate)
    if (locationLower.includes('armonk') || locationLower.includes('headquarters')) {
      return [41.1085, -73.7210];
    } else if (locationLower.includes('research') || locationLower.includes('yorktown')) {
      return [41.2682, -73.7949];
    } else if (locationLower.includes('downtown') || locationLower.includes('manhattan')) {
      return [40.7589, -73.9851];
    } else if (locationLower.includes('brooklyn')) {
      return [40.6782, -73.9442];
    } else if (locationLower.includes('queens')) {
      return [40.7282, -73.7949];
    } else if (locationLower.includes('bronx')) {
      return [40.8448, -73.8648];
    } else if (locationLower.includes('staten island')) {
      return [40.5795, -74.1502];
    } else if (locationLower.includes('newark')) {
      return [40.7357, -74.1724];
    } else if (locationLower.includes('jersey city')) {
      return [40.7178, -74.0431];
    } else {
      // Default to NYC area with some randomization
      const baseLatitude = 40.7128;
      const baseLongitude = -74.0060;
      const randomOffset = () => (Math.random() - 0.5) * 0.1;
      return [baseLatitude + randomOffset(), baseLongitude + randomOffset()];
    }
  }

  return (
    <div className="ride-map-container">
      <div 
        ref={mapRef} 
        style={{ 
          height: height, 
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
      <div className="map-legend" style={{
        marginTop: '10px',
        display: 'flex',
        gap: '20px',
        fontSize: '14px',
        color: '#666'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}></div>
          <span>Pickup Location</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}></div>
          <span>Dropoff Location</span>
        </div>
      </div>
    </div>
  );
}

export default RideMap;

// Made with Bob