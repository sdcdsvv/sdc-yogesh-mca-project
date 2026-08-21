import React, { useState, useEffect, useRef } from 'react';
import { Send, Brain, User, Bot, Lightbulb, FileText, MessageCircle, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { aiAPI } from '../../config/api';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: string;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<'general' | 'explain' | 'summarize' | 'qa'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { icon: Lightbulb, text: "Explain a topic", action: "Explain the concept of ", mode: 'explain' as const },
    { icon: FileText, text: "Summarize notes", action: "Summarize this: ", mode: 'summarize' as const },
    { icon: MessageCircle, text: "Ask a question", action: "I have a question about ", mode: 'qa' as const },
    { icon: BookOpen, text: "Study tips", action: "Give me study tips for ", mode: 'general' as const },
    { icon: GraduationCap, text: "Course help", action: "Help me with my course on ", mode: 'general' as const }
  ];

  useEffect(() => {
    const loadWelcome = async () => {
      try {
        const welcomeData = await aiAPI.getWelcomeMessage();
        setMessages([{
          id: '1',
          content: (welcomeData as any).message,
          sender: 'ai',
          timestamp: new Date(),
          type: 'welcome'
        }]);
      } catch (error) {
        console.error('Failed to load welcome message:', error);
        setMessages([{
          id: '1',
          content: `## 👋 Hello! Welcome to Your AI Study Assistant!

I'm here to help you succeed in your learning journey!

### 🎯 My Capabilities:

**📚 Explain Topics** - Ask me to explain any concept in simple terms

**📝 Summarize Content** - I can summarize long notes or PDFs

**❓ Answer Questions** - Ask me anything about your course materials

**🎯 Study Help** - Need help understanding concepts? I'll guide you through them

**💡 Study Tips** - Get personalized study strategies

**How can I help you today?** 😊`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'welcome'
        }]);
      }
    };
    loadWelcome();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: chatMode
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await aiAPI.chat(messageToSend);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: (response as any).response,
        sender: 'ai',
        timestamp: new Date(),
        type: (response as any).type || chatMode
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `## ⚠️ Oops! Something went wrong.

I'm having trouble connecting right now. Please try again in a moment.

In the meantime, you can:
- Check your course materials
- Review your notes
- Ask your instructor for help

I'll be back soon! 😊`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string, mode: typeof chatMode) => {
    setInputValue(action);
    setChatMode(mode);
  };

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Learning Assistant</h1>
          <p className="text-gray-600">Your personal AI tutor for explanations, summaries, Q&A, and study help</p>
        </div>

        <div className="mb-4 flex gap-2 flex-wrap">
          <button
            onClick={() => setChatMode('general')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chatMode === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            💬 General Chat
          </button>
          <button
            onClick={() => setChatMode('explain')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chatMode === 'explain' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            💡 Explain Topic
          </button>
          <button
            onClick={() => setChatMode('summarize')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chatMode === 'summarize' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            📝 Summarize
          </button>

          <button
            onClick={() => setChatMode('qa')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${chatMode === 'qa' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            ❓ Q&A
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[650px] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Study Assistant</h3>
                <p className="text-sm text-green-600">● Online & Ready to Help</p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Mode: <span className="font-medium">
                {chatMode === 'general' ? 'General Chat' :
                  chatMode === 'explain' ? 'Explain Topic' :
                    chatMode === 'summarize' ? 'Summarize' : 'Q&A'}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}
                >
                  {message.sender === 'ai' ? (
                    <div className="prose prose-sm max-w-none">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="bg-blue-600 p-2 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">AI is thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-4 border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">✨ Quick Actions:</p>
              
              {/* Performance Button - Highlighted */}
              <button
                onClick={() => {
                  setInputValue("Show me my complete performance report");
                  setChatMode('general');
                  setTimeout(() => handleSendMessage(), 100);
                }}
                className="w-full mb-3 flex items-center justify-center gap-3 p-4 text-left bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <TrendingUp className="h-5 w-5 text-white" />
                <span className="text-base text-white font-semibold">📊 Show My Performance</span>
              </button>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action, action.mode)}
                    className="flex items-center gap-2 p-3 text-left bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-purple-50 transition-all border border-gray-200 hover:border-blue-300"
                  >
                    <action.icon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-700 font-medium">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder={
                  chatMode === 'explain' ? 'Enter a topic to explain...' :
                    chatMode === 'summarize' ? 'Paste content to summarize...' :
                      chatMode === 'qa' ? 'Ask your question...' :
                        'Ask me anything about your learning...'
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="h-5 w-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
