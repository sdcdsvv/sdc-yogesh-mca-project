import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatsCard } from './StatsCard';
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Brain,
  Shield,
  Settings,
  BarChart3,
  Activity,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statsData = [
    { title: 'Total Users', value: '1,247', icon: Users, color: 'blue' as const, change: '+12% this month' },
    { title: 'Active Courses', value: '89', icon: BookOpen, color: 'green' as const, change: '+5 new courses' },
    { title: 'System Health', value: '98.5%', icon: Activity, color: 'purple' as const, change: 'All systems operational' },
    { title: 'Revenue', value: '$24,580', icon: TrendingUp, color: 'yellow' as const, change: '+18% this month' }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.name}! 🛡️
            </h1>
            <p className="text-indigo-100 text-lg mb-4">
              System overview and administrative controls at your fingertips
            </p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>1,247 Total Users</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>89 Active Courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>System Secure</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <Shield className="h-24 w-24 text-white opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType="positive"
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-blue-900">Manage Users</span>
          </button>
          <button className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-green-900">Course Approval</span>
          </button>
          <button className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-purple-900">Analytics</span>
          </button>
          <button className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg text-center transition-colors">
            <Settings className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-yellow-900">System Settings</span>
          </button>
        </div>
      </div>

      {/* AI System Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI System Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">User Engagement</h4>
            <p className="text-sm text-gray-600 mb-3">Student engagement increased by 23% this week</p>
            <a href="#" className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View Details →
            </a>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Performance Trends</h4>
            <p className="text-sm text-gray-600 mb-3">Course completion rates are trending upward</p>
            <a href="#" className="text-purple-600 text-sm font-medium hover:text-purple-700">
              Analyze Trends →
            </a>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">System Optimization</h4>
            <p className="text-sm text-gray-600 mb-3">AI suggests 3 performance improvements</p>
            <a href="#" className="text-green-600 text-sm font-medium hover:text-green-700">
              Apply Suggestions →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};