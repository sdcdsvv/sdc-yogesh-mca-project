import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle,
  User,
  Award,
  MessageSquare,
  Eye,
  Edit,
  Save,
  X
} from 'lucide-react';

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  files: {
    name: string;
    size: string;
    url: string;
  }[];
  textContent?: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late';
}

export const AssignmentDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textSubmission, setTextSubmission] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gradingMode, setGradingMode] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  // Mock assignment data
  const assignment = {
    id: '1',
    title: 'Linear Regression Project',
    description: 'Implement a linear regression model using Python and scikit-learn to predict house prices based on various features.',
    instructions: `
      ## Project Requirements
      
      1. **Data Analysis**: Perform exploratory data analysis on the provided housing dataset
      2. **Feature Engineering**: Create meaningful features from the raw data
      3. **Model Implementation**: Implement linear regression using scikit-learn
      4. **Evaluation**: Evaluate your model using appropriate metrics (RMSE, R²)
      5. **Documentation**: Provide clear documentation and comments in your code
      
      ## Deliverables
      
      - Python notebook (.ipynb) with your complete analysis
      - Written report (PDF) summarizing your findings
      - Dataset with your engineered features
      
      ## Grading Criteria
      
      - Code Quality (30%)
      - Analysis Depth (25%)
      - Model Performance (25%)
      - Documentation (20%)
    `,
    courseId: '1',
    courseName: 'Machine Learning Fundamentals',
    instructor: 'Dr. Sarah Johnson',
    dueDate: '2024-02-15T23:59:00Z',
    maxPoints: 100,
    submissionType: 'file', // 'file', 'text', 'both'
    allowedFileTypes: ['.py', '.ipynb', '.pdf', '.csv'],
    maxFileSize: '10MB',
    status: 'pending', // 'pending', 'submitted', 'graded'
    mySubmission: null,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  };

  // Mock submissions (for instructor view)
  const submissions: Submission[] = [
    {
      id: '1',
      studentId: 'student1',
      studentName: 'Alice Johnson',
      submittedAt: '2024-02-14T18:30:00Z',
      files: [
        { name: 'linear_regression_analysis.ipynb', size: '2.3 MB', url: '#' },
        { name: 'housing_report.pdf', size: '1.8 MB', url: '#' },
        { name: 'processed_data.csv', size: '450 KB', url: '#' }
      ],
      grade: 92,
      feedback: 'Excellent work! Your analysis was thorough and the model performance was impressive. Consider exploring feature interactions in future projects.',
      status: 'graded'
    },
    {
      id: '2',
      studentId: 'student2',
      studentName: 'Bob Smith',
      submittedAt: '2024-02-15T22:45:00Z',
      files: [
        { name: 'ml_project.ipynb', size: '1.9 MB', url: '#' },
        { name: 'analysis_report.pdf', size: '1.2 MB', url: '#' }
      ],
      status: 'submitted'
    },
    {
      id: '3',
      studentId: 'student3',
      studentName: 'Carol Davis',
      submittedAt: '2024-02-16T08:15:00Z',
      files: [
        { name: 'regression_project.ipynb', size: '2.1 MB', url: '#' }
      ],
      status: 'late'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    if (diff < 0) return 'Overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours remaining`;
    return `${hours} hours remaining`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'graded': return 'text-green-600 bg-green-100';
      case 'late': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      // Update assignment status
    }, 2000);
  };

  const renderAssignmentDetails = () => (
    <div className="space-y-8">
      {/* Assignment Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{assignment.title}</h2>
            <p className="text-gray-600 mb-4">{assignment.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due: {formatDate(assignment.dueDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                <span>{assignment.maxPoints} points</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{assignment.instructor}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              new Date(assignment.dueDate) < new Date() ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'
            }`}>
              <Clock className="h-4 w-4 mr-1" />
              {getTimeRemaining(assignment.dueDate)}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="prose max-w-none">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
            <div className="whitespace-pre-wrap text-gray-700">{assignment.instructions}</div>
          </div>
        </div>

        {/* Submission Requirements */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Submission Requirements</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Allowed file types: {assignment.allowedFileTypes.join(', ')}</p>
            <p>• Maximum file size: {assignment.maxFileSize}</p>
            <p>• Submission type: {assignment.submissionType}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubmissionForm = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Submit Assignment</h3>
        
        {assignment.status === 'submitted' ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Assignment Submitted</h4>
            <p className="text-gray-600">Your submission has been received and is being reviewed.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept={assignment.allowedFileTypes.join(',')}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {assignment.allowedFileTypes.join(', ')} up to {assignment.maxFileSize}
                  </p>
                </label>
              </div>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Text Submission */}
            {(assignment.submissionType === 'text' || assignment.submissionType === 'both') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Submission
                </label>
                <textarea
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your submission text here..."
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (!selectedFile && !textSubmission.trim())}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Student Submissions</h3>
        <div className="text-sm text-gray-500">
          {submissions.length} submissions
        </div>
      </div>

      {submissions.map((submission) => (
        <div key={submission.id} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {submission.studentName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{submission.studentName}</h4>
                  <p className="text-sm text-gray-500">
                    Submitted {formatDate(submission.submittedAt)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(submission.status)}`}>
                  {submission.status}
                </span>
              </div>

              {/* Files */}
              <div className="space-y-2 mb-4">
                {submission.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{file.name}</span>
                    <span className="text-xs text-gray-500">({file.size})</span>
                    <button className="ml-auto p-1 text-gray-400 hover:text-gray-600">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Grade and Feedback */}
              {submission.grade !== undefined && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-900">Grade: {submission.grade}/{assignment.maxPoints}</span>
                    <span className="text-sm text-green-700">{Math.round((submission.grade / assignment.maxPoints) * 100)}%</span>
                  </div>
                  {submission.feedback && (
                    <p className="text-sm text-green-800">{submission.feedback}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MessageSquare className="h-4 w-4" />
              </button>
              {submission.status === 'submitted' && (
                <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Grade
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'submit', label: 'Submit', icon: Upload },
    { id: 'submissions', label: 'Submissions', icon: Users }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
            <p className="text-gray-600">{assignment.courseName}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {assignment.status === 'graded' && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">92/100</div>
                <div className="text-sm text-gray-500">Your Grade</div>
              </div>
            )}
            
            <div className={`px-4 py-2 rounded-lg font-medium ${
              assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {assignment.status === 'pending' ? 'Not Submitted' :
               assignment.status === 'submitted' ? 'Submitted' : 'Graded'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'details' && renderAssignmentDetails()}
        {activeTab === 'submit' && renderSubmissionForm()}
        {activeTab === 'submissions' && renderSubmissions()}
      </div>
    </div>
  );
};