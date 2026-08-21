import React, { useState, useEffect } from 'react';
import { learnerAnalyticsAPI } from '../../config/api';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Users,
  Clock,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface LearnerInsightsProps {
  className?: string;
}

const LearnerInsights: React.FC<LearnerInsightsProps> = ({ className = '' }) => {
  const [insights, setInsights] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const [analysisData, alertsData] = await Promise.all([
        learnerAnalyticsAPI.getPerformanceAnalysis(),
        learnerAnalyticsAPI.getPerformanceAlerts()
      ]);
      setInsights(analysisData.summary);
      setAlerts(alertsData.alerts.slice(0, 3)); // Show only top 3 alerts
    } catch (error) {
      console.error('Failed to fetch learner insights:', error);
      // Set fallback data
      setInsights({
        slow_learners_count: 0,
        fast_learners_count: 0,
        students_at_risk: 0,
        total_students: 0,
        average_performance: 0,
        inactive_students: 0
      });
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && !insights) {
    return (
      <div className={`bg-white rounded-lg shadow border p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow border ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Learner Insights</h3>
          <button
            onClick={fetchInsights}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {insights ? (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{insights.slow_learners_count}</p>
                <p className="text-sm text-red-700">Slow Learners</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{insights.fast_learners_count}</p>
                <p className="text-sm text-green-700">Fast Learners</p>
              </div>
            </div>

            {/* At Risk Students */}
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Students at Risk</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mb-1">{insights.students_at_risk}</p>
              <p className="text-sm text-yellow-700">
                out of {insights.total_students} total students
              </p>
            </div>

            {/* Performance Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Average Performance</span>
                <span className="font-medium text-gray-900">{insights.average_performance}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${insights.average_performance}%` }}
                ></div>
              </div>
            </div>

            {/* Recent Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                  Recent Alerts
                </h4>
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-sm ${getSeverityColor(alert.severity)}`}
                    >
                      <p className="font-medium">{alert.student_name}</p>
                      <p className="opacity-75">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Students */}
            {insights.inactive_students > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-800">Inactive Students</span>
                </div>
                <p className="text-lg font-bold text-gray-600 mb-1">{insights.inactive_students}</p>
                <p className="text-sm text-gray-600">Haven't logged in recently</p>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  console.log('Navigating to learner analytics from dashboard...');
                  window.location.href = '/analytics/learners';
                }}
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>View Detailed Analytics</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No learner data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerInsights;