import { useState, useCallback } from 'react';
import { sendChatMessage, getChatSuggestions } from '../services/api';
import type { Language } from '../types';
import type { ChatMessage, ConversationHistory } from '../types/chat';
import { generateId } from '../utils/helpers';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  suggestions: string[];
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  loadSuggestions: () => Promise<void>;
}

export function useChat(language: Language): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const conversationHistoryRef = useState<ConversationHistory[]>([])[0];

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: new Date(),
        language
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      // Update conversation history
      conversationHistoryRef.push({ role: 'user', content: text });

      try {
        const response = await sendChatMessage(
          text,
          language,
          conversationHistoryRef
        );

        if (response.success && response.response) {
          const assistantMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: response.response,
            timestamp: new Date(),
            language
          };

          setMessages((prev) => [...prev, assistantMessage]);
          conversationHistoryRef.push({
            role: 'assistant',
            content: response.response
          });
        } else {
          throw new Error(response.message || 'Failed to get response');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        
        const errorMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
          timestamp: new Date(),
          language
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [language, isLoading]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationHistoryRef.length = 0;
    setError(null);
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const response = await getChatSuggestions(language);
      if (response.success && response.suggestions) {
        setSuggestions(response.suggestions);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    }
  }, [language]);

  return {
    messages,
    isLoading,
    error,
    suggestions,
    sendMessage,
    clearMessages,
    loadSuggestions
  };
}

