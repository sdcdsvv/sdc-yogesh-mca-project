import { IconProps } from '../../types';
import * as LucideIcons from 'lucide-react';

/**
 * Icon component wrapper for Lucide React icons
 * Ensures consistent sizing (minimum 24x24px) and accessibility
 */
const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  className = '',
  ariaLabel,
  ...props
}) => {
  // Size mapping (minimum 24x24px)
  const sizeClasses = {
    sm: 'w-6 h-6',   // 24px
    md: 'w-7 h-7',   // 28px
    lg: 'w-8 h-8',   // 32px
    xl: 'w-10 h-10', // 40px
  };

  // Color classes
  const colorClass = color || 'currentColor';

  const iconClasses = [sizeClasses[size], className].join(' ');

  // If name is a string, try to get the icon from Lucide
  if (typeof name === 'string') {
    // Convert kebab-case or snake_case to PascalCase
    const iconName = name
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const IconComponent = (LucideIcons as any)[iconName];

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in Lucide icons`);
      return null;
    }

    return (
      <IconComponent
        className={iconClasses}
        style={{ color: colorClass }}
        aria-label={ariaLabel}
        aria-hidden={!ariaLabel}
        role={ariaLabel ? 'img' : undefined}
        {...props}
      />
    );
  }

  // If name is a ReactNode, render it directly
  return (
    <span
      className={iconClasses}
      style={{ color: colorClass }}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      {...props}
    >
      {name}
    </span>
  );
};

export default Icon;
