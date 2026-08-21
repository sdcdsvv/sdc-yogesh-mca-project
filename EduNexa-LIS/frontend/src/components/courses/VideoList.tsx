import React, { useState, useEffect } from 'react';
import { Video, Play, Trash2, Edit, Eye } from 'lucide-react';
import { getAuthToken, isTokenValid } from '../../utils/tokenHelper';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  filename: string;
  fileSize: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: string;
  views: number;
  videoUrl: string;
}

interface VideoListProps {
  courseId?: string;
  isTeacher?: boolean;
  onVideoSelect?: (video: VideoItem) => void;
}

export const VideoList: React.FC<VideoListProps> = ({ 
  courseId, 
  isTeacher = false,
  onVideoSelect 
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVideos();
  }, [courseId, page]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Get token - check both possible names
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        setError('Please login first. Token not found.');
        setLoading(false);
        return;
      }

      const url = new URL('http://192.160.108.56:5010/api/videos/list');
      if (courseId) {
        url.searchParams.append('courseId', courseId);
      }
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '10');

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      // Get token - check both possible names
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        alert('Please login first. Token not found.');
        return;
      }

      const response = await fetch(`http://192.160.108.56:5010/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete video');
      }

      // Refresh list
      fetchVideos();
    } catch (err: any) {
      alert(err.message || 'Failed to delete video');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No videos uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Video className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {video.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {video.views} views
                </span>
                <span>{formatFileSize(video.fileSize)}</span>
                <span>Uploaded by {video.uploadedBy.name}</span>
                <span>{formatDate(video.uploadedAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onVideoSelect && onVideoSelect(video)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Play video"
              >
                <Play className="w-5 h-5" />
              </button>

              {isTeacher && (
                <button
                  onClick={() => handleDelete(video.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete video"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
