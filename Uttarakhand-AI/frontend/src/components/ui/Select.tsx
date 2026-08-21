import { SelectProps } from '../../types';
import { AlertCircle, ChevronDown } from 'lucide-react';

/**
 * Select dropdown component with validation states
 */
const Select: React.FC<SelectProps> = ({
  name,
  value,
  label,
  helperText,
  error,
  disabled = false,
  required = false,
  options,
  onChange,
  className = '',
  ...props
}) => {
  const selectId = name || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  // Base select classes
  const baseClasses = [
    'w-full px-4 py-2.5 pr-10 text-body',
    'border-2 rounded-lg',
    'transition-all duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60',
    'appearance-none cursor-pointer',
  ].join(' ');

  // State-specific classes
  const stateClasses = hasError
    ? 'border-error focus:border-error focus:ring-error/20'
    : 'border-gray-300 focus:border-mountain-600 focus:ring-mountain-600/20';

  const selectClasses = [baseClasses, stateClasses, className].join(' ');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-body-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-error ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          disabled={disabled}
          required={required}
          onChange={onChange}
          className={selectClasses}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Dropdown icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </div>
      </div>

      {/* Helper text or error message */}
      {error ? (
        <p
          id={`${selectId}-error`}
          className="mt-1 text-body-sm text-error flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${selectId}-helper`}
          className="mt-1 text-body-sm text-gray-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Select;
