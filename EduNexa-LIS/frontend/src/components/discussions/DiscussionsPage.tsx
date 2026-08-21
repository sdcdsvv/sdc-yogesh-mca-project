import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus, Search, Filter, Users, Clock, ThumbsUp, Reply, X, Send, Tag, Loader2, AlertTriangle } from 'lucide-react';
import { useLMS } from '../../contexts/LMSContext';
import DiscussionAPI, { Discussion } from '../../services/discussionAPI';
import { Toast } from '../common/Toast';

export const DiscussionsPage: React.FC = () => {
  const { courses } = useLMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    course: '',
    tags: [] as string[]
  });
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchDiscussions = async () => {
    try {
      setError(null);
      const data = await DiscussionAPI.getDiscussions();
      setDiscussions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load discussions.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hrs ago`;
    return date.toLocaleDateString();
  };

  const availableTags = ['machine-learning', 'python', 'data-science', 'algorithms', 'setup', 'web-dev', 'database'];

  const handleStartDiscussion = () => {
    setShowNewDiscussionModal(true);
  };

  const handleSubmitDiscussion = async () => {
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      setToast({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    setCreatingDiscussion(true);
    try {
      const created = await DiscussionAPI.createDiscussion({
        title: newDiscussion.title.trim(),
        content: newDiscussion.content.trim(),
        course_id: newDiscussion.course || undefined,
        tags: newDiscussion.tags
      });
      setDiscussions((prev) => [created, ...prev]);
      setNewDiscussion({ title: '', content: '', course: '', tags: [] });
      setShowNewDiscussionModal(false);
      setToast({ type: 'success', message: 'Discussion created successfully.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create discussion.';
      setToast({ type: 'error', message });
    } finally {
      setCreatingDiscussion(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setNewDiscussion(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const tags = ['all', 'machine-learning', 'python', 'data-science', 'algorithms', 'setup'];

  const filteredDiscussions = discussions
    .filter(discussion =>
      discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (discussion.course_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(discussion => filterTag === 'all' || discussion.tags.includes(filterTag));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discussions</h1>
          <p className="text-gray-600">Engage with your peers and instructors</p>
        </div>
        <button
          onClick={handleStartDiscussion}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Start Discussion
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-red-700 font-medium">
            <AlertTriangle className="h-5 w-5" />
            Error loading discussions
          </div>
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchDiscussions();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading discussions...</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {tags.map(tag => (
                    <option key={tag} value={tag}>
                      {tag === 'all' ? 'All Topics' : tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Discussions List */}
          <div className="space-y-4">
            {filteredDiscussions.length > 0 ? (
              filteredDiscussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                          {discussion.title}
                        </h3>
                        {discussion.is_resolved && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {discussion.course_title ? `in ${discussion.course_title}` : 'General discussion'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {discussion.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>by {discussion.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatRelativeTime(discussion.last_reply_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-gray-600">
                        <ThumbsUp className="h-4 w-4" />
                        <span>{discussion.likes}</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Reply className="h-4 w-4" />
                        <span>{discussion.reply_count}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                <p className="text-gray-600">Try adjusting your search or start a new discussion</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* New Discussion Modal */}
      {showNewDiscussionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Start New Discussion</h2>
              <button
                onClick={() => setShowNewDiscussionModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discussion Title *
                </label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What would you like to discuss?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course (Optional)
                </label>
                <select
                  value={newDiscussion.course}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, course: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">General discussion</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe your question or topic in detail..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${newDiscussion.tags.includes(tag)
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                    >
                      <Tag className="h-3 w-3 inline mr-1" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNewDiscussionModal(false)}
                disabled={creatingDiscussion}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDiscussion}
                disabled={creatingDiscussion}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {creatingDiscussion ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Start Discussion
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
