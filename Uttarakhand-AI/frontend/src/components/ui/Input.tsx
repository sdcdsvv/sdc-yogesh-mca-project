import { InputProps } from '../../types';
import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Input component with validation states
 * Supports inline validation and accessibility
 */
const Input: React.FC<InputProps> = ({
  type = 'text',
  name,
  value,
  placeholder,
  label,
  helperText,
  error,
  disabled = false,
  required = false,
  onChange,
  onBlur,
  className = '',
  icon,
  ...props
}) => {
  const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;
  const hasSuccess = !hasError && value && value.length > 0;

  // Base input classes
  const baseClasses = [
    'w-full px-4 py-2.5 text-body',
    'border-2 rounded-lg',
    'transition-all duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60',
  ].join(' ');

  // State-specific classes
  const stateClasses = hasError
    ? 'border-error focus:border-error focus:ring-error/20'
    : hasSuccess
    ? 'border-success focus:border-success focus:ring-success/20'
    : 'border-gray-300 focus:border-mountain-600 focus:ring-mountain-600/20';

  // Icon padding
  const iconPadding = icon ? 'pl-11' : '';

  const inputClasses = [baseClasses, stateClasses, iconPadding, className].join(' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-body-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-error ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        
        {/* Status icon */}
        {(hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError ? (
              <AlertCircle className="w-5 h-5 text-error" aria-hidden="true" />
            ) : (
              <CheckCircle className="w-5 h-5 text-success" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      {/* Helper text or error message */}
      {error ? (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-body-sm text-error flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-body-sm text-gray-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
