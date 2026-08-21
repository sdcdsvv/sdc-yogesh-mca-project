import React from 'react';
import { StudentSidebar } from './StudentSidebar';
import { TeacherSidebar } from './TeacherSidebar';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useLMS } from '../../contexts/LMSContext';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen } = useLMS();
  const { user, isAuthenticated } = useAuth();

  const renderSidebar = () => {
    // Only render sidebar if user is authenticated
    if (!isAuthenticated || !user) {
      return null;
    }

    // Normalize role string (handle variations like 'Teacher', 'teacher', etc.)
    const normalizedRole = user.role?.toLowerCase().trim();

    switch (normalizedRole) {
      case 'student':
        return <StudentSidebar />;
      case 'teacher':
      case 'instructor':
        return <TeacherSidebar />;
      case 'super_admin':
      case 'superadmin':
      case 'admin':
        return <SuperAdminSidebar />;
      default:
        // Default to student sidebar for unknown roles
        console.warn(`Unknown user role: ${user.role}, defaulting to student sidebar`);
        return <StudentSidebar />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {renderSidebar()}
      <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
        isAuthenticated && user ? (sidebarOpen ? 'lg:ml-64' : 'lg:ml-16') : ''
      }`}>
        <Header />
        <main className="flex-1 transition-all duration-300 ease-in-out">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};
