import React from 'react';
import MapView from '../common/MapView';

interface PlaceMapProps {
  placeName: string;
  latitude?: number;
  longitude?: number;
  nearbyPlaces?: string[];
}

const PlaceMap: React.FC<PlaceMapProps> = ({ placeName, latitude, longitude, nearbyPlaces = [] }) => {
  // Default coordinates for common Uttarakhand places
  const placeCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'dehradun': { lat: 30.3165, lng: 78.0322 },
    'rishikesh': { lat: 30.0869, lng: 78.2676 },
    'haridwar': { lat: 29.9457, lng: 78.1642 },
    'mussoorie': { lat: 30.4598, lng: 78.0644 },
    'nainital': { lat: 29.3803, lng: 79.4636 },
    'kedarnath': { lat: 30.7346, lng: 79.0669 },
    'badrinath': { lat: 30.7433, lng: 79.4938 },
    'auli': { lat: 30.5358, lng: 79.5967 },
    'jim corbett': { lat: 29.5308, lng: 78.7739 },
    'almora': { lat: 29.5971, lng: 79.6590 },
  };

  const coords = placeCoordinates[placeName.toLowerCase()] || { lat: latitude || 30.0668, lng: longitude || 79.0193 };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">📍 {placeName}</h3>
        <button
          onClick={() => {
            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName + ', Uttarakhand')}`, '_blank');
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span>🗺️</span>
          Open in Google Maps
        </button>
      </div>

      <MapView
        location={placeName}
        latitude={coords.lat}
        longitude={coords.lng}
        zoom={14}
      />

      {nearbyPlaces && nearbyPlaces.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <span>🧭</span>
            Nearby Places to Visit:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {nearbyPlaces.map((place, index) => (
              <button
                key={index}
                onClick={() => {
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place + ', Uttarakhand')}`, '_blank');
                }}
                className="px-3 py-2 bg-white text-green-700 rounded-lg text-sm border border-green-300 hover:bg-green-100 transition-colors text-left"
              >
                📍 {place}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">🚗 How to Reach:</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• <strong>By Air:</strong> Nearest airport - Jolly Grant Airport, Dehradun</p>
          <p>• <strong>By Train:</strong> Major railway stations - Haridwar, Dehradun, Kathgodam</p>
          <p>• <strong>By Road:</strong> Well connected by state and private buses</p>
        </div>
      </div>
    </div>
  );
};

export default PlaceMap;
