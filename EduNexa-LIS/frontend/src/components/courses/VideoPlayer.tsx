import React, { useRef, useEffect, useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  youtubeUrl?: string; // YouTube URL if available
  onClose: () => void;
  onComplete?: () => void;
  initialWatchTime?: number; // Resume from last position
  onProgressUpdate?: (watchTime: number, duration: number) => void; // Callback for progress updates
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, title, youtubeUrl, onClose, onComplete, initialWatchTime = 0, onProgressUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isResumed, setIsResumed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Check if YouTube URL is provided
  useEffect(() => {
    if (youtubeUrl) {
      const ytId = extractYouTubeId(youtubeUrl);
      if (ytId) {
        setIsYouTube(true);
        setYoutubeVideoId(ytId);
        setIsLoading(false);
      } else {
        setError('Invalid YouTube URL');
        setIsLoading(false);
      }
    }
  }, [youtubeUrl]);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getVideoStreamUrl = () => {
    // Requirement 3.6: Fetch video from /api/videos/<video_id>/stream
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.160.108.56:5010/api';
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    // Include token in URL as query parameter for video streaming
    // This allows the video element to make authenticated requests with range support
    return `${baseUrl}/videos/${videoId}/stream?token=${token}`;
  };

  // Load video with proper error handling and loading states
  useEffect(() => {
    // Skip loading for YouTube videos
    if (isYouTube) return;
    
    if (!videoRef.current) return;

    const loadVideo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get token - check both possible names
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required. Please log in again.');
          setIsLoading(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.160.108.56:5010/api';
        const streamUrl = `${baseUrl}/videos/${videoId}/stream`;
        
        // Verify access with HEAD request first
        const response = await fetch(streamUrl, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 403) {
            setError('You do not have permission to access this video. Please ensure you are enrolled in the course.');
          } else if (response.status === 404) {
            setError('Video not found. It may have been removed or is temporarily unavailable.');
          } else if (response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else {
            setError(`Failed to load video (Error ${response.status}). Please try again later.`);
          }
          setIsLoading(false);
          return;
        }

        // Set video source with token in URL for authenticated streaming with range support
        // This allows the browser's native video player to handle range requests
        if (videoRef.current) {
          videoRef.current.src = getVideoStreamUrl();
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load video:', err);
        setError('Failed to load video. Please check your connection and try again.');
        setIsLoading(false);
      }
    };

    loadVideo();
  }, [videoId, isYouTube]);

  // Track YouTube video progress
  useEffect(() => {
    if (!isYouTube) return;

    // For YouTube, we'll track progress using intervals
    const progressInterval = setInterval(async () => {
      // Estimate watch time (YouTube doesn't provide exact API without iframe API setup)
      const estimatedWatchTime = watchTime + 10; // Increment by 10 seconds
      setWatchTime(estimatedWatchTime);

      // Update progress on backend
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) return;

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.160.108.56:5010/api';
        await fetch(`${baseUrl}/videos/${videoId}/progress`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            watchTime: estimatedWatchTime,
            duration: duration || 600 // Default 10 minutes if not known
          })
        });

        if (onProgressUpdate) {
          onProgressUpdate(estimatedWatchTime, duration || 600);
        }
      } catch (error) {
        console.error('Failed to update YouTube video progress:', error);
      }
    }, 10000); // Update every 10 seconds

    return () => {
      clearInterval(progressInterval);
    };
  }, [isYouTube, videoId, watchTime, duration, onProgressUpdate]);

  // Track video progress for local videos
  useEffect(() => {
    if (isYouTube) return; // Skip for YouTube videos
    
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = async () => {
      // Get token - check both possible names
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token || !duration) return;

      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.160.108.56:5010/api';
        
        // Use the new video progress endpoint (Requirement 5.7)
        await fetch(`${baseUrl}/videos/${videoId}/progress`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            watchTime: watchTime,
            duration: duration
          })
        });
        
        // Call the progress update callback if provided
        if (onProgressUpdate) {
          onProgressUpdate(watchTime, duration);
        }
      } catch (error) {
        console.error('Failed to update watch progress:', error);
      }
    };


    const handleTimeUpdate = () => {
      setWatchTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Resume from last watched position
      if (initialWatchTime > 0 && !isResumed && video.duration > 0) {
        video.currentTime = Math.min(initialWatchTime, video.duration - 1);
        setIsResumed(true);
      }
    };

    const handleEnded = () => {
      updateProgress();
      if (onComplete) {
        onComplete();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    // Update progress every 10 seconds
    const progressInterval = setInterval(updateProgress, 10000);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      clearInterval(progressInterval);
      // Final progress update when component unmounts
      updateProgress();
    };
  }, [videoId, watchTime, duration, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-5xl mx-4">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close video player"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-black relative" style={{ minHeight: '400px' }}>
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3" />
                  <p className="text-lg">Loading video...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="text-center text-white max-w-md">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                  <h3 className="text-xl font-semibold mb-2">Unable to Load Video</h3>
                  <p className="text-gray-300 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                      // Trigger reload by updating a dependency
                      const loadVideo = async () => {
                        setIsLoading(true);
                        setError(null);

                        try {
                          const token = localStorage.getItem('access_token') || localStorage.getItem('token');
                          
                          if (!token) {
                            setError('Authentication required. Please log in again.');
                            setIsLoading(false);
                            return;
                          }

                          const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.160.108.56:5010/api';
                          const streamUrl = `${baseUrl}/videos/${videoId}/stream`;
                          
                          const response = await fetch(streamUrl, {
                            method: 'HEAD',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          
                          if (!response.ok) {
                            if (response.status === 403) {
                              setError('You do not have permission to access this video. Please ensure you are enrolled in the course.');
                            } else if (response.status === 404) {
                              setError('Video not found. It may have been removed or is temporarily unavailable.');
                            } else if (response.status === 401) {
                              setError('Your session has expired. Please log in again.');
                            } else {
                              setError(`Failed to load video (Error ${response.status}). Please try again later.`);
                            }
                            setIsLoading(false);
                            return;
                          }

                          // Set video source with token in URL for authenticated streaming
                          if (videoRef.current) {
                            videoRef.current.src = getVideoStreamUrl();
                          }
                          
                          setIsLoading(false);
                        } catch (err) {
                          console.error('Failed to load video:', err);
                          setError('Failed to load video. Please check your connection and try again.');
                          setIsLoading(false);
                        }
                      };
                      loadVideo();
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* YouTube Player */}
            {isYouTube && youtubeVideoId && !error && (
              <div className="relative w-full" style={{ paddingBottom: '56.25%', maxHeight: '70vh' }}>
                <iframe
                  ref={iframeRef}
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&enablejsapi=1&rel=0`}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Local Video Player - Requirement 3.5: Implement video controls (play, pause, seek, volume) */}
            {!isYouTube && (
              <video
                ref={videoRef}
                controls
                autoPlay={!error && !isLoading}
                className={`w-full ${isLoading || error ? 'invisible' : 'visible'}`}
                style={{ maxHeight: '70vh' }}
                onError={(e) => {
                  console.error('Video element error:', e);
                  setError('Video playback error. The video format may not be supported by your browser.');
                  setIsLoading(false);
                }}
                onLoadStart={() => {
                  // Video is starting to load
                  setIsLoading(true);
                }}
                onCanPlay={() => {
                  // Video can start playing
                  setIsLoading(false);
                }}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Progress Info */}
          {duration > 0 && !error && (
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {((watchTime / duration) * 100).toFixed(1)}%</span>
                <span>{Math.floor(watchTime / 60)}:{String(Math.floor(watchTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(watchTime / duration) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
