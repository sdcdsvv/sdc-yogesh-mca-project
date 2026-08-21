import { TypographyProps } from '../../types';

/**
 * Typography component for consistent text styling
 * Ensures minimum 16px body text and proper line heights
 */
const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  children,
  className = '',
  as,
  color,
  weight = 'regular',
  ...props
}) => {
  // Variant-specific classes
  const variantClasses = {
    display: 'text-display font-bold',
    h1: 'text-h1 font-bold',
    h2: 'text-h2 font-semibold',
    h3: 'text-h3 font-semibold',
    h4: 'text-h4 font-medium',
    'body-lg': 'text-body-lg',
    body: 'text-body',
    'body-sm': 'text-body-sm',
    caption: 'text-caption',
  };

  // Weight classes
  const weightClasses = {
    regular: 'font-regular',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  // Default element mapping
  const defaultElements = {
    display: 'h1',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    'body-lg': 'p',
    body: 'p',
    'body-sm': 'p',
    caption: 'span',
  };

  // Determine the element to render
  const Component = as || (defaultElements[variant] as keyof JSX.IntrinsicElements);

  // Color class
  const colorClass = color || 'text-gray-900';

  // Combine classes
  const typographyClasses = [
    variantClasses[variant],
    weightClasses[weight],
    colorClass,
    className,
  ].join(' ');

  return (
    <Component className={typographyClasses} {...props}>
      {children}
    </Component>
  );
};

// Convenience components for common use cases
export const Display: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="display" {...props} />
);

export const H1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const BodyLarge: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-lg" {...props} />
);

export const Body: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body" {...props} />
);

export const BodySmall: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body-sm" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export default Typography;
