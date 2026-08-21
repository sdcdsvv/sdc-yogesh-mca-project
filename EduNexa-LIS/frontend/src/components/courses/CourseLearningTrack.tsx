import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle,
  Lock,
  Clock,
  FileText,
  Video,
  Award,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document' | 'assignment';
  content: string;
  duration: string;
  order: number;
  isCompleted?: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface CourseLearningTrackProps {
  modules: Module[];
  courseId: string;
  onLessonComplete?: (moduleId: string, lessonId: string) => void;
  onLessonStart?: (moduleId: string, lessonId: string) => void;
}

export const CourseLearningTrack: React.FC<CourseLearningTrackProps> = ({
  modules,
  courseId,
  onLessonComplete,
  onLessonStart
}) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([modules[0]?.id]);
  const [currentLesson, setCurrentLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleLessonClick = (moduleId: string, lessonId: string) => {
    setCurrentLesson({ moduleId, lessonId });
    onLessonStart?.(moduleId, lessonId);
  };

  const handleMarkComplete = (moduleId: string, lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    onLessonComplete?.(moduleId, lessonId);
  };

  const isLessonCompleted = (lessonId: string) => completedLessons.has(lessonId);

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter(l => isLessonCompleted(l.id)).length;
    const total = module.lessons.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getTotalProgress = () => {
    const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedCount = modules.reduce(
      (sum, m) => sum + m.lessons.filter(l => isLessonCompleted(l.id)).length,
      0
    );
    return totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  };

  const getLessonIcon = (type: string, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle className="h-5 w-5 text-green-600" />;
    
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-purple-600" />;
      case 'document':
        return <FileText className="h-5 w-5 text-blue-600" />;

      case 'assignment':
        return <FileText className="h-5 w-5 text-orange-600" />;
      default:
        return <PlayCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const currentLessonData = currentLesson
    ? modules
        .find(m => m.id === currentLesson.moduleId)
        ?.lessons.find(l => l.id === currentLesson.lessonId)
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Learning Track Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Content</h2>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{modules.length} modules</span>
              <span>{modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons</span>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Your Progress</span>
              <span className="font-semibold text-gray-900">{getTotalProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getTotalProgress()}%` }}
              />
            </div>
          </div>

          {/* Modules List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {modules.map((module, moduleIndex) => {
              const isExpanded = expandedModules.includes(module.id);
              const progress = getModuleProgress(module);

              return (
                <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {moduleIndex + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm truncate">{module.title}</h3>
                        <p className="text-xs text-gray-500">{module.lessons.length} lessons • {progress}%</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  {/* Module Progress Bar */}
                  <div className="h-1 bg-gray-200">
                    <div
                      className="h-1 bg-blue-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Lessons List */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-100">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isCompleted = isLessonCompleted(lesson.id);
                        const isCurrent = currentLesson?.lessonId === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonClick(module.id, lesson.id)}
                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                              isCurrent ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                          >
                            {getLessonIcon(lesson.type, isCompleted)}
                            <div className="flex-1 text-left min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}>
                                {lesson.title}
                              </p>
                              {lesson.duration && (
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {lesson.duration}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="lg:col-span-2">
        {currentLessonData ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Lesson Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getLessonIcon(currentLessonData.type, isLessonCompleted(currentLessonData.id))}
                    <span className="text-sm font-medium text-gray-600 capitalize">
                      {currentLessonData.type}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentLessonData.title}</h1>
                  {currentLessonData.duration && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {currentLessonData.duration}
                    </p>
                  )}
                </div>
                {!isLessonCompleted(currentLessonData.id) && (
                  <button
                    onClick={() => handleMarkComplete(currentLesson!.moduleId, currentLesson!.lessonId)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Complete
                  </button>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="p-6">
              {currentLessonData.type === 'video' && currentLessonData.content && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                  <video
                    controls
                    className="w-full h-full"
                    src={currentLessonData.content}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {currentLessonData.type === 'document' && currentLessonData.content && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Document Resource</h3>
                  <p className="text-gray-600 mb-4">Click below to access the document</p>
                  <a
                    href={currentLessonData.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Document
                  </a>
                </div>
              )}



              {currentLessonData.type === 'assignment' && (
                <div className="border-2 border-orange-200 bg-orange-50 rounded-lg p-8 text-center">
                  <FileText className="h-16 w-16 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Assignment</h3>
                  <p className="text-gray-600 mb-4">Complete this assignment to proceed</p>
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    <Download className="h-4 w-4" />
                    View Assignment
                  </button>
                </div>
              )}

              {!currentLessonData.content && (
                <div className="text-center py-12 text-gray-500">
                  <p>No content available for this lesson yet.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <PlayCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Lesson to Start</h3>
            <p className="text-gray-600">Choose a lesson from the course content to begin learning</p>
          </div>
        )}
      </div>
    </div>
  );
};
