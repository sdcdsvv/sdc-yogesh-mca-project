import { NavItemProps } from '../../types';
import { Link } from 'react-router-dom';

/**
 * Navigation Item component for desktop navigation
 * Includes hover effects and active state indicators
 */
export const NavItem: React.FC<NavItemProps> = ({
  label,
  href,
  active = false,
  icon,
  onClick,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = [
    'inline-flex items-center gap-2 px-4 py-2',
    'text-body font-medium',
    'rounded-lg',
    'transition-all duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-mountain-500 focus:ring-offset-2',
  ].join(' ');

  // Active state classes (bold text + underline)
  const activeClasses = active
    ? 'text-mountain-600 font-bold bg-mountain-50 border-b-2 border-mountain-600'
    : 'text-gray-700 hover:text-mountain-600 hover:bg-mountain-50';

  const navClasses = [baseClasses, activeClasses, className].join(' ');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      to={href}
      className={navClasses}
      onClick={handleClick}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </Link>
  );
};

/**
 * Mobile Navigation Item for drawer navigation
 */
export const MobileNavItem: React.FC<NavItemProps> = ({
  label,
  href,
  active = false,
  icon,
  onClick,
  className = '',
  ...props
}) => {
  // Base classes for mobile
  const baseClasses = [
    'flex items-center gap-3 px-4 py-3',
    'text-body-lg font-medium',
    'rounded-lg',
    'transition-all duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-mountain-500',
    'min-h-[44px]', // Touch target
  ].join(' ');

  // Active state classes
  const activeClasses = active
    ? 'text-mountain-600 font-bold bg-mountain-50 border-l-4 border-mountain-600'
    : 'text-gray-700 hover:text-mountain-600 hover:bg-mountain-50';

  const navClasses = [baseClasses, activeClasses, className].join(' ');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      to={href}
      className={navClasses}
      onClick={handleClick}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0 w-6 h-6" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{label}</span>
    </Link>
  );
};

/**
 * Navigation Drawer for mobile
 */
interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const NavDrawer: React.FC<NavDrawerProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 animate-slide-in-right overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-mountain-500"
            aria-label="Close navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation items */}
        <nav className="px-4 pb-6 space-y-1">
          {children}
        </nav>
      </div>
    </>
  );
};

export default NavItem;
