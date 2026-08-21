// Component Props Type Definitions
import { ReactNode, MouseEvent } from 'react';

/**
 * Button component props
 */
export interface ButtonProps {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Loading state with spinner */
  loading?: boolean;
  /** Optional icon element */
  icon?: ReactNode;
  /** Button content */
  children: ReactNode;
  /** Click handler */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset';
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * Card component props
 */
export interface CardProps {
  /** Visual variant */
  variant?: 'default' | 'feature' | 'interactive';
  /** Padding size */
  padding?: 'sm' | 'md' | 'lg';
  /** Shadow elevation */
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  /** Card content */
  children: ReactNode;
  /** Click handler for interactive cards */
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Hover effect enabled */
  hoverable?: boolean;
}

/**
 * Tab component props
 */
export interface TabProps {
  /** Unique identifier */
  id: string;
  /** Icon (emoji or icon component) */
  icon: string | ReactNode;
  /** Tab label */
  label: string;
  /** Tab description */
  description: string;
  /** Gradient color classes */
  color: string;
  /** Active state */
  active: boolean;
  /** Click handler */
  onClick: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Input field props
 */
export interface InputProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Input name */
  name?: string;
  /** Input value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Icon element */
  icon?: ReactNode;
}

/**
 * Textarea props
 */
export interface TextareaProps {
  /** Textarea name */
  name?: string;
  /** Textarea value */
  value?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Number of rows */
  rows?: number;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Select dropdown props
 */
export interface SelectProps {
  /** Select name */
  name?: string;
  /** Selected value */
  value?: string;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Options array */
  options: Array<{ value: string; label: string }>;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Icon component props
 */
export interface IconProps {
  /** Icon name or component */
  name: string | ReactNode;
  /** Icon size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Icon color */
  color?: string;
  /** Additional CSS classes */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
}

/**
 * Typography component props
 */
export interface TypographyProps {
  /** Typography variant */
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body-lg' | 'body' | 'body-sm' | 'caption';
  /** Text content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** HTML element to render */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  /** Text color */
  color?: string;
  /** Font weight */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

/**
 * Form group props
 */
export interface FormGroupProps {
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Required indicator */
  required?: boolean;
  /** Form field content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigation item props
 */
export interface NavItemProps {
  /** Navigation label */
  label: string;
  /** Navigation path */
  href: string;
  /** Active state */
  active?: boolean;
  /** Icon element */
  icon?: ReactNode;
  /** Click handler */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Modal props
 */
export interface ModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Toast notification props
 */
export interface ToastProps {
  /** Toast message */
  message: string;
  /** Toast type */
  type?: 'success' | 'error' | 'warning' | 'info';
  /** Auto dismiss duration in ms */
  duration?: number;
  /** Close handler */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}
