import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AssignmentAPI, Assignment, AssignmentSubmission } from '../services/assignmentAPI';
import { GradingModal } from '../components/assignments/GradingModal';
import { Toast } from '../components/common/Toast';
import { apiCache, CACHE_KEYS } from '../utils/cache';
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

type FilterStatus = 'all' | 'pending' | 'graded';

interface ToastState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AssignmentManagementState {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  loading: boolean;
  refreshing: boolean;
  filterStatus: FilterStatus;
  error: string | null;
  gradingModal: {
    show: boolean;
    submission: AssignmentSubmission | null;
  };
  toast: ToastState;
}

export const AssignmentManagement: React.FC = () => {
  const { user } = useAuth();
  
  const [state, setState] = useState<AssignmentManagementState>({
    assignments: [],
    selectedAssignment: null,
    loading: true,
    refreshing: false,
    filterStatus: 'all',
    error: null,
    gradingModal: {
      show: false,
      submission: null
    },
    toast: {
      show: false,
      type: 'info',
      message: ''
    }
  });

  // Helper function to show toast
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setState(prev => ({
      ...prev,
      toast: {
        show: true,
        type,
        message
      }
    }));
  };

  // Helper function to hide toast
  const hideToast = () => {
    setState(prev => ({
      ...prev,
      toast: {
        ...prev.toast,
        show: false
      }
    }));
  };

  // Fetch all assignments
  const fetchAssignments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setState(prev => ({ ...prev, refreshing: true, error: null }));
        // Invalidate cache on manual refresh
        apiCache.invalidate(CACHE_KEYS.TEACHER_ASSIGNMENTS);
        apiCache.invalidatePattern('assignment:'); // Invalidate all assignment details
      } else {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const assignments = await apiCache.getOrFetch(
        CACHE_KEYS.TEACHER_ASSIGNMENTS,
        () => AssignmentAPI.getAssignments()
      );
      
      setState(prev => ({
        ...prev,
        assignments,
        loading: false,
        refreshing: false,
        error: null
      }));
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
      const errorMessage = 'Failed to load assignments. Please try again.';
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: errorMessage
      }));
      showToast('error', errorMessage);
    }
  };

  // Fetch assignment details with submissions
  const fetchAssignmentDetails = async (assignmentId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const assignment = await apiCache.getOrFetch(
        CACHE_KEYS.ASSIGNMENT_DETAILS(assignmentId),
        () => AssignmentAPI.getAssignmentById(assignmentId)
      );
      
      setState(prev => ({
        ...prev,
        selectedAssignment: assignment,
        loading: false,
        error: null
      }));
    } catch (error) {
      console.error('Failed to fetch assignment details:', error);
      const errorMessage = 'Failed to load assignment details. Please try again.';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      showToast('error', errorMessage);
    }
  };

  // Handle assignment selection
  const handleSelectAssignment = (assignment: Assignment) => {
    fetchAssignmentDetails(assignment._id);
  };

  // Handle back to list
  const handleBackToList = () => {
    setState(prev => ({ ...prev, selectedAssignment: null }));
  };

  // Handle opening grading modal
  const handleOpenGradingModal = (submission: AssignmentSubmission) => {
    setState(prev => ({
      ...prev,
      gradingModal: {
        show: true,
        submission
      }
    }));
  };

  // Handle closing grading modal
  const handleCloseGradingModal = () => {
    setState(prev => ({
      ...prev,
      gradingModal: {
        show: false,
        submission: null
      }
    }));
  };

  // Handle grade submitted with optimistic update
  const handleGradeSubmitted = (submissionId?: string, newGrade?: number, newFeedback?: string) => {
    // If optimistic update data is provided, update UI immediately
    if (submissionId && newGrade !== undefined && state.selectedAssignment) {
      const updatedSubmissions = (state.selectedAssignment.submissions || []).map(sub =>
        sub._id === submissionId
          ? {
              ...sub,
              status: 'graded' as const,
              grade: newGrade,
              feedback: newFeedback || '',
              graded_at: new Date().toISOString()
            }
          : sub
      );

      setState(prev => ({
        ...prev,
        selectedAssignment: prev.selectedAssignment
          ? {
              ...prev.selectedAssignment,
              submissions: updatedSubmissions
            }
          : null
      }));
    }

    // Invalidate cache for this assignment and refresh
    if (state.selectedAssignment) {
      apiCache.invalidate(CACHE_KEYS.ASSIGNMENT_DETAILS(state.selectedAssignment._id));
      apiCache.invalidate(CACHE_KEYS.TEACHER_ASSIGNMENTS);
      apiCache.invalidate(CACHE_KEYS.TEACHER_DASHBOARD_STATS); // Stats may have changed
      fetchAssignmentDetails(state.selectedAssignment._id);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Debounce timer ref
  const refreshTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = React.useRef(false);

  const handleRefresh = () => {
    // Prevent multiple simultaneous refresh requests
    if (isRefreshingRef.current || state.refreshing) {
      return;
    }

    // Clear any existing debounce timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    // Set debounce timer (1 second delay)
    refreshTimerRef.current = setTimeout(() => {
      isRefreshingRef.current = true;
      fetchAssignments(true).finally(() => {
        isRefreshingRef.current = false;
        refreshTimerRef.current = null;
      });
    }, 1000);
  };

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  // Calculate statistics
  const calculateStats = () => {
    const totalAssignments = state.assignments.length;
    let totalSubmissions = 0;
    let pendingGrading = 0;
    let totalGrades = 0;
    let gradeCount = 0;

    state.assignments.forEach(assignment => {
      const submissions = assignment.submissions || [];
      totalSubmissions += submissions.length;
      
      submissions.forEach(submission => {
        if (submission.status === 'submitted') {
          pendingGrading++;
        } else if (submission.status === 'graded' && submission.grade !== undefined) {
          totalGrades += submission.grade;
          gradeCount++;
        }
      });
    });

    const averageGrade = gradeCount > 0 ? (totalGrades / gradeCount) : 0;
    const averagePercentage = gradeCount > 0 
      ? state.assignments.reduce((sum, a) => {
          const graded = (a.submissions || []).filter(s => s.status === 'graded' && s.grade !== undefined);
          const avgForAssignment = graded.length > 0
            ? graded.reduce((s, sub) => s + (sub.grade! / a.max_points) * 100, 0) / graded.length
            : 0;
          return sum + avgForAssignment;
        }, 0) / state.assignments.filter(a => (a.submissions || []).some(s => s.status === 'graded')).length
      : 0;

    return {
      totalAssignments,
      totalSubmissions,
      pendingGrading,
      averageGrade: averagePercentage
    };
  };

  // Loading state
  if (state.loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error && state.assignments.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Assignments</h3>
          <p className="text-red-700 mb-4">{state.error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 min-h-[44px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If assignment is selected, show detail view
  if (state.selectedAssignment) {
    const assignment = state.selectedAssignment;
    const submissions = assignment.submissions || [];
    
    return (
      <div className="p-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 px-4 py-2 min-h-[44px] bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-gray-600 mt-1">{assignment.course_title}</p>
          </div>
        </div>

        {/* Assignment Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-sm font-medium text-gray-600">Due Date</span>
              <p className="text-gray-900 mt-1">{new Date(assignment.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Max Points</span>
              <p className="text-gray-900 mt-1">{assignment.max_points}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Submissions</span>
              <p className="text-gray-900 mt-1">{submissions.length}</p>
            </div>
          </div>
          {assignment.description && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">Description</span>
              <p className="text-gray-900 mt-1">{assignment.description}</p>
            </div>
          )}
        </div>

        {/* Submissions List */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Submissions</h2>
          </div>
          <div className="p-6">
            {submissions.length > 0 ? (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Student Information */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {submission.student_name || 'Unknown Student'}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          {submission.roll_no && (
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Roll No: {submission.roll_no}
                            </span>
                          )}
                          {submission.student_email && (
                            <span>{submission.student_email}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        submission.status === 'graded'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.status === 'graded' ? 'Graded' : 'Pending'}
                      </span>
                    </div>

                    {/* Submission Date */}
                    <div className="mb-4">
                      <span className="text-sm text-gray-600">
                        Submitted on {new Date(submission.submitted_at).toLocaleDateString()} at{' '}
                        {new Date(submission.submitted_at).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Content Preview */}
                    {submission.text_content && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Submission Content:</span>
                        <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded border border-gray-200 line-clamp-3">
                          {submission.text_content}
                        </p>
                      </div>
                    )}

                    {/* File Attachment */}
                    {submission.file_name && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-700">Attached File:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-900">{submission.file_name}</span>
                        </div>
                      </div>
                    )}

                    {/* Graded Information */}
                    {submission.status === 'graded' && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Grade:</span>
                            <p className="text-lg font-bold text-green-600 mt-1">
                              {submission.grade} / {assignment.max_points}
                              <span className="text-sm text-gray-600 ml-2">
                                ({((submission.grade! / assignment.max_points) * 100).toFixed(1)}%)
                              </span>
                            </p>
                          </div>
                          {submission.graded_at && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Graded on:</span>
                              <p className="text-sm text-gray-900 mt-1">
                                {new Date(submission.graded_at).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                        {submission.feedback && (
                          <div className="mt-4">
                            <span className="text-sm font-medium text-gray-700">Feedback:</span>
                            <p className="text-gray-900 mt-1 bg-blue-50 p-3 rounded border border-blue-200">
                              {submission.feedback}
                            </p>
                          </div>
                        )}
                        <div className="mt-4">
                          <button
                            onClick={() => handleOpenGradingModal(submission)}
                            className="w-full md:w-auto px-6 py-2 min-h-[44px] bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            aria-label={`Update grade for ${submission.student_name}`}
                          >
                            Update Grade
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Grade Button for Pending Submissions */}
                    {submission.status === 'submitted' && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <button
                          onClick={() => handleOpenGradingModal(submission)}
                          className="w-full md:w-auto px-6 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          aria-label={`Grade submission from ${submission.student_name}`}
                        >
                          Grade Submission
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions</h3>
                <p className="text-gray-600">No students have submitted this assignment yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600 mt-1">Manage and grade student assignments</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={state.refreshing}
          className="flex items-center gap-2 px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={state.refreshing ? 'Refreshing assignments' : 'Refresh assignments'}
        >
          <RefreshCw className={`h-4 w-4 ${state.refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Statistics Overview */}
      {(() => {
        const stats = calculateStats();
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Assignments</span>
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Submissions</span>
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Pending Grading</span>
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Average Grade</span>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageGrade > 0 ? `${stats.averageGrade.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Assignment List with Filtering */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2" role="tablist" aria-label="Assignment filter tabs">
            <button
              onClick={() => setState(prev => ({ ...prev, filterStatus: 'all' }))}
              className={`px-4 py-2 min-h-[44px] rounded-lg font-medium transition-colors ${
                state.filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              role="tab"
              aria-selected={state.filterStatus === 'all'}
              aria-label="Show all assignments"
            >
              All
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, filterStatus: 'pending' }))}
              className={`px-4 py-2 min-h-[44px] rounded-lg font-medium transition-colors ${
                state.filterStatus === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              role="tab"
              aria-selected={state.filterStatus === 'pending'}
              aria-label="Show assignments pending review"
            >
              Pending Review
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, filterStatus: 'graded' }))}
              className={`px-4 py-2 min-h-[44px] rounded-lg font-medium transition-colors ${
                state.filterStatus === 'graded'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              role="tab"
              aria-selected={state.filterStatus === 'graded'}
              aria-label="Show graded assignments"
            >
              Graded
            </button>
          </div>
        </div>
        <div className="p-6">
          {state.assignments.length > 0 ? (
            <div className="space-y-4">
              {state.assignments.map((assignment) => {
                // Calculate pending and graded counts from submissions
                const submissions = assignment.submissions || [];
                const pendingCount = submissions.filter(s => s.status === 'submitted').length;
                const gradedCount = submissions.filter(s => s.status === 'graded').length;
                
                // Filter logic based on selected filter
                let shouldShow = true;
                if (state.filterStatus === 'pending' && pendingCount === 0) {
                  shouldShow = false;
                } else if (state.filterStatus === 'graded' && gradedCount === 0) {
                  shouldShow = false;
                }
                
                if (!shouldShow) return null;
                
                return (
                  <div
                    key={assignment._id}
                    onClick={() => handleSelectAssignment(assignment)}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {assignment.course_title} • Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {pendingCount > 0 && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              {pendingCount} pending
                            </span>
                          )}
                          {gradedCount > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              {gradedCount} graded
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {assignment.submission_count || 0} submissions
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments</h3>
              <p className="text-gray-600">
                {state.filterStatus === 'all' 
                  ? "You haven't created any assignments yet"
                  : `No assignments with ${state.filterStatus} submissions`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Grading Modal */}
      {state.gradingModal.show && state.gradingModal.submission && state.selectedAssignment && (
        <GradingModal
          isOpen={state.gradingModal.show}
          onClose={handleCloseGradingModal}
          submission={state.gradingModal.submission}
          maxPoints={state.selectedAssignment.max_points}
          onGradeSubmitted={handleGradeSubmitted}
        />
      )}

      {/* Toast Notification */}
      {state.toast.show && (
        <Toast
          type={state.toast.type}
          message={state.toast.message}
          onClose={hideToast}
        />
      )}
    </div>
  );
};

export default AssignmentManagement;
