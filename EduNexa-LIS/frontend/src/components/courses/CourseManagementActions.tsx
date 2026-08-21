import React, { useState } from 'react';
import CourseAPI from '../../services/courseAPI';
import {
  Edit,
  Trash2,
  Archive,
  RotateCcw,
  MoreVertical,
  AlertTriangle,
  X
} from 'lucide-react';

interface CourseManagementActionsProps {
  courseId: string;
  courseTitle: string;
  isActive: boolean;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export const CourseManagementActions: React.FC<CourseManagementActionsProps> = ({
  courseId,
  courseTitle,
  isActive,
  onUpdate,
  onDelete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleEdit = () => {
    navigate(`/courses/${courseId}/edit`);
    setShowMenu(false);
  };

  const handleArchive = async () => {
    setIsProcessing(true);
    try {
      await CourseAPI.archiveCourse(courseId);
      alert('Course archived successfully');
      setShowArchiveModal(false);
      setShowMenu(false);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Failed to archive course:', error);
      alert(`Failed to archive course: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      await CourseAPI.restoreCourse(courseId);
      alert('Course restored successfully');
      setShowMenu(false);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Failed to restore course:', error);
      alert(`Failed to restore course: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      // Note: This sets is_active to false (soft delete)
      await CourseAPI.deleteCourse(courseId);
      alert('Course deleted successfully');
      setShowDeleteModal(false);
      setShowMenu(false);
      if (onDelete) onDelete();
    } catch (error: any) {
      console.error('Failed to delete course:', error);
      alert(`Failed to delete course: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      {/* Menu Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Course actions"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Course
            </button>

            {isActive ? (
              <button
                onClick={() => {
                  setShowArchiveModal(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Archive className="h-4 w-4" />
                Archive Course
              </button>
            ) : (
              <button
                onClick={handleRestore}
                disabled={isProcessing}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Restore Course
              </button>
            )}

            <div className="border-t border-gray-200 my-1" />

            <button
              onClick={() => {
                setShowDeleteModal(true);
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Course
            </button>
          </div>
        </>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Archive className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Archive Course</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to archive "<strong>{courseTitle}</strong>"? 
              Students will no longer be able to enroll, but existing enrollments will remain active.
              You can restore it later.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowArchiveModal(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleArchive}
                disabled={isProcessing}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Archiving...
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4" />
                    Archive Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Course</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "<strong>{courseTitle}</strong>"?
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-900 mb-2">Warning:</h4>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>This will deactivate the course</li>
                  <li>Students will lose access to course materials</li>
                  <li>All enrollments will be affected</li>
                  <li>Course data will be preserved but hidden</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
