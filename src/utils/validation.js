// Validation utilities for form inputs and data
// This demonstrates better error handling and input validation

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the validation passed
 * @property {string[]} errors - Array of error messages
 * @property {Object} sanitized - Sanitized/cleaned data
 */

/**
 * Sanitize text input by trimming and removing potentially harmful content
 * @param {string} text - Input text to sanitize
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';

  return text
    .trim()
    .replace(/[<>"'&]/g, '') // Remove basic HTML/script injection chars
    .substring(0, 1000); // Limit length
};

/**
 * Validate question text input
 * @param {string} text - Question text to validate
 * @returns {ValidationResult} Validation result
 */
export const validateQuestionText = (text) => {
  const errors = [];
  const sanitized = sanitizeText(text);

  if (!sanitized) {
    errors.push('Question text is required');
  } else if (sanitized.length < 10) {
    errors.push('Question must be at least 10 characters long');
  } else if (sanitized.length > 500) {
    errors.push('Question must be less than 500 characters');
  }

  // Check for spam patterns
  const spamPatterns = [
    /^.*(.)\1{4,}.*$/, // Repeated characters (5+ times)
    /^[A-Z\s!]{20,}$/, // All caps with excessive length
    /(http|www\.|@)/i // URLs or email patterns
  ];

  if (spamPatterns.some(pattern => pattern.test(sanitized))) {
    errors.push('Question appears to contain spam or inappropriate content');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate session ID
 * @param {string} sessionId - Session ID to validate
 * @returns {ValidationResult} Validation result
 */
export const validateSessionId = (sessionId) => {
  const errors = [];
  let sanitized = null;

  if (sessionId) {
    sanitized = sanitizeText(sessionId);

    if (sanitized.length < 3) {
      errors.push('Session ID must be at least 3 characters');
    } else if (sanitized.length > 50) {
      errors.push('Session ID must be less than 50 characters');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(sanitized)) {
      errors.push('Session ID can only contain letters, numbers, hyphens, and underscores');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate complete question submission data
 * @param {Object} questionData - Question data to validate
 * @returns {ValidationResult} Validation result
 */
export const validateQuestionSubmission = (questionData) => {
  const errors = [];
  const sanitized = {};

  // Validate question text
  const textValidation = validateQuestionText(questionData.text);
  if (!textValidation.isValid) {
    errors.push(...textValidation.errors);
  } else {
    sanitized.text = textValidation.sanitized;
  }

  // Validate session ID if provided
  if (questionData.session) {
    const sessionValidation = validateSessionId(questionData.session);
    if (!sessionValidation.isValid) {
      errors.push(...sessionValidation.errors);
    } else {
      sanitized.session = sessionValidation.sanitized;
    }
  }

  // Validate anonymous flag
  sanitized.anonymous = Boolean(questionData.anonymous);

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Rate limiting utility
 * @param {string} key - Unique key for rate limiting (e.g., IP, user ID)
 * @param {number} maxAttempts - Maximum attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} Whether the action is allowed
 */
export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now();
  const storageKey = `rateLimit_${key}`;

  try {
    const stored = localStorage.getItem(storageKey);
    const attempts = stored ? JSON.parse(stored) : [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

    if (validAttempts.length >= maxAttempts) {
      return false; // Rate limit exceeded
    }

    // Add current attempt
    validAttempts.push(now);
    localStorage.setItem(storageKey, JSON.stringify(validAttempts));

    return true; // Action allowed
  } catch (error) {
    console.warn('Rate limiting error:', error);
    return true; // Allow action if rate limiting fails
  }
};

/**
 * Debounce utility for search and input handling
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Format error messages for user display
 * @param {string|Error|Array} error - Error to format
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (error) => {
  if (Array.isArray(error)) {
    return error.join('. ');
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};

/**
 * Check if a string contains profanity or inappropriate content
 * @param {string} text - Text to check
 * @returns {boolean} Whether text contains inappropriate content
 */
export const containsInappropriateContent = (text) => {
  // Basic profanity filter - in production, use a more comprehensive solution
  const inappropriatePatterns = [
    /\b(spam|test|fake|dummy)\b/i,
    /[!@#$%^&*]{3,}/, // Excessive special characters
    /\b\w*(.)\1{3,}\w*\b/ // Words with repeated characters
  ];

  return inappropriatePatterns.some(pattern => pattern.test(text));
};

const validationUtils = {
  sanitizeText,
  validateQuestionText,
  validateSessionId,
  validateQuestionSubmission,
  checkRateLimit,
  debounce,
  formatErrorMessage,
  containsInappropriateContent
};

export default validationUtils;
