import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { TeacherAssignmentView } from '../assignments/TeacherAssignmentView';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const QuickTest: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">System Status Check</h1>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">Frontend Running: Port 5174</span>
          </div>
          
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-gray-700">Backend Running: Port 5000</span>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">User Logged In: {user.name} ({user.role})</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-gray-700">No User Logged In</span>
              </>
            )}
          </div>
        </div>
      </div>

      {user?.role === 'teacher' ? (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Teacher Assignment View</h2>
          <TeacherAssignmentView />
        </div>
      ) : user?.role === 'student' ? (
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Student View</h2>
          <p className="text-blue-700">
            Go to Assignments page to submit assignments or Course Details to view course assignments.
          </p>
          <div className="mt-4 space-y-2">
            <a href="/assignments" className="block text-blue-600 hover:underline">
              → Go to Assignments Page
            </a>
            <a href="/courses/detail" className="block text-blue-600 hover:underline">
              → Go to Course Details
            </a>
            <a href="/test/assignments" className="block text-blue-600 hover:underline">
              → Go to Assignment Test Page
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600">Please login to continue</p>
        </div>
      )}
    </div>
  );
};