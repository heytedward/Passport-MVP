/**
 * Secure Circular QR Code System for Monarch Passport MVP
 * 
 * This module provides secure QR code generation and verification using:
 * - AES-256-GCM encryption for payload security
 * - HMAC-SHA256 for integrity verification
 * - Secure key derivation functions
 * - Rate limiting and validation
 */

import { secureConfig, PAPILLON_SECRET, ENCRYPTION_KEY } from './secureConfig.js';
import crypto from 'crypto';

// QR code payload structure
const QR_PAYLOAD_STRUCTURE = {
  version: '1.0',
  timestamp: null,
  userId: null,
  rewardId: null,
  nonce: null,
  signature: null
};

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  authTagLength: 16,
  iterations: 100000
};

// Rate limiting for QR generation
const rateLimits = new Map();

/**
 * Generate a secure nonce for QR codes
 */
function generateSecureNonce() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Derive encryption key from master secret
 */
function deriveQRKey(masterKey = ENCRYPTION_KEY, salt = 'papillon-qr-salt') {
  return crypto.pbkdf2Sync(masterKey, salt, ENCRYPTION_CONFIG.iterations, ENCRYPTION_CONFIG.keyLength, 'sha256');
}

/**
 * Create HMAC signature for payload integrity
 */
function createSignature(payload, secret = PAPILLON_SECRET) {
  const data = JSON.stringify(payload);
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature for payload integrity
 */
function verifySignature(payload, signature, secret = PAPILLON_SECRET) {
  const expectedSignature = createSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Encrypt QR payload using AES-256-GCM
 */
function encryptPayload(payload) {
  try {
    const key = deriveQRKey();
    const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
    const cipher = crypto.createCipher(ENCRYPTION_CONFIG.algorithm, key);
    
    let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      version: QR_PAYLOAD_STRUCTURE.version
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypt QR payload using AES-256-GCM
 */
function decryptPayload(encryptedData) {
  try {
    const key = deriveQRKey();
    const decipher = crypto.createDecipher(ENCRYPTION_CONFIG.algorithm, key);
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Validate QR payload structure and data
 */
function validatePayload(payload) {
  const required = ['timestamp', 'userId', 'rewardId', 'nonce', 'signature'];
  const missing = required.filter(field => !payload[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required payload fields: ${missing.join(', ')}`);
  }
  
  // Validate timestamp (not older than 24 hours)
  const timestamp = new Date(payload.timestamp);
  const now = new Date();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  if (now - timestamp > maxAge) {
    throw new Error('QR code has expired');
  }
  
  // Validate user ID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.userId)) {
    throw new Error('Invalid user ID format');
  }
  
  // Validate reward ID format
  if (!/^[a-zA-Z0-9_-]+$/.test(payload.rewardId)) {
    throw new Error('Invalid reward ID format');
  }
  
  return true;
}

/**
 * Check rate limiting for QR generation
 */
function checkRateLimit(userId, action = 'generate') {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const window = 60 * 1000; // 1 minute window
  const limit = action === 'generate' ? 5 : 10; // 5 generates, 10 scans per minute
  
  if (!rateLimits.has(key)) {
    rateLimits.set(key, []);
  }
  
  const attempts = rateLimits.get(key);
  const recentAttempts = attempts.filter(timestamp => now - timestamp < window);
  
  if (recentAttempts.length >= limit) {
    throw new Error(`Rate limit exceeded for ${action}. Please wait before trying again.`);
  }
  
  recentAttempts.push(now);
  rateLimits.set(key, recentAttempts);
  
  // Clean up old entries
  setTimeout(() => {
    const currentAttempts = rateLimits.get(key) || [];
    const filtered = currentAttempts.filter(timestamp => now - timestamp < window);
    if (filtered.length === 0) {
      rateLimits.delete(key);
    } else {
      rateLimits.set(key, filtered);
    }
  }, window);
  
  return true;
}

/**
 * Generate secure QR code payload
 */
export function generateSecureQRPayload(userId, rewardId) {
  try {
    // Check rate limiting
    checkRateLimit(userId, 'generate');
    
    // Validate inputs
    if (!userId || !rewardId) {
      throw new Error('User ID and reward ID are required');
    }
    
    // Create payload
    const payload = {
      ...QR_PAYLOAD_STRUCTURE,
      timestamp: new Date().toISOString(),
      userId,
      rewardId,
      nonce: generateSecureNonce()
    };
    
    // Add signature
    payload.signature = createSignature(payload);
    
    // Validate payload
    validatePayload(payload);
    
    // Encrypt payload
    const encrypted = encryptPayload(payload);
    
    return {
      success: true,
      data: encrypted,
      message: 'QR payload generated successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to generate QR payload'
    };
  }
}

/**
 * Verify and decrypt QR code payload
 */
export function verifySecureQRPayload(encryptedData) {
  try {
    // Validate encrypted data structure
    if (!encryptedData.encrypted || !encryptedData.iv || !encryptedData.authTag) {
      throw new Error('Invalid encrypted data structure');
    }
    
    // Decrypt payload
    const payload = decryptPayload(encryptedData);
    
    // Validate payload
    validatePayload(payload);
    
    // Verify signature
    if (!verifySignature(payload, payload.signature)) {
      throw new Error('Invalid QR code signature');
    }
    
    // Check rate limiting for scanning
    checkRateLimit(payload.userId, 'scan');
    
    return {
      success: true,
      data: {
        userId: payload.userId,
        rewardId: payload.rewardId,
        timestamp: payload.timestamp,
        nonce: payload.nonce
      },
      message: 'QR payload verified successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to verify QR payload'
    };
  }
}

/**
 * Create QR code data URL for display
 */
export function createQRCodeDataURL(encryptedData) {
  try {
    const qrData = JSON.stringify(encryptedData);
    const dataUrl = `data:application/json;base64,${btoa(qrData)}`;
    
    return {
      success: true,
      dataUrl,
      message: 'QR code data URL created successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to create QR code data URL'
    };
  }
}

/**
 * Validate QR code from data URL
 */
export function validateQRCodeFromDataURL(dataUrl) {
  try {
    // Extract data from data URL
    const base64Data = dataUrl.replace('data:application/json;base64,', '');
    const jsonData = atob(base64Data);
    const encryptedData = JSON.parse(jsonData);
    
    // Verify the encrypted data
    return verifySecureQRPayload(encryptedData);
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Invalid QR code data URL'
    };
  }
}

/**
 * Security audit for QR system
 */
export function auditQRSecurity() {
  const audit = {
    timestamp: new Date().toISOString(),
    rateLimits: rateLimits.size,
    activeUsers: new Set([...rateLimits.keys()].map(key => key.split(':')[0])).size,
    encryptionAlgorithm: ENCRYPTION_CONFIG.algorithm,
    keyLength: ENCRYPTION_CONFIG.keyLength,
    signatureAlgorithm: 'HMAC-SHA256'
  };
  
  return audit;
}

/**
 * Clear rate limiting data (for testing/admin purposes)
 */
export function clearRateLimits() {
  rateLimits.clear();
  return { success: true, message: 'Rate limits cleared' };
}

// Export configuration for external use
export const QR_CONFIG = {
  ENCRYPTION_CONFIG,
  QR_PAYLOAD_STRUCTURE,
  RATE_LIMITS: {
    GENERATE: 5, // per minute
    SCAN: 10     // per minute
  }
};

export default {
  generateSecureQRPayload,
  verifySecureQRPayload,
  createQRCodeDataURL,
  validateQRCodeFromDataURL,
  auditQRSecurity,
  clearRateLimits,
  QR_CONFIG
}; 