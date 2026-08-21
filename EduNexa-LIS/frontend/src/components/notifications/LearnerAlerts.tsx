import React, { useState, useEffect } from 'react';
import { learnerAnalyticsAPI } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  AlertTriangle,
  TrendingDown,
  Clock,
  User,
  CheckCircle
} from 'lucide-react';

interface Alert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  student_id: string;
  student_name: string;
  message: string;
  created_at: string;
}

interface LearnerAlertsProps {
  className?: string;
}

const LearnerAlerts: React.FC<LearnerAlertsProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const fetchAlerts = async () => {
    if (!user || !['teacher', 'super_admin'].includes(user.role)) return;
    
    setLoading(true);
    try {
      const response = await learnerAnalyticsAPI.getPerformanceAlerts() as { alerts: Alert[] };
      setAlerts(response.alerts || []);
    } catch (error) {
      console.error('Failed to fetch learner alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Set up polling for new alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'inactive':
        return <Clock className="h-4 w-4" />;
      case 'academic':
        return <TrendingDown className="h-4 w-4" />;
      case 'performance':
        return <AlertTriangle className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const visibleAlerts = alerts.filter((alert) => {
    const alertKey = `${alert.student_id}-${alert.type}-${alert.created_at}`;
    return !dismissedAlerts.has(alertKey);
  });

  const highPriorityAlerts = visibleAlerts.filter(alert => alert.severity === 'high');
  const hasUnreadAlerts = visibleAlerts.length > 0;

  if (!user || !['teacher', 'super_admin'].includes(user.role)) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Student Alerts Button - Using AlertTriangle icon to distinguish from notifications */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          hasUnreadAlerts 
            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        title="Student Performance Alerts"
      >
        <AlertTriangle className="h-5 w-5" />
        {hasUnreadAlerts && (
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
            {visibleAlerts.length > 9 ? '9+' : visibleAlerts.length}
          </span>
        )}
      </button>

      {/* Alerts Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Student Alerts</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {highPriorityAlerts.length > 0 && (
              <p className="text-sm text-red-600 mt-1">
                {highPriorityAlerts.length} high priority alert{highPriorityAlerts.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading alerts...</p>
              </div>
            ) : visibleAlerts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {visibleAlerts.map((alert) => {
                  const alertKey = `${alert.student_id}-${alert.type}-${alert.created_at}`;
                  return (
                    <div
                      key={alertKey}
                      className={`p-4 border-l-4 ${
                        alert.severity === 'high' ? 'border-red-500' :
                        alert.severity === 'medium' ? 'border-yellow-500' :
                        'border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {alert.student_name}
                              </p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(alert.created_at).toLocaleDateString()} • {alert.type}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDismissedAlerts(prev => new Set([...prev, alertKey]));
                          }}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                          title="Dismiss alert"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No active alerts</p>
                <p className="text-sm text-gray-500 mt-1">All students are performing well!</p>
              </div>
            )}
          </div>

          {visibleAlerts.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={fetchAlerts}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  Refresh
                </button>
                <button
                  onClick={() => {
                    console.log('Navigating to learner analytics...');
                    setIsOpen(false);
                    window.history.pushState({}, '', '/analytics/learners');
                    // Force a page refresh to ensure the route is loaded
                    window.location.href = '/analytics/learners';
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Analytics →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating High Priority Alert */}
      {highPriorityAlerts.length > 0 && !isOpen && (
        <div className="fixed top-20 right-4 z-40 max-w-sm">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">
                  High Priority Student Alert
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  {highPriorityAlerts.length} student{highPriorityAlerts.length !== 1 ? 's' : ''} need{highPriorityAlerts.length === 1 ? 's' : ''} immediate attention
                </p>
                <button
                  onClick={() => setIsOpen(true)}
                  className="text-sm text-red-600 hover:text-red-700 font-medium mt-2"
                >
                  View Details →
                </button>
              </div>
              <button
                onClick={() => setDismissedAlerts(prev => {
                  const newSet = new Set(prev);
                  highPriorityAlerts.forEach(alert => {
                    const alertKey = `${alert.student_id}-${alert.type}-${alert.created_at}`;
                    newSet.add(alertKey);
                  });
                  return newSet;
                })}
                className="text-red-400 hover:text-red-600 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerAlerts;