import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, History, BarChart3, Activity } from 'lucide-react';
import type { Language } from '../../types';
import { commonTranslations } from '../../utils/translations';

interface NavbarProps {
  showAuth?: boolean;
  currentLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  showAuth = true,
  currentLanguage = 'english',
  onLanguageChange
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setProfileMenuOpen(false);
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const t = commonTranslations[currentLanguage];
  
  const navLinks = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.services, path: '/services' },
    { label: t.nav.explore, path: '/explore' },
    { label: currentLanguage === 'hindi' ? 'आधिकारिक पर्यटन' : 'Official Tourism', path: 'https://uttarakhandtourism.gov.in/', external: true }
  ];

  return (
    <>
      {/* Government Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 via-white to-green-600 border-b-2 border-orange-500">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left - PM Photo & Emblem */}
            <div className="flex items-center gap-3">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_of_India_logo.svg/2560px-Government_of_India_logo.svg.png"
                alt="Government of India"
                className="h-14 w-auto"
              />
              <div className="hidden sm:block border-l-2 border-stone-300 pl-3">
                <img 
                  src="https://www.bssnews.net/assets/news_photos/2024/03/22/image-180146-1711095480.jpg"
                  alt="Hon'ble Prime Minister"
                  className="h-16 w-auto rounded-md shadow-md border-2 border-white"
                />
              </div>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-lg sm:text-2xl font-bold text-stone-800 leading-tight">
                उत्तराखंड पर्यटन विकास बोर्ड
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Uttarakhand Tourism Development Board
              </p>
              <p className="text-xs text-orange-700 font-semibold hidden sm:block">
                देवभूमि - Land of Gods
              </p>
            </div>

            {/* Right - CM Photo */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block border-r-2 border-stone-300 pr-3">
                <img 
                  src="https://cdnbbsr.s3waas.gov.in/s38208974663db80265e9bfe7b222dcb18/uploads/bfi_thumb/202503101471645722-r2n83af4sbb6aenhlv6l8285ut2p68mbj6k917qnc0.jpg"
                  alt="Hon'ble Chief Minister"
                  className="h-16 w-auto rounded-md shadow-md border-2 border-white"
                />
              </div>
              {/* Language Selector */}
              {onLanguageChange && (
                <select
                  value={currentLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as Language)}
                  className="px-3 py-2 text-sm font-medium border-2 border-stone-300 rounded-lg bg-white hover:border-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 transition-all shadow-sm"
                >
                  <option value="english">English</option>
                  <option value="hindi">हिंदी</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="fixed top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm shadow-md border-b border-stone-200">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between h-14">
          {/* Logo - Left */}
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-emerald-800">Uttarakhand</span>
              <span className="text-stone-600 ml-2">Tourism</span>
            </div>
          </div>

          {/* Navigation Links - Center */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  if (link.external) {
                    window.open(link.path, '_blank');
                  } else {
                    navigate(link.path);
                  }
                }}
                className="px-5 py-2 text-sm font-medium text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/50 rounded-md transition-all duration-200"
                aria-label={link.label}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions - Right */}
          <div className="flex items-center gap-3">
            {showAuth && (
              <>
                {user ? (
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-stone-100 rounded-lg transition-all duration-200"
                    >
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-emerald-600"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {getInitials(user.name)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-stone-700">{user.name}</span>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-stone-200 py-2 z-50">
                        <div className="px-4 py-3 border-b border-stone-200">
                          <p className="text-sm font-semibold text-stone-800">{user.name}</p>
                          <p className="text-xs text-stone-500 truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigate('/activity/dashboard');
                            setProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>{currentLanguage === 'hindi' ? 'गतिविधि डैशबोर्ड' : 'Activity Dashboard'}</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/activity/history');
                            setProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <Activity className="w-4 h-4" />
                          <span>{currentLanguage === 'hindi' ? 'गतिविधि इतिहास' : 'Activity History'}</span>
                        </button>
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>{currentLanguage === 'hindi' ? 'सेटिंग्स' : 'Settings'}</span>
                        </button>
                        <div className="border-t border-stone-200 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{t.nav.logout}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-emerald-800 hover:bg-stone-100 rounded-md transition-all duration-200"
                    >
                      {t.nav.login}
                    </button>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-md hover:from-emerald-800 hover:to-teal-800 transition-all duration-200 shadow-sm"
                    >
                      {t.nav.signup}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between h-14">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="text-lg font-bold tracking-tight">
              <span className="text-emerald-800">Uttarakhand</span>
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-stone-700 hover:text-emerald-800 hover:bg-stone-100 rounded-md transition-all duration-200"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Drawer */}
            <div className="fixed top-[8.5rem] right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* User Profile Section */}
              {showAuth && user && (
                <div className="pb-4 border-b border-stone-200">
                  <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg px-4 py-3 border border-emerald-200">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-white">
                          {getInitials(user.name)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">{user.name}</p>
                      <p className="text-xs text-stone-600 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-2" role="navigation">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      if (link.external) {
                        window.open(link.path, '_blank');
                      } else {
                        navigate(link.path);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-base font-medium text-stone-700 hover:text-emerald-800 hover:bg-emerald-50/50 rounded-md transition-all duration-200"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              {/* Auth Buttons */}
              {showAuth && (
                <div className="pt-4 border-t border-stone-200 space-y-2">
                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-stone-700 hover:text-emerald-800 hover:bg-stone-100 rounded-md transition-all duration-200"
                      >
                        <Settings className="w-5 h-5" />
                        <span>{currentLanguage === 'hindi' ? 'सेटिंग्स' : 'Settings'}</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>{t.nav.logout}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          navigate('/login');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-base font-medium text-stone-700 hover:text-emerald-800 hover:bg-stone-100 rounded-md transition-all duration-200"
                      >
                        {t.nav.login}
                      </button>
                      <button
                        onClick={() => {
                          navigate('/login');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-5 py-3 text-base font-semibold bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-md hover:from-emerald-800 hover:to-teal-800 transition-all duration-200 shadow-sm"
                      >
                        {t.nav.signup}
                      </button>
                    </>
                  )}
                </div>
              )}
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  );
};

export default Navbar;
