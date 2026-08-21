import React, { useState, useEffect } from 'react';
import { Video, Eye, Clock, TrendingUp, Users, Play, Download, ArrowLeft } from 'lucide-react';
import { getAuthToken } from '../../utils/tokenHelper';

interface VideoStatistics {
  total_views: number;
  total_watch_time_seconds: number;
  total_watch_time_formatted: string;
  avg_completion_percentage: number;
  enrolled_students: number;
  view_rate: number;
}

interface CourseVideo {
  id: string;
  title: string;
  description: string;
  content_id: string;
  uploaded_at: string;
  file_size: number;
  file_path: string;
  statistics: VideoStatistics;
}

interface CourseVideosViewProps {
  courseId: string;
  courseTitle?: string;
  onBack?: () => void;
}

export const CourseVideosView: React.FC<CourseVideosViewProps> = ({ courseId, courseTitle, onBack }) => {
  const [videos, setVideos] = useState<CourseVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalVideos, setTotalVideos] = useState(0);
  const [enrolledStudents, setEnrolledStudents] = useState(0);

  useEffect(() => {
    if (courseId) {
      fetchVideos();
    } else {
      console.warn('CourseVideosView: courseId is undefined');
      setError('Course ID is missing');
      setLoading(false);
    }
  }, [courseId]);

  const fetchVideos = async () => {
    if (!courseId) {
      setError('Course ID is required');
      setLoading(false);
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://192.160.108.56:5010/api/progress/course/${courseId}/videos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos);
        setTotalVideos(data.total_videos);
        setEnrolledStudents(data.enrolled_students);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch videos');
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError('Failed to load video statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </button>
        )}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Videos</h1>
        {courseTitle && <p className="text-gray-600">{courseTitle}</p>}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Videos</p>
              <p className="text-2xl font-bold text-gray-900">{totalVideos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Enrolled Students</p>
              <p className="text-2xl font-bold text-gray-900">{enrolledStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.length > 0
                  ? Math.round(videos.reduce((sum, v) => sum + v.statistics.avg_completion_percentage, 0) / videos.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Videos List */}
      <div className="space-y-4">
        {videos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Yet</h3>
            <p className="text-gray-600">Upload videos to your course to see statistics here.</p>
          </div>
        ) : (
          videos.map((video) => (
            <div key={video.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
                  {video.description && (
                    <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Uploaded: {formatDate(video.uploaded_at)}</span>
                    <span>Size: {formatFileSize(video.file_size)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Play className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Total Views</p>
                    <p className="text-sm font-semibold text-gray-900">{video.statistics.total_views}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Watch Time</p>
                    <p className="text-sm font-semibold text-gray-900">{video.statistics.total_watch_time_formatted}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Avg Completion</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {video.statistics.avg_completion_percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">View Rate</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {video.statistics.view_rate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Average Student Progress</span>
                  <span className="text-xs font-medium text-gray-900">
                    {video.statistics.avg_completion_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${video.statistics.avg_completion_percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
