/**
 * Activity Dashboard
 * Shows usage summary, statistics, and analytics
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  Activity as ActivityIcon,
  Zap,
  Sparkles
} from 'lucide-react';
import { activityService, UsageSummary } from '../../services/activity';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import type { Language } from '../../types';
import { commonTranslations } from '../../utils/translations';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`${color} rounded-xl p-3 text-white`}>
        {icon}
      </div>
    </div>
    <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-gray-600 font-medium">{title}</p>
    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

interface ActivityDashboardProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({ language = 'english', onLanguageChange }) => {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [timeRange, setTimeRange] = useState(30);
  const t = commonTranslations[language];

  useEffect(() => {
    loadSummary();
  }, [timeRange]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading activity summary for', timeRange, 'days...');
      const response = await activityService.getSummary(timeRange);
      console.log('Activity summary response:', response);
      if (response.success) {
        setSummary(response.data);
        console.log('Summary data:', response.data);
      } else {
        console.error('Failed response:', response);
        setError('Failed to load activity data');
      }
    } catch (error: any) {
      console.error('Failed to load summary - Full error:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      setError(error?.response?.data?.error || error?.message || 'Failed to load activity data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const testActivityLogging = async () => {
    try {
      console.log('Testing activity logging...');
      const testActivity = {
        service_type: 'chat',
        action: 'test_message',
        details: {
          description: 'Test activity from dashboard'
        },
        request_data: {
          test: true
        },
        response_data: {
          success: true
        },
        metadata: {
          timestamp: new Date().toISOString()
        }
      };
      
      const response = await activityService.logActivity(testActivity);
      console.log('Test activity logged:', response);
      
      if (response.success) {
        alert('Test activity logged successfully! Refreshing data...');
        await loadSummary();
      }
    } catch (error: any) {
      console.error('Failed to log test activity:', error);
      alert('Failed to log test activity: ' + (error?.response?.data?.error || error?.message));
    }
  };

  const getServiceLabel = (type: string): string => {
    const labels: Record<string, string> = {
      itinerary: 'Itinerary Generation',
      vision: 'Image Analysis',
      chat: 'Chat Conversations',
      emergency: 'Emergency Lookups',
      weather: 'Weather Queries',
      places: 'Place Information',
      translation: 'Translations'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Navbar currentLanguage={language} onLanguageChange={onLanguageChange} />
        <div className="flex-1 flex items-center justify-center pt-40">
          <div className="text-center">
            <div className="inline-block w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl text-stone-700 font-semibold">Loading Dashboard...</p>
            <p className="text-sm text-stone-500 mt-2">Fetching your activity data</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navbar currentLanguage={language} onLanguageChange={onLanguageChange} />
      
      {/* Hero Section */}
      <div className="relative pt-40 pb-16 bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 overflow-hidden">
        {/* Mountain Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="activity-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 10 L50 40 L10 40 Z" fill="currentColor" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#activity-pattern)"/>
          </svg>
        </div>

        <div className="container mx-auto px-6 max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6 border border-white/20">
            <Sparkles className="w-4 h-4" />
            <span>Usage Analytics</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            Activity Dashboard
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            Your service usage insights and analytics
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-start gap-4 animate-fadeIn">
              <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-700 text-xl font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-bold text-lg mb-1">Unable to Load Data</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={loadSummary}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Time Range Selector */}
          <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-stone-800">Your Activity Overview</h2>
              <p className="text-stone-600 text-sm mt-1">Track your service usage and performance</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={testActivityLogging}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                Test Activity
              </button>
              <label className="text-sm font-semibold text-stone-700">Time Period:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-4 py-2.5 border-2 border-stone-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-stone-700 transition-all"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Activities"
              value={summary?.total_activities || 0}
              icon={<ActivityIcon className="w-6 h-6" />}
              color="bg-gradient-to-br from-emerald-600 to-teal-600"
              subtitle={`in ${timeRange} days`}
            />
            
            <StatsCard
              title="Services Used"
              value={summary?.services.length || 0}
              icon={<Zap className="w-6 h-6" />}
              color="bg-gradient-to-br from-sky-600 to-blue-600"
              subtitle="different services"
            />
            
            <StatsCard
              title="Most Used"
              value={summary?.most_used_service ? getServiceLabel(summary.most_used_service).split(' ')[0] : 'N/A'}
              icon={<TrendingUp className="w-6 h-6" />}
              color="bg-gradient-to-br from-amber-600 to-orange-600"
              subtitle="popular service"
            />
            
            <StatsCard
              title="Avg Response"
              value={
                summary?.services.length 
                  ? formatDuration(summary.services.reduce((acc, s) => acc + s.avg_duration, 0) / summary.services.length)
                  : 'N/A'
              }
              icon={<Clock className="w-6 h-6" />}
              color="bg-gradient-to-br from-stone-600 to-slate-600"
              subtitle="average time"
            />
          </div>

          {/* Service Breakdown */}
          {summary && summary.services.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-stone-200">
              <h2 className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
                Service Usage Breakdown
              </h2>

              <div className="space-y-6">
                {summary.services.map((service, index) => {
                  const percentage = (service.count / summary.total_activities) * 100;
                  const colors = [
                    'bg-emerald-500',
                    'bg-sky-500',
                    'bg-amber-500',
                    'bg-teal-500',
                    'bg-orange-500',
                    'bg-blue-500',
                    'bg-green-500'
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div key={service._id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${color}`}></div>
                          <span className="font-semibold text-stone-800">
                            {getServiceLabel(service._id)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-stone-800">{service.count}</span>
                          <span className="text-stone-500 text-sm ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="mt-2 flex items-center gap-6 text-sm text-stone-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Avg: {formatDuration(service.avg_duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Last used: {new Date(service.last_used).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!error && (!summary || summary.total_activities === 0) && (
            <div className="bg-gradient-to-br from-white to-stone-50 rounded-2xl shadow-xl p-16 text-center border-2 border-stone-200">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ActivityIcon className="w-16 h-16 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-stone-800 mb-3">
                No Activity Yet
              </h3>
              <p className="text-lg text-stone-600 max-w-xl mx-auto mb-8">
                Start using our AI-powered services to see your activity stats and insights here. 
                Try generating an itinerary, analyzing an image, or chatting with our AI guide!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/services"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Explore Services
                </a>
                <button
                  onClick={loadSummary}
                  className="px-6 py-3 bg-white text-stone-700 rounded-xl font-semibold border-2 border-stone-300 hover:border-stone-400 hover:bg-stone-50 transition-all shadow-lg"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ActivityDashboard;
