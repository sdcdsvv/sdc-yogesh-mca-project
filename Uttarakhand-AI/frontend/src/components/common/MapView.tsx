import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Loader2, Compass, Mountain, Info } from 'lucide-react';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

interface MapViewProps {
  location: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  description?: string;
}

const MapView: React.FC<MapViewProps> = ({ 
  location, 
  latitude, 
  longitude, 
  zoom = 12,
  description 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [showInfo, setShowInfo] = useState(true);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = () => {
      // Check if Google Maps is loaded
      if (typeof window.google === 'undefined' || !window.google.maps) {
        setError('Google Maps is loading... Please wait.');
        setTimeout(initMap, 1000); // Retry after 1 second
        return;
      }

      if (!mapRef.current) return;

      try {
        // Default coordinates for Uttarakhand
        const coordinates = {
          lat: latitude || 30.0668,
          lng: longitude || 79.0193
        };

        // Custom map styles for better aesthetics
        const mapStyles = [
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#a2daf3' }]
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#c8e6c9' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ];

        // Initialize map
        const map = new window.google.maps.Map(mapRef.current, {
          center: coordinates,
          zoom: zoom,
          mapTypeId: mapType,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: mapType === 'roadmap' ? mapStyles : [],
          gestureHandling: 'cooperative',
        });

        mapInstanceRef.current = map;

        // Custom marker icon
        const markerIcon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
          scale: 10,
        };

        // Add marker with animation
        const marker = new window.google.maps.Marker({
          position: coordinates,
          map: map,
          title: location,
          animation: window.google.maps.Animation.DROP,
          icon: markerIcon,
        });

        // Enhanced info window content
        const infoWindowContent = `
          <div style="padding: 16px; font-family: 'Inter', Arial, sans-serif; max-width: 280px;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          width: 40px; height: 40px; border-radius: 50%; 
                          display: flex; align-items: center; justify-content: center; 
                          margin-right: 12px;">
                <span style="color: white; font-size: 20px;">🏔️</span>
              </div>
              <div>
                <h3 style="margin: 0; font-weight: 700; color: #1e293b; font-size: 16px;">${location}</h3>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">📍 Uttarakhand, India</p>
              </div>
            </div>
            ${description ? `<p style="margin: 0 0 12px 0; color: #475569; font-size: 13px; line-height: 1.5;">${description}</p>` : ''}
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}" 
                 target="_blank" 
                 style="flex: 1; padding: 8px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; text-decoration: none; border-radius: 6px; 
                        text-align: center; font-weight: 600; font-size: 13px; 
                        transition: transform 0.2s;">
                🧭 Directions
              </a>
              <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}" 
                 target="_blank" 
                 style="flex: 1; padding: 8px 12px; background: #f1f5f9; 
                        color: #475569; text-decoration: none; border-radius: 6px; 
                        text-align: center; font-weight: 600; font-size: 13px;">
                🔍 Search
              </a>
            </div>
          </div>
        `;

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: infoWindowContent,
        });

        // Open info window on marker click
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        // Auto-open info window
        if (showInfo) {
          infoWindow.open(map, marker);
        }

        setIsLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
  }, [location, latitude, longitude, zoom, description, showInfo, mapType]);

  // Change map type
  const handleMapTypeChange = (type: 'roadmap' | 'satellite' | 'terrain') => {
    setMapType(type);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(type);
    }
  };

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (mapInstanceRef.current) {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            mapInstanceRef.current.panTo(userLocation);
            
            // Add user location marker
            new window.google.maps.Marker({
              position: userLocation,
              map: mapInstanceRef.current,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
                scale: 8,
              },
              title: 'Your Location'
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 relative">
      {/* Header with location info */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{location}</h3>
              <p className="text-sm text-white/90 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Uttarakhand, India
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-all"
            title="Toggle info window"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-20 right-4 z-20 flex flex-col gap-2">
        {/* Map type selector */}
        <div className="bg-white rounded-lg shadow-lg p-2 space-y-1">
          <button
            onClick={() => handleMapTypeChange('roadmap')}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition-all ${
              mapType === 'roadmap'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🗺️ Map
          </button>
          <button
            onClick={() => handleMapTypeChange('satellite')}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition-all ${
              mapType === 'satellite'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => handleMapTypeChange('terrain')}
            className={`w-full px-3 py-2 rounded text-sm font-medium transition-all ${
              mapType === 'terrain'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⛰️ Terrain
          </button>
        </div>

        {/* Current location button */}
        <button
          onClick={handleGetCurrentLocation}
          className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-all group"
          title="Get current location"
        >
          <Compass className="w-5 h-5 text-blue-600 group-hover:rotate-180 transition-transform duration-500" />
        </button>

        {/* Navigation button */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${latitude || 30.0668},${longitude || 79.0193}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-all"
          title="Get directions"
        >
          <Navigation className="w-5 h-5" />
        </a>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-30">
          <div className="text-center">
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
              <Mountain className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-700 font-medium">Loading map...</p>
            <p className="text-gray-500 text-sm mt-1">Discovering Uttarakhand's beauty</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 z-30">
          <div className="text-center p-8 max-w-md">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Map Unavailable</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg 
                       hover:shadow-lg transition-all font-medium"
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapRef} className="w-full h-96" />

      {/* Footer info */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="font-medium">
              {latitude?.toFixed(4) || '30.0668'}, {longitude?.toFixed(4) || '79.0193'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Powered by</span>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Google Maps
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
