/**
 * Secure Input Validation System for Monarch Passport MVP
 * 
 * This module provides comprehensive input validation and sanitization:
 * - QR scan input validation
 * - User profile data sanitization
 * - File upload validation
 * - SQL injection prevention
 * - XSS protection
 * - Input rate limiting
 */

import { secureConfig } from './secureConfig.js';

// Validation patterns
const VALIDATION_PATTERNS = {
  // User ID (UUID format)
  USER_ID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  
  // Email address
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Username (alphanumeric, 3-20 chars)
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  
  // Display name (letters, numbers, spaces, 2-50 chars)
  DISPLAY_NAME: /^[a-zA-Z0-9\s\-_\.]{2,50}$/,
  
  // Reward ID (alphanumeric, hyphens, underscores)
  REWARD_ID: /^[a-zA-Z0-9_-]+$/,
  
  // QR code data (base64 encoded JSON)
  QR_DATA: /^data:application\/json;base64,[A-Za-z0-9+/]*={0,2}$/,
  
  // File extension (image files only)
  IMAGE_EXTENSION: /\.(jpg|jpeg|png|webp|gif)$/i,
  
  // MIME type (image files only)
  IMAGE_MIME: /^image\/(jpeg|png|webp|gif)$/i,
  
  // URL validation
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  
  // Phone number (basic format)
  PHONE: /^\+?[\d\s\-\(\)]{10,15}$/,
  
  // Date (ISO format)
  DATE: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  
  // Timestamp (numeric)
  TIMESTAMP: /^\d{10,13}$/
};

// Malicious patterns to detect
const MALICIOUS_PATTERNS = {
  // SQL injection attempts
  SQL_INJECTION: [
    /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
    /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
    /(\b(exec|execute|sp_|xp_)\b)/i,
    /(\b(script|javascript|vbscript|expression)\b)/i
  ],
  
  // XSS attempts
  XSS: [
    /<script[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i,
    /<link[^>]*>/i,
    /<meta[^>]*>/i,
    /<style[^>]*>/i,
    /<form[^>]*>/i,
    /<input[^>]*>/i,
    /<textarea[^>]*>/i,
    /<select[^>]*>/i,
    /<button[^>]*>/i,
    /<a[^>]*>/i,
    /<img[^>]*>/i,
    /<video[^>]*>/i,
    /<audio[^>]*>/i,
    /<canvas[^>]*>/i,
    /<svg[^>]*>/i
  ],
  
  // Path traversal attempts
  PATH_TRAVERSAL: [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e%2f/i,
    /%2e%2e%5c/i,
    /\.\.%2f/i,
    /\.\.%5c/i
  ],
  
  // Command injection attempts
  COMMAND_INJECTION: [
    /(\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig)\b)/i,
    /(\b(rm|del|erase|format|fdisk|mkfs)\b)/i,
    /(\b(wget|curl|nc|telnet|ssh|ftp)\b)/i,
    /(\b(ping|traceroute|nslookup|dig)\b)/i,
    /(\b(sudo|su|chmod|chown)\b)/i
  ],
  
  // NoSQL injection attempts
  NOSQL_INJECTION: [
    /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$exists|\$regex)/i,
    /(\$or|\$and|\$not|\$nor)/i,
    /(\$set|\$unset|\$inc|\$push|\$pull)/i
  ]
};

// Rate limiting for input validation
const inputRateLimits = new Map();

/**
 * Check rate limiting for input validation
 */
function checkInputRateLimit(userId, inputType) {
  const key = `${userId}:${inputType}`;
  const now = Date.now();
  const window = 60 * 1000; // 1 minute window
  const limit = 100; // 100 inputs per minute per type
  
  if (!inputRateLimits.has(key)) {
    inputRateLimits.set(key, []);
  }
  
  const attempts = inputRateLimits.get(key);
  const recentAttempts = attempts.filter(timestamp => now - timestamp < window);
  
  if (recentAttempts.length >= limit) {
    throw new Error(`Input rate limit exceeded for ${inputType}. Please wait before trying again.`);
  }
  
  recentAttempts.push(now);
  inputRateLimits.set(key, recentAttempts);
  
  return true;
}

/**
 * Sanitize string input
 */
function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  // Check length
  if (input.length > maxLength) {
    throw new Error(`Input too long. Maximum length is ${maxLength} characters.`);
  }
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Check for malicious patterns
  Object.entries(MALICIOUS_PATTERNS).forEach(([type, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        throw new Error(`Malicious input detected: ${type}`);
      }
    });
  });
  
  return sanitized;
}

/**
 * Validate and sanitize user ID
 */
export function validateUserId(userId) {
  try {
    const sanitized = sanitizeString(userId, 36);
    
    if (!VALIDATION_PATTERNS.USER_ID.test(sanitized)) {
      throw new Error('Invalid user ID format');
    }
    
    return {
      success: true,
      data: sanitized,
      message: 'User ID validated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'User ID validation failed'
    };
  }
}

/**
 * Validate and sanitize email address
 */
export function validateEmail(email) {
  try {
    const sanitized = sanitizeString(email, 254);
    
    if (!VALIDATION_PATTERNS.EMAIL.test(sanitized)) {
      throw new Error('Invalid email format');
    }
    
    // Additional email checks
    const [localPart, domain] = sanitized.split('@');
    
    if (localPart.length > 64 || domain.length > 253) {
      throw new Error('Email address too long');
    }
    
    if (localPart.length === 0 || domain.length === 0) {
      throw new Error('Invalid email structure');
    }
    
    return {
      success: true,
      data: sanitized.toLowerCase(),
      message: 'Email validated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Email validation failed'
    };
  }
}

/**
 * Validate and sanitize username
 */
export function validateUsername(username) {
  try {
    const sanitized = sanitizeString(username, 20);
    
    if (!VALIDATION_PATTERNS.USERNAME.test(sanitized)) {
      throw new Error('Username must be 3-20 characters, alphanumeric with hyphens and underscores only');
    }
    
    // Check for reserved usernames
    const reserved = ['admin', 'root', 'system', 'support', 'help', 'info', 'test', 'demo'];
    if (reserved.includes(sanitized.toLowerCase())) {
      throw new Error('Username is reserved');
    }
    
    return {
      success: true,
      data: sanitized,
      message: 'Username validated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Username validation failed'
    };
  }
}

/**
 * Validate and sanitize display name
 */
export function validateDisplayName(displayName) {
  try {
    const sanitized = sanitizeString(displayName, 50);
    
    if (!VALIDATION_PATTERNS.DISPLAY_NAME.test(sanitized)) {
      throw new Error('Display name must be 2-50 characters, letters, numbers, spaces, hyphens, underscores, and periods only');
    }
    
    return {
      success: true,
      data: sanitized,
      message: 'Display name validated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Display name validation failed'
    };
  }
}

/**
 * Validate QR code data
 */
export function validateQRData(qrData, userId) {
  try {
    // Check rate limiting
    checkInputRateLimit(userId, 'qr_scan');
    
    const sanitized = sanitizeString(qrData, 10000);
    
    // Check if it's a data URL
    if (VALIDATION_PATTERNS.QR_DATA.test(sanitized)) {
      return {
        success: true,
        data: sanitized,
        type: 'data_url',
        message: 'QR data URL validated successfully'
      };
    }
    
    // Check if it's JSON
    try {
      const parsed = JSON.parse(sanitized);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          success: true,
          data: sanitized,
          type: 'json',
          message: 'QR JSON data validated successfully'
        };
      }
    } catch (parseError) {
      // Not JSON, continue with other validations
    }
    
    // Check if it's a simple string (legacy format)
    if (sanitized.length > 0 && sanitized.length <= 1000) {
      return {
        success: true,
        data: sanitized,
        type: 'string',
        message: 'QR string data validated successfully'
      };
    }
    
    throw new Error('Invalid QR data format');
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'QR data validation failed'
    };
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(file, userId) {
  try {
    // Check rate limiting
    checkInputRateLimit(userId, 'file_upload');
    
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Check file size
    const maxSize = secureConfig.get('MAX_FILE_SIZE');
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
    
    // Check file type
    const allowedTypes = secureConfig.get('ALLOWED_FILE_TYPES');
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Check file extension
    const fileName = file.name || '';
    if (!VALIDATION_PATTERNS.IMAGE_EXTENSION.test(fileName)) {
      throw new Error('File extension not allowed. Only image files are permitted');
    }
    
    // Validate filename
    const sanitizedFileName = sanitizeString(fileName, 255);
    
    // Check for malicious filename patterns
    if (MALICIOUS_PATTERNS.PATH_TRAVERSAL.some(pattern => pattern.test(sanitizedFileName))) {
      throw new Error('Malicious filename detected');
    }
    
    return {
      success: true,
      data: {
        file,
        fileName: sanitizedFileName,
        fileSize: file.size,
        fileType: file.type
      },
      message: 'File upload validated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'File upload validation failed'
    };
  }
}

/**
 * Validate reward ID
 */
export function validateRewardId(rewardId) {
  try {
    const sanitized = sanitizeString(rewardId, 100);
    
    if (!VALIDATION_PATTERNS.REWARD_ID.test(sanitized)) {
      throw new Error('Invalid reward ID format');
    }
    
    return {
      success: true,
      data: sanitized,
      message: 'Reward ID validated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Reward ID validation failed'
    };
  }
}

/**
 * Validate URL
 */
export function validateURL(url) {
  try {
    const sanitized = sanitizeString(url, 2048);
    
    if (!VALIDATION_PATTERNS.URL.test(sanitized)) {
      throw new Error('Invalid URL format');
    }
    
    // Additional URL checks
    const urlObj = new URL(sanitized);
    
    // Check for allowed protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed');
    }
    
    return {
      success: true,
      data: sanitized,
      message: 'URL validated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'URL validation failed'
    };
  }
}

/**
 * Validate phone number
 */
export function validatePhone(phone) {
  try {
    const sanitized = sanitizeString(phone, 20);
    
    if (!VALIDATION_PATTERNS.PHONE.test(sanitized)) {
      throw new Error('Invalid phone number format');
    }
    
    // Remove all non-digit characters for validation
    const digitsOnly = sanitized.replace(/\D/g, '');
    
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      throw new Error('Phone number must be 10-15 digits');
    }
    
    return {
      success: true,
      data: sanitized,
      message: 'Phone number validated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Phone number validation failed'
    };
  }
}

/**
 * Validate date
 */
export function validateDate(date) {
  try {
    const sanitized = sanitizeString(date, 30);
    
    if (!VALIDATION_PATTERNS.DATE.test(sanitized)) {
      throw new Error('Invalid date format. Use ISO 8601 format');
    }
    
    const dateObj = new Date(sanitized);
    
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }
    
    return {
      success: true,
      data: sanitized,
      message: 'Date validated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Date validation failed'
    };
  }
}

/**
 * Validate user profile data
 */
export function validateUserProfile(profileData, userId) {
  try {
    // Check rate limiting
    checkInputRateLimit(userId, 'profile_update');
    
    const validated = {};
    const errors = [];
    
    // Validate each field
    if (profileData.email) {
      const emailResult = validateEmail(profileData.email);
      if (emailResult.success) {
        validated.email = emailResult.data;
      } else {
        errors.push(`Email: ${emailResult.error}`);
      }
    }
    
    if (profileData.username) {
      const usernameResult = validateUsername(profileData.username);
      if (usernameResult.success) {
        validated.username = usernameResult.data;
      } else {
        errors.push(`Username: ${usernameResult.error}`);
      }
    }
    
    if (profileData.display_name) {
      const displayNameResult = validateDisplayName(profileData.display_name);
      if (displayNameResult.success) {
        validated.display_name = displayNameResult.data;
      } else {
        errors.push(`Display name: ${displayNameResult.error}`);
      }
    }
    
    if (profileData.phone) {
      const phoneResult = validatePhone(profileData.phone);
      if (phoneResult.success) {
        validated.phone = phoneResult.data;
      } else {
        errors.push(`Phone: ${phoneResult.error}`);
      }
    }
    
    if (profileData.bio) {
      const bioResult = sanitizeString(profileData.bio, 500);
      validated.bio = bioResult;
    }
    
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join('; ')}`);
    }
    
    return {
      success: true,
      data: validated,
      message: 'User profile validated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'User profile validation failed'
    };
  }
}

/**
 * Security audit for input validation
 */
export function auditInputValidation() {
  const audit = {
    timestamp: new Date().toISOString(),
    rateLimits: inputRateLimits.size,
    activeUsers: new Set([...inputRateLimits.keys()].map(key => key.split(':')[0])).size,
    validationPatterns: Object.keys(VALIDATION_PATTERNS).length,
    maliciousPatterns: Object.keys(MALICIOUS_PATTERNS).length
  };
  
  return audit;
}

/**
 * Clear input rate limits (for testing/admin purposes)
 */
export function clearInputRateLimits() {
  inputRateLimits.clear();
  return { success: true, message: 'Input rate limits cleared' };
}

// Export validation patterns for external use
export const VALIDATION_CONFIG = {
  PATTERNS: VALIDATION_PATTERNS,
  MALICIOUS_PATTERNS,
  RATE_LIMITS: {
    QR_SCAN: 100,
    FILE_UPLOAD: 10,
    PROFILE_UPDATE: 50
  }
};

export default {
  validateUserId,
  validateEmail,
  validateUsername,
  validateDisplayName,
  validateQRData,
  validateFileUpload,
  validateRewardId,
  validateURL,
  validatePhone,
  validateDate,
  validateUserProfile,
  auditInputValidation,
  clearInputRateLimits,
  VALIDATION_CONFIG
}; 