import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBasedRoute } from '../auth/RoleBasedRoute';
import { Dashboard } from '../dashboard/Dashboard';
import { CoursesPage } from '../courses/CoursesPage';
import { CreateCoursePage } from '../courses/CreateCoursePage';
import { AssignmentsPage } from '../assignments/AssignmentsPage';
import { DiscussionsPage } from '../discussions/DiscussionsPage';
import { AnalyticsPage } from '../analytics/AnalyticsPage';
import { AIAssistant } from '../ai/AIAssistant';
import { ProfilePage } from '../profile/ProfilePage';
import { SettingsPage } from '../settings/SettingsPage';
import { SuperAdminSettings } from '../settings/SuperAdminSettings';
import { Notifications } from '../../pages/Notifications';

import { AchievementsPage } from '../achievements/AchievementsPage';
import { StudentsPage } from '../students/StudentsPage';
import { SchedulePage } from '../schedule/SchedulePage';
import { CourseDetailPage } from '../courses/CourseDetailPage';
import { EditCoursePage } from '../courses/EditCoursePage';
import { AssignmentDetailPage } from '../assignments/AssignmentDetailPage';

import LearnerAnalytics from '../analytics/LearnerAnalytics';
import UserManagement from '../admin/UserManagement';
import { TeacherAIAssistant } from '../ai/TeacherAIAssistant';
import { VideoManagement } from '../../pages/VideoManagement';
import { AssignmentTest } from '../test/AssignmentTest';
import { TeacherAssignmentView } from '../assignments/TeacherAssignmentView';
import { QuickTest } from '../test/QuickTest';
import { NavigationTest } from '../../test/NavigationTest';
import { AssignmentManagement } from '../../pages/AssignmentManagement';
import { ErrorBoundary } from '../common';

export const AppRouter: React.FC = () => {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = React.useState('/dashboard');

  // Simple router based on current path
  React.useEffect(() => {
    const path = window.location.pathname;
    setCurrentPath(path === '/' ? '/dashboard' : path);

    // Listen for popstate events (back/forward navigation)
    const handlePopState = () => {
      const newPath = window.location.pathname;
      setCurrentPath(newPath === '/' ? '/dashboard' : newPath);
    };

    // Listen for custom navigation events from sidebar
    const handleCustomNavigation = () => {
      const newPath = window.location.pathname;
      setCurrentPath(newPath === '/' ? '/dashboard' : newPath);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('navigation', handleCustomNavigation);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('navigation', handleCustomNavigation);
    };
  }, []);

  const renderPage = () => {
    // Handle dynamic routes
    if (currentPath.startsWith('/courses/') && currentPath !== '/courses/create') {
      const pathParts = currentPath.split('/');
      const courseId = pathParts[2];
      
      // Check if it's an edit route
      if (pathParts[3] === 'edit') {
        return (
          <RoleBasedRoute allowedRoles={['teacher', 'instructor', 'super_admin', 'admin']}>
            <EditCoursePage courseId={courseId} />
          </RoleBasedRoute>
        );
      }
      
      return <CourseDetailPage courseId={courseId} />;
    }

    if (currentPath.startsWith('/assignments/detail')) {
      const pathParts = currentPath.split('/');
      const pathId = pathParts[3];
      const queryId = new URLSearchParams(window.location.search).get('id');
      const assignmentId = pathId || queryId || undefined;
      return <AssignmentDetailPage assignmentId={assignmentId} />;
    }

    switch (currentPath) {
      case '/dashboard':
        return <Dashboard />;
      case '/courses':
        return <CoursesPage />;
      case '/courses/create':
        return (
          <RoleBasedRoute allowedRoles={['teacher', 'instructor', 'super_admin', 'admin']}>
            <CreateCoursePage />
          </RoleBasedRoute>
        );
      case '/videos':
        return (
          <RoleBasedRoute allowedRoles={['teacher', 'instructor', 'super_admin', 'admin']}>
            <VideoManagement />
          </RoleBasedRoute>
        );
      case '/assignments':
        return <AssignmentsPage />;
      case '/discussions':
        return <DiscussionsPage />;
      case '/analytics':
        // Show different analytics based on user role
        return user?.role === 'teacher' || user?.role === 'instructor' || user?.role === 'super_admin' || user?.role === 'admin'
          ? <LearnerAnalytics />
          : <AnalyticsPage />;
      case '/admin/users':
        return (
          <RoleBasedRoute allowedRoles={['super_admin', 'admin']}>
            <UserManagement />
          </RoleBasedRoute>
        );
      case '/profile':
        return <ProfilePage />;
      case '/settings':
      case '/admin/settings':
        return user?.role === 'super_admin' ? <SuperAdminSettings /> : <SettingsPage />;
      case '/notifications':
        return <Notifications />;
      case '/achievements':
        return <AchievementsPage />;
      case '/students':
        return (
          <RoleBasedRoute allowedRoles={['teacher', 'instructor', 'super_admin', 'admin']}>
            <StudentsPage />
          </RoleBasedRoute>
        );
      case '/schedule':
        return <SchedulePage />;
      case '/assignments/teacher':
        return (
          <RoleBasedRoute allowedRoles={['teacher', 'instructor', 'super_admin', 'admin']}>
            <TeacherAssignmentView />
          </RoleBasedRoute>
        );
      case '/assignments/manage':
        return (
          <RoleBasedRoute allowedRoles={['teacher', 'instructor', 'super_admin', 'admin']}>
            <ErrorBoundary>
              <AssignmentManagement />
            </ErrorBoundary>
          </RoleBasedRoute>
        );
      case '/analytics/learners':
        return <LearnerAnalytics />;
      case '/test/assignments':
        return <AssignmentTest />;
      case '/test':
        return <QuickTest />;
      case '/test/navigation':
        return <NavigationTest />;
      case '/ai-assistant':
        return user?.role === 'teacher' ? <TeacherAIAssistant /> : <AIAssistant />;

      default:
        return <Dashboard />;
    }
  };

  // Add click handlers to navigation links
  React.useEffect(() => {
    const handleNavigation = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.href.startsWith(window.location.origin)) {
        e.preventDefault();
        const path = target.pathname;
        setCurrentPath(path);
        window.history.pushState({}, '', path);
      }
    };

    document.addEventListener('click', handleNavigation);
    return () => document.removeEventListener('click', handleNavigation);
  }, []);

  return renderPage();
};