/**
 * Text-to-Speech utilities
 * Handles cleaning markdown and speaking with Indian accent
 */

import type { Language } from '../types';

/**
 * Clean markdown formatting from text for speech
 * Removes markdown symbols like **, *, _, etc.
 */
export function cleanMarkdownForSpeech(text: string): string {
  let cleaned = text;
  
  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`[^`]+`/g, '');
  
  // Remove bold/italic markers
  cleaned = cleaned.replace(/\*\*\*(.+?)\*\*\*/g, '$1'); // Bold + Italic
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1'); // Bold
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1'); // Italic
  cleaned = cleaned.replace(/__(.+?)__/g, '$1'); // Bold (underscore)
  cleaned = cleaned.replace(/_(.+?)_/g, '$1'); // Italic (underscore)
  
  // Remove strikethrough
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1');
  
  // Remove headers (keep text only)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // Remove links but keep text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove images
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^\)]+\)/g, '');
  
  // Remove blockquotes
  cleaned = cleaned.replace(/^>\s+/gm, '');
  
  // Remove horizontal rules
  cleaned = cleaned.replace(/^[-*_]{3,}$/gm, '');
  
  // Remove list markers but keep text
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, ''); // Unordered lists
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, ''); // Ordered lists
  
  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n'); // Max 2 newlines
  cleaned = cleaned.replace(/\s+/g, ' '); // Multiple spaces to single
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Get the best Indian accent voice for the given language
 */
export function getIndianVoice(language: Language): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  
  // Language code mapping
  const langCode = language === 'hindi' ? 'hi-IN' : 'en-IN';
  
  // Priority order for voice selection
  const voicePreferences = [
    // For English - prefer Indian English voices
    'Google हिन्दी', // Google Hindi
    'Microsoft Swara - Hindi (India)',
    'Google UK English Female',
    'Google UK English Male',
    'Microsoft Heera - English (India)',
    'Microsoft Ravi - English (India)',
    
    // For Hindi
    'Google हिन्दी',
    'Microsoft Swara - Hindi (India)',
    'Microsoft Hemant - Hindi (India)',
  ];
  
  // Try to find preferred voice
  for (const pref of voicePreferences) {
    const voice = voices.find(v => v.name.includes(pref));
    if (voice) return voice;
  }
  
  // Fallback: Find any voice with matching language code
  const langVoice = voices.find(v => v.lang === langCode);
  if (langVoice) return langVoice;
  
  // Fallback: Find any Indian voice
  const indianVoice = voices.find(v => 
    v.lang.includes('IN') || 
    v.name.toLowerCase().includes('india')
  );
  if (indianVoice) return indianVoice;
  
  // Last resort: return first available voice
  return voices[0] || null;
}

/**
 * Speak text with Indian accent and cleaned markdown
 */
export function speakText(
  text: string,
  language: Language = 'english',
  options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  } = {}
): void {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Clean markdown from text
  const cleanedText = cleanMarkdownForSpeech(text);
  
  if (!cleanedText.trim()) {
    console.warn('No text to speak after cleaning');
    return;
  }
  
  // Create utterance
  const utterance = new SpeechSynthesisUtterance(cleanedText);
  
  // Set language
  const langMap: Record<Language, string> = {
    english: 'en-IN',
    hindi: 'hi-IN',
    garhwali: 'hi-IN', // Fallback to Hindi
    kumaoni: 'hi-IN'   // Fallback to Hindi
  };
  utterance.lang = langMap[language] || 'en-IN';
  
  // Try to set Indian voice
  const indianVoice = getIndianVoice(language);
  if (indianVoice) {
    utterance.voice = indianVoice;
  }
  
  // Set speech parameters
  utterance.rate = options.rate ?? 0.9;  // Slightly slower for clarity
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;
  
  // Set callbacks
  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;
  
  // Speak
  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  window.speechSynthesis.cancel();
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Load voices (needed for some browsers)
 * Call this on app initialization
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    
    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });
}
