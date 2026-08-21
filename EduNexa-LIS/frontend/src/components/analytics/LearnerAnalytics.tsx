import React, { useState, useEffect } from 'react';
import { learnerAnalyticsAPI } from '../../config/api';
import {
  Users,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  XCircle,
  RefreshCw,
  User,
  Mail,
  Award
} from 'lucide-react';

interface Student {
  student_id: string;
  student_name: string;
  email: string;
  department: string;
  year: string;
  roll_number: string;
  performance_score: number;
  learning_pace: 'slow' | 'normal' | 'fast';
  difficulties: Array<{
    type: string;
    description: string;
  }>;
  days_since_login: number;
  risk_level: 'low' | 'medium' | 'high';
  course_data?: {
    course_name: string;
    progress: number;
    enrolled_at: string;
  };
}

interface PerformanceAnalysis {
  summary: {
    total_students: number;
    slow_learners_count: number;
    fast_learners_count: number;
    average_performance: number;
    students_at_risk: number;
    inactive_students: number;
  };
  students: Student[];
  slow_learners: Student[];
  fast_learners: Student[];
}

interface Alert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  student_id: string;
  student_name: string;
  message: string;
  created_at: string;
}

const LearnerAnalytics: React.FC = () => {
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'slow' | 'fast'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analysisData, alertsData] = await Promise.all([
        learnerAnalyticsAPI.getPerformanceAnalysis(undefined, selectedView),
        learnerAnalyticsAPI.getPerformanceAlerts()
      ]);
      setAnalysis(analysisData as PerformanceAnalysis);
      setAlerts((alertsData as any).alerts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch learner analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (studentId: string) => {
    try {
      const data = await learnerAnalyticsAPI.getStudentRecommendations(studentId);
      setRecommendations(data);
    } catch (err: any) {
      console.error('Failed to fetch recommendations:', err);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [selectedView]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPaceIcon = (pace: string) => {
    switch (pace) {
      case 'fast': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'slow': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && !analysis) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading learner analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={fetchAnalysis}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Learner Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor student performance and identify learning patterns</p>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {analysis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Students</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{analysis.summary.total_students}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Slow Learners</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{analysis.summary.slow_learners_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Fast Learners</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{analysis.summary.fast_learners_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">At Risk</p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-600">{analysis.summary.students_at_risk}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mr-2 flex-shrink-0" />
              <span className="truncate">Performance Alerts</span>
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base break-words">{alert.message}</p>
                      <p className="text-xs sm:text-sm opacity-75 mt-1">
                        Type: {alert.type} • {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
            {[
              { key: 'all', label: 'All Students', icon: Users },
              { key: 'slow', label: 'Slow Learners', icon: TrendingDown },
              { key: 'fast', label: 'Fast Learners', icon: TrendingUp }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as any)}
                className={`flex items-center py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  selectedView === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Students List */}
        <div className="p-4 sm:p-6">
          {analysis && analysis.students.length > 0 ? (
            <div className="space-y-4">
              {analysis.students.map((student) => (
                <div
                  key={student.student_id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row items-start gap-4">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{student.student_name}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 mt-1 space-y-1 sm:space-y-0">
                            <span className="flex items-center truncate">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{student.email}</span>
                            </span>
                            <span className="truncate">{student.department} • {student.year}</span>
                            <span className="truncate">Roll: {student.roll_number}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                        <div className="flex items-center">
                          <Award className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">
                            Performance: <strong>{student.performance_score}%</strong>
                          </span>
                        </div>
                        <div className="flex items-center">
                          {getPaceIcon(student.learning_pace)}
                          <span className="text-xs sm:text-sm ml-2 truncate">
                            Pace: <strong className="capitalize">{student.learning_pace}</strong>
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 mr-2 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">
                            Last: <strong>{student.days_since_login}d ago</strong>
                          </span>
                        </div>
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(student.risk_level)} text-center`}>
                          {student.risk_level.toUpperCase()} RISK
                        </div>
                      </div>

                      {student.difficulties.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Areas of Difficulty:</p>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {student.difficulties.map((difficulty, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full break-words"
                              >
                                {difficulty.description}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {student.course_data && (
                        <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-full">
                              {student.course_data.course_name}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                              Progress: {student.course_data.progress}%
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${student.course_data.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 w-full lg:w-auto lg:ml-4">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          fetchRecommendations(student.student_id);
                        }}
                        className="w-full lg:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        View Recommendations
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">No students found for the selected criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Modal */}
      {selectedStudent && recommendations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommendations for {selectedStudent.student_name}
                </h2>
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setRecommendations(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Performance Metrics */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Performance Overview</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Performance Score</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {recommendations.performance_metrics.performance_score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Learning Pace</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {recommendations.performance_metrics.learning_pace}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <p className={`text-lg font-semibold capitalize ${
                      recommendations.performance_metrics.risk_level === 'high' ? 'text-red-600' :
                      recommendations.performance_metrics.risk_level === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {recommendations.performance_metrics.risk_level}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Recommended Actions</h3>
                {recommendations.recommendations.map((rec: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 ${
                        rec.type === 'urgent' ? 'bg-red-500' :
                        rec.type === 'moderate' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{rec.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">Suggested Actions:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {rec.actions.map((action: string, actionIndex: number) => (
                              <li key={actionIndex}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnerAnalytics;