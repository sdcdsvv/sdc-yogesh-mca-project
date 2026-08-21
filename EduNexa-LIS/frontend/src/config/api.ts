// API Configuration for EduNexa LMS Frontend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.160.108.56:5010/api';

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    GOOGLE_LOGIN: `${API_BASE_URL}/auth/google/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    LOGOUT_ALL: `${API_BASE_URL}/auth/logout-all`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    VALIDATE_TOKEN: `${API_BASE_URL}/auth/validate-token`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    VERIFY_RESET_TOKEN: `${API_BASE_URL}/auth/verify-reset-token`,
    CLEANUP_TOKENS: `${API_BASE_URL}/auth/cleanup-tokens`,
    TOKEN_STATS: `${API_BASE_URL}/auth/token-stats`,
  },

  // Courses
  COURSES: {
    BASE: `${API_BASE_URL}/courses`,
    BY_ID: (id: string) => `${API_BASE_URL}/courses/${id}`,
    ENROLL: (id: string) => `${API_BASE_URL}/courses/${id}/enroll`,
    UNENROLL: (id: string) => `${API_BASE_URL}/courses/${id}/unenroll`,
    MATERIALS: (id: string) => `${API_BASE_URL}/courses/${id}/materials`,
    STUDENTS: (id: string) => `${API_BASE_URL}/courses/${id}/students`,
  },

  // Assignments
  ASSIGNMENTS: {
    BASE: `${API_BASE_URL}/assignments`,
    BY_ID: (id: string) => `${API_BASE_URL}/assignments/${id}`,
    SUBMIT: (id: string) => `${API_BASE_URL}/assignments/${id}/submit`,
    GRADE: (submissionId: string) => `${API_BASE_URL}/assignments/submissions/${submissionId}/grade`,
  },



  // Users
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
    DEACTIVATE: (id: string) => `${API_BASE_URL}/users/${id}/deactivate`,
    ACTIVATE: (id: string) => `${API_BASE_URL}/users/${id}/activate`,
    RESET_PASSWORD: (id: string) => `${API_BASE_URL}/users/${id}/reset-password`,
    BULK_IMPORT: `${API_BASE_URL}/users/bulk-import`,
    STATISTICS: `${API_BASE_URL}/users/statistics`,
  },

  // AI Features
  AI: {
    CHAT: `${API_BASE_URL}/ai/chat`,
    CHAT_WELCOME: `${API_BASE_URL}/ai/chat/welcome`,
    SUMMARIZE: `${API_BASE_URL}/ai/summarize`,

    RECOMMENDATIONS: `${API_BASE_URL}/ai/recommendations`,
    CHAT_HISTORY: `${API_BASE_URL}/ai/chat-history`,
    LEARNING_PATH: `${API_BASE_URL}/ai/learning-path`,
  },

  // Analytics
  ANALYTICS: {
    BASE: `${API_BASE_URL}/analytics`,
    DASHBOARD: `${API_BASE_URL}/analytics/dashboard`,
    COURSE: (id: string) => `${API_BASE_URL}/analytics/course/${id}`,
    STUDENT: (id: string) => `${API_BASE_URL}/analytics/student/${id}`,
    SYSTEM: `${API_BASE_URL}/analytics/system`,
    TEACHER_DASHBOARD: `${API_BASE_URL}/analytics/teacher/dashboard`,
    TEACHER_ASSIGNMENTS: `${API_BASE_URL}/analytics/teacher/assignments`,
  },

  // Student Progress
  STUDENT_PROGRESS: {
    ALL_STUDENTS: `${API_BASE_URL}/student-progress/teacher/students`,
    STUDENT_DETAIL: (id: string) => `${API_BASE_URL}/student-progress/teacher/student/${id}`,
    COURSE_PROGRESS: (id: string) => `${API_BASE_URL}/student-progress/teacher/course/${id}/progress`,
    ENGAGEMENT_ALERTS: `${API_BASE_URL}/student-progress/teacher/engagement/alerts`,
    ENGAGEMENT_SUMMARY: `${API_BASE_URL}/student-progress/teacher/engagement/summary`,
    COURSE_ENGAGEMENT: (id: string) => `${API_BASE_URL}/student-progress/teacher/engagement/course/${id}/monitor`,
  },

  // Learner Analytics
  LEARNER_ANALYTICS: {
    PERFORMANCE_ANALYSIS: `${API_BASE_URL}/learner-analytics/performance-analysis`,
    STUDENT_RECOMMENDATIONS: `${API_BASE_URL}/learner-analytics/student-recommendations`,
    PERFORMANCE_ALERTS: `${API_BASE_URL}/learner-analytics/performance-alerts`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/notifications`,
    BY_ID: (id: string) => `${API_BASE_URL}/notifications/${id}`,
    MARK_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/read-all`,
    UNREAD_COUNT: `${API_BASE_URL}/notifications/unread-count`,
  },

  // Discussions
  DISCUSSIONS: {
    BASE: `${API_BASE_URL}/discussions`,
    BY_ID: (id: string) => `${API_BASE_URL}/discussions/${id}`,
  },

  // Schedule
  SCHEDULE: {
    EVENTS: `${API_BASE_URL}/schedule/events`,
    EVENT_BY_ID: (id: string) => `${API_BASE_URL}/schedule/events/${id}`,
  },

  // Achievements
  ACHIEVEMENTS: {
    BASE: `${API_BASE_URL}/achievements`,
  },

  // Messages
  MESSAGES: {
    CONVERSATIONS: `${API_BASE_URL}/messages/conversations`,
    CONVERSATION: (partnerId: number) => `${API_BASE_URL}/messages/conversation/${partnerId}`,
    SEND: `${API_BASE_URL}/messages/send`,
    UNREAD_COUNT: `${API_BASE_URL}/messages/unread-count`,
    USERS: `${API_BASE_URL}/messages/users`,
  },

  // Health check
  HEALTH: `${API_BASE_URL}/health`,
};

// HTTP client configuration
export const HTTP_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// Token management
export const tokenManager = {
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  isTokenExpired: (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
};

// Helper function to get auth headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = tokenManager.getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
};

// API client class with automatic token refresh and error handling
export class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;
  private maxRetries = 2;
  private retryDelay = 1000;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private shouldRetry(error: any, attempt: number): boolean {
    // Don't retry if max attempts reached
    if (attempt >= this.maxRetries) {
      return false;
    }

    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on 5xx errors
    if (error.response?.status >= 500) {
      return true;
    }

    // Retry on 429 (rate limit)
    if (error.response?.status === 429) {
      return true;
    }

    return false;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      tokenManager.setTokens(data.access_token, data.refresh_token);
    } catch (error) {
      tokenManager.clearTokens();
      // Redirect to login or emit event for app to handle
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    // Check if access token is expired and refresh if needed
    const accessToken = tokenManager.getAccessToken();
    if (accessToken && tokenManager.isTokenExpired(accessToken) && !endpoint.includes('/auth/refresh')) {
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshPromise = this.refreshToken().finally(() => {
          this.isRefreshing = false;
          this.refreshPromise = null;
        });
      }

      if (this.refreshPromise) {
        await this.refreshPromise;
      }
    }

    const headers: Record<string, string> = {
      ...HTTP_CONFIG.headers,
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> || {}),
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle token expiration
        if (response.status === 401 && errorData.code === 'TOKEN_EXPIRED') {
          if (!endpoint.includes('/auth/refresh')) {
            // Try to refresh token and retry request
            try {
              await this.refreshToken();
              // Retry the original request with new token
              const retryHeaders: Record<string, string> = {
                ...(config.headers as Record<string, string> || {}),
                ...getAuthHeaders(),
              };
              const retryConfig: RequestInit = {
                ...config,
                headers: retryHeaders,
              };
              const retryResponse = await fetch(url, retryConfig);
              if (retryResponse.ok) {
                return await retryResponse.json();
              }
            } catch (refreshError) {
              // Refresh failed, let the original error bubble up
            }
          }
        }

        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Utility functions for common API operations
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    if (response.access_token && response.refresh_token) {
      tokenManager.setTokens(response.access_token, response.refresh_token);
    }
    return response;
  },

  googleLogin: async (credential: string, role: string = 'student') => {
    const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, { credential, role });
    if (response.access_token && response.refresh_token) {
      tokenManager.setTokens(response.access_token, response.refresh_token);
    }
    return response;
  },

  register: async (userData: any) => {
    const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.REGISTER, userData);
    if (response.access_token && response.refresh_token) {
      tokenManager.setTokens(response.access_token, response.refresh_token);
    }
    return response;
  },

  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      tokenManager.clearTokens();
    }
  },

  logoutAll: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT_ALL);
    } finally {
      tokenManager.clearTokens();
    }
  },

  refreshToken: async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<any>(API_ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken,
    });

    if (response.access_token && response.refresh_token) {
      tokenManager.setTokens(response.access_token, response.refresh_token);
    }

    return response;
  },

  validateToken: () =>
    apiClient.get(API_ENDPOINTS.AUTH.VALIDATE_TOKEN),

  getProfile: () =>
    apiClient.get(API_ENDPOINTS.AUTH.PROFILE),

  updateProfile: (data: any) =>
    apiClient.put(API_ENDPOINTS.AUTH.PROFILE, data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  forgotPassword: (email: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      new_password: newPassword,
    }),

  verifyResetToken: (token: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN, { token }),

  // Admin only endpoints
  cleanupTokens: () =>
    apiClient.post(API_ENDPOINTS.AUTH.CLEANUP_TOKENS),

  getTokenStats: () =>
    apiClient.get(API_ENDPOINTS.AUTH.TOKEN_STATS),
};

export const coursesAPI = {
  getAll: () => apiClient.get(API_ENDPOINTS.COURSES.BASE),
  getById: (id: string) => apiClient.get(API_ENDPOINTS.COURSES.BY_ID(id)),
  create: (data: any) => apiClient.post(API_ENDPOINTS.COURSES.BASE, data),
  update: (id: string, data: any) => apiClient.put(API_ENDPOINTS.COURSES.BY_ID(id), data),
  enroll: (id: string) => apiClient.post(API_ENDPOINTS.COURSES.ENROLL(id)),
  unenroll: (id: string) => apiClient.post(API_ENDPOINTS.COURSES.UNENROLL(id)),
  getStudents: (id: string) => apiClient.get(API_ENDPOINTS.COURSES.STUDENTS(id)),
};

export const assignmentsAPI = {
  getAll: () => apiClient.get(API_ENDPOINTS.ASSIGNMENTS.BASE),
  getById: (id: string) => apiClient.get(API_ENDPOINTS.ASSIGNMENTS.BY_ID(id)),
  create: (data: any) => apiClient.post(API_ENDPOINTS.ASSIGNMENTS.BASE, data),
  update: (id: string, data: any) => apiClient.put(API_ENDPOINTS.ASSIGNMENTS.BY_ID(id), data),
  submit: (id: string, data: any) => apiClient.post(API_ENDPOINTS.ASSIGNMENTS.SUBMIT(id), data),
  grade: (submissionId: string, grade: number, feedback?: string) =>
    apiClient.post(API_ENDPOINTS.ASSIGNMENTS.GRADE(submissionId), { grade, feedback }),
};



export const aiAPI = {
  chat: (message: string) => apiClient.post(API_ENDPOINTS.AI.CHAT, { message }),
  getWelcomeMessage: () => apiClient.get(API_ENDPOINTS.AI.CHAT_WELCOME),
  summarize: (content: string, type: string = 'text') =>
    apiClient.post(API_ENDPOINTS.AI.SUMMARIZE, { content, type }),

  getRecommendations: () => apiClient.get(API_ENDPOINTS.AI.RECOMMENDATIONS),
  getChatHistory: (page: number = 1, limit: number = 20) =>
    apiClient.get(`${API_ENDPOINTS.AI.CHAT_HISTORY}?page=${page}&limit=${limit}`),
  generateLearningPath: (goal: string, timeframe: string = 'month') =>
    apiClient.post(API_ENDPOINTS.AI.LEARNING_PATH, { goal, timeframe }),
};

export const analyticsAPI = {
  getDashboard: () => apiClient.get(API_ENDPOINTS.ANALYTICS.DASHBOARD),
  getCourseAnalytics: (id: string) => apiClient.get(API_ENDPOINTS.ANALYTICS.COURSE(id)),
  getStudentAnalytics: (id: string) => apiClient.get(API_ENDPOINTS.ANALYTICS.STUDENT(id)),
  getSystemAnalytics: (days: number = 30) =>
    apiClient.get(`${API_ENDPOINTS.ANALYTICS.SYSTEM}?days=${days}`),
};

export const learnerAnalyticsAPI = {
  getPerformanceAnalysis: (courseId?: string, type?: 'slow' | 'fast' | 'all') => {
    const params = new URLSearchParams();
    if (courseId) params.append('course_id', courseId);
    if (type) params.append('type', type);
    const queryString = params.toString();
    return apiClient.get(`${API_ENDPOINTS.LEARNER_ANALYTICS.PERFORMANCE_ANALYSIS}${queryString ? `?${queryString}` : ''}`);
  },

  getStudentRecommendations: (studentId: string) =>
    apiClient.get(`${API_ENDPOINTS.LEARNER_ANALYTICS.STUDENT_RECOMMENDATIONS}?student_id=${studentId}`),

  getPerformanceAlerts: () =>
    apiClient.get(API_ENDPOINTS.LEARNER_ANALYTICS.PERFORMANCE_ALERTS),
};

export const notificationsAPI = {
  getAll: (unreadOnly: boolean = false, limit: number = 50) =>
    apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS.BASE}?unread_only=${unreadOnly}&limit=${limit}`),

  markAsRead: (id: string) =>
    apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),

  markAllAsRead: () =>
    apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),

  getUnreadCount: () =>
    apiClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id)),
};

export const messagesAPI = {
  getConversations: () =>
    apiClient.get(API_ENDPOINTS.MESSAGES.CONVERSATIONS),

  getConversationMessages: (partnerId: number) =>
    apiClient.get(API_ENDPOINTS.MESSAGES.CONVERSATION(partnerId)),

  sendMessage: (receiverId: number, content: string) =>
    apiClient.post(API_ENDPOINTS.MESSAGES.SEND, { receiver_id: receiverId, content }),

  getUnreadCount: () =>
    apiClient.get(API_ENDPOINTS.MESSAGES.UNREAD_COUNT),

  getAvailableUsers: () =>
    apiClient.get(API_ENDPOINTS.MESSAGES.USERS),
};

export default apiClient;