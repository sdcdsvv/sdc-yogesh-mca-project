import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/tokenHelper';
import { CheckCircle, AlertCircle, Calendar, Award, Send } from 'lucide-react';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  due_date: string;
  max_points: number;
  submission_status: string;
  course_title: string;
}

export const AssignmentTest: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch('http://192.160.108.56:5010/api/assignments/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
        console.log('Assignments fetched:', data.assignments);
      } else {
        console.error('Failed to fetch assignments:', response.status);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async (assignmentId: string) => {
    setSubmitting(assignmentId);
    try {
      const token = getAuthToken();
      const response = await fetch(`http://192.160.108.56:5010/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text_content: `Test submission for assignment ${assignmentId} at ${new Date().toISOString()}`,
          file_name: 'test-submission.txt',
          file_path: '/uploads/test-submission.txt'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Assignment submitted successfully:', data);
        // Refresh assignments
        fetchAssignments();
      } else {
        console.error('Failed to submit assignment:', data.error);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setSubmitting(null);
    }
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

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Assignment Test Page</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <span className="ml-3">Loading assignments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Assignment Test Page</h1>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="font-semibold text-blue-900 mb-2">Test Instructions:</h2>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• This page shows all assignments for the logged-in student</li>
          <li>• Click "Test Submit" to submit an assignment with sample data</li>
          <li>• Status should change from "pending" to "submitted"</li>
          <li>• Check browser console for detailed logs</li>
        </ul>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No assignments found. Make sure you're logged in as a student.</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment._id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{assignment.title}</h3>
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
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                    assignment.submission_status === 'submitted' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {assignment.submission_status === 'submitted' ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Submitted
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Pending
                      </>
                    )}
                  </span>

                  {assignment.submission_status === 'pending' && (
                    <button
                      onClick={() => submitAssignment(assignment._id)}
                      disabled={submitting === assignment._id}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting === assignment._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Test Submit
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Debug Info:</h3>
        <p className="text-sm text-gray-600">Total assignments: {assignments.length}</p>
        <p className="text-sm text-gray-600">
          Pending: {assignments.filter(a => a.submission_status === 'pending').length}
        </p>
        <p className="text-sm text-gray-600">
          Submitted: {assignments.filter(a => a.submission_status === 'submitted').length}
        </p>
      </div>
    </div>
  );
};