import React, { useState, useEffect } from 'react';
import { useLMS } from '../../contexts/LMSContext';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsAPI } from '../../config/api';
import { 
  Home, 
  BookOpen, 
  FileText as Assignment, 
  BarChart3, 
  Settings, 
  Brain, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  User,
  GraduationCap,
  PlusCircle,
  Video
} from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
}

interface SidebarSection {
  items: SidebarItem[];
}

export const TeacherSidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useLMS();
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track current path for active state highlighting
  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handlePathChange);
    
    // Also listen for custom navigation events
    window.addEventListener('pushstate', handlePathChange);

    return () => {
      window.removeEventListener('popstate', handlePathChange);
      window.removeEventListener('pushstate', handlePathChange);
    };
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const notifData = await notificationsAPI.getUnreadCount();
        setUnreadNotifications((notifData as any).unread_count || 0);
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    };

    if (user) {
      fetchNotificationCount();
      
      // Poll for updates every 30 seconds
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Navigation organized into 3 logical sections
  const navigationSections: SidebarSection[] = [
    {
      // Core Teaching Section - Primary features
      items: [
        { icon: Home, label: 'Dashboard', href: '/dashboard' },
        { icon: BookOpen, label: 'My Courses', href: '/courses' },
        { icon: PlusCircle, label: 'Create Course', href: '/courses/create' },
        { icon: Video, label: 'Video Management', href: '/videos' }
      ]
    },
    {
      // Student Management Section
      items: [
        { icon: Assignment, label: 'Assignments', href: '/assignments/teacher' },
        { icon: Users, label: 'My Students', href: '/students' },
        { icon: BarChart3, label: 'Analytics', href: '/analytics' }
      ]
    },
    {
      // Tools & Settings Section
      items: [
        { icon: Brain, label: 'AI Assistant', href: '/ai-assistant' },
        { icon: Bell, label: 'Notifications', href: '/notifications', badge: unreadNotifications || undefined },
        { icon: User, label: 'Profile', href: '/profile' },
        { icon: Settings, label: 'Settings', href: '/settings' }
      ]
    }
  ];

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    
    // Update current path immediately for responsive UI
    setCurrentPath(href);
    
    // Update browser history
    window.history.pushState({}, '', href);
    
    // Dispatch custom navigation event to trigger router update
    window.dispatchEvent(new CustomEvent('navigation'));
    
    // Also dispatch popstate for compatibility
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    // Close sidebar on mobile after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Helper function to check if a path is active
  const isActivePath = (href: string): boolean => {
    // Exact match for most routes
    if (currentPath === href) {
      return true;
    }
    
    // Special handling for course routes
    if (href === '/courses' && currentPath.startsWith('/courses/') && currentPath !== '/courses/create') {
      return true;
    }
    
    // Special handling for assignment routes
    if (href === '/assignments/teacher' && currentPath.startsWith('/assignments/')) {
      return true;
    }
    
    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
        isMobile 
          ? sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
          : sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`flex items-center border-b border-gray-200 p-3 sm:p-4 ${
            sidebarOpen || isMobile ? 'justify-between' : 'justify-center'
          }`}>
            {(sidebarOpen || isMobile) && (
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-1.5 sm:p-2 rounded-lg">
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gray-900">EduNexa</h1>
                  <p className="text-xs text-gray-500">Teacher Portal</p>
                </div>
              </div>
            )}
            {!isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 overflow-y-auto">
            {navigationSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {/* Navigation Items within Section - 8px spacing between items (space-y-2 = 0.5rem = 8px) */}
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <a
                      key={itemIndex}
                      href={item.href}
                      onClick={(e) => handleNavigation(e, item.href)}
                      title={!sidebarOpen && !isMobile ? item.label : undefined}
                      className={`flex items-center gap-3 px-2 sm:px-3 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-200 ease-in-out group relative ${
                        sidebarOpen || isMobile ? '' : 'justify-center'
                      } ${
                        isActivePath(item.href)
                          ? 'bg-green-50 text-green-600 shadow-sm border-l-4 border-green-600 font-semibold'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-600 hover:shadow-sm hover:translate-x-1'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ease-in-out ${
                        isActivePath(item.href) ? 'text-green-600' : 'text-gray-500 group-hover:text-green-600 group-hover:scale-110'
                      }`} />
                      {(sidebarOpen || isMobile) && (
                        <>
                          <span className={`font-medium transition-colors duration-200 ${
                            isActivePath(item.href) ? 'text-green-600' : ''
                          }`}>{item.label}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 sm:py-1 rounded-full min-w-[20px] text-center font-semibold shadow-sm">
                              {item.badge > 9 ? '9+' : item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {/* Badge indicator for collapsed state */}
                      {!sidebarOpen && !isMobile && item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold shadow-sm">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
                
                {/* Section Divider - 16px spacing between sections (my-4 = 1rem = 16px) */}
                {sectionIndex < navigationSections.length - 1 && (
                  <div className={`my-4 ${sidebarOpen || isMobile ? 'mx-4' : 'mx-2'}`}>
                    <div className="h-px bg-gray-200" />
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Info */}
          <div className={`p-3 sm:p-4 border-t border-gray-200 ${
            !sidebarOpen && !isMobile ? 'flex justify-center' : ''
          }`}>
            {(sidebarOpen || isMobile) ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm sm:text-base font-medium">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">Teacher</p>
                </div>
              </div>
            ) : (
              <div 
                className="w-9 h-9 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                title={user?.name}
              >
                <span className="text-white text-sm font-medium">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};