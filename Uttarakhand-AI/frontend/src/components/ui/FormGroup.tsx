import { FormGroupProps } from '../../types';
import { AlertCircle } from 'lucide-react';

/**
 * Form Group component
 * Wraps form fields with label, helper text, and error message
 * Applies proper spacing (8px label-to-input, 16px between groups)
 */
const FormGroup: React.FC<FormGroupProps> = ({
  label,
  helperText,
  error,
  required = false,
  children,
  className = '',
  ...props
}) => {
  const groupId = `form-group-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  return (
    <div className={`mb-4 ${className}`} {...props}>
      {/* Label with required indicator */}
      {label && (
        <label
          htmlFor={groupId}
          className="block text-body-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && (
            <span className="text-error ml-1" aria-label="required">
              *
            </span>
          )}
          {!required && (
            <span className="text-gray-400 ml-1 font-normal">
              (optional)
            </span>
          )}
        </label>
      )}

      {/* Form field content */}
      <div className="relative">
        {children}
      </div>

      {/* Helper text or error message */}
      {error ? (
        <div
          id={`${groupId}-error`}
          className="mt-1 text-body-sm text-error flex items-start gap-1"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <p
          id={`${groupId}-helper`}
          className="mt-1 text-body-sm text-gray-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default FormGroup;
