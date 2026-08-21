/** API service functions for backend communication */
import type { ChatResponse, TranslationResponse, ConversationHistory } from '../types/chat';
import type { VisionAnalysisResponse } from '../types/place';
import type { Language } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Handle API errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// ==================== Chat API ====================

export async function sendChatMessage(
  message: string,
  language: Language = 'english',
  conversationHistory?: ConversationHistory[]
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      language,
      conversation_history: conversationHistory || []
    }),
  });

  return handleResponse<ChatResponse>(response);
}

export async function translateText(
  text: string,
  sourceLanguage: Language,
  targetLanguage: Language
): Promise<TranslationResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      source_language: sourceLanguage,
      target_language: targetLanguage
    }),
  });

  return handleResponse<TranslationResponse>(response);
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: string[];
  language: string;
}

export async function getChatSuggestions(language: Language = 'english'): Promise<SuggestionsResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/suggestions?language=${language}`);
  return handleResponse<SuggestionsResponse>(response);
}

// ==================== Vision API ====================

export async function analyzeImage(
  imageBase64: string,
  language: Language = 'english'
): Promise<VisionAnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/vision/analyze-base64`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageBase64,
      language
    }),
  });

  return handleResponse<VisionAnalysisResponse>(response);
}

export async function analyzeImageFile(
  file: File,
  language: Language = 'english'
): Promise<VisionAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('language', language);

  const response = await fetch(`${API_BASE_URL}/vision/analyze`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse<VisionAnalysisResponse>(response);
}

// ==================== Itinerary API ====================

export interface ItineraryPreferences {
  duration: number;
  budget: number;
  interests: string[];
  start_location: string;
  travel_style?: string;
  accommodation_type?: string;
  transport_mode?: string;
  language?: Language;
  save?: boolean;
  user_id?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  places: Array<{
    name: string;
    time: string;
    description: string;
    cost: number;
  }>;
  accommodation: {
    name: string;
    cost: number;
  };
  meals: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
  total_cost: number;
}

export interface Itinerary {
  duration: number;
  budget: number;
  days: ItineraryDay[];
  packing_list?: string[];
  travel_tips?: string[];
}

export interface ItineraryResponse {
  success: boolean;
  itinerary: Itinerary;
  language?: string;
  message?: string;
}

export async function generateItinerary(
  preferences: ItineraryPreferences
): Promise<ItineraryResponse> {
  const response = await fetch(`${API_BASE_URL}/itinerary/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(preferences),
  });

  return handleResponse<ItineraryResponse>(response);
}

export async function getItinerarySuggestions() {
  const response = await fetch(`${API_BASE_URL}/itinerary/suggestions`);
  return handleResponse(response);
}

// ==================== Emergency API ====================

export interface EmergencyContact {
  name: string;
  number: string;
  description: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  feels_like: number;
  description: string;
  humidity: number;
  wind_speed: number;
  pressure: number;
  visibility: number;
  icon: string;
  condition: string;
  travel_advice: string;
}

export interface WeatherResponse {
  success: boolean;
  data: WeatherData;
  message?: string;
}

export interface EmergencyAdviceResponse {
  success: boolean;
  advice: string;
  language?: string;
  message?: string;
}

export interface TravelAlert {
  id: number;
  type: string;
  severity: 'low' | 'moderate' | 'high';
  title: string;
  message: string;
  location: string;
  valid_until: string;
}

export async function getEmergencyAdvice(
  situation: string,
  location: string = '',
  language: Language = 'english'
): Promise<EmergencyAdviceResponse> {
  const response = await fetch(`${API_BASE_URL}/emergency/advice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      situation,
      location,
      language
    }),
  });

  return handleResponse<EmergencyAdviceResponse>(response);
}

export async function getEmergencyContacts(): Promise<{
  success: boolean;
  contacts: EmergencyContact[];
  count: number;
}> {
  const response = await fetch(`${API_BASE_URL}/emergency/contacts`);
  return handleResponse(response);
}

export async function getWeather(location: string): Promise<WeatherResponse> {
  const response = await fetch(
    `${API_BASE_URL}/emergency/weather?location=${encodeURIComponent(location)}`
  );
  return handleResponse<WeatherResponse>(response);
}

export async function getAlerts(location?: string): Promise<{
  success: boolean;
  alerts: TravelAlert[];
  count: number;
}> {
  const url = location
    ? `${API_BASE_URL}/emergency/alerts?location=${encodeURIComponent(location)}`
    : `${API_BASE_URL}/emergency/alerts`;
  const response = await fetch(url);
  return handleResponse(response);
}

// ==================== Auth API ====================

export interface SignupData {
  email: string;
  password: string;
  name: string;
  language?: Language;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      _id: string;
      email: string;
      name: string;
      language: string;
      created_at: string;
    };
    token: string;
  };
  error?: string;
}

export async function signup(data: SignupData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse<AuthResponse>(response);
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse<AuthResponse>(response);
}

// ==================== Chat History API ====================

export interface SaveMessageData {
  session_id?: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    language?: string;
    query_type?: string;
    tokens_used?: number;
    response_time?: number;
  };
}

export async function saveMessage(data: SaveMessageData): Promise<any> {
  const token = localStorage.getItem('authToken');
  if (!token) return { success: false, error: 'Not authenticated' };

  const response = await fetch(`${API_BASE_URL}/history/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function submitFeedback(messageId: string, rating: number, comment?: string): Promise<any> {
  const token = localStorage.getItem('authToken');
  if (!token) return { success: false, error: 'Not authenticated' };

  const response = await fetch(`${API_BASE_URL}/history/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message_id: messageId, rating, comment }),
  });

  return handleResponse(response);
}
