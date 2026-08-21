/**
 * Activity History Page
 * Shows user's complete service usage history
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  TrendingUp, 
  Filter, 
  Calendar,
  Activity as ActivityIcon,
  Image,
  MessageSquare,
  AlertCircle,
  MapPin,
  Cloud,
  Globe,
  Sparkles
} from 'lucide-react';
import { activityService, Activity } from '../../services/activity';
import { formatDistanceToNow } from 'date-fns';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import type { Language } from '../../types';

const serviceIcons: Record<string, React.ReactNode> = {
  itinerary: <MapPin className="w-5 h-5" />,
  vision: <Image className="w-5 h-5" />,
  chat: <MessageSquare className="w-5 h-5" />,
  emergency: <AlertCircle className="w-5 h-5" />,
  weather: <Cloud className="w-5 h-5" />,
  places: <Globe className="w-5 h-5" />,
  translation: <Globe className="w-5 h-5" />
};

const serviceColors: Record<string, string> = {
  itinerary: 'bg-gradient-to-br from-amber-600 to-orange-600',
  vision: 'bg-gradient-to-br from-sky-600 to-blue-600',
  chat: 'bg-gradient-to-br from-emerald-600 to-teal-600',
  emergency: 'bg-gradient-to-br from-stone-600 to-slate-600',
  weather: 'bg-gradient-to-br from-cyan-600 to-blue-600',
  places: 'bg-gradient-to-br from-orange-600 to-red-600',
  translation: 'bg-gradient-to-br from-pink-600 to-purple-600'
};

interface ActivityHistoryProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ language = 'english', onLanguageChange }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<number>(30);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const limit = 20;

  useEffect(() => {
    loadActivities();
  }, [filter, timeRange, page]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {
        limit,
        skip: page * limit,
        days: timeRange
      };

      if (filter !== 'all') {
        params.service_type = filter;
      }

      console.log('Loading activities with params:', params);
      const response = await activityService.getHistory(params);
      console.log('Activity history response:', response);
      
      if (response.success) {
        setActivities(response.data.activities);
        setHasMore(response.data.count === limit);
        console.log('Loaded activities:', response.data.activities.length);
      } else {
        console.error('Failed response:', response);
        setError('Failed to load activity history');
      }
    } catch (error: any) {
      console.error('Failed to load activities - Full error:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      setError(error?.response?.data?.error || error?.message || 'Failed to load activity history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getServiceLabel = (type: string): string => {
    const labels: Record<string, string> = {
      itinerary: 'Itinerary',
      vision: 'Image Analysis',
      chat: 'Chat',
      emergency: 'Emergency',
      weather: 'Weather',
      places: 'Places',
      translation: 'Translation'
    };
    return labels[type] || type;
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar currentLanguage={language} onLanguageChange={onLanguageChange} />
      
      {/* Hero Section */}
      <div className="relative pt-40 pb-16 bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 overflow-hidden">
        {/* Mountain Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="history-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 10 L50 40 L10 40 Z" fill="currentColor" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#history-pattern)"/>
          </svg>
        </div>

        <div className="container mx-auto px-6 max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6 border border-white/20">
            <Sparkles className="w-4 h-4" />
            <span>Service History</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            Activity History
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Track your service usage and explore your journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-16">
        <div className="container mx-auto px-6 max-w-6xl">

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-stone-200">
            <div className="flex flex-wrap gap-4">
              {/* Service Type Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Service Type
                </label>
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">All Services</option>
                  <option value="itinerary">Itinerary</option>
                  <option value="vision">Image Analysis</option>
                  <option value="chat">Chat</option>
                  <option value="emergency">Emergency</option>
                  <option value="weather">Weather</option>
                  <option value="places">Places</option>
                </select>
              </div>

              {/* Time Range Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Time Range
                </label>
                <select
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(Number(e.target.value));
                    setPage(0);
                  }}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                  <option value={365}>Last year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-4 animate-fadeIn">
              <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-700 text-xl font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-bold text-lg mb-1">Unable to Load History</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={loadActivities}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Activity List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xl text-stone-700 font-semibold">Loading Activities...</p>
                <p className="text-sm text-stone-500 mt-2">Fetching your activity history</p>
              </div>
            ) : !error && activities.length === 0 ? (
              <div className="bg-gradient-to-br from-white to-stone-50 rounded-2xl shadow-xl p-16 text-center border-2 border-stone-200">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ActivityIcon className="w-16 h-16 text-emerald-600" />
                </div>
                <h3 className="text-3xl font-bold text-stone-800 mb-3">
                  No Activities Found
                </h3>
                <p className="text-lg text-stone-600 max-w-xl mx-auto mb-8">
                  {filter !== 'all' 
                    ? `No ${filter} activities found for the selected time period. Try changing the filters.`
                    : 'Start using our services to see your activity history here. Try generating an itinerary or analyzing an image!'
                  }
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href="/services"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Explore Services
                  </a>
                  {filter !== 'all' && (
                    <button
                      onClick={() => {
                        setFilter('all');
                        setPage(0);
                      }}
                      className="px-6 py-3 bg-white text-stone-700 rounded-xl font-semibold border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 transition-all shadow-lg"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            ) : !error && (
              <>
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-stone-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`${serviceColors[activity.service_type] || 'bg-gradient-to-br from-stone-600 to-slate-600'} rounded-lg p-3 text-white shadow-md`}>
                        {serviceIcons[activity.service_type] || <ActivityIcon className="w-5 h-5" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-stone-800">
                              {getServiceLabel(activity.service_type)}
                            </h3>
                            <p className="text-sm text-stone-600">
                              {activity.details.description || activity.action}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-sm text-stone-500">
                              <Clock className="w-4 h-4" />
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </div>
                            {activity.duration_ms > 0 && (
                              <div className="text-xs text-stone-400 mt-1">
                                <TrendingUp className="w-3 h-3 inline mr-1" />
                                {formatDuration(activity.duration_ms)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        {Object.keys(activity.details).length > 1 && (
                          <div className="mt-3 pt-3 border-t border-stone-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {Object.entries(activity.details).map(([key, value]) => {
                                if (key === 'description') return null;
                                return (
                                  <div key={key} className="flex gap-2">
                                    <span className="font-medium text-stone-700 capitalize">
                                      {key.replace(/_/g, ' ')}:
                                    </span>
                                    <span className="text-stone-600">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="mt-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            activity.status === 'success' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : activity.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {(page > 0 || hasMore) && (
                  <div className="flex justify-center gap-4 mt-8">
                    {page > 0 && (
                      <button
                        onClick={() => setPage(page - 1)}
                        className="px-6 py-3 bg-white text-emerald-700 rounded-lg shadow-md hover:shadow-lg transition-all font-semibold border-2 border-emerald-200 hover:border-emerald-300"
                      >
                        Previous
                      </button>
                    )}
                    {hasMore && (
                      <button
                        onClick={() => setPage(page + 1)}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-semibold"
                      >
                        Next
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ActivityHistory;
