import React from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  description: string;
}

interface AssignmentItemProps {
  assignment: Assignment;
}

export const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment }) => {
  const getStatusIcon = () => {
    switch (assignment.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'submitted':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'graded':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (assignment.status) {
      case 'pending': return 'bg-yellow-50 border-yellow-200';
      case 'submitted': return 'bg-blue-50 border-blue-200';
      case 'graded': return 'bg-green-50 border-green-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`border rounded-lg p-4 hover:shadow-sm transition-shadow duration-200 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-gray-600" />
          <div>
            <h4 className="font-medium text-gray-900">{assignment.title}</h4>
            <p className="text-sm text-gray-600">{assignment.description}</p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Due: {formatDate(assignment.dueDate)}</span>
          </div>
          <span className="capitalize px-2 py-1 rounded-full text-xs font-medium bg-white">
            {assignment.status}
          </span>
        </div>
        
        {assignment.grade && (
          <div className="text-right">
            <span className="font-bold text-lg text-green-600">{assignment.grade}%</span>
            <p className="text-xs text-gray-500">Grade</p>
          </div>
        )}
      </div>
    </div>
  );
};