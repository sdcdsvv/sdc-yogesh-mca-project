import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/tokenHelper';
import { AssignmentAPI, Assignment as AssignmentType } from '../../services/assignmentAPI';
import { AssignmentCreationModal } from './AssignmentCreationModal';
import { GradingModal } from './GradingModal';
import { AssignmentAnalytics } from './AssignmentAnalytics';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  Award,
  Eye,
  Edit,
  Calendar,
  AlertCircle,
  Download,
  Plus,
  Trash2,
  MoreVertical,
  BarChart3
} from 'lucide-react';
import { Toast } from '../common/Toast';

interface Submission {
  _id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  roll_no: string;
  text_content: string;
  file_name: string;
  file_path: string;
  submitted_at: string;
  status: string;
  grade?: number;
  feedback?: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course_id: string;
  course_title: string;
  due_date: string;
  max_points: number;
  submission_count: number;
  submissions?: Submission[];
}

export const TeacherAssignmentView: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'assignments' | 'analytics'>('assignments');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const fetchedAssignments = await AssignmentAPI.getAssignments();
      setAssignments(fetchedAssignments as Assignment[]);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setToast({ type: 'error', message: 'Failed to load assignments' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setShowCreationModal(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment as AssignmentType);
    setShowCreationModal(true);
    setShowOptionsMenu(null);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      await AssignmentAPI.deleteAssignment(assignmentId);
      setToast({ type: 'success', message: 'Assignment deleted successfully' });
      setShowDeleteConfirm(null);
      setShowOptionsMenu(null);
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setToast({ type: 'error', message: 'Failed to delete assignment' });
    }
  };

  const handleAssignmentSuccess = () => {
    fetchAssignments();
    setShowCreationModal(false);
    setEditingAssignment(null);
  };

  const fetchAssignmentDetails = async (assignmentId: string) => {
    try {
      const assignment = await AssignmentAPI.getAssignmentById(assignmentId);
      setSelectedAssignment(assignment);
    } catch (error) {
      console.error('Error fetching assignment details:', error);
      setToast({ type: 'error', message: 'Failed to load assignment details' });
    }
  };

  const openGradingModal = (submission: Submission) => {
    setGradingSubmission(submission);
    setShowGradingModal(true);
  };

  const handleGradeSubmitted = () => {
    // Refresh assignment details after grading
    if (selectedAssignment) {
      fetchAssignmentDetails(selectedAssignment._id);
    }
    setShowGradingModal(false);
    setGradingSubmission(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSubmissionStats = (assignment: Assignment) => {
    if (!assignment.submissions) return { total: 0, graded: 0, pending: 0 };
    
    const total = assignment.submissions.length;
    const graded = assignment.submissions.filter(s => s.status === 'graded').length;
    const pending = total - graded;
    
    return { total, graded, pending };
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (selectedAssignment) {
    const stats = getSubmissionStats(selectedAssignment);
    
    return (
      <div className="p-6">
        <button
          onClick={() => setSelectedAssignment(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          ← Back to Assignments
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedAssignment.title}</h2>
          <p className="text-gray-600 mb-4">{selectedAssignment.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Total Submissions</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Graded</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.graded}</p>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-600 mb-1">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Award className="h-5 w-5" />
                <span className="text-sm font-medium">Max Points</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{selectedAssignment.max_points}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Student Submissions</h3>
          
          {!selectedAssignment.submissions || selectedAssignment.submissions.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No submissions yet</p>
            </div>
          ) : (
            selectedAssignment.submissions.map((submission) => (
              <div key={submission._id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{submission.student_name}</h4>
                      <span className="text-sm text-gray-500">{submission.roll_no}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'graded' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {submission.status === 'graded' ? 'Graded' : 'Pending Review'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{submission.student_email}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Submission:</p>
                      <p className="text-gray-600">{submission.text_content}</p>
                      
                      {submission.file_name && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                          <FileText className="h-4 w-4" />
                          <span>{submission.file_name}</span>
                          <button className="hover:underline flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {formatDate(submission.submitted_at)}</span>
                      </div>
                      
                      {submission.grade !== undefined && (
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <Award className="h-4 w-4" />
                          <span>Grade: {submission.grade}/{selectedAssignment.max_points}</span>
                        </div>
                      )}
                    </div>
                    
                    {submission.feedback && (
                      <div className="mt-3 bg-blue-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">Feedback:</p>
                        <p className="text-sm text-blue-800">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => openGradingModal(submission)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    {submission.status === 'graded' ? (
                      <>
                        <Edit className="h-4 w-4" />
                        Edit Grade
                      </>
                    ) : (
                      <>
                        <Award className="h-4 w-4" />
                        Grade
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Grading Modal */}
        <GradingModal
          isOpen={showGradingModal}
          onClose={() => {
            setShowGradingModal(false);
            setGradingSubmission(null);
          }}
          submission={gradingSubmission}
          maxPoints={selectedAssignment.max_points}
          onGradeSubmitted={handleGradeSubmitted}
        />

        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Assignment Management</h1>
          <p className="text-gray-600">Create, review and grade student submissions</p>
        </div>
        <button
          onClick={handleCreateAssignment}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Assignment
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'assignments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assignments
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' ? (
        <AssignmentAnalytics />
      ) : (
        <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No assignments found</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                    {!assignment.is_active && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  <p className="text-sm text-blue-600 mb-3">Course: {assignment.course_title}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {formatDate(assignment.due_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      <span>{assignment.max_points} points</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{assignment.submission_count} submissions</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchAssignmentDetails(assignment._id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Submissions
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowOptionsMenu(showOptionsMenu === assignment._id ? null : assignment._id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    {showOptionsMenu === assignment._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => handleEditAssignment(assignment)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Assignment
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(assignment._id);
                            setShowOptionsMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Assignment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Assignment Creation/Edit Modal */}
      <AssignmentCreationModal
        isOpen={showCreationModal}
        onClose={() => {
          setShowCreationModal(false);
          setEditingAssignment(null);
        }}
        onSuccess={handleAssignmentSuccess}
        editingAssignment={editingAssignment}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Assignment</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this assignment? All student submissions will be preserved but the assignment will be marked as inactive.
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAssignment(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Assignment
              </button>
            </div>
          </div>
        </div>
      )}
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