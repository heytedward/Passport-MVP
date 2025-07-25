/**
 * 🔒 Monarch Passport MVP - Secure Encryption Utilities
 * Replaces weak XOR encryption with industry-standard AES-256-GCM
 */

import crypto from 'crypto';

// Configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // AES block size
const TAG_LENGTH = 16; // GCM authentication tag length
const SALT_LENGTH = 32; // Salt for key derivation

/**
 * Derives a cryptographic key from a password using PBKDF2
 * @param {string} password - The password to derive from
 * @param {Buffer} salt - Random salt for key derivation
 * @param {number} iterations - Number of PBKDF2 iterations (default: 100000)
 * @returns {Buffer} Derived key
 */
export function deriveKey(password, salt, iterations = 100000) {
  return crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
}

/**
 * Generates a cryptographically secure random string
 * @param {number} length - Length of the random string
 * @returns {string} Random string
 */
export function generateSecureRandom(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generates a secure nonce for QR codes
 * @returns {string} Secure random nonce
 */
export function generateSecureNonce() {
  return crypto.randomBytes(16).toString('base64url');
}

/**
 * Encrypts data using AES-256-GCM
 * @param {string} plaintext - Data to encrypt
 * @param {string} password - Password for encryption
 * @returns {string} Encrypted data (base64 encoded)
 */
export function encryptData(plaintext, password) {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from password
    const key = deriveKey(password, salt);
    
    // Create cipher
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(salt); // Additional authenticated data
    
    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine salt, iv, tag, and encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'base64')
    ]);
    
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data using AES-256-GCM
 * @param {string} encryptedData - Encrypted data (base64 encoded)
 * @param {string} password - Password for decryption
 * @returns {string} Decrypted plaintext
 */
export function decryptData(encryptedData, password) {
  try {
    // Decode the combined data
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Derive key from password
    const key = deriveKey(password, salt);
    
    // Create decipher
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAAD(salt);
    decipher.setAuthTag(tag);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data - data may be corrupted or password incorrect');
  }
}

/**
 * Creates a secure hash of data using SHA-256
 * @param {string} data - Data to hash
 * @param {string} salt - Optional salt
 * @returns {string} Hash (hex encoded)
 */
export function secureHash(data, salt = '') {
  const hash = crypto.createHash('sha256');
  hash.update(data + salt);
  return hash.digest('hex');
}

/**
 * Verifies a hash against data
 * @param {string} data - Original data
 * @param {string} hash - Hash to verify against
 * @param {string} salt - Optional salt used in hashing
 * @returns {boolean} Whether hash is valid
 */
export function verifyHash(data, hash, salt = '') {
  const computed = secureHash(data, salt);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

/**
 * Generates a secure QR code payload with encryption and timestamps
 * @param {string} productCode - Product identifier
 * @param {number} validityHours - How long the QR code is valid (default: 24 hours)
 * @returns {object} Secure QR code data
 */
export function generateSecureQRPayload(productCode, validityHours = 24) {
  try {
    const now = Date.now();
    const expiryTime = now + (validityHours * 60 * 60 * 1000);
    
    const payload = {
      productCode: productCode.trim(),
      issuedAt: now,
      expiresAt: expiryTime,
      nonce: generateSecureNonce(),
      version: '2.0' // Version for future compatibility
    };
    
    // Get encryption secret from environment
    const secret = process.env.PAPILLON_SECRET;
    if (!secret) {
      throw new Error('PAPILLON_SECRET environment variable not set');
    }
    
    // Encrypt the payload
    const encrypted = encryptData(JSON.stringify(payload), secret);
    
    return {
      encrypted,
      hash: secureHash(encrypted),
      version: '2.0'
    };
  } catch (error) {
    console.error('Failed to generate secure QR payload:', error);
    throw error;
  }
}

/**
 * Validates and decrypts a secure QR code payload
 * @param {string} encryptedPayload - Encrypted QR payload
 * @param {string} expectedHash - Expected hash for integrity verification
 * @returns {object} Validated payload data
 */
export function validateSecureQRPayload(encryptedPayload, expectedHash) {
  try {
    // Verify payload integrity
    const computedHash = secureHash(encryptedPayload);
    if (!verifyHash(encryptedPayload, expectedHash)) {
      throw new Error('QR code integrity check failed - payload may be tampered');
    }
    
    // Get decryption secret from environment
    const secret = process.env.PAPILLON_SECRET;
    if (!secret) {
      throw new Error('PAPILLON_SECRET environment variable not set');
    }
    
    // Decrypt the payload
    const decryptedJson = decryptData(encryptedPayload, secret);
    const payload = JSON.parse(decryptedJson);
    
    // Validate payload structure
    if (!payload.productCode || !payload.issuedAt || !payload.expiresAt || !payload.nonce) {
      throw new Error('Invalid QR code payload structure');
    }
    
    // Check expiry
    const now = Date.now();
    if (now > payload.expiresAt) {
      throw new Error('QR code has expired');
    }
    
    // Check if issued in the future (clock skew protection)
    if (payload.issuedAt > now + 300000) { // 5 minutes tolerance
      throw new Error('QR code issued time is in the future');
    }
    
    return {
      productCode: payload.productCode,
      issuedAt: new Date(payload.issuedAt),
      expiresAt: new Date(payload.expiresAt),
      nonce: payload.nonce,
      version: payload.version,
      isValid: true
    };
  } catch (error) {
    console.error('QR code validation failed:', error);
    return {
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Rate limiting helper - tracks and validates request frequencies
 */
export class RateLimiter {
  constructor(windowMs = 3600000, maxRequests = 100) { // 1 hour, 100 requests
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }
  
  /**
   * Checks if a request is allowed under rate limiting rules
   * @param {string} identifier - Unique identifier (user ID, IP, etc.)
   * @returns {object} Rate limit status
   */
  checkLimit(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests for this identifier
    let requests = this.requests.get(identifier) || [];
    
    // Remove expired requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= this.maxRequests) {
      return {
        allowed: false,
        requests: requests.length,
        maxRequests: this.maxRequests,
        resetTime: new Date(requests[0] + this.windowMs)
      };
    }
    
    // Add current request
    requests.push(now);
    this.requests.set(identifier, requests);
    
    return {
      allowed: true,
      requests: requests.length,
      maxRequests: this.maxRequests,
      remaining: this.maxRequests - requests.length
    };
  }
  
  /**
   * Cleans up expired entries to prevent memory leaks
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// Create default rate limiter instances
export const qrScanLimiter = new RateLimiter(3600000, 100); // 100 scans per hour
export const authLimiter = new RateLimiter(900000, 5); // 5 auth attempts per 15 minutes

// Cleanup rate limiters every 10 minutes
setInterval(() => {
  qrScanLimiter.cleanup();
  authLimiter.cleanup();
}, 600000);

/**
 * Environment validation - ensures all required secrets are present
 */
export function validateEnvironment() {
  const required = ['PAPILLON_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate secret strength
  const secret = process.env.PAPILLON_SECRET;
  if (secret.length < 32) {
    console.warn('⚠️ PAPILLON_SECRET should be at least 32 characters for security');
  }
  
  return true;
}

// Export legacy function names for backward compatibility (deprecated)
export const xorEncrypt = (text, key) => {
  console.warn('⚠️ xorEncrypt is deprecated and insecure. Use encryptData() instead.');
  return encryptData(text, key);
};

export const xorDecrypt = (encrypted, key) => {
  console.warn('⚠️ xorDecrypt is deprecated and insecure. Use decryptData() instead.');
  return decryptData(encrypted, key);
};

// Validate environment on module load
try {
  validateEnvironment();
} catch (error) {
  console.error('🚨 Security configuration error:', error.message);
}