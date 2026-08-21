import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CourseAPI from '../../services/courseAPI';
import {
  BookOpen,
  Upload,
  X,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  AlertCircle,
  Loader
} from 'lucide-react';

interface EditCoursePageProps {
  courseId: string;
}

export const EditCoursePage: React.FC<EditCoursePageProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const goBack = () => {
    window.history.back();
  };

  // Course basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [duration, setDuration] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [maxStudents, setMaxStudents] = useState('50');

  // Course details
  const [prerequisites, setPrerequisites] = useState<string[]>(['']);
  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);

  const categories = [
    'AI & Machine Learning',
    'Programming',
    'Data Science',
    'Web Development',
    'Mobile Development',
    'Database',
    'Cloud Computing',
    'Cybersecurity',
    'DevOps',
    'Other'
  ];

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  // Load course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const course = await CourseAPI.getCourseById(courseId);
        
        // Populate form fields
        setTitle(course.title);
        setDescription(course.description);
        setCategory(course.category);
        setDifficulty(course.difficulty);
        setDuration(course.duration || '');
        setThumbnail(course.thumbnail || '');
        setIsPublic(course.is_public);
        setIsActive(course.is_active);
        setMaxStudents(course.max_students?.toString() || '50');
        setPrerequisites(course.prerequisites && course.prerequisites.length > 0 ? course.prerequisites : ['']);
        setLearningObjectives(course.learning_objectives && course.learning_objectives.length > 0 ? course.learning_objectives : ['']);
        
      } catch (err: any) {
        console.error('Failed to load course:', err);
        setError('Failed to load course data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  const handleAddPrerequisite = () => {
    setPrerequisites([...prerequisites, '']);
  };

  const handleRemovePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index));
  };

  const handlePrerequisiteChange = (index: number, value: string) => {
    const updated = [...prerequisites];
    updated[index] = value;
    setPrerequisites(updated);
  };

  const handleAddObjective = () => {
    setLearningObjectives([...learningObjectives, '']);
  };

  const handleRemoveObjective = (index: number) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const updated = [...learningObjectives];
    updated[index] = value;
    setLearningObjectives(updated);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnail(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!title.trim()) {
      alert('Please enter a course title');
      return;
    }
    if (title.trim().length < 5) {
      alert('Course title must be at least 5 characters long');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a course description');
      return;
    }
    if (description.trim().length < 20) {
      alert('Course description must be at least 20 characters long');
      return;
    }
    if (!category) {
      alert('Please select a category');
      return;
    }
    
    // Validate max students
    const maxStudentsNum = parseInt(maxStudents);
    if (isNaN(maxStudentsNum) || maxStudentsNum < 1) {
      alert('Maximum students must be at least 1');
      return;
    }

    setIsSubmitting(true);

    try {
      const courseData = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        duration: duration.trim() || 'Self-paced',
        thumbnail: thumbnail || 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
        is_public: isPublic,
        is_active: isActive,
        max_students: maxStudentsNum,
        prerequisites: prerequisites.filter(p => p.trim()),
        learning_objectives: learningObjectives.filter(o => o.trim())
      };

      await CourseAPI.updateCourse(courseId, courseData);
      
      alert('Course updated successfully!');
      navigate(`/courses/${courseId}`);
    } catch (error: any) {
      console.error('Error updating course:', error);
      const errorMessage = error.message || 'Failed to update course';
      alert(`Failed to update course: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Course</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={goBack}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Course</h1>
        <p className="text-gray-600">Update your course information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to Machine Learning"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of your course..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 8 weeks, 40 hours"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Students
                </label>
                <input
                  type="number"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  Make this course publicly visible
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Course is active (students can enroll)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Course Thumbnail */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Thumbnail</h2>
          
          <div className="space-y-4">
            {thumbnail ? (
              <div className="relative">
                <img
                  src={thumbnail}
                  alt="Course thumbnail"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setThumbnail('')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Upload a course thumbnail</p>
                <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
                  <Upload className="h-4 w-4" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Recommended: 1200x600px, Max 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Prerequisites */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Prerequisites</h2>
            <button
              type="button"
              onClick={handleAddPrerequisite}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Prerequisite
            </button>
          </div>

          <div className="space-y-3">
            {prerequisites.map((prereq, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={prereq}
                  onChange={(e) => handlePrerequisiteChange(index, e.target.value)}
                  placeholder="e.g., Basic Python knowledge"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {prerequisites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePrerequisite(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Learning Objectives</h2>
            <button
              type="button"
              onClick={handleAddObjective}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Objective
            </button>
          </div>

          <div className="space-y-3">
            {learningObjectives.map((objective, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => handleObjectiveChange(index, e.target.value)}
                  placeholder="e.g., Understand machine learning algorithms"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {learningObjectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveObjective(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={goBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
