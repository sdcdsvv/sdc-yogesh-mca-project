/** Common types and interfaces */

export type Language = 'english' | 'hindi' | 'garhwali' | 'kumaoni';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Export theme types
export * from './theme';

// Export component types
export * from './components';

