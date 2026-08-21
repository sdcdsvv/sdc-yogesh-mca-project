/**
 * Recent Activities Widget
 * Compact widget showing recent user activities
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Activity as ActivityIcon,
  ChevronRight,
  Image,
  MessageSquare,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { activityService, Activity } from '../../services/activity';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const serviceIcons: Record<string, React.ReactNode> = {
  itinerary: <MapPin className="w-4 h-4" />,
  vision: <Image className="w-4 h-4" />,
  chat: <MessageSquare className="w-4 h-4" />,
  emergency: <AlertCircle className="w-4 h-4" />
};

const serviceColors: Record<string, string> = {
  itinerary: 'bg-blue-500',
  vision: 'bg-purple-500',
  chat: 'bg-green-500',
  emergency: 'bg-red-500',
  weather: 'bg-cyan-500',
  places: 'bg-orange-500'
};

interface RecentActivitiesProps {
  limit?: number;
  compact?: boolean;
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  limit = 5, 
  compact = false 
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [limit]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await activityService.getRecent(limit);
      if (response.success) {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.error('Failed to load recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <Link 
          to="/activity/history"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Activities List */}
      <div className={compact ? 'p-4' : 'p-6'}>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <ActivityIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No recent activities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity._id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Icon */}
                <div className={`${serviceColors[activity.service_type] || 'bg-gray-500'} rounded-lg p-2 text-white flex-shrink-0`}>
                  {serviceIcons[activity.service_type] || <ActivityIcon className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.details.description || activity.action}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    activity.status === 'success' 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;
