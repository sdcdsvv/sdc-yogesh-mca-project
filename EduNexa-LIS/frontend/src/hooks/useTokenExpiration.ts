import { useEffect, useState } from 'react';
import { tokenManager } from '../config/api';

interface TokenExpirationInfo {
  isExpiringSoon: boolean;
  timeUntilExpiration: number; // in milliseconds
  shouldRefresh: boolean;
}

export const useTokenExpiration = (warningThresholdMinutes: number = 5) => {
  const [tokenInfo, setTokenInfo] = useState<TokenExpirationInfo>({
    isExpiringSoon: false,
    timeUntilExpiration: 0,
    shouldRefresh: false,
  });

  useEffect(() => {
    const checkTokenExpiration = () => {
      const accessToken = tokenManager.getAccessToken();
      if (!accessToken) {
        setTokenInfo({
          isExpiringSoon: false,
          timeUntilExpiration: 0,
          shouldRefresh: false,
        });
        return;
      }

      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;
        const warningThreshold = warningThresholdMinutes * 60 * 1000; // Convert to milliseconds

        setTokenInfo({
          isExpiringSoon: timeUntilExpiration <= warningThreshold && timeUntilExpiration > 0,
          timeUntilExpiration: Math.max(0, timeUntilExpiration),
          shouldRefresh: timeUntilExpiration <= warningThreshold && timeUntilExpiration > 0,
        });
      } catch (error) {
        console.error('Error parsing token:', error);
        setTokenInfo({
          isExpiringSoon: false,
          timeUntilExpiration: 0,
          shouldRefresh: false,
        });
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60 * 1000);

    return () => clearInterval(interval);
  }, [warningThresholdMinutes]);

  return tokenInfo;
};

// Hook for formatting time until expiration
export const useFormattedTimeUntilExpiration = (timeUntilExpiration: number) => {
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    const updateFormattedTime = () => {
      if (timeUntilExpiration <= 0) {
        setFormattedTime('Expired');
        return;
      }

      const minutes = Math.floor(timeUntilExpiration / (1000 * 60));
      const seconds = Math.floor((timeUntilExpiration % (1000 * 60)) / 1000);

      if (minutes > 0) {
        setFormattedTime(`${minutes}m ${seconds}s`);
      } else {
        setFormattedTime(`${seconds}s`);
      }
    };

    updateFormattedTime();
    const interval = setInterval(updateFormattedTime, 1000);

    return () => clearInterval(interval);
  }, [timeUntilExpiration]);

  return formattedTime;
};