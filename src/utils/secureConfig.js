/**
 * Secure Configuration System for Monarch Passport MVP
 * 
 * This module provides secure configuration management with:
 * - Environment variable validation
 * - Configuration validation
 * - Client-side configuration management
 */

// Configuration validation
const requiredConfig = {
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY
};

// Optional configuration with defaults
const optionalConfig = {
  DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',
  BETA_FEATURES: process.env.REACT_APP_BETA_FEATURES_ENABLED === 'true',
  RATE_LIMIT_SCANS: parseInt(process.env.REACT_APP_RATE_LIMIT_SCANS) || 10,
  RATE_LIMIT_LOGINS: parseInt(process.env.REACT_APP_RATE_LIMIT_LOGINS) || 5,
  SESSION_TIMEOUT: parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 3600,
  MAX_FILE_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 5242880, // 5MB
  ALLOWED_FILE_TYPES: process.env.REACT_APP_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp']
};

// Validate required configuration
function validateConfig() {
  const missing = [];
  
  Object.entries(requiredConfig).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    }
  });
  
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
  
  return true;
}

// Browser-compatible secure secret generation
function generateSecureSecret(length = 32) {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Configuration manager class
class SecureConfigManager {
  constructor() {
    this.config = {};
    this.initialize();
  }
  
  initialize() {
    try {
      validateConfig();
      
      // Merge required and optional config
      this.config = {
        ...requiredConfig,
        ...optionalConfig
      };
      
      console.log('🔒 Secure configuration initialized successfully');
    } catch (error) {
      console.error('❌ Configuration validation failed:', error.message);
      throw error;
    }
  }
  
  get(key) {
    return this.config[key];
  }
  
  getClientConfig() {
    // Return only client-safe configuration
    return {
      SUPABASE_URL: this.config.SUPABASE_URL,
      SUPABASE_ANON_KEY: this.config.SUPABASE_ANON_KEY,
      DEBUG_MODE: this.config.DEBUG_MODE,
      BETA_FEATURES: this.config.BETA_FEATURES,
      RATE_LIMIT_SCANS: this.config.RATE_LIMIT_SCANS,
      RATE_LIMIT_LOGINS: this.config.RATE_LIMIT_LOGINS,
      SESSION_TIMEOUT: this.config.SESSION_TIMEOUT,
      MAX_FILE_SIZE: this.config.MAX_FILE_SIZE,
      ALLOWED_FILE_TYPES: this.config.ALLOWED_FILE_TYPES
    };
  }
  
  audit() {
    const audit = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      requiredVars: Object.keys(requiredConfig).length,
      optionalVars: Object.keys(optionalConfig).length,
      missingVars: [],
      warnings: []
    };
    
    // Check for missing required variables
    Object.entries(requiredConfig).forEach(([key, value]) => {
      if (!value) {
        audit.missingVars.push(key);
      }
    });
    
    // Check for development variables in production
    if (process.env.NODE_ENV === 'production') {
      if (this.config.DEBUG_MODE) {
        audit.warnings.push('DEBUG_MODE should not be enabled in production');
      }
    }
    
    return audit;
  }
}

// Export singleton instance
export const secureConfig = new SecureConfigManager();

// Export utility functions
export { validateConfig, generateSecureSecret }; 