import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, tokenManager } from '../config/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  year?: string;
  semester?: string;
  designation?: string;
  employee_id?: string;
  roll_number?: string;
  profile_pic?: string;
  phone?: string;
  total_points?: number;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string, role?: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkTokenValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!tokenManager.getAccessToken();

  // Check token validity
  const checkTokenValidity = async (): Promise<boolean> => {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) {
      return false;
    }

    try {
      await authAPI.validateToken();
      return true;
    } catch (error: unknown) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  // Load user from token on app start
  const loadUserFromToken = async () => {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      // Check if token is expired
      if (tokenManager.isTokenExpired(accessToken)) {
        // Try to refresh token
        try {
          await authAPI.refreshToken();
        } catch (refreshError: unknown) {
          console.error('Token refresh failed:', refreshError);
          tokenManager.clearTokens();
          setIsLoading(false);
          return;
        }
      }

      // Get user profile
      const response = await authAPI.getProfile() as { user: User };
      setUser(response.user);
    } catch (error: unknown) {
      console.error('Failed to load user:', error);
      tokenManager.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      setUser(response.user);
    } catch (error: unknown) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Google Login function
  const googleLogin = async (credential: string, role: string = 'student') => {
    try {
      const response = await authAPI.googleLogin(credential, role);
      setUser(response.user);
    } catch (error: unknown) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.user);
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error: unknown) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      tokenManager.clearTokens();
    }
  };

  // Logout from all devices
  const logoutAll = async () => {
    try {
      await authAPI.logoutAll();
    } catch (error: unknown) {
      console.error('Logout all API call failed:', error);
    } finally {
      setUser(null);
      tokenManager.clearTokens();
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile() as { user: User };
      setUser(response.user);
    } catch (error: unknown) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  // Handle token expiration events
  useEffect(() => {
    const handleTokenExpired = () => {
      console.log('Token expired, logging out user');
      setUser(null);
      tokenManager.clearTokens();
      // You can also redirect to login page here
      window.location.href = '/login';
    };

    window.addEventListener('auth:token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, []);

  // Load user on component mount
  useEffect(() => {
    loadUserFromToken();
  }, []);

  // Set up periodic token validation (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        console.log('Token validation failed, logging out user');
        setUser(null);
        tokenManager.clearTokens();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    googleLogin,
    register,
    logout,
    logoutAll,
    refreshUser,
    checkTokenValidity,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;