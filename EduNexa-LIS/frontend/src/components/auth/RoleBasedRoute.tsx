import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

/**
 * Component that renders children only if user has one of the allowed roles
 * @param children - Content to render if user has permission
 * @param allowedRoles - Array of roles that are allowed to access this content
 * @param fallback - Optional fallback content to render if user doesn't have permission
 */
export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallback 
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, don't render anything
  if (!isAuthenticated || !user) {
    return fallback ? <>{fallback}</> : null;
  }

  // Normalize user role for comparison
  const normalizedUserRole = user.role?.toLowerCase().trim();

  // Normalize allowed roles for comparison
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());

  // Check if user has one of the allowed roles
  const hasPermission = normalizedAllowedRoles.includes(normalizedUserRole);

  if (!hasPermission) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Required role: {allowedRoles.join(', ')}
          </p>
          <p className="text-sm text-gray-500">
            Your role: {user.role}
          </p>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/dashboard');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Hook to check if user has a specific role
 */
export const useHasRole = (allowedRoles: string[]): boolean => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return false;
  }

  const normalizedUserRole = user.role?.toLowerCase().trim();
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());

  return normalizedAllowedRoles.includes(normalizedUserRole);
};

/**
 * Hook to get normalized user role
 */
export const useUserRole = (): string | null => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return user.role?.toLowerCase().trim() || null;
};
