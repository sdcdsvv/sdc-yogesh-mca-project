import { ButtonProps } from '../../types';
import { Loader2 } from 'lucide-react';

/**
 * Button component with multiple variants and sizes
 * Meets WCAG 2.1 AA accessibility standards
 * Minimum 44px touch targets on mobile
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  children,
  className = '',
  type = 'button',
  fullWidth = false,
  onClick,
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses = [
    'inline-flex items-center justify-center gap-2',
    'font-semibold rounded-lg',
    'transition-all duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-98',
  ].join(' ');

  // Variant-specific classes
  const variantClasses = {
    primary: [
      'bg-mountain-600 text-white',
      'hover:bg-mountain-700 hover:scale-102 hover:shadow-lg',
      'focus:ring-mountain-500',
    ].join(' '),
    secondary: [
      'border-2 border-mountain-600 text-mountain-600 bg-white',
      'hover:bg-mountain-50 hover:scale-102 hover:shadow-md',
      'focus:ring-mountain-500',
    ].join(' '),
    ghost: [
      'text-mountain-600 bg-transparent',
      'hover:bg-mountain-50 hover:scale-102',
      'focus:ring-mountain-500',
    ].join(' '),
    danger: [
      'bg-error text-white',
      'hover:bg-red-700 hover:scale-102 hover:shadow-lg',
      'focus:ring-red-500',
    ].join(' '),
  };

  // Size-specific classes (ensuring 44px minimum touch target)
  const sizeClasses = {
    sm: 'h-10 px-3 text-body-sm min-h-[44px]', // 40px height, but min 44px for touch
    md: 'h-11 px-4 text-body min-h-[44px]',    // 44px height
    lg: 'h-12 px-6 text-body-lg min-h-[44px]', // 48px height
  };

  // Full width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className,
  ].join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
