import React from 'react';
import {
  MapPin,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Info,
  Mountain
} from 'lucide-react';
import PlaceMap from './PlaceMap';
import type { VisionAnalysisResponse } from '../../types/place';

interface PlaceInfoProps {
  result: VisionAnalysisResponse;
  imageUrl?: string;
}

const PlaceInfo: React.FC<PlaceInfoProps> = ({ result, imageUrl }) => {
  if (!result.success || !result.data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        <p>{result.message || 'Failed to analyze image'}</p>
      </div>
    );
  }

  const data = result.data;
  const isIdentified = result.identified;

  const getCrowdLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Mountain className="w-6 h-6" />
              <h2 className="text-2xl font-bold">{data.name || 'Unknown Place'}</h2>
            </div>
            {isIdentified ? (
              <span className="inline-block px-3 py-1 bg-green-500 rounded-full text-sm font-medium">
                ✓ Identified
              </span>
            ) : (
              <span className="inline-block px-3 py-1 bg-yellow-500 rounded-full text-sm font-medium">
                ⚠ Estimated
              </span>
            )}
          </div>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={data.name}
              className="w-24 h-24 rounded-lg object-cover shadow-md"
            />
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Description */}
        {data.description && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">{data.description}</p>
          </div>
        )}

        {/* History */}
        {data.history && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              History
            </h3>
            <p className="text-gray-600 leading-relaxed">{data.history}</p>
          </div>
        )}

        {/* Best Time to Visit */}
        {data.best_time_to_visit && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-800">Best Time to Visit</p>
              <p className="text-gray-600">{data.best_time_to_visit}</p>
            </div>
          </div>
        )}

        {/* Crowd Level */}
        {data.crowd_level && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <Users className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">Crowd Level</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getCrowdLevelColor(
                  data.crowd_level
                )}`}
              >
                {data.crowd_level}
              </span>
            </div>
          </div>
        )}

        {/* Nearby Places */}
        {data.nearby_places && data.nearby_places.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Nearby Places
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.nearby_places.map((place, index) => (
                <div
                  key={index}
                  className="p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <p className="text-gray-700">{place}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Do's and Don'ts */}
        {data.dos_and_donts && data.dos_and_donts.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Do's & Don'ts
            </h3>
            <div className="space-y-2">
              {data.dos_and_donts.map((item, index) => {
                const isDo = item.toLowerCase().startsWith('do') || item.toLowerCase().includes('should');
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      isDo
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    {isDo ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-gray-700">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Map */}
        {data.name && (
          <div>
            <PlaceMap
              placeName={data.name}
              nearbyPlaces={data.nearby_places}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceInfo;

