import React, { useState, useEffect } from 'react';
import { authAPI } from '../../config/api';

interface TokenStats {
  refresh_tokens: {
    active: number;
    expired: number;
    inactive: number;
  };
  password_reset_tokens: {
    active: number;
    expired: number;
  };
  server_start_time: string;
}

const TokenManagement: React.FC = () => {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleanupResult, setCleanupResult] = useState<any>(null);

  const fetchTokenStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.getTokenStats();
      setStats(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch token statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authAPI.cleanupTokens();
      setCleanupResult(response);
      // Refresh stats after cleanup
      await fetchTokenStats();
    } catch (err: any) {
      setError(err.message || 'Failed to cleanup tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading token statistics...</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Token Management</h2>
        <div className="flex space-x-3">
          <button
            onClick={fetchTokenStats}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh Stats'}
          </button>
          <button
            onClick={handleCleanupTokens}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Cleaning...' : 'Cleanup Expired'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {cleanupResult && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">
            Cleanup completed: {JSON.stringify(cleanupResult, null, 2)}
          </p>
        </div>
      )}

      {stats && (
        <div className="space-y-6">
          {/* Server Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Server Information</h3>
            <p className="text-sm text-gray-600">
              Server started: {new Date(stats.server_start_time).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              All tokens issued before this time are automatically invalid
            </p>
          </div>

          {/* Refresh Tokens */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Refresh Tokens</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.refresh_tokens.active}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.refresh_tokens.expired}
                </div>
                <div className="text-sm text-gray-600">Expired</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {stats.refresh_tokens.inactive}
                </div>
                <div className="text-sm text-gray-600">Revoked</div>
              </div>
            </div>
          </div>

          {/* Password Reset Tokens */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Password Reset Tokens</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.password_reset_tokens.active}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.password_reset_tokens.expired}
                </div>
                <div className="text-sm text-gray-600">Expired</div>
              </div>
            </div>
          </div>

          {/* Security Notes */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-amber-800 mb-2">Security Notes</h3>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Access tokens expire after 2 hours</li>
              <li>• Refresh tokens expire after 7 days</li>
              <li>• Tokens are automatically cleaned up on server restart</li>
              <li>• Expired tokens should be cleaned up regularly</li>
              <li>• High numbers of expired tokens may indicate cleanup issues</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenManagement;