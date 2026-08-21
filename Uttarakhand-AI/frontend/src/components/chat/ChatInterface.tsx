import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Volume2, VolumeX } from 'lucide-react';
import MessageBubble from './MessageBubble';
import VoiceInput from './VoiceInput';
import { sendChatMessage, getChatSuggestions, saveMessage, submitFeedback } from '../../services/api';
import type { Language } from '../../types';
import type { ChatMessage, ConversationHistory } from '../../types/chat';
import { generateId } from '../../utils/helpers';
import { speakText } from '../../utils/textToSpeech';

interface ChatInterfaceProps {
  language: Language;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationHistoryRef = useRef<ConversationHistory[]>([]);
  const messageIdsRef = useRef<Map<string, string>>(new Map()); // Map local ID to server ID

  useEffect(() => {
    loadSuggestions();
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSuggestions = async () => {
    try {
      const response = await getChatSuggestions(language);
      if (response.success && response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (error: unknown) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      language
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Update conversation history
    conversationHistoryRef.current.push({ role: 'user', content: text });

    // Save user message to history (if authenticated)
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const saveResult = await saveMessage({
          session_id: sessionId,
          role: 'user',
          content: text,
          metadata: { language }
        });
        if (saveResult.success && saveResult.data?.message?._id) {
          messageIdsRef.current.set(userMessage.id, saveResult.data.message._id);
        }
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    }

    try {
      const startTime = Date.now();
      const response = await sendChatMessage(
        text,
        language,
        conversationHistoryRef.current
      );

      if (response.success && response.response) {
        const responseTime = (Date.now() - startTime) / 1000;
        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          language
        };

        setMessages((prev) => [...prev, assistantMessage]);
        conversationHistoryRef.current.push({
          role: 'assistant',
          content: response.response
        });

        // Save assistant message to history (if authenticated)
        if (token) {
          try {
            const saveResult = await saveMessage({
              session_id: sessionId,
              role: 'assistant',
              content: response.response,
              metadata: {
                language,
                response_time: responseTime
              }
            });
            if (saveResult.success && saveResult.data?.message?._id) {
              messageIdsRef.current.set(assistantMessage.id, saveResult.data.message._id);
            }
          } catch (error) {
            console.error('Failed to save assistant message:', error);
          }
        }

        // Auto-speak if enabled
        if (autoSpeak) {
          speakText(response.response, language);
        }
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
        language
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    handleSend(transcript);
  };

  const handleFeedback = async (localMessageId: string, rating: number) => {
    const serverId = messageIdsRef.current.get(localMessageId);
    if (!serverId) {
      console.warn('No server ID found for message');
      return;
    }

    try {
      await submitFeedback(serverId, rating);
      // Update local message state
      setMessages(prev => prev.map(msg => 
        msg.id === localMessageId 
          ? { ...msg, feedback: { rating } }
          : msg
      ));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <div className="flex flex-col h-[650px] bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 rounded-2xl shadow-2xl overflow-hidden border border-orange-200">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 text-white p-4 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <span className="text-2xl">🏔️</span>
            </div>
            <div>
              <h3 className="font-bold text-lg">Uttarakhand AI Guide</h3>
              <p className="text-sm text-orange-100">Your Digital Tourism Companion</p>
            </div>
          </div>
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all backdrop-blur-sm border border-white/30 ${
              autoSpeak
                ? 'bg-green-500/30 hover:bg-green-500/40 text-white'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
            title={autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled'}
          >
            {autoSpeak ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span className="hidden sm:inline">OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-white/80 via-orange-50/50 to-yellow-50/50 backdrop-blur-sm">
        {messages.length === 0 ? (
          <div className="text-center mt-8 px-4">
            <div className="inline-block p-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-6 shadow-2xl">
              <span className="text-6xl">🏔️</span>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
              Welcome to Uttarakhand Tourism AI!
            </h3>
            <p className="text-gray-600 mb-2 text-lg">
              Your intelligent companion for exploring the Land of Gods
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Ask me about places, culture, travel tips, or anything about Uttarakhand
            </p>
            {suggestions.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <p className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
                  <span>✨</span>
                  <span>Try these quick questions:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestions.slice(0, 4).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-3 bg-white text-left rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border border-orange-200 group hover:border-orange-300"
                    >
                      <span className="text-sm text-gray-700 group-hover:text-orange-600 transition-colors font-medium">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                onFeedback={handleFeedback}
              />
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
                <div className="bg-white rounded-2xl px-5 py-4 shadow-lg border border-orange-200">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-sm font-medium">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-gradient-to-r from-white via-orange-50 to-yellow-50 border-t border-orange-200 p-4 shadow-lg">
        {suggestions.length > 0 && messages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500 font-medium flex items-center">
              💡 Suggestions:
            </span>
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="px-3 py-1 text-xs bg-gradient-to-r from-orange-50 to-yellow-50 text-gray-700 rounded-full hover:from-orange-100 hover:to-yellow-100 transition-all disabled:opacity-50 border border-orange-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <VoiceInput
            onTranscript={handleVoiceTranscript}
            language={language}
            disabled={isLoading}
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 pr-12 border-2 border-orange-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all bg-white/80"
              disabled={isLoading}
            />
            {input.trim() && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                Press Enter ↵
              </span>
            )}
          </div>
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

