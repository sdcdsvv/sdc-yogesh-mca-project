import React from 'react';
import { useLMS } from '../../contexts/LMSContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Users, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Crown
} from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  badge?: number;
}

export const SuperAdminSidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useLMS();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  const navigationItems: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'User Management', href: '/admin/users' },
    { icon: Settings, label: 'Settings', href: '/settings' }
  ];

  // Detect mobile screen
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Track current path for active state highlighting
  React.useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handlePathChange);
    
    // Also listen for custom navigation events
    window.addEventListener('navigation', handlePathChange);

    return () => {
      window.removeEventListener('popstate', handlePathChange);
      window.removeEventListener('navigation', handlePathChange);
    };
  }, []);

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
    
    // Special handling for admin routes
    if (href === '/admin/users' && currentPath.startsWith('/admin/users')) {
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
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-purple-900 to-indigo-900">
            {(sidebarOpen || isMobile) && (
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-1.5 sm:p-2 rounded-lg">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white">EduNexa</h1>
                  <p className="text-xs text-purple-200">Super Admin</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-purple-800 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-5 w-5 text-white" />
              ) : (
                <ChevronRight className="h-5 w-5 text-white" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 overflow-y-auto">
            <div className="space-y-2">
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item.href)}
                  className={`flex items-center gap-3 px-2 sm:px-3 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-200 ease-in-out group relative ${
                    isActivePath(item.href)
                      ? 'bg-purple-50 text-purple-600 shadow-sm border-l-4 border-purple-600 font-semibold'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:shadow-sm hover:translate-x-1'
                  }`}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ease-in-out ${
                    isActivePath(item.href) ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-600 group-hover:scale-110'
                  }`} />
                  {(sidebarOpen || isMobile) && (
                    <>
                      <span className={`font-medium transition-colors duration-200 ${
                        isActivePath(item.href) ? 'text-purple-600' : ''
                      }`}>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 sm:py-1 rounded-full min-w-[20px] text-center font-semibold shadow-sm">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </a>
              ))}
            </div>
          </nav>

          {/* User Info */}
          {(sidebarOpen || isMobile) && (
            <div className="p-3 sm:p-4 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Crown className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-purple-600 font-medium">Super Administrator</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};