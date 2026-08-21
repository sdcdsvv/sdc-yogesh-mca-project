import React, { useState, useEffect } from 'react';
import { MessageSquare, Clock, ThumbsUp, ThumbsDown, Trash2, Search, User, Download, Filter, ChevronLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import type { Language } from '../../types';

interface Message {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  feedback?: {
    rating: number | null;
    comment?: string;
  };
  metadata?: {
    language?: string;
    response_time?: number;
  };
}

interface Session {
  _id: string;
  first_message: string;
  last_message: string;
  last_timestamp: string;
  message_count: number;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  stats: {
    total_chats: number;
    total_feedback: number;
  };
}

interface ChatHistoryProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ language = 'english', onLanguageChange }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchSessions();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/history/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSessions(data.data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionMessages = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/history/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.chats);
        setSelectedSession(sessionId);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/history/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message_id: messageId, rating })
      });
      
      if (response.ok) {
        setMessages(messages.map(msg => 
          msg._id === messageId 
            ? { ...msg, feedback: { rating } }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Delete this conversation?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`http://localhost:5000/api/history/session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSessions(sessions.filter(s => s._id !== sessionId));
      if (selectedSession === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterByDate = (session: Session) => {
    if (dateFilter === 'all') return true;
    
    const sessionDate = new Date(session.last_timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / 86400000);

    if (dateFilter === 'today') return diffDays === 0;
    if (dateFilter === 'week') return diffDays <= 7;
    if (dateFilter === 'month') return diffDays <= 30;
    return true;
  };

  const filteredSessions = sessions
    .filter(session =>
      session.first_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.last_message.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(filterByDate);

  const exportConversation = (format: 'md' | 'json') => {
    if (!selectedSession || messages.length === 0) return;

    let content = '';
    let filename = '';

    if (format === 'md') {
      content = `# Chat Conversation\n\n`;
      content += `**Date**: ${formatFullDate(messages[0].timestamp)}\n\n`;
      content += `---\n\n`;
      
      messages.forEach(msg => {
        const role = msg.role === 'user' ? '👤 You' : '🤖 AI Assistant';
        content += `### ${role}\n`;
        content += `*${formatFullDate(msg.timestamp)}*\n\n`;
        content += `${msg.content}\n\n`;
        if (msg.feedback?.rating) {
          content += `*Feedback: ${msg.feedback.rating === 1 ? '👍 Liked' : '👎 Disliked'}*\n\n`;
        }
        content += `---\n\n`;
      });
      
      filename = `chat-${selectedSession}.md`;
    } else {
      content = JSON.stringify({
        session_id: selectedSession,
        exported_at: new Date().toISOString(),
        messages: messages
      }, null, 2);
      filename = `chat-${selectedSession}.json`;
    }

    const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sanitizeAndRenderMarkdown = (content: string) => {
    const sanitized = DOMPurify.sanitize(content);
    return sanitized;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Navbar currentLanguage={language} onLanguageChange={onLanguageChange} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-stone-600 font-medium">Loading your conversations...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar currentLanguage={language} onLanguageChange={onLanguageChange} />
      
      {/* Hero Section */}
      <div className="relative pt-48 pb-12 bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 overflow-hidden">
        {/* Mountain Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="chat-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 10 L50 40 L10 40 Z" fill="currentColor" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#chat-pattern)"/>
          </svg>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* User Info */}
            <div className="flex items-center gap-4">
              {selectedSession && (
                <button
                  onClick={() => {
                    setSelectedSession(null);
                    setMessages([]);
                  }}
                  className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}
              
              {userProfile && (
                <>
                  {userProfile.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white/20 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/20 shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-white" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                      {userProfile.name}'s Chat History
                    </h1>
                    <p className="text-white/80" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.2)' }}>
                      {userProfile.email}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Stats */}
            {userProfile && (
              <div className="flex gap-6">
                <div className="text-center bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                  <div className="text-2xl font-bold text-white">{userProfile.stats.total_chats}</div>
                  <div className="text-xs text-white/80">Total Chats</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                  <div className="text-2xl font-bold text-white">{sessions.length}</div>
                  <div className="text-xs text-white/80">Conversations</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/20">
                  <div className="text-2xl font-bold text-white">{userProfile.stats.total_feedback}</div>
                  <div className="text-xs text-white/80">Feedback Given</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sessions List */}
            <div className={`lg:col-span-1 bg-white rounded-2xl shadow-lg border border-stone-200 ${selectedSession ? 'hidden lg:block' : 'block'}`}>
              <div className="p-4 border-b border-stone-200 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
                <h2 className="text-lg font-bold text-stone-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  Conversations
                </h2>
              
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                
                {showFilters && (
                  <div className="flex gap-1">
                    {(['all', 'today', 'week', 'month'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setDateFilter(filter)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${
                          dateFilter === filter
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : filter === 'week' ? 'Week' : 'Month'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto p-4">
              {filteredSessions.length === 0 ? (
                <p className="text-stone-500 text-center py-8">No conversations found</p>
              ) : (
                filteredSessions.map((session) => (
                  <div
                    key={session._id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedSession === session._id
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500 shadow-md'
                        : 'bg-stone-50 hover:bg-stone-100 border-2 border-transparent hover:shadow-sm'
                    }`}
                    onClick={() => fetchSessionMessages(session._id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate">
                          {session.first_message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span className="text-xs text-stone-500">
                            {formatDate(session.last_timestamp)}
                          </span>
                          <span className="text-xs text-stone-500">
                            • {session.message_count} messages
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session._id);
                        }}
                        className="text-stone-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

            {/* Messages View */}
            <div className={`lg:col-span-2 bg-white rounded-2xl shadow-lg border border-stone-200 ${!selectedSession && 'hidden lg:block'}`}>
              {!selectedSession ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-6 shadow-md">
                    <MessageSquare className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-800 mb-2">No Conversation Selected</h3>
                  <p className="text-stone-500">Select a conversation from the list to view messages</p>
                </div>
              ) : (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-stone-200 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between rounded-t-2xl">
                    <div>
                      <h3 className="font-bold text-stone-800">Conversation</h3>
                      <p className="text-xs text-stone-500">{messages.length} messages</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportConversation('md')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-sm"
                        title="Export as Markdown"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">MD</span>
                      </button>
                      <button
                        onClick={() => exportConversation('json')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-sm"
                        title="Export as JSON"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-white text-sm">🤖</span>
                          </div>
                        )}
                        
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                              : 'bg-white text-stone-800 border border-stone-200'
                          }`}
                        >
                        {message.role === 'user' ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="text-sm mb-2 last:mb-0 leading-relaxed text-stone-700">{children}</p>,
                                h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-stone-900 border-b border-stone-200 pb-1">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-stone-800">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-bold mb-1 text-stone-800">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-sm text-stone-700">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-stone-900">{children}</strong>,
                                em: ({ children }) => <em className="italic text-stone-700">{children}</em>,
                                code: ({ children }) => (
                                  <code className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-mono border border-emerald-200">{children}</code>
                                ),
                                pre: ({ children }) => (
                                  <pre className="bg-stone-50 p-3 rounded-lg text-xs overflow-x-auto border border-stone-200 my-2 font-mono">{children}</pre>
                                ),
                                a: ({ children, href }) => (
                                  <a href={href} className="text-emerald-600 hover:text-emerald-700 underline font-medium" target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                ),
                                img: ({ src, alt }) => (
                                  <img src={src} alt={alt} className="rounded-lg max-w-full h-auto my-2 border border-stone-200" />
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-stone-600 my-2">{children}</blockquote>
                                ),
                              }}
                            >
                              {sanitizeAndRenderMarkdown(message.content)}
                            </ReactMarkdown>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-200/50 gap-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 opacity-50" />
                            <span className={`text-xs ${message.role === 'user' ? 'text-white/80' : 'text-stone-500'}`}>
                              {formatFullDate(message.timestamp)}
                            </span>
                          </div>
                          
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleFeedback(message._id, 1)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  message.feedback?.rating === 1
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : 'hover:bg-stone-100 text-stone-400 hover:text-emerald-600'
                                }`}
                                title="Like this response"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message._id, -1)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  message.feedback?.rating === -1
                                    ? 'bg-red-100 text-red-600'
                                    : 'hover:bg-stone-100 text-stone-400 hover:text-red-600'
                                }`}
                                title="Dislike this response"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-400 to-stone-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ChatHistory;
