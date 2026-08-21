import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Hotel,
  Utensils,
  Luggage,
  Lightbulb
} from 'lucide-react';
import type { Itinerary } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  const totalCost = itinerary.days.reduce((sum, day) => sum + day.total_cost, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Your {itinerary.duration}-Day Itinerary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(itinerary.budget)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Estimated Cost</p>
            <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Duration</p>
            <p className="text-2xl font-bold">{itinerary.duration} Days</p>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {itinerary.days.map((day, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            {/* Day Header */}
            <div className="bg-blue-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    {day.date || `Day ${day.day}`}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(day.total_cost)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Places */}
              {day.places && day.places.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Places to Visit
                  </h4>
                  <div className="space-y-3">
                    {day.places.map((place, placeIndex) => (
                      <div
                        key={placeIndex}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-800">{place.name}</h5>
                          <span className="text-sm font-medium text-blue-600">
                            {formatCurrency(place.cost)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {place.time}
                          </span>
                        </div>
                        {place.description && (
                          <p className="text-sm text-gray-600">{place.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accommodation */}
              {day.accommodation && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hotel className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {day.accommodation.name}
                        </p>
                        <p className="text-sm text-gray-600">Accommodation</p>
                      </div>
                    </div>
                    <p className="font-bold text-blue-600">
                      {formatCurrency(day.accommodation.cost)}
                    </p>
                  </div>
                </div>
              )}

              {/* Meals */}
              {day.meals && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-800">Meals</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-gray-600">Breakfast</p>
                      <p className="font-medium text-gray-800">
                        {formatCurrency(day.meals.breakfast)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Lunch</p>
                      <p className="font-medium text-gray-800">
                        {formatCurrency(day.meals.lunch)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Dinner</p>
                      <p className="font-medium text-gray-800">
                        {formatCurrency(day.meals.dinner)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Packing List */}
      {itinerary.packing_list && itinerary.packing_list.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Luggage className="w-6 h-6 text-blue-600" />
            Packing List
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {itinerary.packing_list.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Travel Tips */}
      {itinerary.travel_tips && itinerary.travel_tips.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Travel Tips
          </h3>
          <div className="space-y-2">
            {itinerary.travel_tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDisplay;

