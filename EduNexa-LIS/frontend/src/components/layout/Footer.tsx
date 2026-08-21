import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  const version = '1.0.0';

  const links = [
    { label: 'Help', href: '/help' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  return (
    <footer className={`bg-gray-100 border-t border-gray-200 py-6 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Desktop Layout - Horizontal */}
        <div className="hidden sm:flex sm:flex-col sm:items-center sm:justify-center sm:space-y-2">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="font-medium">EduNexa © {currentYear}</span>
            <span className="text-gray-400">•</span>
            {links.map((link, index) => (
              <React.Fragment key={link.label}>
                <a
                  href={link.href}
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  {link.label}
                </a>
                {index < links.length - 1 && <span className="text-gray-400">•</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Version {version}
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="flex flex-col items-center space-y-3 sm:hidden">
          <div className="text-sm font-medium text-gray-600">
            EduNexa © {currentYear}
          </div>
          <div className="flex flex-col items-center space-y-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            Version {version}
          </div>
        </div>
      </div>
    </footer>
  );
};
