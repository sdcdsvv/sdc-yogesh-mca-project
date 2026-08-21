import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  Calendar,
  User,
  Award,
  Plus,
  Trash2,
  Lock,
  Unlock
} from 'lucide-react';

interface RubricItem {
  criterion: string;
  score: number;
  max_score: number;
  comments: string;
}

interface Submission {
  _id: string;
  student_name: string;
  student_email: string;
  student_roll_no?: string;
  submitted_at: string;
  text_content?: string;
  file_name?: string;
  file_path?: string;
  grade?: number;
  feedback?: string;
  rubric_scores?: RubricItem[];
  is_final?: boolean;
  grade_released?: boolean;
  status: string;
}

interface EnhancedGradingModalProps {
  submission: Submission;
  assignmentTitle: string;
  maxPoints: number;
  onClose: () => void;
  onGradeSubmitted: () => void;
}

export const EnhancedGradingModal: React.FC<EnhancedGradingModalProps> = ({
  submission,
  assignmentTitle,
  maxPoints,
  onClose,
  onGradeSubmitted
}) => {
  const [useRubric, setUseRubric] = useState(false);
  const [directGrade, setDirectGrade] = useState(submission.grade || 0);
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [rubricItems, setRubricItems] = useState<RubricItem[]>(
    submission.rubric_scores || []
  );
  const [isFinal, setIsFinal] = useState(submission.is_final || false);
  const [releaseGrade, setReleaseGrade] = useState(submission.grade_released !== false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate total from rubric
  const rubricTotal = rubricItems.reduce((sum, item) => sum + item.score, 0);

  // Add default rubric items if none exist
  useEffect(() => {
    if (useRubric && rubricItems.length === 0) {
      setRubricItems([
        { criterion: 'Content Quality', score: 0, max_score: Math.floor(maxPoints * 0.4), comments: '' },
        { criterion: 'Technical Implementation', score: 0, max_score: Math.floor(maxPoints * 0.3), comments: '' },
        { criterion: 'Documentation', score: 0, max_score: Math.floor(maxPoints * 0.2), comments: '' },
        { criterion: 'Code Style', score: 0, max_score: Math.floor(maxPoints * 0.1), comments: '' }
      ]);
    }
  }, [useRubric, maxPoints]);

  const addRubricItem = () => {
    setRubricItems([
      ...rubricItems,
      { criterion: '', score: 0, max_score: 10, comments: '' }
    ]);
  };

  const removeRubricItem = (index: number) => {
    setRubricItems(rubricItems.filter((_, i) => i !== index));
  };

  const updateRubricItem = (index: number, field: keyof RubricItem, value: string | number) => {
    const updated = [...rubricItems];
    updated[index] = { ...updated[index], [field]: value };
    setRubricItems(updated);
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const payload: any = {
        feedback,
        is_final: isFinal,
        release_grade: releaseGrade
      };

      if (useRubric) {
        // Validate rubric
        for (const item of rubricItems) {
          if (!item.criterion.trim()) {
            throw new Error('All rubric criteria must have a name');
          }
          if (item.score < 0 || item.score > item.max_score) {
            throw new Error(`Score for "${item.criterion}" must be between 0 and ${item.max_score}`);
          }
        }
        payload.rubric_scores = rubricItems;
      } else {
        if (directGrade < 0 || directGrade > maxPoints) {
          throw new Error(`Grade must be between 0 and ${maxPoints}`);
        }
        payload.grade = directGrade;
      }

      const response = await fetch(`http://192.160.108.56:5010/api/grading/submissions/${submission._id}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit grade');
      }

      onGradeSubmitted();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const finalGrade = useRubric ? rubricTotal : directGrade;
  const percentage = maxPoints > 0 ? (finalGrade / maxPoints) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Grade Submission</h2>
            <p className="text-gray-600 mt-1">{assignmentTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Student Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Student</p>
                  <p className="font-medium text-blue-900">{submission.student_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Submitted</p>
                  <p className="font-medium text-blue-900">{formatDate(submission.submitted_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600">Max Points</p>
                  <p className="font-medium text-blue-900">{maxPoints}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submission Content */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Submission Content
            </h3>
            {submission.text_content && (
              <div className="bg-white rounded p-4 mb-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.text_content}</p>
              </div>
            )}
            {submission.file_name && (
              <div className="bg-white rounded p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium">{submission.file_name}</span>
                </div>
                <a
                  href={`http://192.160.108.56:5010${submission.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Download
                </a>
              </div>
            )}
          </div>

          {/* Grading Method Toggle */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useRubric}
                onChange={() => setUseRubric(false)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="font-medium">Direct Grade</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useRubric}
                onChange={() => setUseRubric(true)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="font-medium">Rubric-Based Grading</span>
            </label>
          </div>

          {/* Direct Grade Input */}
          {!useRubric && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade (out of {maxPoints})
              </label>
              <input
                type="number"
                min="0"
                max={maxPoints}
                step="0.5"
                value={directGrade}
                onChange={(e) => setDirectGrade(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
              />
            </div>
          )}

          {/* Rubric Grading */}
          {useRubric && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Grading Rubric</h3>
                <button
                  onClick={addRubricItem}
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Criterion
                </button>
              </div>

              {rubricItems.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Criterion name"
                        value={item.criterion}
                        onChange={(e) => updateRubricItem(index, 'criterion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => removeRubricItem(index)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Score</label>
                      <input
                        type="number"
                        min="0"
                        max={item.max_score}
                        step="0.5"
                        value={item.score}
                        onChange={(e) => updateRubricItem(index, 'score', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Max Score</label>
                      <input
                        type="number"
                        min="1"
                        value={item.max_score}
                        onChange={(e) => updateRubricItem(index, 'max_score', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <textarea
                    placeholder="Comments for this criterion"
                    value={item.comments}
                    onChange={(e) => updateRubricItem(index, 'comments', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              ))}

              {/* Rubric Total */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-900">Total Score</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {rubricTotal} / {maxPoints}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Overall Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide detailed feedback to the student..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Grade Options */}
          <div className="space-y-3 bg-gray-50 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={releaseGrade}
                onChange={(e) => setReleaseGrade(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div className="flex items-center gap-2">
                {releaseGrade ? <Eye className="h-5 w-5 text-green-600" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
                <div>
                  <p className="font-medium text-gray-900">Release grade to student</p>
                  <p className="text-sm text-gray-600">Student will be notified immediately</p>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFinal}
                onChange={(e) => setIsFinal(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div className="flex items-center gap-2">
                {isFinal ? <Lock className="h-5 w-5 text-purple-600" /> : <Unlock className="h-5 w-5 text-gray-400" />}
                <div>
                  <p className="font-medium text-gray-900">Mark as final grade</p>
                  <p className="text-sm text-gray-600">Cannot be changed without admin approval</p>
                </div>
              </div>
            </label>
          </div>

          {/* Grade Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Grade Summary</h3>
              <div className="flex items-center gap-2">
                {isFinal && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Final
                  </span>
                )}
                {releaseGrade && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Released
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-3xl font-bold text-blue-600">{finalGrade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Out of</p>
                <p className="text-3xl font-bold text-gray-900">{maxPoints}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Percentage</p>
                <p className="text-3xl font-bold text-purple-600">{percentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Grade
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
