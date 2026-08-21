import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  language?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  checkTokenExpiry: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');

    if (storedUser && storedToken && tokenTimestamp) {
      // Check if token is expired (24 hours)
      const now = new Date().getTime();
      const tokenAge = now - parseInt(tokenTimestamp);
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if (tokenAge < oneDayInMs) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } else {
        // Token expired, clear storage
        logout();
      }
    }
  }, []);

  // Check token expiry periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkTokenExpiry();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [token]);

  const checkTokenExpiry = (): boolean => {
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    if (!tokenTimestamp) return false;

    const now = new Date().getTime();
    const tokenAge = now - parseInt(tokenTimestamp);
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (tokenAge >= oneDayInMs) {
      logout();
      return false;
    }
    return true;
  };

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('tokenTimestamp', new Date().getTime().toString());
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenTimestamp');
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        checkTokenExpiry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
