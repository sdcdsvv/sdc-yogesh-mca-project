import React from 'react';
import MapView from '../common/MapView';

interface Place {
  name: string;
  latitude?: number;
  longitude?: number;
}

interface ItineraryMapProps {
  places: Place[];
  selectedPlace?: Place;
}

const ItineraryMap: React.FC<ItineraryMapProps> = ({ places, selectedPlace }) => {
  const defaultPlace = selectedPlace || places[0] || { name: 'Dehradun', latitude: 30.3165, longitude: 78.0322 };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          📍 Location: {defaultPlace.name}
        </h3>
        <button
          onClick={() => {
            const lat = defaultPlace.latitude || 30.3165;
            const lng = defaultPlace.longitude || 78.0322;
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Get Directions
        </button>
      </div>

      <MapView
        location={defaultPlace.name}
        latitude={defaultPlace.latitude}
        longitude={defaultPlace.longitude}
        zoom={13}
      />

      {places.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">All Destinations:</h4>
          <div className="flex flex-wrap gap-2">
            {places.map((place, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm border border-blue-300"
              >
                {place.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryMap;
