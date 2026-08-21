import { CardProps } from '../../types';

/**
 * Card component with multiple variants
 * Supports hover effects and proper spacing
 */
const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'lg',
  shadow = 'md',
  children,
  onClick,
  className = '',
  hoverable = false,
  ...props
}) => {
  // Base card classes
  const baseClasses = [
    'bg-white rounded-xl border border-gray-200',
    'transition-all duration-normal',
  ].join(' ');

  // Variant-specific classes
  const variantClasses = {
    default: '',
    feature: 'text-center',
    interactive: hoverable || onClick ? 'cursor-pointer' : '',
  };

  // Padding classes (24px default)
  const paddingClasses = {
    sm: 'p-4',   // 16px
    md: 'p-5',   // 20px
    lg: 'p-6',   // 24px
  };

  // Shadow classes
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  // Hover classes (scale and shadow increase)
  const hoverClasses = (hoverable || onClick)
    ? 'hover:scale-102 hover:shadow-xl hover:-translate-y-1'
    : '';

  // Combine all classes
  const cardClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    shadowClasses[shadow],
    hoverClasses,
    className,
  ].join(' ');

  const handleClick = onClick
    ? (e: React.MouseEvent<HTMLDivElement>) => {
        onClick(e);
      }
    : undefined;

  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e as any);
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Feature Card - specialized card for feature sections
 */
export const FeatureCard: React.FC<CardProps & { icon?: React.ReactNode; title?: string; description?: string }> = ({
  icon,
  title,
  description,
  children,
  ...props
}) => {
  return (
    <Card variant="feature" hoverable {...props}>
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-mountain-50 text-mountain-600">
            {icon}
          </div>
        </div>
      )}
      {title && (
        <h3 className="text-h4 font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-body text-gray-600">
          {description}
        </p>
      )}
      {children}
    </Card>
  );
};

export default Card;
