/**
 * Validation utility functions for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => ValidationResult;
}

/**
 * Validate a single field based on rules
 */
export const validateField = (
  value: any,
  rules: ValidationRules,
  fieldName: string = 'Field'
): ValidationResult => {
  // Required check
  if (rules.required) {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }
    if (typeof value === 'string' && value.trim() === '') {
      return { isValid: false, error: `${fieldName} is required` };
    }
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return { isValid: true };
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.minLength && value.trim().length < rules.minLength) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${rules.minLength} characters`
      };
    }

    if (rules.maxLength && value.trim().length > rules.maxLength) {
      return {
        isValid: false,
        error: `${fieldName} must not exceed ${rules.maxLength} characters`
      };
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return {
        isValid: false,
        error: `${fieldName} format is invalid`
      };
    }
  }

  // Number validations
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = typeof value === 'number' ? value : Number(value);

    if (rules.min !== undefined && numValue < rules.min) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${rules.min}`
      };
    }

    if (rules.max !== undefined && numValue > rules.max) {
      return {
        isValid: false,
        error: `${fieldName} must not exceed ${rules.max}`
      };
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return { isValid: true };
};

/**
 * Validate multiple fields at once
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRules>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((fieldName) => {
    const result = validateField(data[fieldName], rules[fieldName], fieldName);
    if (!result.isValid && result.error) {
      errors[fieldName] = result.error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Course-specific validation rules
 */
export const courseValidationRules = {
  title: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  description: {
    required: true,
    minLength: 20,
    maxLength: 2000
  },
  category: {
    required: true
  },
  max_students: {
    required: true,
    min: 1,
    max: 10000,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) {
        return { isValid: false, error: 'Max students must be a valid number' };
      }
      if (!Number.isInteger(num)) {
        return { isValid: false, error: 'Max students must be a whole number' };
      }
      return { isValid: true };
    }
  },
  duration: {
    minLength: 2,
    maxLength: 100
  }
};

/**
 * Assignment-specific validation rules
 */
export const assignmentValidationRules = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 1000
  },
  course_id: {
    required: true
  },
  due_date: {
    required: true,
    custom: (value: any) => {
      if (!value) {
        return { isValid: false, error: 'Due date is required' };
      }
      const dueDate = new Date(value);
      const now = new Date();
      // Allow dates that are at least 1 minute in the future
      const oneMinuteFromNow = new Date(now.getTime() + 60000);
      if (isNaN(dueDate.getTime())) {
        return { isValid: false, error: 'Invalid date format' };
      }
      if (dueDate < oneMinuteFromNow) {
        return { isValid: false, error: 'Due date must be at least 1 minute in the future' };
      }
      return { isValid: true };
    }
  },
  max_points: {
    required: true,
    min: 1,
    max: 1000,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) {
        return { isValid: false, error: 'Max points must be a valid number' };
      }
      if (num <= 0) {
        return { isValid: false, error: 'Max points must be greater than 0' };
      }
      return { isValid: true };
    }
  },
  max_file_size: {
    required: true,
    min: 1,
    max: 100,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num)) {
        return { isValid: false, error: 'Max file size must be a valid number' };
      }
      if (num <= 0) {
        return { isValid: false, error: 'Max file size must be greater than 0' };
      }
      return { isValid: true };
    }
  }
};

/**
 * Grading-specific validation rules
 */
export const gradingValidationRules = (maxPoints: number) => ({
  grade: {
    required: true,
    min: 0,
    max: maxPoints,
    custom: (value: any) => {
      if (value === null || value === undefined || value === '') {
        return { isValid: false, error: 'Grade is required' };
      }
      const num = Number(value);
      if (isNaN(num)) {
        return { isValid: false, error: 'Grade must be a valid number' };
      }
      if (num < 0) {
        return { isValid: false, error: 'Grade cannot be negative' };
      }
      if (num > maxPoints) {
        return { isValid: false, error: `Grade cannot exceed ${maxPoints} points` };
      }
      return { isValid: true };
    }
  },
  feedback: {
    maxLength: 2000
  }
});

/**
 * Sanitize string input to prevent XSS
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate file type
 */
export const isValidFileType = (fileName: string, allowedTypes: string[]): boolean => {
  if (allowedTypes.length === 0) return true;
  
  const extension = fileName.toLowerCase().split('.').pop();
  return allowedTypes.some(type => 
    type.toLowerCase().replace('.', '') === extension
  );
};

/**
 * Validate file size
 */
export const isValidFileSize = (fileSize: number, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
};
