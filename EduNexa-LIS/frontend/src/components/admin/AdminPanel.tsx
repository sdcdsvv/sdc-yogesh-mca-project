import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  BookOpen,
  Video,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Shield,
  TrendingUp,
  Activity,
  Database,
  Download,
  Upload,
  RefreshCw,
  Crown,
  AlertCircle,
  CheckCircle,
  Clock,
  UserCheck,
  GraduationCap
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  totalVideos: number;
  totalAssignments: number;
  pendingSubmissions: number;
  systemHealth: string;
  storageUsed: string;
  activeUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'course' | 'assignment' | 'video' | 'enrollment';
  message: string;
  timestamp: string;
  user?: string;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}

export const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchAdminStats(),
      fetchRecentActivities(),
      fetchSystemAlerts()
    ]);
    setLoading(false);
  };

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Fetch user stats
      const userResponse = await fetch('http://192.160.108.56:5010/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let userData = { total_users: 0, students: 0, teachers: 0, admins: 0 };
      if (userResponse.ok) {
        userData = await userResponse.json();
      }

      // Fetch courses
      const coursesResponse = await fetch('http://192.160.108.56:5010/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let coursesData = [];
      if (coursesResponse.ok) {
        coursesData = await coursesResponse.json();
      }

      // Fetch videos
      const videosResponse = await fetch('http://192.160.108.56:5010/api/videos/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let videosData = [];
      if (videosResponse.ok) {
        videosData = await videosResponse.json();
      }

      setStats({
        totalUsers: userData.total_users || 0,
        totalStudents: userData.students || 0,
        totalTeachers: userData.teachers || 0,
        totalAdmins: userData.admins || 1,
        totalCourses: coursesData.length || 0,
        activeCourses: coursesData.filter((c: any) => c.is_active).length || 0,
        totalEnrollments: 0,
        totalVideos: videosData.length || 0,
        totalAssignments: 0,
        pendingSubmissions: 0,
        systemHealth: '98.5%',
        storageUsed: '2.4 GB',
        activeUsers: Math.floor((userData.total_users || 0) * 0.65)
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchRecentActivities = async () => {
    setRecentActivities([
      {
        id: '1',
        type: 'user',
        message: 'New student registered: Rahul Sharma',
        timestamp: '2 minutes ago',
        user: 'student01@datams.edu'
      },
      {
        id: '2',
        type: 'course',
        message: 'Course published: Introduction to Machine Learning',
        timestamp: '15 minutes ago',
        user: 'teacher01@datams.edu'
      },
      {
        id: '3',
        type: 'assignment',
        message: '12 new assignment submissions received',
        timestamp: '1 hour ago'
      },
      {
        id: '4',
        type: 'video',
        message: 'Video uploaded: Data Science Lecture 5',
        timestamp: '2 hours ago',
        user: 'teacher02@datams.edu'
      },
      {
        id: '5',
        type: 'enrollment',
        message: '5 students enrolled in Full Stack Development',
        timestamp: '3 hours ago'
      }
    ]);
  };

  const fetchSystemAlerts = async () => {
    setSystemAlerts([
      {
        id: '1',
        type: 'success',
        message: 'Database backup completed successfully',
        timestamp: '1 hour ago'
      },
      {
        id: '2',
        type: 'info',
        message: 'System update available: v2.1.0',
        timestamp: '3 hours ago'
      },
      {
        id: '3',
        type: 'warning',
        message: 'Storage usage at 75% - consider cleanup',
        timestamp: '5 hours ago'
      }
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserCheck className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'assignment': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'enrollment': return <GraduationCap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertCircle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800 font-medium">Access denied. Super Administrator privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header with Crown */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Crown className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
                Super Admin Dashboard
              </h1>
              <p className="text-purple-100 text-sm sm:text-base">
                Welcome back, {user?.name} • Full System Control
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 disabled:opacity-50"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`h-6 w-6 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="space-y-2">
          {systemAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`${getAlertBgColor(alert.type)} border rounded-lg p-4 flex items-start gap-3`}
            >
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-600 mt-1">{alert.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Stats Grid */}
      {!loading && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                {stats.activeUsers} Active
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
            <p className="text-sm text-gray-600 mb-3">Total Users</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>👨‍🎓 {stats.totalStudents}</span>
              <span>👨‍🏫 {stats.totalTeachers}</span>
              <span>👑 {stats.totalAdmins}</span>
            </div>
          </div>

          {/* Total Courses */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {stats.activeCourses} Live
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalCourses}</h3>
            <p className="text-sm text-gray-600 mb-3">Total Courses</p>
            <div className="text-xs text-gray-500">
              {stats.totalEnrollments} total enrollments
            </div>
          </div>

          {/* Video Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                Media
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalVideos}</h3>
            <p className="text-sm text-gray-600 mb-3">Video Content</p>
            <div className="text-xs text-gray-500">
              {stats.storageUsed} storage used
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Healthy
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.systemHealth}</h3>
            <p className="text-sm text-gray-600 mb-3">System Uptime</p>
            <div className="text-xs text-gray-500">
              All systems operational
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => navigateTo('/admin/users')}
            className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 text-left group"
          >
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Users</h3>
            <p className="text-xs text-gray-600">Manage all users</p>
          </button>

          <button
            onClick={() => navigateTo('/courses')}
            className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200 text-left group"
          >
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Courses</h3>
            <p className="text-xs text-gray-600">View all courses</p>
          </button>

          <button
            onClick={() => navigateTo('/videos')}
            className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 text-left group"
          >
            <Video className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Videos</h3>
            <p className="text-xs text-gray-600">Manage videos</p>
          </button>

          <button
            onClick={() => navigateTo('/analytics')}
            className="p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-xl transition-all duration-200 text-left group"
          >
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Analytics</h3>
            <p className="text-xs text-gray-600">View reports</p>
          </button>

          <button
            onClick={() => navigateTo('/assignments/manage')}
            className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 rounded-xl transition-all duration-200 text-left group"
          >
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Assignments</h3>
            <p className="text-xs text-gray-600">Manage tasks</p>
          </button>

          <button
            onClick={() => navigateTo('/students')}
            className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl transition-all duration-200 text-left group"
          >
            <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Students</h3>
            <p className="text-xs text-gray-600">Track progress</p>
          </button>

          <button
            onClick={() => navigateTo('/notifications')}
            className="p-4 sm:p-6 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-xl transition-all duration-200 text-left group"
          >
            <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Notifications</h3>
            <p className="text-xs text-gray-600">Send alerts</p>
          </button>

          <button
            onClick={() => navigateTo('/settings')}
            className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all duration-200 text-left group"
          >
            <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Settings</h3>
            <p className="text-xs text-gray-600">System config</p>
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & System Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Recent Activity
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-start gap-3"
              >
                <div className="p-2 bg-white rounded-lg border border-gray-200">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  {activity.user && (
                    <p className="text-xs text-gray-600 mt-1">{activity.user}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            System Management
          </h2>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg text-left transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Backup Database</p>
                  <p className="text-xs text-gray-600">Export all data</p>
                </div>
              </div>
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg text-left transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Restore Database</p>
                  <p className="text-xs text-gray-600">Import backup file</p>
                </div>
              </div>
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg text-left transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm font-medium text-gray-900">View System Logs</p>
                  <p className="text-xs text-gray-600">Check error logs</p>
                </div>
              </div>
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg text-left transition-all flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-sm font-medium text-gray-900">System Monitor</p>
                  <p className="text-xs text-gray-600">Real-time metrics</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
