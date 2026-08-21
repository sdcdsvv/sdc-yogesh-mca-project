import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Clock, 
  Award,
  BarChart3,
  FileText,
  AlertCircle,
  Download
} from 'lucide-react';
import { AssignmentAPI, AssignmentStatistics } from '../../services/assignmentAPI';
import { Toast } from '../common/Toast';

export const AssignmentAnalytics: React.FC = () => {
  const [statistics, setStatistics] = useState<AssignmentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const stats = await AssignmentAPI.getAssignmentStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching assignment statistics:', error);
      setToast({ type: 'error', message: 'Failed to load assignment statistics' });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const exportReport = () => {
    if (!statistics) return;

    // Create CSV content
    const csvContent = [
      ['Assignment Analytics Report'],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['Summary Statistics'],
      ['Total Assignments', statistics.total_assignments],
      ['Pending Submissions', statistics.pending_submissions],
      ['Graded Submissions', statistics.graded_submissions],
      ['Completion Rate', `${statistics.completion_rate.toFixed(1)}%`],
      ['Average Grade', statistics.average_grade.toFixed(2)],
      [''],
      ['Assignment Performance'],
      ['Assignment', 'Course', 'Submissions', 'Graded', 'Avg Grade', 'Grade %', 'Due Date'],
      ...statistics.assignment_performance.map(perf => [
        perf.assignment_title,
        perf.course_title,
        perf.total_submissions,
        perf.graded_submissions,
        perf.average_grade.toFixed(2),
        `${perf.grade_percentage.toFixed(1)}%`,
        formatDate(perf.due_date)
      ])
    ].map(row => row.join(',')).join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assignment-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setToast({ type: 'success', message: 'Report exported successfully!' });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assignment Analytics</h1>
          <p className="text-gray-600">Track assignment performance and student progress</p>
        </div>
        <button
          onClick={exportReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total Assignments</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{statistics.total_assignments}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{statistics.pending_submissions}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Graded</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{statistics.graded_submissions}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Completion Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{statistics.completion_rate.toFixed(1)}%</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Avg Grade</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{statistics.average_grade.toFixed(1)}</p>
        </div>
      </div>

      {/* Grading Workload */}
      {statistics.grading_workload.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Grading Workload</h2>
          </div>

          <div className="space-y-4">
            {statistics.grading_workload.map((item) => (
              <div key={item.assignment_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{item.assignment_title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                        {item.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mb-3">{item.course_title}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{item.pending_submissions} pending / {item.total_submissions} total</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Due: {formatDate(item.due_date)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Grading Progress</span>
                        <span>
                          {item.total_submissions > 0 
                            ? Math.round(((item.total_submissions - item.pending_submissions) / item.total_submissions) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${item.total_submissions > 0 
                              ? ((item.total_submissions - item.pending_submissions) / item.total_submissions) * 100
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assignment Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Assignment Performance</h2>
        </div>

        {statistics.assignment_performance.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No performance data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assignment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Submissions</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Graded</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Grade</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Performance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {statistics.assignment_performance.map((perf) => (
                  <tr key={perf.assignment_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{perf.assignment_title}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-600">{perf.course_title}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{perf.total_submissions}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{perf.graded_submissions}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm font-medium text-gray-900">
                        {perf.average_grade.toFixed(1)}/{perf.max_points}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              perf.grade_percentage >= 80 ? 'bg-green-500' :
                              perf.grade_percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${perf.grade_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-[45px]">
                          {perf.grade_percentage.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">{formatDate(perf.due_date)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insights */}
      {statistics.assignment_performance.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Insights</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                {statistics.completion_rate < 50 && (
                  <li>• Low completion rate detected. Consider extending deadlines or providing additional support.</li>
                )}
                {statistics.average_grade < 60 && (
                  <li>• Average grade is below 60%. Review assignment difficulty and provide more guidance.</li>
                )}
                {statistics.pending_submissions > 10 && (
                  <li>• You have {statistics.pending_submissions} pending submissions to grade.</li>
                )}
                {statistics.completion_rate >= 80 && statistics.average_grade >= 75 && (
                  <li>• Great job! Students are performing well with high completion and grade rates.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
