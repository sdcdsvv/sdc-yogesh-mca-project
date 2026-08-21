import React, { useState } from 'react';
import { Upload, Video, X, CheckCircle, AlertCircle } from 'lucide-react';
import { getAuthToken, isTokenValid, isTeacher } from '../../utils/tokenHelper';

interface VideoUploadProps {
  onUploadComplete?: (videoData: any) => void;
  courseId?: string;
  maxSizeMB?: number;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ 
  onUploadComplete,
  courseId,
  maxSizeMB = 100 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Requirement 6.2: Validate file type with clear error message
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!file.type.startsWith('video/') || !allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed types: MP4, WebM, OGG. Your file type: ${file.type || 'unknown'}`);
      return;
    }

    // Requirement 6.1: Validate file size with clear error message
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds maximum allowed size of ${maxSizeMB}MB. Your file size: ${fileSizeMB.toFixed(2)}MB`);
      return;
    }

    setSelectedFile(file);
    setError('');
    setSuccess(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (!title.trim()) {
      setError('Please enter a video title');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    // Get token - check both possible names
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      setError('Please login first. Token not found.');
      setUploading(false);
      return;
    }

    console.log('🔑 Using token for upload:', token.substring(0, 20) + '...');

    // Create FormData
    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    // Use XMLHttpRequest for real upload progress
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percentComplete);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 201) {
        try {
          const data = JSON.parse(xhr.responseText);
          setUploadProgress(100);
          setSuccess(true);
          
          if (onUploadComplete) {
            onUploadComplete(data);
          }
        } catch (err) {
          setError('Upload completed but failed to parse response');
        }
      } else {
        // Requirement 6.1, 6.2: Show user-friendly error messages
        try {
          const errorData = JSON.parse(xhr.responseText);
          let errorMessage = errorData.error || `Upload failed with status ${xhr.status}`;
          
          // Add specific guidance based on error code
          if (xhr.status === 413) {
            errorMessage += '. Please reduce the file size or compress the video.';
          } else if (xhr.status === 400) {
            errorMessage += '. Please check the file format and try again.';
          } else if (xhr.status === 403) {
            errorMessage += '. You may not have permission to upload videos.';
          } else if (xhr.status === 401) {
            errorMessage += '. Please log in again.';
          }
          
          setError(errorMessage);
        } catch {
          setError(`Upload failed with status ${xhr.status}. Please try again.`);
        }
      }
      setUploading(false);
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      setError('Network error. Please check your connection and try again.');
      setUploading(false);
    });

    xhr.addEventListener('abort', () => {
      setError('Upload cancelled');
      setUploading(false);
    });

    // Open connection and send
    xhr.open('POST', 'http://192.160.108.56:5010/api/videos/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setUploadProgress(0);
    setError('');
    setSuccess(false);
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              MP4, AVI, MOV, or other video formats (Max {maxSizeMB}MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="video/*"
            onChange={handleFileSelect}
          />
        </label>
      ) : (
        <div className="border-2 border-gray-300 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Video className="w-10 h-10 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!uploading && !success && (
              <button
                onClick={handleRemove}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {!uploading && !success && (
            <div className="space-y-4 mb-4">
              <div>
                <label htmlFor="videoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  id="videoTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter video title"
                  required
                />
              </div>
              <div>
                <label htmlFor="videoDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="videoDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter video description"
                  rows={3}
                />
              </div>
            </div>
          )}

          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Upload successful!</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!uploading && !success && (
            <button
              onClick={handleUpload}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Video
            </button>
          )}
        </div>
      )}
    </div>
  );
};
