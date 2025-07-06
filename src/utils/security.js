/**
 * Security utilities for input sanitization and XSS prevention
 * Implements security best practices for user-generated content
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} dirty - Raw HTML content
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = (dirty, options = {}) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const defaultConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class'],
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ...options
  };

  return DOMPurify.sanitize(dirty, defaultConfig);
};

/**
 * Sanitize plain text input to prevent injection attacks
 * @param {string} input - Raw text input
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} - Sanitized text
 */
export const sanitizeText = (input, maxLength = 1000) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  let sanitized = input
    .replace(/[<>"'&]/g, '') // Remove HTML/XML characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:/gi, '') // Remove data: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

/**
 * Validate and sanitize URL inputs
 * @param {string} url - URL to validate
 * @param {Array} allowedProtocols - Allowed URL protocols
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url, allowedProtocols = ['http:', 'https:', 'mailto:']) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const urlObj = new URL(url);

    // Check if protocol is allowed
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return null;
    }

    // Additional security checks
    // eslint-disable-next-line no-script-url
    if (urlObj.protocol === 'javascript:' ||
        urlObj.protocol === 'data:' ||
        urlObj.protocol === 'vbscript:') {
      return null;
    }

    return urlObj.toString();
  } catch (error) {
    return null;
  }
};

/**
 * Generate a Content Security Policy header value
 * @returns {string} - CSP header value
 */
export const generateCSP = () => {
  const policies = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests'
  ];

  return policies.join('; ');
};

/**
 * Rate limiting utility for API calls
 */
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   * @param {string} identifier - Unique identifier (IP, user ID, etc.)
   * @returns {boolean} - Whether request is allowed
   */
  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  /**
   * Get remaining requests for identifier
   * @param {string} identifier - Unique identifier
   * @returns {number} - Remaining requests
   */
  getRemainingRequests(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

/**
 * Create rate limiter instances for different operations
 */
export const rateLimiters = {
  questions: new RateLimiter(10, 60000), // 10 questions per minute
  votes: new RateLimiter(50, 60000), // 50 votes per minute
  bookmarks: new RateLimiter(100, 60000), // 100 bookmark operations per minute
  general: new RateLimiter(200, 60000) // 200 general requests per minute
};

/**
 * Security headers for fetch requests
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

/**
 * Validate session data structure
 * @param {Object} session - Session object to validate
 * @returns {boolean} - Whether session is valid
 */
export const validateSessionData = (session) => {
  if (!session || typeof session !== 'object') {
    return false;
  }

  const requiredFields = ['id', 'title', 'start_time', 'end_time'];
  const hasRequiredFields = requiredFields.every(field =>
    session.hasOwnProperty(field) && session[field] !== null
  );

  if (!hasRequiredFields) {
    return false;
  }

  // Validate data types
  if (typeof session.id !== 'number' && typeof session.id !== 'string') {
    return false;
  }

  if (typeof session.title !== 'string' || session.title.length > 200) {
    return false;
  }

  // Validate dates
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return false;
  }

  if (startTime >= endTime) {
    return false;
  }

  return true;
};

/**
 * Generate a secure random string for CSRF tokens
 * @param {number} length - Length of the random string
 * @returns {string} - Random string
 */
export const generateSecureToken = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const securityUtils = {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  generateCSP,
  rateLimiters,
  securityHeaders,
  validateSessionData,
  generateSecureToken
};

export default securityUtils;
