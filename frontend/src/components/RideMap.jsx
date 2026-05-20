import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icons in Leaflet with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Halifax, NS, Canada coordinates
const HALIFAX_COORDS = [44.6488, -63.5752];

// Fixed dropoff location (as specified by user)
const FIXED_DROPOFF_COORDS = [44.7236, -63.6956];

/**
 * RideMap Component
 *
 * Displays an interactive map with pickup and dropoff locations.
 * Shows a route with a car icon between the two points.
 * Allows clicking on the map to select pickup location.
 *
 * Props:
 * - pickupLocation: string - Name of pickup location
 * - dropoffLocation: string - Name of dropoff location
 * - height: string - Height of map container (default: '400px')
 * - onPickupSelect: function - Callback when pickup location is selected via map click (optional)
 * - interactive: boolean - Whether map allows clicking to select pickup (default: false)
 */
function RideMap({ pickupLocation, pickupCoords, dropoffLocation, height = '400px', onPickupSelect, interactive = false }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const [selectedPickup, setSelectedPickup] = useState(null);

  useEffect(() => {
    // Only initialize map once
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize map centered on Halifax, NS, Canada
      mapInstanceRef.current = L.map(mapRef.current).setView(HALIFAX_COORDS, 12);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    // Clean up function
    return () => {
      if (routingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing routing control if it exists
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Remove existing pickup marker if it exists
    if (pickupMarkerRef.current) {
      mapInstanceRef.current.removeLayer(pickupMarkerRef.current);
      pickupMarkerRef.current = null;
    }

    // Remove existing dropoff marker if it exists
    if (dropoffMarkerRef.current) {
      mapInstanceRef.current.removeLayer(dropoffMarkerRef.current);
      dropoffMarkerRef.current = null;
    }

    // Prefer explicit pickup coordinates from the form, then dragged location, then location name, then Halifax
    const currentPickupCoords = pickupCoords || selectedPickup || getApproximateCoordinates(pickupLocation);
    const dropoffCoords = FIXED_DROPOFF_COORDS; // Always use fixed dropoff

    // Create custom icons
    const pickupIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background-color: #10b981; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">P</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    const dropoffIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="background-color: #ef4444; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">D</div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });

    // Create draggable pickup marker
    pickupMarkerRef.current = L.marker(currentPickupCoords, {
      icon: pickupIcon,
      draggable: interactive // Only draggable in interactive mode
    })
      .addTo(mapInstanceRef.current)
      .bindPopup(`<b>Pickup:</b><br>${pickupLocation || 'Drag to select location'}`);

    // Handle drag end event
    if (interactive && onPickupSelect) {
      pickupMarkerRef.current.on('dragend', (e) => {
        const { lat, lng } = e.target.getLatLng();
        setSelectedPickup([lat, lng]);
        
        // Update routing
        if (routingControlRef.current) {
          routingControlRef.current.setWaypoints([
            L.latLng(lat, lng),
            L.latLng(dropoffCoords[0], dropoffCoords[1])
          ]);
        }
        
        // Call the callback with coordinates
        if (onPickupSelect) {
          onPickupSelect({
            lat,
            lng,
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          });
        }
      });
    }

    // Create routing control with Leaflet Routing Machine
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(currentPickupCoords[0], currentPickupCoords[1]),
        L.latLng(dropoffCoords[0], dropoffCoords[1])
      ],
      show: false,
      fitSelectedRoutes: false,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#0f62fe', opacity: 0.8, weight: 5 }]
      },
      createMarker: function(i, waypoint, n) {
        // Don't create default markers - we're using custom ones
        return null;
      },
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      })
    }).addTo(mapInstanceRef.current);

    // Add fixed dropoff marker (not draggable)
    dropoffMarkerRef.current = L.marker(dropoffCoords, { icon: dropoffIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup('<b>Dropoff:</b><br>IBM Client Innovation Centre Nova Scotia');

    // Fit map bounds to show both markers unless the user is actively dragging the pickup marker
    if (!selectedPickup) {
      const bounds = L.latLngBounds([currentPickupCoords, dropoffCoords]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [pickupLocation, pickupCoords, dropoffLocation, selectedPickup, interactive, onPickupSelect]);

  // Helper function to get approximate coordinates based on location name
  // In production, replace this with a real geocoding service
  function getApproximateCoordinates(location) {
    if (!location) return HALIFAX_COORDS;
    
    const locationLower = location.toLowerCase();
    
    // Halifax area locations (approximate)
    if (locationLower.includes('downtown') || locationLower.includes('citadel')) {
      return [44.6488, -63.5752]; // Downtown Halifax
    } else if (locationLower.includes('dartmouth')) {
      return [44.6710, -63.5752]; // Dartmouth
    } else if (locationLower.includes('bedford')) {
      return [44.7293, -63.6453]; // Bedford
    } else if (locationLower.includes('sackville')) {
      return [44.7707, -63.6811]; // Lower Sackville
    } else if (locationLower.includes('airport')) {
      return [44.8808, -63.5086]; // Halifax Airport
    } else if (locationLower.includes('waterfront') || locationLower.includes('harbour')) {
      return [44.6476, -63.5728]; // Halifax Waterfront
    } else if (locationLower.includes('dalhousie') || locationLower.includes('university')) {
      return [44.6369, -63.5876]; // Dalhousie University
    } else if (locationLower.includes('spring garden')) {
      return [44.6426, -63.5770]; // Spring Garden Road
    } else if (locationLower.includes('bayers lake')) {
      return [44.6584, -63.6584]; // Bayers Lake
    } else if (locationLower.includes('burnside')) {
      return [44.7089, -63.5989]; // Burnside Industrial Park
    } else {
      // Default to Halifax with some randomization for variety
      const randomOffset = () => (Math.random() - 0.5) * 0.05;
      return [HALIFAX_COORDS[0] + randomOffset(), HALIFAX_COORDS[1] + randomOffset()];
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