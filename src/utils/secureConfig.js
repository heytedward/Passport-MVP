/**
 * Secure Configuration System for Monarch Passport MVP
 * 
 * This module provides secure configuration management with:
 * - Environment variable validation
 * - Secret rotation capabilities
 * - Secure key generation
 * - Configuration encryption
 */

import crypto from 'crypto';

// Configuration validation
const requiredConfig = {
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
  APP_SECRET: process.env.REACT_APP_SECRET_KEY,
  ENCRYPTION_KEY: process.env.REACT_APP_ENCRYPTION_KEY,
  JWT_SECRET: process.env.REACT_APP_JWT_SECRET
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

// Secure secret generation
function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Key derivation function for encryption
function deriveKey(password, salt, iterations = 100000) {
  return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
}

// Secure configuration encryption
function encryptConfig(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-gcm', key);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

// Secure configuration decryption
function decryptConfig(encryptedData, key) {
  const decipher = crypto.createDecipher('aes-256-gcm', key);
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

// Configuration manager class
class SecureConfigManager {
  constructor() {
    this.config = {};
    this.secrets = {};
    this.initialize();
  }
  
  initialize() {
    try {
      validateConfig();
      
      // Initialize configuration
      this.config = {
        ...requiredConfig,
        ...optionalConfig
      };
      
      // Initialize secrets
      this.secrets = {
        PAPILLON_SECRET: this.config.APP_SECRET || generateSecureSecret(),
        ENCRYPTION_KEY: this.config.ENCRYPTION_KEY || generateSecureSecret(32),
        JWT_SECRET: this.config.JWT_SECRET || generateSecureSecret(64)
      };
      
      // Validate secrets
      this.validateSecrets();
      
    } catch (error) {
      console.error('Configuration initialization failed:', error.message);
      throw new Error(`Security configuration error: ${error.message}`);
    }
  }
  
  validateSecrets() {
    const requiredSecrets = ['PAPILLON_SECRET', 'ENCRYPTION_KEY', 'JWT_SECRET'];
    
    requiredSecrets.forEach(secret => {
      if (!this.secrets[secret] || this.secrets[secret].length < 16) {
        throw new Error(`Invalid or weak secret: ${secret}`);
      }
    });
  }
  
  get(key) {
    if (key in this.config) {
      return this.config[key];
    }
    
    if (key in this.secrets) {
      return this.secrets[key];
    }
    
    throw new Error(`Configuration key not found: ${key}`);
  }
  
  getSecret(key) {
    if (!(key in this.secrets)) {
      throw new Error(`Secret key not found: ${key}`);
    }
    
    return this.secrets[key];
  }
  
  // Secure configuration update
  updateConfig(updates) {
    const allowedUpdates = ['DEBUG_MODE', 'BETA_FEATURES', 'RATE_LIMIT_SCANS', 'RATE_LIMIT_LOGINS'];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (allowedUpdates.includes(key)) {
        this.config[key] = value;
      } else {
        throw new Error(`Unauthorized configuration update: ${key}`);
      }
    });
  }
  
  // Secret rotation
  rotateSecret(secretKey) {
    if (!(secretKey in this.secrets)) {
      throw new Error(`Secret key not found: ${secretKey}`);
    }
    
    const newSecret = generateSecureSecret();
    const oldSecret = this.secrets[secretKey];
    
    // Store old secret for graceful transition
    this.secrets[`${secretKey}_OLD`] = oldSecret;
    
    // Update with new secret
    this.secrets[secretKey] = newSecret;
    
    // Clean up old secret after transition period
    setTimeout(() => {
      delete this.secrets[`${secretKey}_OLD`];
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    return newSecret;
  }
  
  // Get configuration for client-side use (sanitized)
  getClientConfig() {
    return {
      SUPABASE_URL: this.config.SUPABASE_URL,
      SUPABASE_ANON_KEY: this.config.SUPABASE_ANON_KEY,
      DEBUG_MODE: this.config.DEBUG_MODE,
      BETA_FEATURES: this.config.BETA_FEATURES,
      RATE_LIMIT_SCANS: this.config.RATE_LIMIT_SCANS,
      RATE_LIMIT_LOGINS: this.config.RATE_LIMIT_LOGINS,
      MAX_FILE_SIZE: this.config.MAX_FILE_SIZE,
      ALLOWED_FILE_TYPES: this.config.ALLOWED_FILE_TYPES
    };
  }
  
  // Security audit
  audit() {
    const audit = {
      timestamp: new Date().toISOString(),
      configKeys: Object.keys(this.config).length,
      secretKeys: Object.keys(this.secrets).length,
      weakSecrets: [],
      missingConfig: []
    };
    
    // Check for weak secrets
    Object.entries(this.secrets).forEach(([key, value]) => {
      if (value.length < 16) {
        audit.weakSecrets.push(key);
      }
    });
    
    // Check for missing configuration
    Object.entries(requiredConfig).forEach(([key, value]) => {
      if (!value) {
        audit.missingConfig.push(key);
      }
    });
    
    return audit;
  }
}

// Create singleton instance
const configManager = new SecureConfigManager();

// Export secure configuration
export const secureConfig = {
  // Configuration getters
  get: (key) => configManager.get(key),
  getSecret: (key) => configManager.getSecret(key),
  getClientConfig: () => configManager.getClientConfig(),
  
  // Security utilities
  generateSecret: generateSecureSecret,
  deriveKey: deriveKey,
  encrypt: encryptConfig,
  decrypt: decryptConfig,
  
  // Management functions
  update: (updates) => configManager.updateConfig(updates),
  rotateSecret: (key) => configManager.rotateSecret(key),
  audit: () => configManager.audit(),
  
  // Validation
  validate: validateConfig
};

// Export individual configuration values for convenience
export const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  DEBUG_MODE,
  BETA_FEATURES,
  RATE_LIMIT_SCANS,
  RATE_LIMIT_LOGINS,
  SESSION_TIMEOUT,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES
} = configManager.config;

// Export secrets (use with caution)
export const {
  PAPILLON_SECRET,
  ENCRYPTION_KEY,
  JWT_SECRET
} = configManager.secrets;

export default secureConfig; 