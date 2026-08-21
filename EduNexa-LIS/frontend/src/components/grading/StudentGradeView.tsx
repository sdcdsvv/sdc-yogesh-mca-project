import React from 'react';
import {
  Award,
  CheckCircle,
  FileText,
  Calendar,
  User,
  Lock,
  Eye,
  MessageSquare
} from 'lucide-react';

interface RubricItem {
  criterion: string;
  score: number;
  max_score: number;
  comments: string;
}

interface GradeViewProps {
  grade: number;
  maxPoints: number;
  feedback: string;
  rubricScores?: RubricItem[];
  isFinal: boolean;
  gradedAt: string;
  graderName: string;
}

export const StudentGradeView: React.FC<GradeViewProps> = ({
  grade,
  maxPoints,
  feedback,
  rubricScores,
  isFinal,
  gradedAt,
  graderName
}) => {
  const percentage = maxPoints > 0 ? (grade / maxPoints) * 100 : 0;

  const getGradeColor = (pct: number) => {
    if (pct >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (pct >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (pct >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (pct >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getLetterGrade = (pct: number) => {
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    return 'F';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Grade Header */}
      <div className={`rounded-xl p-6 border-2 ${getGradeColor(percentage)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8" />
            <div>
              <h3 className="text-2xl font-bold">Your Grade</h3>
              <p className="text-sm opacity-80">
                {isFinal ? 'Final Grade' : 'Provisional Grade'}
              </p>
            </div>
          </div>
          {isFinal && (
            <span className="px-4 py-2 bg-white bg-opacity-50 rounded-full flex items-center gap-2 font-medium">
              <Lock className="h-4 w-4" />
              Final
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-sm opacity-80 mb-1">Score</p>
            <p className="text-4xl font-bold">{grade}</p>
          </div>
          <div>
            <p className="text-sm opacity-80 mb-1">Out of</p>
            <p className="text-4xl font-bold">{maxPoints}</p>
          </div>
          <div>
            <p className="text-sm opacity-80 mb-1">Percentage</p>
            <p className="text-4xl font-bold">{percentage.toFixed(1)}%</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-80">Letter Grade</span>
            <span className="text-3xl font-bold">{getLetterGrade(percentage)}</span>
          </div>
        </div>
      </div>

      {/* Grading Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Graded by</p>
              <p className="font-medium text-gray-900">{graderName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Graded on</p>
              <p className="font-medium text-gray-900">{formatDate(gradedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rubric Breakdown */}
      {rubricScores && rubricScores.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Rubric Breakdown
          </h4>
          <div className="space-y-4">
            {rubricScores.map((item, index) => {
              const itemPercentage = item.max_score > 0 ? (item.score / item.max_score) * 100 : 0;
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{item.criterion}</h5>
                    <span className="text-lg font-bold text-blue-600">
                      {item.score} / {item.max_score}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        itemPercentage >= 80 ? 'bg-green-500' :
                        itemPercentage >= 60 ? 'bg-blue-500' :
                        itemPercentage >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${itemPercentage}%` }}
                    />
                  </div>

                  {item.comments && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm text-blue-900 flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{item.comments}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overall Feedback */}
      {feedback && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Instructor Feedback
          </h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{feedback}</p>
          </div>
        </div>
      )}

      {/* Status Notice */}
      {!isFinal && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <Eye className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-900 mb-1">Provisional Grade</p>
            <p className="text-sm text-yellow-800">
              This grade is provisional and may be updated by your instructor. You will be notified if any changes are made.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
