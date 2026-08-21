import React, { useState } from 'react';
import { User, Bot, Volume2, VolumeX, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../../types/chat';
import { speakText, stopSpeaking } from '../../utils/textToSpeech';
import type { Language } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
  onFeedback?: (messageId: string, rating: number) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onFeedback }) => {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<number | null>(message.feedback?.rating || null);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    speakText(message.content, (message.language as Language) || 'english', {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleFeedback = async (rating: number) => {
    if (!message.id) return;
    
    setFeedback(rating);
    if (onFeedback) {
      onFeedback(message.id, rating);
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-md transition-all ${
          isUser
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
            : 'bg-white text-gray-800 border border-gray-200'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-sm mb-2 last:mb-0 leading-relaxed">{children}</p>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-800">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-1 text-gray-800">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-gray-700">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                code: ({ children }) => (
                  <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-50 p-3 rounded-lg text-xs overflow-x-auto border border-gray-200 my-2">{children}</pre>
                ),
                a: ({ children, href }) => (
                  <a href={href} className="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div className="flex items-center justify-between mt-2 gap-3">
          <p
            className={`text-xs ${
              isUser ? 'text-white/70' : 'text-gray-500'
            }`}
          >
            {message.timestamp.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {!isUser && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSpeak}
                className={`p-1.5 rounded-lg transition-all ${
                  isSpeaking 
                    ? 'bg-red-50 hover:bg-red-100' 
                    : 'hover:bg-gray-100'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 text-red-500 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => handleFeedback(1)}
                className={`p-1.5 rounded-lg transition-all ${
                  feedback === 1
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Like this response"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleFeedback(-1)}
                className={`p-1.5 rounded-lg transition-all ${
                  feedback === -1
                    ? 'bg-red-100 text-red-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Dislike this response"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;

