import { TextareaProps } from '../../types';
import { AlertCircle } from 'lucide-react';

/**
 * Textarea component with validation states
 */
const Textarea: React.FC<TextareaProps> = ({
  name,
  value,
  placeholder,
  label,
  helperText,
  error,
  disabled = false,
  required = false,
  rows = 4,
  onChange,
  onBlur,
  className = '',
  ...props
}) => {
  const textareaId = name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  // Base textarea classes
  const baseClasses = [
    'w-full px-4 py-2.5 text-body',
    'border-2 rounded-lg',
    'transition-all duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60',
    'resize-vertical',
  ].join(' ');

  // State-specific classes
  const stateClasses = hasError
    ? 'border-error focus:border-error focus:ring-error/20'
    : 'border-gray-300 focus:border-mountain-600 focus:ring-mountain-600/20';

  const textareaClasses = [baseClasses, stateClasses, className].join(' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-body-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-error ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        onChange={onChange}
        onBlur={onBlur}
        className={textareaClasses}
        aria-invalid={hasError}
        aria-describedby={
          error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
        }
        {...props}
      />

      {/* Helper text or error message */}
      {error ? (
        <p
          id={`${textareaId}-error`}
          className="mt-1 text-body-sm text-error flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${textareaId}-helper`}
          className="mt-1 text-body-sm text-gray-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Textarea;
