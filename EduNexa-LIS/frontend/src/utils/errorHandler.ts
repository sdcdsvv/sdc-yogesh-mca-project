/**
 * Centralized error handling utility
 */

export interface APIError {
  message: string;
  field?: string;
  code?: string;
  status?: number;
}

export class AppError extends Error {
  public field?: string;
  public code?: string;
  public status?: number;

  constructor(message: string, field?: string, code?: string, status?: number) {
    super(message);
    this.name = 'AppError';
    this.field = field;
    this.code = code;
    this.status = status;
  }
}

/**
 * Parse error from API response
 */
export const parseAPIError = (error: any): APIError => {
  // Network error
  if (!error.response) {
    return {
      message: 'Network error. Please check your internet connection and try again.',
      code: 'NETWORK_ERROR',
      status: 0
    };
  }

  // API error response
  const { data, status } = error.response;

  // Handle different error formats
  if (data?.error) {
    return {
      message: data.error,
      field: data.field,
      code: data.code,
      status
    };
  }

  if (data?.message) {
    return {
      message: data.message,
      field: data.field,
      code: data.code,
      status
    };
  }

  // Default error messages based on status code
  const defaultMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'Authentication required. Please log in.',
    403: 'Access denied. You do not have permission to perform this action.',
    404: 'Resource not found.',
    409: 'Conflict. The resource already exists.',
    422: 'Validation error. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Bad gateway. The server is temporarily unavailable.',
    503: 'Service unavailable. Please try again later.',
    504: 'Gateway timeout. The request took too long to process.'
  };

  return {
    message: defaultMessages[status] || 'An unexpected error occurred. Please try again.',
    code: `HTTP_${status}`,
    status
  };
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error: any): string => {
  const apiError = parseAPIError(error);
  return apiError.message;
};

/**
 * Log error for debugging
 */
export const logError = (error: any, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Error${context ? ` in ${context}` : ''}`);
    console.error('Error:', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
    if (error.request) {
      console.error('Request:', error.request);
    }
    console.groupEnd();
  }
};

/**
 * Handle API error with retry logic
 */
export const handleAPIErrorWithRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 2,
  retryDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        if (error.response.status !== 429) {
          throw error;
        }
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  throw lastError;
};

/**
 * Error boundary fallback component props
 */
export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Check if error is authentication error
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401 || error.response?.status === 403;
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error: any): boolean => {
  return !error.response || error.code === 'NETWORK_ERROR';
};

/**
 * Check if error is validation error
 */
export const isValidationError = (error: any): boolean => {
  return error.response?.status === 400 || error.response?.status === 422;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (error: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (error.response?.data?.errors) {
    // Handle array of errors
    if (Array.isArray(error.response.data.errors)) {
      error.response.data.errors.forEach((err: any) => {
        if (err.field && err.message) {
          errors[err.field] = err.message;
        }
      });
    }
    // Handle object of errors
    else if (typeof error.response.data.errors === 'object') {
      Object.assign(errors, error.response.data.errors);
    }
  }
  // Handle single field error
  else if (error.response?.data?.field && error.response?.data?.error) {
    errors[error.response.data.field] = error.response.data.error;
  }

  return errors;
};

/**
 * Create error notification message
 */
export const createErrorNotification = (error: any, defaultMessage?: string): {
  type: 'error' | 'warning';
  message: string;
} => {
  const apiError = parseAPIError(error);

  return {
    type: isAuthError(error) ? 'warning' : 'error',
    message: apiError.message || defaultMessage || 'An error occurred'
  };
};

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Default retry configuration
 */
export const defaultRetryConfig: RetryConfig = {
  maxRetries: 2,
  retryDelay: 1000,
  shouldRetry: (error: any) => {
    // Retry on network errors and 5xx errors
    return isNetworkError(error) || (error.response?.status >= 500);
  }
};

/**
 * Execute API call with retry and error handling
 */
export const executeWithRetry = async <T>(
  apiCall: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: any;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;
      logError(error, `Attempt ${attempt + 1}/${finalConfig.maxRetries + 1}`);

      // Check if we should retry
      const shouldRetry = finalConfig.shouldRetry ? finalConfig.shouldRetry(error) : true;

      if (!shouldRetry || attempt === finalConfig.maxRetries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const delay = finalConfig.retryDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};
