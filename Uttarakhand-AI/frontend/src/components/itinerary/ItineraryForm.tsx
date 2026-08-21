import React, { useState } from 'react';
import { Loader2, Calendar, DollarSign, MapPin, Heart } from 'lucide-react';
import { generateItinerary, getItinerarySuggestions, type ItineraryPreferences } from '../../services/api';
import ItineraryDisplay from './ItineraryDisplay';
import type { Itinerary } from '../../services/api';

const ItineraryForm: React.FC = () => {
  const [duration, setDuration] = useState(3);
  const [budget, setBudget] = useState(50000);
  const [interests, setInterests] = useState<string[]>([]);
  const [startLocation, setStartLocation] = useState('Dehradun');
  const [travelStyle, setTravelStyle] = useState('moderate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any>(null);

  React.useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await getItinerarySuggestions();
      if (response.success) {
        setSuggestions(response.suggestions);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  };

  const interestOptions = suggestions?.interests || [
    'Temples & Spirituality',
    'Trekking & Adventure',
    'Wildlife & Nature',
    'Hill Stations',
    'Yoga & Wellness',
    'Photography',
    'Local Culture'
  ];

  const travelStyleOptions = suggestions?.travel_styles || [
    'Budget',
    'Moderate',
    'Luxury',
    'Backpacker',
    'Family Friendly'
  ];

  const locationOptions = [
    'Dehradun',
    'Rishikesh',
    'Haridwar',
    'Mussoorie',
    'Nainital',
    'Almora',
    'Ranikhet',
    'Kedarnath',
    'Badrinath'
  ];

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleQuickSelect = (suggestion: any) => {
    setDuration(suggestion.duration);
    setBudget(suggestion.budget);
    setInterests([suggestion.description]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setItinerary(null);

    try {
      const preferences: ItineraryPreferences = {
        duration,
        budget,
        interests,
        start_location: startLocation,
        travel_style: travelStyle.toLowerCase(),
        language: 'english'
      };

      const response = await generateItinerary(preferences);
      if (response.success && response.itinerary) {
        setItinerary(response.itinerary);
      } else {
        throw new Error(response.message || 'Failed to generate itinerary');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate itinerary. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (itinerary) {
    return (
      <div>
        <button
          onClick={() => {
            setItinerary(null);
            setError(null);
          }}
          className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Back to Form
        </button>
        <ItineraryDisplay itinerary={itinerary} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4 shadow-lg">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Plan Your Journey</h2>
        <p className="text-gray-600">Create a personalized itinerary for your Uttarakhand adventure</p>
      </div>

      {/* Quick Suggestions */}
      {suggestions?.quick_trips && suggestions.quick_trips.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✨</span>
            <h3 className="text-lg font-bold text-gray-800">Quick Trip Suggestions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.quick_trips.map((trip: any, index: number) => (
              <button
                key={index}
                onClick={() => handleQuickSelect(trip)}
                className="text-left p-4 bg-white rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all transform hover:-translate-y-1 group"
              >
                <p className="font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">{trip.name}</p>
                <p className="text-sm text-gray-600 mb-2">{trip.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {trip.duration} days
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    ₹{trip.budget.toLocaleString()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
        {/* Duration & Budget - Side by Side */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Duration */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              Duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-purple-50/50"
              required
            />
          </div>

          {/* Budget */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              Budget (₹)
            </label>
            <input
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-purple-50/50"
              required
            />
          </div>
        </div>

        {/* Start Location & Travel Style - Side by Side */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Start Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              Start Location
            </label>
            <select
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-purple-50/50"
              required
            >
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Travel Style */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✈️</span>
              </div>
              Travel Style
            </label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-purple-50/50"
              required
            >
              {travelStyleOptions.map((style: string) => (
                <option key={style} value={style.toLowerCase()}>
                  {style}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            Interests (Select at least one)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {interestOptions.map((interest: string) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`px-4 py-3 rounded-xl border-2 transition-all font-medium transform hover:scale-105 ${
                  interests.includes(interest)
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600 shadow-lg'
                    : 'bg-white text-gray-700 border-purple-200 hover:border-purple-400 hover:shadow-md'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating || interests.length === 0}
          className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Generating Your Perfect Itinerary...</span>
            </>
          ) : (
            <>
              <Calendar className="w-6 h-6" />
              <span>Generate My Itinerary</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ItineraryForm;

