import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, AlertCircle, Plus, Trash2, BookOpen } from 'lucide-react';
import { AssignmentAPI, CreateAssignmentRequest, UpdateAssignmentRequest, Assignment } from '../../services/assignmentAPI';
import { Toast } from '../common/Toast';
import { validateForm, assignmentValidationRules } from '../../utils/validation';
import { useLMS } from '../../contexts/LMSContext';

interface AssignmentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseId?: string;
  editingAssignment?: Assignment | null;
}

export const AssignmentCreationModal: React.FC<AssignmentCreationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  courseId,
  editingAssignment
}) => {
  const { courses } = useLMS();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: courseId || '',
    instructions: '',
    due_date: '',
    max_points: 100,
    submission_type: 'both' as 'file' | 'text' | 'both',
    allowed_file_types: [] as string[],
    max_file_size: 10
  });

  const [newFileType, setNewFileType] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        title: editingAssignment.title,
        description: editingAssignment.description,
        course_id: editingAssignment.course_id,
        instructions: editingAssignment.instructions || '',
        due_date: editingAssignment.due_date.split('T')[0] + 'T' + editingAssignment.due_date.split('T')[1].substring(0, 5),
        max_points: editingAssignment.max_points,
        submission_type: editingAssignment.submission_type,
        allowed_file_types: editingAssignment.allowed_file_types || [],
        max_file_size: editingAssignment.max_file_size
      });
    } else if (courseId) {
      setFormData(prev => ({ ...prev, course_id: courseId }));
    }
  }, [editingAssignment, courseId]);

  const validateFormData = (): boolean => {
    const validation = validateForm(formData, assignmentValidationRules);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submitted with data:', formData);

    if (!validateFormData()) {
      console.log('Validation failed with errors:', errors);
      return;
    }

    setLoading(true);
    try {
      if (editingAssignment) {
        const updateData: UpdateAssignmentRequest = {
          title: formData.title,
          description: formData.description,
          instructions: formData.instructions,
          due_date: new Date(formData.due_date).toISOString(),
          max_points: formData.max_points,
          submission_type: formData.submission_type,
          allowed_file_types: formData.allowed_file_types,
          max_file_size: formData.max_file_size
        };
        
        console.log('Updating assignment with data:', updateData);
        await AssignmentAPI.updateAssignment(editingAssignment._id, updateData);
        setToast({ type: 'success', message: 'Assignment updated successfully!' });
      } else {
        const createData: CreateAssignmentRequest = {
          ...formData,
          due_date: new Date(formData.due_date).toISOString()
        };
        
        console.log('Creating assignment with data:', createData);
        const result = await AssignmentAPI.createAssignment(createData);
        console.log('Assignment created successfully:', result);
        setToast({ type: 'success', message: 'Assignment created successfully!' });
      }

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving assignment:', error);
      setToast({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to save assignment' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      course_id: courseId || '',
      instructions: '',
      due_date: '',
      max_points: 100,
      submission_type: 'both',
      allowed_file_types: [],
      max_file_size: 10
    });
    setErrors({});
    setNewFileType('');
    onClose();
  };

  const addFileType = () => {
    if (newFileType.trim() && !formData.allowed_file_types.includes(newFileType.trim())) {
      setFormData(prev => ({
        ...prev,
        allowed_file_types: [...prev.allowed_file_types, newFileType.trim()]
      }));
      setNewFileType('');
    }
  };

  const removeFileType = (fileType: string) => {
    setFormData(prev => ({
      ...prev,
      allowed_file_types: prev.allowed_file_types.filter(ft => ft !== fileType)
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Course Selection - only show if courseId not provided */}
            {!courseId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course *
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.course_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, course_id: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                      errors.course_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading || editingAssignment !== null}
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.course_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>
                )}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter assignment title"
                disabled={loading}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Brief description of the assignment"
                disabled={loading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Provide detailed instructions for students..."
                disabled={loading}
              />
            </div>

            {/* Due Date and Max Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.due_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                </div>
                {errors.due_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Points *
                </label>
                <input
                  type="number"
                  value={formData.max_points}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_points: parseInt(e.target.value) || 0 }))}
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.max_points ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.max_points && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_points}</p>
                )}
              </div>
            </div>

            {/* Submission Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submission Type *
              </label>
              <div className="grid grid-cols-3 gap-4">
                {(['file', 'text', 'both'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, submission_type: type }))}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                      formData.submission_type === type
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                    disabled={loading}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* File Settings */}
            {(formData.submission_type === 'file' || formData.submission_type === 'both') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed File Types
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFileType}
                      onChange={(e) => setNewFileType(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFileType())}
                      placeholder="e.g., .pdf, .docx, .zip"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={addFileType}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      disabled={loading}
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                  {formData.allowed_file_types.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formData.allowed_file_types.map((fileType) => (
                        <span
                          key={fileType}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {fileType}
                          <button
                            type="button"
                            onClick={() => removeFileType(fileType)}
                            className="text-gray-500 hover:text-red-600"
                            disabled={loading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max File Size (MB) *
                  </label>
                  <input
                    type="number"
                    value={formData.max_file_size}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_file_size: parseInt(e.target.value) || 0 }))}
                    min="1"
                    max="100"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.max_file_size ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  {errors.max_file_size && (
                    <p className="mt-1 text-sm text-red-600">{errors.max_file_size}</p>
                  )}
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Assignment Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Students will be notified when the assignment is created</li>
                    <li>Set a realistic deadline for students to complete the work</li>
                    <li>Provide clear instructions to avoid confusion</li>
                    <li>You can edit the assignment details before the due date</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {editingAssignment ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};
