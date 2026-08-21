import React, { useEffect, useState } from 'react';
import { Search, Filter, FileText, Calendar, CheckCircle, Clock, Upload, Eye, AlertTriangle, BookOpen, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherAssignmentView } from './TeacherAssignmentView';
import { AssignmentAPI, Assignment as AssignmentApiType, SubmitAssignmentRequest } from '../../services/assignmentAPI';
import { Toast } from '../common/Toast';

type Assignment = AssignmentApiType;

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submissionAssignment, setSubmissionAssignment] = useState<Assignment | null>(null);

  // If user is teacher, show teacher view
  if (user?.role === 'teacher') {
    return <TeacherAssignmentView />;
  }

  const loadAssignments = async (withLoader = true) => {
    try {
      if (withLoader) {
        setLoadingAssignments(true);
      }
      setPageError(null);
      const data = await AssignmentAPI.getAssignments();
      setAssignments(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assignments';
      setPageError(errorMessage);
    } finally {
      if (withLoader) {
        setLoadingAssignments(false);
      }
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const getAssignmentStatus = (assignment: Assignment) => assignment.submission_status || 'pending';

  const filteredAssignments = assignments
    .filter(assignment =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assignment.course_title || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(assignment => filterStatus === 'all' || getAssignmentStatus(assignment) === filterStatus);

  const statusCounts = {
    all: assignments.length,
    pending: assignments.filter(a => getAssignmentStatus(a) === 'pending').length,
    submitted: assignments.filter(a => getAssignmentStatus(a) === 'submitted').length,
    graded: assignments.filter(a => getAssignmentStatus(a) === 'graded').length
  };

  const handleSubmitAssignment = async () => {
    if (!submissionAssignment) return;

    if (!submissionText.trim() && submissionFiles.length === 0) {
      setToast({ type: 'error', message: 'Please provide text or attach a file before submitting.' });
      return;
    }

    const payload: SubmitAssignmentRequest = {};

    if (submissionText.trim()) {
      payload.text_content = submissionText.trim();
    }

    if (submissionFiles[0]) {
      payload.file_name = submissionFiles[0].name;
      payload.file_path = `/uploads/assignments/${submissionFiles[0].name}`;
    }

    setSubmitting(true);
    try {
      await AssignmentAPI.submitAssignment(submissionAssignment._id, payload);
      setToast({ type: 'success', message: 'Assignment submitted successfully.' });
      setSubmissionText('');
      setSubmissionFiles([]);
      setShowSubmissionModal(false);
      setSubmissionAssignment(null);
      await loadAssignments(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit assignment.';
      setToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSubmissionModal = () => {
    setShowSubmissionModal(false);
    setSubmissionAssignment(null);
    setSubmissionText('');
    setSubmissionFiles([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSubmissionFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return '—';
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) {
      return 0;
    }
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'graded': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments</h1>
          <p className="text-gray-600">Track and manage your coursework</p>
        </div>
      </div>
      {pageError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Unable to load assignments</span>
          </div>
          <p className="text-sm text-red-600 flex-1">{pageError}</p>
          <button
            onClick={() => loadAssignments()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {loadingAssignments ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600">Pending</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Submitted</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.submitted}</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Graded</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.graded}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="submitted">Submitted</option>
                  <option value="graded">Graded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Assignments List */}
          <div className="space-y-6">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => {
            const daysUntilDue = getDaysUntilDue(assignment.due_date);
            const status = getAssignmentStatus(assignment);
            const isOverdue = daysUntilDue < 0;
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;
            const grade = assignment.submission?.grade;
            const feedback = assignment.submission?.feedback;
            const submittedAt = assignment.submission?.submitted_at;

            return (
              <div key={assignment._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      {isOverdue && status === 'pending' && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                          Overdue
                        </span>
                      )}
                      {isDueSoon && status === 'pending' && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          Due Soon
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{assignment.course_title || 'Course'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(assignment.due_date)}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{assignment.description}</p>
                    
                    {status === 'graded' && grade !== undefined && (
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-900">Grade: {grade}/{assignment.max_points}</span>
                          </div>
                        </div>
                        {feedback && (
                          <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900"><strong>Feedback:</strong> {feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {submittedAt && (
                      <div className="text-sm text-gray-600 mb-4">
                        <span className="font-medium">Submitted:</span> {formatDate(submittedAt)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {status === 'pending' && (
                      <button
                        onClick={() => {
                          setSubmissionAssignment(assignment);
                          setShowSubmissionModal(true);
                          setSubmissionText('');
                          setSubmissionFiles([]);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Submit Assignment
                      </button>
                    )}
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{assignment.max_points ?? 0} points</div>
                      {daysUntilDue >= 0 ? (
                        <div className="text-xs text-gray-500">
                          {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days left`}
                        </div>
                      ) : (
                        <div className="text-xs text-red-500">
                          {Math.abs(daysUntilDue)} days overdue
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Assignment Detail Modal */}
      {selectedAssignment && !showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedAssignment.title}</h2>
                <p className="text-gray-600">{selectedAssignment.course_title || 'Course'}</p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Instructions</h4>
                    {selectedAssignment.instructions ? (
                      <div
                        className="prose max-w-none text-gray-700 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: selectedAssignment.instructions }}
                      />
                    ) : (
                      <p className="text-gray-600 text-sm">No additional instructions provided.</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Assignment Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium">{formatDate(selectedAssignment.due_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points:</span>
                        <span className="font-medium">{selectedAssignment.max_points ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getAssignmentStatus(selectedAssignment))}`}>
                          {getAssignmentStatus(selectedAssignment).charAt(0).toUpperCase() + getAssignmentStatus(selectedAssignment).slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submission Type:</span>
                        <span className="font-medium capitalize">{selectedAssignment.submission_type}</span>
                      </div>
                    </div>
                  </div>
                  
                  {getAssignmentStatus(selectedAssignment) === 'graded' && selectedAssignment.submission?.grade !== undefined && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Grade Received</h4>
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {selectedAssignment.submission?.grade}/{selectedAssignment.max_points ?? 0}
                      </div>
                      {selectedAssignment.submission?.feedback && (
                        <div>
                          <p className="text-sm font-medium text-green-900 mb-1">Feedback:</p>
                          <p className="text-sm text-green-800">{selectedAssignment.submission?.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-3">
                    {getAssignmentStatus(selectedAssignment) === 'pending' && (
                      <button
                        onClick={() => {
                          setSubmissionAssignment(selectedAssignment);
                          setShowSubmissionModal(true);
                          setSubmissionText('');
                          setSubmissionFiles([]);
                        }}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <Upload className="h-5 w-5" />
                        Submit Assignment
                      </button>
                    )}
                    
                    <button
                      onClick={() => setSelectedAssignment(null)}
                      className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmissionModal && submissionAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Submit Assignment</h2>
              <button
                onClick={handleCloseSubmissionModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">{submissionAssignment.title}</h3>
                <p className="text-sm text-blue-800">Due: {formatDate(submissionAssignment.due_date)}</p>
              </div>

              {(submissionAssignment.submission_type === 'text' || submissionAssignment.submission_type === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Written Submission
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Enter your written response here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              )}

              {(submissionAssignment.submission_type === 'file' || submissionAssignment.submission_type === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Upload
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                    >
                      Choose Files
                    </label>
                  </div>

                  {submissionFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                      <div className="space-y-2">
                        {submissionFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-medium text-gray-900">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Before submitting:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Review your work carefully</li>
                      <li>Ensure all required files are attached</li>
                      <li>Check that your submission meets all requirements</li>
                      <li>You can resubmit before the deadline if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCloseSubmissionModal}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAssignment}
                disabled={submitting || (!submissionText.trim() && submissionFiles.length === 0)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Submit Assignment
                  </>
                )}
              </button>
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