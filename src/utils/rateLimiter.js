/**
 * Rate Limiting System for Monarch Passport MVP
 * 
 * This module provides comprehensive rate limiting:
 * - QR scan rate limiting
 * - Login attempt limiting
 * - API endpoint protection
 * - IP-based and user-based limiting
 * - Configurable windows and limits
 */

import { secureConfig } from './secureConfig.js';

// Rate limiting storage
const rateLimitStore = new Map();

// Rate limit configurations
const RATE_LIMIT_CONFIG = {
  // QR scanning limits
  QR_SCAN: {
    window: 60 * 1000, // 1 minute
    limit: secureConfig.get('RATE_LIMIT_SCANS') || 10,
    key: process.env.REACT_APP_RATE_LIMIT_QR_KEY || 'qr_scan'
  },
  
  // Login attempt limits
  LOGIN: {
    window: 15 * 60 * 1000, // 15 minutes
    limit: secureConfig.get('RATE_LIMIT_LOGINS') || 5,
    key: process.env.REACT_APP_RATE_LIMIT_LOGIN_KEY || 'login'
  },
  
  // API request limits
  API: {
    window: 60 * 1000, // 1 minute
    limit: parseInt(process.env.REACT_APP_RATE_LIMIT_API) || 100,
    key: process.env.REACT_APP_RATE_LIMIT_API_KEY || 'api'
  },
  
  // File upload limits
  FILE_UPLOAD: {
    window: 60 * 1000, // 1 minute
    limit: parseInt(process.env.REACT_APP_RATE_LIMIT_FILE_UPLOAD) || 5,
    key: process.env.REACT_APP_RATE_LIMIT_FILE_KEY || 'file_upload'
  },
  
  // Profile update limits
  PROFILE_UPDATE: {
    window: 60 * 1000, // 1 minute
    limit: parseInt(process.env.REACT_APP_RATE_LIMIT_PROFILE) || 10,
    key: process.env.REACT_APP_RATE_LIMIT_PROFILE_KEY || 'profile_update'
  },
  
  // Reward claim limits
  REWARD_CLAIM: {
    window: 60 * 1000, // 1 minute
    limit: parseInt(process.env.REACT_APP_RATE_LIMIT_REWARD) || 20,
    key: process.env.REACT_APP_RATE_LIMIT_REWARD_KEY || 'reward_claim'
  }
};

/**
 * Generate rate limit key
 */
function generateRateLimitKey(identifier, type) {
  return `${type}:${identifier}`;
}

/**
 * Get current timestamp
 */
function getCurrentTime() {
  return Date.now();
}

/**
 * Clean expired entries from rate limit store
 */
function cleanExpiredEntries() {
  const now = getCurrentTime();
  
  for (const [key, entries] of rateLimitStore.entries()) {
    const validEntries = entries.filter(timestamp => now - timestamp < 60 * 1000);
    
    if (validEntries.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validEntries);
    }
  }
}

/**
 * Check rate limit for a specific action
 */
export function checkRateLimit(identifier, type, config = null) {
  try {
    // Clean expired entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean
      cleanExpiredEntries();
    }
    
    // Get configuration for the rate limit type
    const rateLimitConfig = config || RATE_LIMIT_CONFIG[type.toUpperCase()];
    
    if (!rateLimitConfig) {
      throw new Error(`Unknown rate limit type: ${type}`);
    }
    
    const { window, limit, key } = rateLimitConfig;
    const rateLimitKey = generateRateLimitKey(identifier, key);
    const now = getCurrentTime();
    
    // Get existing entries
    const entries = rateLimitStore.get(rateLimitKey) || [];
    
    // Filter entries within the current window
    const validEntries = entries.filter(timestamp => now - timestamp < window);
    
    // Check if limit is exceeded
    if (validEntries.length >= limit) {
      const oldestEntry = Math.min(...validEntries);
      const resetTime = oldestEntry + window;
      const timeUntilReset = resetTime - now;
      
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetTime: new Date(resetTime).toISOString(),
        timeUntilReset: Math.ceil(timeUntilReset / 1000),
        message: `Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`
      };
    }
    
    // Add current request
    validEntries.push(now);
    rateLimitStore.set(rateLimitKey, validEntries);
    
    return {
      allowed: true,
      limit,
      remaining: limit - validEntries.length,
      resetTime: new Date(now + window).toISOString(),
      timeUntilReset: Math.ceil(window / 1000),
      message: 'Rate limit check passed'
    };
    
  } catch (error) {
    console.error('Rate limit check failed:', error.message);
    return {
      allowed: false,
      error: error.message,
      message: 'Rate limit check failed'
    };
  }
}

/**
 * Check QR scan rate limit
 */
export function checkQRScanRateLimit(userId) {
  return checkRateLimit(userId, 'QR_SCAN');
}

/**
 * Check login attempt rate limit
 */
export function checkLoginRateLimit(identifier) {
  return checkRateLimit(identifier, 'LOGIN');
}

/**
 * Check API request rate limit
 */
export function checkAPIRateLimit(identifier) {
  return checkRateLimit(identifier, 'API');
}

/**
 * Check file upload rate limit
 */
export function checkFileUploadRateLimit(userId) {
  return checkRateLimit(userId, 'FILE_UPLOAD');
}

/**
 * Check profile update rate limit
 */
export function checkProfileUpdateRateLimit(userId) {
  return checkRateLimit(userId, 'PROFILE_UPDATE');
}

/**
 * Check reward claim rate limit
 */
export function checkRewardClaimRateLimit(userId) {
  return checkRateLimit(userId, 'REWARD_CLAIM');
}

/**
 * Rate limiting middleware for React components
 */
export function withRateLimit(WrappedComponent, rateLimitType, identifierGetter) {
  return function RateLimitedComponent(props) {
    const identifier = identifierGetter ? identifierGetter(props) : 'default';
    
    const handleAction = async (action, ...args) => {
      const rateLimitResult = checkRateLimit(identifier, rateLimitType);
      
      if (!rateLimitResult.allowed) {
        console.warn('Rate limit exceeded:', rateLimitResult.message);
        throw new Error(rateLimitResult.message);
      }
      
      // Proceed with the action
      return action(...args);
    };
    
    return WrappedComponent({ ...props, rateLimitedAction: handleAction });
  };
}

/**
 * Rate limiting hook for functional components
 */
export function useRateLimit(rateLimitType, identifier) {
  const checkLimit = () => {
    return checkRateLimit(identifier, rateLimitType);
  };
  
  const isAllowed = () => {
    const result = checkLimit();
    return result.allowed;
  };
  
  const getRemaining = () => {
    const result = checkLimit();
    return result.remaining;
  };
  
  const getResetTime = () => {
    const result = checkLimit();
    return result.resetTime;
  };
  
  return {
    checkLimit,
    isAllowed,
    getRemaining,
    getResetTime
  };
}

/**
 * Reset rate limit for a specific identifier and type
 */
export function resetRateLimit(identifier, type) {
  try {
    const rateLimitConfig = RATE_LIMIT_CONFIG[type.toUpperCase()];
    
    if (!rateLimitConfig) {
      throw new Error(`Unknown rate limit type: ${type}`);
    }
    
    const rateLimitKey = generateRateLimitKey(identifier, rateLimitConfig.key);
    rateLimitStore.delete(rateLimitKey);
    
    return {
      success: true,
      message: `Rate limit reset for ${identifier} (${type})`
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to reset rate limit'
    };
  }
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats() {
  const stats = {
    timestamp: new Date().toISOString(),
    totalEntries: rateLimitStore.size,
    activeLimits: {},
    configurations: RATE_LIMIT_CONFIG
  };
  
  // Count active limits by type
  for (const [key, entries] of rateLimitStore.entries()) {
    const type = key.split(':')[0];
    if (!stats.activeLimits[type]) {
      stats.activeLimits[type] = 0;
    }
    stats.activeLimits[type]++;
  }
  
  return stats;
}

/**
 * Clear all rate limits (for admin purposes)
 */
export function clearAllRateLimits() {
  rateLimitStore.clear();
  return {
    success: true,
    message: 'All rate limits cleared'
  };
}

/**
 * Get rate limit information for a specific identifier
 */
export function getRateLimitInfo(identifier, type) {
  try {
    const rateLimitConfig = RATE_LIMIT_CONFIG[type.toUpperCase()];
    
    if (!rateLimitConfig) {
      throw new Error(`Unknown rate limit type: ${type}`);
    }
    
    const rateLimitKey = generateRateLimitKey(identifier, rateLimitConfig.key);
    const entries = rateLimitStore.get(rateLimitKey) || [];
    const now = getCurrentTime();
    
    const validEntries = entries.filter(timestamp => now - timestamp < rateLimitConfig.window);
    
    return {
      identifier,
      type,
      limit: rateLimitConfig.limit,
      used: validEntries.length,
      remaining: rateLimitConfig.limit - validEntries.length,
      window: rateLimitConfig.window,
      resetTime: validEntries.length > 0 
        ? new Date(Math.max(...validEntries) + rateLimitConfig.window).toISOString()
        : new Date(now).toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to get rate limit info'
    };
  }
}

/**
 * Security audit for rate limiting system
 */
export function auditRateLimiting() {
  const audit = {
    timestamp: new Date().toISOString(),
    totalEntries: rateLimitStore.size,
    configurations: Object.keys(RATE_LIMIT_CONFIG).length,
    activeLimits: getRateLimitStats().activeLimits,
    memoryUsage: process.memoryUsage ? process.memoryUsage() : 'N/A'
  };
  
  return audit;
}

// Export configuration for external use
export const RATE_LIMIT_CONFIG_EXPORT = RATE_LIMIT_CONFIG;

export default {
  checkRateLimit,
  checkQRScanRateLimit,
  checkLoginRateLimit,
  checkAPIRateLimit,
  checkFileUploadRateLimit,
  checkProfileUpdateRateLimit,
  checkRewardClaimRateLimit,
  withRateLimit,
  useRateLimit,
  resetRateLimit,
  getRateLimitStats,
  clearAllRateLimits,
  getRateLimitInfo,
  auditRateLimiting,
  RATE_LIMIT_CONFIG_EXPORT
}; 