import React, { useState, useEffect } from 'react';
import CourseAPI, { Material, MaterialUploadRequest, VideoUploadRequest } from '../../services/courseAPI';
import {
  Plus,
  Video,
  FileText,
  Link as LinkIcon,
  Upload,
  Trash2,
  Save,
  X,
  Loader
} from 'lucide-react';

interface CourseMaterialManagerProps {
  courseId: string;
  onUpdate?: () => void;
}

export const CourseMaterialManager: React.FC<CourseMaterialManagerProps> = ({
  courseId,
  onUpdate
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [materialType, setMaterialType] = useState<'video' | 'pdf' | 'document' | 'link'>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [order, setOrder] = useState(0);
  const [isRequired, setIsRequired] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const materialsData = await CourseAPI.getCourseMaterials(courseId);
      setMaterials(materialsData);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setVideoFile(null);
    setOrder(0);
    setIsRequired(true);
    setMaterialType('video');
  };

  const handleAddMaterial = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (materialType === 'video' && !videoFile) {
      alert('Please select a video file');
      return;
    }

    if (materialType !== 'video' && !content.trim()) {
      alert('Please enter content/URL');
      return;
    }

    setIsSubmitting(true);

    try {
      if (materialType === 'video' && videoFile) {
        const videoData: VideoUploadRequest = {
          title: title.trim(),
          description: description.trim(),
          order,
          video: videoFile
        };
        await CourseAPI.uploadVideo(courseId, videoData);
      } else {
        const materialData: MaterialUploadRequest = {
          title: title.trim(),
          description: description.trim(),
          type: materialType,
          content: content.trim(),
          order,
          is_required: isRequired
        };
        await CourseAPI.uploadMaterial(courseId, materialData);
      }

      alert('Material added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchMaterials();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      console.error('Failed to add material:', error);
      alert(`Failed to add material: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert('Video file size must be less than 100MB');
      return;
    }

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      return;
    }

    setVideoFile(file);
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-blue-600" />;
      case 'pdf':
      case 'document':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-green-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Course Materials</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Material
        </button>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Materials Yet</h3>
          <p className="text-gray-600 mb-4">Add videos, documents, or links to your course</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First Material
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <div
              key={material._id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getMaterialIcon(material.type)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-medium text-gray-900 mb-1">
                      {material.title}
                    </h4>
                    {material.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {material.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="capitalize">{material.type}</span>
                      {material.order !== undefined && (
                        <span>Order: {material.order}</span>
                      )}
                      {material.is_required && (
                        <span className="text-red-600 font-medium">Required</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="text-red-600 hover:text-red-700 p-2"
                  title="Delete material"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add Course Material</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: 'video', label: 'Video', icon: Video },
                    { value: 'pdf', label: 'PDF', icon: FileText },
                    { value: 'document', label: 'Document', icon: FileText },
                    { value: 'link', label: 'Link', icon: LinkIcon }
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setMaterialType(type.value as any)}
                      className={`flex flex-col items-center gap-2 p-4 border-2 rounded-lg transition-colors ${
                        materialType === type.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Introduction to React Hooks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this material"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {materialType === 'video' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                      required
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      {videoFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <Video className="h-8 w-8 text-blue-600" />
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900">{videoFile.name}</p>
                            <p className="text-sm text-gray-500">
                              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setVideoFile(null);
                            }}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 text-center">Click to upload video</p>
                          <p className="text-sm text-gray-500 mt-1 text-center">MP4, AVI, MOV (Max 100MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {materialType === 'link' ? 'URL' : 'Content'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      materialType === 'link'
                        ? 'https://example.com'
                        : 'Enter content or file path'
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order (Optional)
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-required"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="is-required" className="text-sm text-gray-700">
                  Mark as required for course completion
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMaterial}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    {materialType === 'video' ? 'Uploading...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Add Material
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
