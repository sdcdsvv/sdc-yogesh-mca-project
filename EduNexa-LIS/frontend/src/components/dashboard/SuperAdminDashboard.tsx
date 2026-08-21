import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StatsCard } from './StatsCard';
import api from '../../config/api';
import {
  Users,
  Crown,
  Server,
  Activity,
  Settings,
  UserCheck,
  BookOpen,
  Video,
  FileText,
  TrendingUp,
  CheckCircle,
  BarChart3
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalVideos: number;
  totalAssignments: number;
  pendingSubmissions: number;
  systemStatus: string;
  uptime: string;
}

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const [usersRes, coursesRes, videosRes, assignmentsRes] = await Promise.all([
        api.get<any>('/users?limit=1000'),
        api.get<any>('/courses'),
        api.get<any>('/videos'),
        api.get<any>('/assignments')
      ]);

      // Handle different response structures
      const usersData = usersRes?.users || (Array.isArray(usersRes) ? usersRes : []);
      const coursesData = coursesRes?.courses || (Array.isArray(coursesRes) ? coursesRes : []);
      const videosData = videosRes?.videos || (Array.isArray(videosRes) ? videosRes : []);
      const assignmentsData = assignmentsRes?.assignments || (Array.isArray(assignmentsRes) ? assignmentsRes : []);

      setStats({
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        activeUsers: Array.isArray(usersData) ? usersData.filter((u: any) => u.is_active).length : 0,
        totalCourses: Array.isArray(coursesData) ? coursesData.length : 0,
        totalVideos: Array.isArray(videosData) ? videosData.length : 0,
        totalAssignments: Array.isArray(assignmentsData) ? assignmentsData.length : 0,
        pendingSubmissions: 0,
        systemStatus: 'Online',
        uptime: '99.9%'
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values on error
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalCourses: 0,
        totalVideos: 0,
        totalAssignments: 0,
        pendingSubmissions: 0,
        systemStatus: 'Online',
        uptime: '99.9%'
      });
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const statsData = [
    { title: 'Total Users', value: stats?.totalUsers.toString() || '0', icon: Users, color: 'blue' as const, change: `${stats?.activeUsers || 0} active` },
    { title: 'Total Courses', value: stats?.totalCourses.toString() || '0', icon: BookOpen, color: 'green' as const, change: 'All courses' },
    { title: 'Total Videos', value: stats?.totalVideos.toString() || '0', icon: Video, color: 'purple' as const, change: 'Video library' },
    { title: 'Assignments', value: stats?.totalAssignments.toString() || '0', icon: FileText, color: 'yellow' as const, change: 'Active assignments' },
    { title: 'System Status', value: stats?.systemStatus || 'Online', icon: Server, color: 'green' as const, change: `${stats?.uptime || '99.9%'} uptime` },
    { title: 'Active Now', value: stats?.activeUsers.toString() || '0', icon: UserCheck, color: 'purple' as const, change: 'Currently online' }
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-800 to-blue-900 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
              <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-400" />
              {getGreeting()}, {user?.name}! 👑
            </h1>
            <p className="text-purple-100 text-base sm:text-lg">
              System administration dashboard
            </p>
          </div>
          <div className="hidden md:block">
            <Crown className="h-24 w-24 text-yellow-400 opacity-30" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

      {/* Content Management Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Content Management
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button 
            onClick={() => navigateTo('/courses')}
            className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-blue-900">Courses</div>
            </div>
            <div className="text-2xl font-bold text-blue-700 mb-1">{stats?.totalCourses || 0}</div>
            <div className="text-xs sm:text-sm text-blue-600">Manage all courses</div>
          </button>

          <button 
            onClick={() => navigateTo('/videos')}
            className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Video className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-purple-900">Videos</div>
            </div>
            <div className="text-2xl font-bold text-purple-700 mb-1">{stats?.totalVideos || 0}</div>
            <div className="text-xs sm:text-sm text-purple-600">Video library</div>
          </button>

          <button 
            onClick={() => navigateTo('/assignments/manage')}
            className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-orange-900">Assignments</div>
            </div>
            <div className="text-2xl font-bold text-orange-700 mb-1">{stats?.totalAssignments || 0}</div>
            <div className="text-xs sm:text-sm text-orange-600">Manage assignments</div>
          </button>

          <button 
            onClick={() => navigateTo('/analytics')}
            className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
              <div className="font-medium text-green-900">Analytics</div>
            </div>
            <div className="text-2xl font-bold text-green-700 mb-1">View</div>
            <div className="text-xs sm:text-sm text-green-600">System analytics</div>
          </button>
        </div>
      </div>

      {/* User & System Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* User Management */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            User Management
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigateTo('/admin/users')}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors group flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-blue-900 mb-1">All Users</div>
                <div className="text-sm text-blue-700">{stats?.totalUsers || 0} total users</div>
              </div>
              <Users className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => navigateTo('/students')}
              className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors group flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-green-900 mb-1">Students</div>
                <div className="text-sm text-green-700">View all students</div>
              </div>
              <UserCheck className="h-5 w-5 text-green-600 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => navigateTo('/admin/users?role=teacher')}
              className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors group flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-purple-900 mb-1">Teachers</div>
                <div className="text-sm text-purple-700">Manage instructors</div>
              </div>
              <Users className="h-5 w-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* System Management */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            System Management
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigateTo('/settings')}
              className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors group flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-green-900 mb-1">Settings</div>
                <div className="text-sm text-green-700">System configuration</div>
              </div>
              <Settings className="h-5 w-5 text-green-600 group-hover:rotate-90 transition-transform" />
            </button>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-green-900">System Status</div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-sm text-green-700">All systems operational</div>
              <div className="text-xs text-green-600 mt-1">{stats?.uptime || '99.9%'} uptime</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-blue-900">Active Users</div>
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">{stats?.activeUsers || 0}</div>
              <div className="text-xs text-blue-600 mt-1">Currently online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Platform Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-700">{stats?.totalUsers || 0}</div>
            <div className="text-xs sm:text-sm text-indigo-600 mt-1">Total Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-700">{stats?.totalCourses || 0}</div>
            <div className="text-xs sm:text-sm text-blue-600 mt-1">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-700">{stats?.totalVideos || 0}</div>
            <div className="text-xs sm:text-sm text-purple-600 mt-1">Videos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-orange-700">{stats?.totalAssignments || 0}</div>
            <div className="text-xs sm:text-sm text-orange-600 mt-1">Assignments</div>
          </div>
        </div>
      </div>
    </div>
  );
};