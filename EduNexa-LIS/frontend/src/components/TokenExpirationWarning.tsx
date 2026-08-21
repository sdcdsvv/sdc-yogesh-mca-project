import React, { useState } from 'react';
import { useTokenExpiration, useFormattedTimeUntilExpiration } from '../hooks/useTokenExpiration';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../config/api';

interface TokenExpirationWarningProps {
  warningThresholdMinutes?: number;
  className?: string;
}

const TokenExpirationWarning: React.FC<TokenExpirationWarningProps> = ({
  warningThresholdMinutes = 5,
  className = '',
}) => {
  const { isExpiringSoon, timeUntilExpiration } = useTokenExpiration(warningThresholdMinutes);
  const formattedTime = useFormattedTimeUntilExpiration(timeUntilExpiration);
  const { refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    try {
      await authAPI.refreshToken();
      await refreshUser();
      setIsDismissed(true);
      // Auto-show warning again after 30 seconds if still expiring soon
      setTimeout(() => setIsDismissed(false), 30000);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Token refresh failed, user will be logged out automatically
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isExpiringSoon || isDismissed) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Session Expiring Soon
            </h3>
            <div className="mt-1 text-sm text-yellow-700">
              <p>Your session will expire in {formattedTime}</p>
            </div>
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleRefreshToken}
                disabled={isRefreshing}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-medium px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRefreshing ? 'Refreshing...' : 'Extend Session'}
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="text-yellow-800 hover:text-yellow-900 text-xs font-medium px-3 py-1 rounded-md transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => setIsDismissed(true)}
              className="inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none focus:text-yellow-500 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenExpirationWarning;