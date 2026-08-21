import React, { useState } from 'react';
import { VideoUpload } from '../components/courses/VideoUpload';
import { VideoList } from '../components/courses/VideoList';
import { VideoPlayer } from '../components/courses/VideoPlayer';
import { Upload, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const VideoManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('list');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin' || user?.role === 'super_admin';

  const handleUploadComplete = (videoData: any) => {
    // Refresh the video list
    setRefreshKey(prev => prev + 1);
    // Switch to list view
    setActiveTab('list');
  };

  const handleVideoSelect = (video: any) => {
    setSelectedVideo(video);
  };

  if (!isTeacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            Only teachers and administrators can access the video management page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Management</h1>
          <p className="text-gray-600">Upload and manage your course videos</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('list')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'list'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <List className="w-5 h-5" />
                My Videos
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'upload'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Upload className="w-5 h-5" />
                Upload Video
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'upload' ? (
              <div className="max-w-2xl mx-auto">
                <VideoUpload onUploadComplete={handleUploadComplete} />
              </div>
            ) : (
              <VideoList 
                key={refreshKey}
                isTeacher={true} 
                onVideoSelect={handleVideoSelect}
              />
            )}
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};
