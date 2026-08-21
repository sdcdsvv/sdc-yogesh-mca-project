import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StudentDashboard } from './StudentDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { ErrorBoundary } from '../common';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user role
  switch (user?.role) {
    case 'student':
      return (
        <ErrorBoundary>
          <StudentDashboard />
        </ErrorBoundary>
      );
    case 'teacher':
      return (
        <ErrorBoundary>
          <TeacherDashboard />
        </ErrorBoundary>
      );
    case 'admin':
    case 'super_admin':
      return (
        <ErrorBoundary>
          <SuperAdminDashboard />
        </ErrorBoundary>
      );
    default:
      return (
        <ErrorBoundary>
          <StudentDashboard />
        </ErrorBoundary>
      ); // Default fallback
  }
};