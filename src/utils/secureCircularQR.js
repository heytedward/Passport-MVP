/**
 * Secure Circular QR Code System for Monarch Passport MVP
 * 
 * This module provides QR code generation and verification using:
 * - Secure payload validation
 * - Rate limiting and validation
 * - Browser-compatible security measures
 */

import { secureConfig } from './secureConfig.js';

// QR code payload structure
const QR_PAYLOAD_STRUCTURE = {
  version: '1.0',
  timestamp: null,
  userId: null,
  rewardId: null,
  nonce: null
};

// Rate limiting for QR generation
const rateLimits = new Map();

/**
 * Generate a secure nonce for QR codes
 */
function generateSecureNonce() {
  const array = new Uint8Array(16);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < 16; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create simple hash for payload validation
 */
function createSimpleHash(data) {
  let hash = 0;
  const str = JSON.stringify(data);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Validate QR payload structure
 */
function validatePayload(payload) {
  const required = ['version', 'timestamp', 'userId', 'rewardId', 'nonce'];
  
  for (const field of required) {
    if (!payload[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  if (payload.version !== QR_PAYLOAD_STRUCTURE.version) {
    throw new Error(`Unsupported payload version: ${payload.version}`);
  }
  
  // Check timestamp (within 24 hours)
  const timestamp = new Date(payload.timestamp);
  const now = new Date();
  const timeDiff = Math.abs(now - timestamp);
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  if (timeDiff > maxAge) {
    throw new Error('QR code has expired');
  }
  
  return true;
}

/**
 * Check rate limiting for QR operations
 */
function checkRateLimit(userId, action = 'generate') {
  const key = `${userId}-${action}`;
  const now = Date.now();
  const window = 60 * 1000; // 1 minute window
  
  if (!rateLimits.has(key)) {
    rateLimits.set(key, []);
  }
  
  const userActions = rateLimits.get(key);
  
  // Remove old entries
  const recentActions = userActions.filter(time => now - time < window);
  rateLimits.set(key, recentActions);
  
  // Check limits
  const maxActions = action === 'generate' ? 10 : 50; // 10 generates, 50 scans per minute
  
  if (recentActions.length >= maxActions) {
    throw new Error(`Rate limit exceeded for ${action}`);
  }
  
  // Add current action
  recentActions.push(now);
  rateLimits.set(key, recentActions);
  
  return true;
}

/**
 * Generate secure QR payload
 */
export function generateSecureQRPayload(userId, rewardId) {
  try {
    // Check rate limiting
    checkRateLimit(userId, 'generate');
    
    const payload = {
      version: QR_PAYLOAD_STRUCTURE.version,
      timestamp: new Date().toISOString(),
      userId: userId,
      rewardId: rewardId,
      nonce: generateSecureNonce()
    };
    
    // Validate payload
    validatePayload(payload);
    
    // Create simple validation hash
    const hash = createSimpleHash(payload);
    
    return {
      ...payload,
      hash: hash
    };
  } catch (error) {
    throw new Error(`QR payload generation failed: ${error.message}`);
  }
}

/**
 * Verify secure QR payload
 */
export function verifySecureQRPayload(payload) {
  try {
    // Check rate limiting
    checkRateLimit(payload.userId, 'scan');
    
    // Validate payload structure
    validatePayload(payload);
    
    // Verify hash
    const expectedHash = createSimpleHash({
      version: payload.version,
      timestamp: payload.timestamp,
      userId: payload.userId,
      rewardId: payload.rewardId,
      nonce: payload.nonce
    });
    
    if (payload.hash !== expectedHash) {
      throw new Error('Invalid QR code hash');
    }
    
    return {
      isValid: true,
      userId: payload.userId,
      rewardId: payload.rewardId,
      timestamp: payload.timestamp
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Create QR code data URL
 */
export function createQRCodeDataURL(payload) {
  try {
    const data = JSON.stringify(payload);
    return `data:application/json;base64,${btoa(data)}`;
  } catch (error) {
    throw new Error(`QR data URL creation failed: ${error.message}`);
  }
}

/**
 * Validate QR code from data URL
 */
export function validateQRCodeFromDataURL(dataUrl) {
  try {
    if (!dataUrl.startsWith('data:application/json;base64,')) {
      throw new Error('Invalid QR code format');
    }
    
    const base64Data = dataUrl.replace('data:application/json;base64,', '');
    const jsonData = atob(base64Data);
    const payload = JSON.parse(jsonData);
    
    return verifySecureQRPayload(payload);
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

/**
 * Audit QR security
 */
export function auditQRSecurity() {
  const audit = {
    timestamp: new Date().toISOString(),
    rateLimits: rateLimits.size,
    activeUsers: new Set([...rateLimits.keys()].map(key => key.split('-')[0])).size,
    version: QR_PAYLOAD_STRUCTURE.version
  };
  
  return audit;
}

/**
 * Clear rate limits (for testing)
 */
export function clearRateLimits() {
  rateLimits.clear();
} 