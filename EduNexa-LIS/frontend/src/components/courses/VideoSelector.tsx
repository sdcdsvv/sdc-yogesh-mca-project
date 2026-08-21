import React, { useState, useEffect } from 'react';
import { Video, Upload, X, CheckCircle } from 'lucide-react';

interface VideoSelectorProps {
  selectedVideoId?: string;
  onVideoSelect: (videoId: string) => void;
  onVideoUpload?: () => void;
}

interface VideoItem {
  id: string;
  title: string;
  filename: string;
  uploadedAt: string;
}

export const VideoSelector: React.FC<VideoSelectorProps> = ({
  selectedVideoId,
  onVideoSelect,
  onVideoUpload
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (showModal) {
      fetchVideos();
    }
  }, [showModal]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://192.160.108.56:5010/api/videos/list?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (videoId: string) => {
    onVideoSelect(videoId);
    setShowModal(false);
  };

  const selectedVideo = videos.find(v => v.id === selectedVideoId);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 text-sm"
        >
          <Video className="h-4 w-4" />
          {selectedVideoId ? 'Change Video' : 'Select Video'}
        </button>
        {selectedVideoId && (
          <CheckCircle className="h-5 w-5 text-green-600" title="Video selected" />
        )}
      </div>

      {selectedVideo && (
        <p className="text-xs text-gray-600 mt-1">Selected: {selectedVideo.title}</p>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Select Video</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No videos uploaded yet</p>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      onVideoUpload?.();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Video
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleSelect(video.id)}
                      className={`w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedVideoId === video.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <Video className="h-8 w-8 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">{video.title}</p>
                        <p className="text-sm text-gray-500">{video.filename}</p>
                      </div>
                      {selectedVideoId === video.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
