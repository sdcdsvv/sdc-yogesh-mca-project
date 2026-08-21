import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Users, 
  BookOpen, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Award,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  RefreshCw
} from 'lucide-react';
import { aiAPI, learnerAnalyticsAPI } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface TeachingSuggestion {
  type: 'content' | 'engagement' | 'assessment' | 'support';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export const TeacherAIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<TeachingSuggestion[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'insights' | 'chat'>('suggestions');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadTeachingInsights();
  }, []);

  const loadTeachingInsights = async () => {
    setLoading(true);
    try {
      const analyticsData = await learnerAnalyticsAPI.getPerformanceAnalysis();
      
      console.log('Analytics data received:', analyticsData);
      
      // Handle different response structures
      const summary = (analyticsData as any).summary || analyticsData;
      
      if (summary) {
        setInsights(summary);
        generateTeachingSuggestions(summary);
      } else {
        console.warn('No summary data in analytics response');
        // Set default values if no data
        const defaultSummary = {
          total_students: 0,
          slow_learners_count: 0,
          fast_learners_count: 0,
          average_performance: 0,
          students_at_risk: 0,
          inactive_students: 0
        };
        setInsights(defaultSummary);
        generateTeachingSuggestions(defaultSummary);
      }
    } catch (error) {
      console.error('Failed to load teaching insights:', error);
      // Set default values on error
      const defaultSummary = {
        total_students: 0,
        slow_learners_count: 0,
        fast_learners_count: 0,
        average_performance: 0,
        students_at_risk: 0,
        inactive_students: 0
      };
      setInsights(defaultSummary);
      generateTeachingSuggestions(defaultSummary);
    } finally {
      setLoading(false);
    }
  };

  const generateTeachingSuggestions = (data: any) => {
    const suggestions: TeachingSuggestion[] = [];

    console.log('Generating suggestions from data:', data);

    // Always add some general teaching suggestions
    if (data.total_students > 0) {
      // Content suggestions based on performance
      if (data.slow_learners_count > data.total_students * 0.3) {
        suggestions.push({
          type: 'content',
          title: 'Simplify Course Content',
          description: `${data.slow_learners_count} students are struggling. Consider breaking down complex topics.`,
          priority: 'high',
          actionItems: [
            'Create additional practice materials',
            'Add more visual explanations',
            'Provide step-by-step guides',
            'Offer supplementary resources'
          ]
        });
      }

      // Engagement suggestions
      if (data.inactive_students > 0) {
        suggestions.push({
          type: 'engagement',
          title: 'Boost Student Engagement',
          description: `${data.inactive_students} students haven't been active recently.`,
          priority: 'medium',
          actionItems: [
            'Send personalized check-in messages',
            'Create interactive assignments',
            'Schedule virtual office hours',
            'Form study groups'
          ]
        });
      }

      // Assessment suggestions
      const avgPerf = Number(data.average_performance) || 0;
      console.log('Average performance check:', avgPerf, 'Is < 70?', avgPerf < 70, 'Is > 0?', avgPerf > 0);
      
      if (avgPerf < 70 && avgPerf > 0) {
        console.log('Adding assessment suggestion');
        suggestions.push({
          type: 'assessment',
          title: 'Adjust Assessment Strategy',
          description: `Average performance is ${avgPerf.toFixed(1)}%. Consider modifying assessments.`,
          priority: 'high',
          actionItems: [
            'Provide more practice opportunities',
            'Offer formative assessments',
            'Give detailed feedback',
            'Create rubrics for clarity'
          ]
        });
      }

      // Support suggestions
      if (data.students_at_risk > 0) {
        suggestions.push({
          type: 'support',
          title: 'Support At-Risk Students',
          description: `${data.students_at_risk} students need additional support.`,
          priority: 'high',
          actionItems: [
            'Schedule one-on-one meetings',
            'Provide additional resources',
            'Connect with academic advisors',
            'Offer flexible deadlines'
          ]
        });
      }

      // If performance is good, add positive reinforcement
      const avgPerf2 = Number(data.average_performance) || 0;
      if (avgPerf2 >= 70 && suggestions.length === 0) {
        console.log('Adding excellence suggestion');
        suggestions.push({
          type: 'content',
          title: 'Maintain Teaching Excellence',
          description: `Your students are performing well with an average of ${avgPerf2.toFixed(1)}%. Keep up the great work!`,
          priority: 'low',
          actionItems: [
            'Continue current teaching methods',
            'Share best practices with colleagues',
            'Consider advanced topics for high performers',
            'Gather student feedback for continuous improvement'
          ]
        });
      }
      
      // If still no suggestions, add a general one
      if (suggestions.length === 0) {
        console.log('No specific suggestions, adding general one');
        suggestions.push({
          type: 'content',
          title: 'Continue Monitoring Progress',
          description: `Your ${data.total_students} students are making progress. Keep monitoring their performance.`,
          priority: 'low',
          actionItems: [
            'Review student progress regularly',
            'Provide timely feedback on assignments',
            'Encourage student participation',
            'Maintain open communication channels'
          ]
        });
      }
    } else {
      // No students yet - provide general suggestions
      suggestions.push({
        type: 'content',
        title: 'Prepare Your Course',
        description: 'Get ready for your students by setting up engaging course materials.',
        priority: 'medium',
        actionItems: [
          'Create clear learning objectives',
          'Prepare diverse content types (videos, readings, quizzes)',
          'Set up a welcoming course introduction',
          'Plan your assessment strategy'
        ]
      });
    }

    console.log('Generated suggestions:', suggestions);
    setSuggestions(suggestions);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-blue-200 bg-blue-50 text-blue-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content': return <BookOpen className="h-5 w-5" />;
      case 'engagement': return <Users className="h-5 w-5" />;
      case 'assessment': return <Award className="h-5 w-5" />;
      case 'support': return <Target className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const renderSuggestions = () => {
    console.log('Rendering suggestions, count:', suggestions.length, 'loading:', loading);
    console.log('Suggestions state:', suggestions);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">AI Teaching Suggestions</h2>
          <button
            onClick={loadTeachingInsights}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Analyzing student data...</span>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid gap-6">
          {suggestions.map((suggestion, index) => (
            <div key={index} className={`border rounded-lg p-6 ${getPriorityColor(suggestion.priority)}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{suggestion.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {suggestion.priority} priority
                    </span>
                  </div>
                  <p className="text-sm mb-4">{suggestion.description}</p>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Recommended Actions:</h4>
                    <ul className="text-sm space-y-1">
                      {suggestion.actionItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No specific suggestions at this time. Your students are doing well!</p>
        </div>
      )}
      </div>
    );
  };

  // Handle chat message send
  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      // Add teacher context to the message
      const contextualMessage = `As a teacher, ${userMessage}`;
      
      const response = await aiAPI.chat(contextualMessage);
      const aiResponse = (response as any).response || 'Sorry, I could not process your request.';
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render chat interface
  const renderChat = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">AI Teaching Assistant Chat</h2>
          <button
            onClick={() => setChatMessages([])}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear Chat
          </button>
        </div>

        {/* Chat Messages */}
        <div className="bg-white border border-gray-200 rounded-lg h-[500px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a Conversation</h3>
                <p className="text-gray-600 mb-4">Ask me anything about teaching, student management, or course planning!</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <button
                    onClick={() => setChatInput('How can I improve student engagement in my courses?')}
                    className="text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-900 transition-colors"
                  >
                    💡 How can I improve student engagement?
                  </button>
                  <button
                    onClick={() => setChatInput('What are effective assessment strategies?')}
                    className="text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-900 transition-colors"
                  >
                    📊 Effective assessment strategies?
                  </button>
                  <button
                    onClick={() => setChatInput('How do I handle struggling students?')}
                    className="text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg text-sm text-green-900 transition-colors"
                  >
                    🎯 How to help struggling students?
                  </button>
                  <button
                    onClick={() => setChatInput('Tips for creating engaging course content?')}
                    className="text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm text-orange-900 transition-colors"
                  >
                    ✨ Creating engaging content?
                  </button>
                </div>
              </div>
            ) : (
              <>
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && (
                          <Brain className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          {message.role === 'assistant' ? (
                            <div className="prose prose-sm max-w-none">
                              <MarkdownRenderer content={message.content} />
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-gray-600" />
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about teaching..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={chatLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || chatLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderInsights = () => {
    console.log('Rendering insights:', insights);
    
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Student Performance Insights</h2>
        
        {insights ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Total Students</h3>
                <p className="text-2xl font-bold text-blue-600">{insights.total_students}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Average Performance</h3>
                <p className="text-2xl font-bold text-green-600">
                  {insights.average_performance !== undefined ? `${insights.average_performance}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-900">At Risk</h3>
                <p className="text-2xl font-bold text-red-600">
                  {insights.students_at_risk !== undefined ? insights.students_at_risk : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Slow Learners</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {insights.slow_learners_count !== undefined ? insights.slow_learners_count : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Fast Learners</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {insights.fast_learners_count !== undefined ? insights.fast_learners_count : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Inactive Students</h3>
                <p className="text-2xl font-bold text-gray-600">
                  {insights.inactive_students !== undefined ? insights.inactive_students : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading insights...</p>
        </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Teaching Assistant</h1>
        <p className="text-gray-600">Get AI-powered insights and suggestions to improve your teaching</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'suggestions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            Teaching Suggestions
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'insights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            Student Insights
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'chat'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'suggestions' && renderSuggestions()}
        {activeTab === 'insights' && renderInsights()}
        {activeTab === 'chat' && renderChat()}
      </div>
    </div>
  );
};