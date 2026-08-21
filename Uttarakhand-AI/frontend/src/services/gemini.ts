/** Gemini AI service utilities */
import { sendChatMessage } from './api';
import type { Language } from '../types';

/**
 * Generate a quick response using Gemini
 */
export async function quickGeminiResponse(
  prompt: string,
  language: Language = 'english'
): Promise<string> {
  try {
    const response = await sendChatMessage(prompt, language);
    return response.response || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

/**
 * Format Gemini response for display
 */
export function formatGeminiResponse(text: string): string {
  // Basic formatting - can be enhanced
  return text
    .replace(/\n\n/g, '\n')
    .trim();
}

