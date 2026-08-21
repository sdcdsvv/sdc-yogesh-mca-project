import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('authToken');
  const tokenTimestamp = localStorage.getItem('tokenTimestamp');

  // Check if user is authenticated
  const isAuthenticated = user && token && tokenTimestamp;

  // Check token expiry (24 hours)
  if (isAuthenticated && tokenTimestamp) {
    const now = new Date().getTime();
    const tokenAge = now - parseInt(tokenTimestamp);
    const oneDayInMs = 24 * 60 * 60 * 1000;

    if (tokenAge >= oneDayInMs) {
      // Token expired, clear storage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenTimestamp');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
