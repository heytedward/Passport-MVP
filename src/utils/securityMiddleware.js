/**
 * Comprehensive Security Middleware for Monarch Passport MVP
 * 
 * This module provides a unified security layer that integrates:
 * - Input validation and sanitization
 * - Role-based access control
 * - Rate limiting
 * - Encryption and data protection
 * - Security logging and monitoring
 * - Error handling and user feedback
 */

import { secureConfig } from './secureConfig.js';
import { 
  validateUserId, 
  validateEmail, 
  validateQRData, 
  validateFileUpload,
  validateUserProfile 
} from './inputValidation.js';
import { 
  hasPermission, 
  hasAnyPermission, 
  canAccessRoute,
  isAdmin,
  isSuperAdmin 
} from './secureRBAC.js';
import { 
  checkRateLimit, 
  checkQRScanRateLimit, 
  checkLoginRateLimit,
  checkFileUploadRateLimit 
} from './rateLimiter.js';
import { 
  generateSecureQRPayload, 
  verifySecureQRPayload,
  auditQRSecurity 
} from './secureCircularQR.js';

// Security event logging
const securityEvents = [];

/**
 * Log security event
 */
function logSecurityEvent(event) {
  const securityEvent = {
    timestamp: new Date().toISOString(),
    ...event,
    environment: process.env.NODE_ENV || 'development'
  };
  
  securityEvents.push(securityEvent);
  
  // Keep only last 1000 events
  if (securityEvents.length > 1000) {
    securityEvents.splice(0, securityEvents.length - 1000);
  }
  
  // Log to console in development
  if (secureConfig.get('DEBUG_MODE')) {
    console.log(`🔒 Security Event: ${event.type} - ${event.message}`);
  }
  
  return securityEvent;
}

/**
 * Security middleware for QR scanning
 */
export function secureQRScan(userId, qrData) {
  try {
    // Step 1: Input validation
    const qrValidation = validateQRData(qrData, userId);
    if (!qrValidation.success) {
      logSecurityEvent({
        type: 'QR_VALIDATION_FAILED',
        userId,
        error: qrValidation.error,
        message: 'QR data validation failed'
      });
      return {
        success: false,
        error: qrValidation.error,
        message: 'Invalid QR code data'
      };
    }
    
    // Step 2: Rate limiting
    const rateLimitResult = checkQRScanRateLimit(userId);
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'QR_RATE_LIMIT_EXCEEDED',
        userId,
        limit: rateLimitResult.limit,
        message: 'QR scan rate limit exceeded'
      });
      return {
        success: false,
        error: 'Rate limit exceeded',
        message: rateLimitResult.message,
        resetTime: rateLimitResult.resetTime
      };
    }
    
    // Step 3: Permission check
    if (!hasPermission(userId, 'user:qr:scan')) {
      logSecurityEvent({
        type: 'QR_PERMISSION_DENIED',
        userId,
        message: 'User lacks QR scan permission'
      });
      return {
        success: false,
        error: 'Permission denied',
        message: 'You do not have permission to scan QR codes'
      };
    }
    
    // Step 4: QR verification
    const verificationResult = verifySecureQRPayload(qrData);
    if (!verificationResult.success) {
      logSecurityEvent({
        type: 'QR_VERIFICATION_FAILED',
        userId,
        error: verificationResult.error,
        message: 'QR code verification failed'
      });
      return {
        success: false,
        error: verificationResult.error,
        message: 'Invalid or expired QR code'
      };
    }
    
    // Step 5: Success logging
    logSecurityEvent({
      type: 'QR_SCAN_SUCCESS',
      userId,
      rewardId: verificationResult.data.rewardId,
      message: 'QR code scanned successfully'
    });
    
    return {
      success: true,
      data: verificationResult.data,
      message: 'QR code scanned successfully'
    };
    
  } catch (error) {
    logSecurityEvent({
      type: 'QR_SCAN_ERROR',
      userId,
      error: error.message,
      message: 'Unexpected error during QR scan'
    });
    
    return {
      success: false,
      error: 'Internal error',
      message: 'An unexpected error occurred'
    };
  }
}

/**
 * Security middleware for file uploads
 */
export function secureFileUpload(userId, file) {
  try {
    // Step 1: Input validation
    const fileValidation = validateFileUpload(file, userId);
    if (!fileValidation.success) {
      logSecurityEvent({
        type: 'FILE_VALIDATION_FAILED',
        userId,
        error: fileValidation.error,
        fileName: file?.name,
        fileSize: file?.size,
        message: 'File upload validation failed'
      });
      return {
        success: false,
        error: fileValidation.error,
        message: 'Invalid file'
      };
    }
    
    // Step 2: Rate limiting
    const rateLimitResult = checkFileUploadRateLimit(userId);
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'FILE_RATE_LIMIT_EXCEEDED',
        userId,
        limit: rateLimitResult.limit,
        message: 'File upload rate limit exceeded'
      });
      return {
        success: false,
        error: 'Rate limit exceeded',
        message: rateLimitResult.message
      };
    }
    
    // Step 3: Permission check
    if (!hasPermission(userId, 'user:avatar:upload')) {
      logSecurityEvent({
        type: 'FILE_PERMISSION_DENIED',
        userId,
        message: 'User lacks file upload permission'
      });
      return {
        success: false,
        error: 'Permission denied',
        message: 'You do not have permission to upload files'
      };
    }
    
    // Step 4: Success logging
    logSecurityEvent({
      type: 'FILE_UPLOAD_SUCCESS',
      userId,
      fileName: fileValidation.data.fileName,
      fileSize: fileValidation.data.fileSize,
      fileType: fileValidation.data.fileType,
      message: 'File upload validated successfully'
    });
    
    return {
      success: true,
      data: fileValidation.data,
      message: 'File upload validated successfully'
    };
    
  } catch (error) {
    logSecurityEvent({
      type: 'FILE_UPLOAD_ERROR',
      userId,
      error: error.message,
      message: 'Unexpected error during file upload'
    });
    
    return {
      success: false,
      error: 'Internal error',
      message: 'An unexpected error occurred'
    };
  }
}

/**
 * Security middleware for user profile updates
 */
export function secureProfileUpdate(userId, profileData) {
  try {
    // Step 1: Input validation
    const profileValidation = validateUserProfile(profileData, userId);
    if (!profileValidation.success) {
      logSecurityEvent({
        type: 'PROFILE_VALIDATION_FAILED',
        userId,
        error: profileValidation.error,
        message: 'Profile update validation failed'
      });
      return {
        success: false,
        error: profileValidation.error,
        message: 'Invalid profile data'
      };
    }
    
    // Step 2: Permission check
    if (!hasPermission(userId, 'user:profile:edit')) {
      logSecurityEvent({
        type: 'PROFILE_PERMISSION_DENIED',
        userId,
        message: 'User lacks profile edit permission'
      });
      return {
        success: false,
        error: 'Permission denied',
        message: 'You do not have permission to edit your profile'
      };
    }
    
    // Step 3: Success logging
    logSecurityEvent({
      type: 'PROFILE_UPDATE_SUCCESS',
      userId,
      updatedFields: Object.keys(profileValidation.data),
      message: 'Profile update validated successfully'
    });
    
    return {
      success: true,
      data: profileValidation.data,
      message: 'Profile update validated successfully'
    };
    
  } catch (error) {
    logSecurityEvent({
      type: 'PROFILE_UPDATE_ERROR',
      userId,
      error: error.message,
      message: 'Unexpected error during profile update'
    });
    
    return {
      success: false,
      error: 'Internal error',
      message: 'An unexpected error occurred'
    };
  }
}

/**
 * Security middleware for login attempts
 */
export function secureLogin(identifier, credentials) {
  try {
    // Step 1: Input validation
    if (!identifier || !credentials) {
      logSecurityEvent({
        type: 'LOGIN_VALIDATION_FAILED',
        identifier,
        error: 'Missing credentials',
        message: 'Login validation failed'
      });
      return {
        success: false,
        error: 'Invalid credentials',
        message: 'Please provide valid credentials'
      };
    }
    
    // Step 2: Rate limiting
    const rateLimitResult = checkLoginRateLimit(identifier);
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'LOGIN_RATE_LIMIT_EXCEEDED',
        identifier,
        limit: rateLimitResult.limit,
        message: 'Login rate limit exceeded'
      });
      return {
        success: false,
        error: 'Rate limit exceeded',
        message: rateLimitResult.message
      };
    }
    
    // Step 3: Success logging (actual authentication would happen here)
    logSecurityEvent({
      type: 'LOGIN_ATTEMPT',
      identifier,
      message: 'Login attempt validated'
    });
    
    return {
      success: true,
      message: 'Login attempt validated'
    };
    
  } catch (error) {
    logSecurityEvent({
      type: 'LOGIN_ERROR',
      identifier,
      error: error.message,
      message: 'Unexpected error during login'
    });
    
    return {
      success: false,
      error: 'Internal error',
      message: 'An unexpected error occurred'
    };
  }
}

/**
 * Security middleware for route access
 */
export function secureRouteAccess(userId, route) {
  try {
    // Step 1: Route access check
    const hasAccess = canAccessRoute(userId, route);
    
    if (!hasAccess) {
      logSecurityEvent({
        type: 'ROUTE_ACCESS_DENIED',
        userId,
        route,
        message: 'Route access denied'
      });
      return {
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to access this page'
      };
    }
    
    // Step 2: Success logging
    logSecurityEvent({
      type: 'ROUTE_ACCESS_GRANTED',
      userId,
      route,
      message: 'Route access granted'
    });
    
    return {
      success: true,
      message: 'Route access granted'
    };
    
  } catch (error) {
    logSecurityEvent({
      type: 'ROUTE_ACCESS_ERROR',
      userId,
      route,
      error: error.message,
      message: 'Unexpected error during route access check'
    });
    
    return {
      success: false,
      error: 'Internal error',
      message: 'An unexpected error occurred'
    };
  }
}

/**
 * Security middleware for admin actions
 */
export function secureAdminAction(userId, action, data = {}) {
  try {
    // Step 1: Admin permission check
    if (!isAdmin(userId)) {
      logSecurityEvent({
        type: 'ADMIN_ACTION_DENIED',
        userId,
        action,
        message: 'Non-admin user attempted admin action'
      });
      return {
        success: false,
        error: 'Access denied',
        message: 'Admin privileges required'
      };
    }
    
    // Step 2: Specific permission check
    const permission = `admin:${action}`;
    if (!hasPermission(userId, permission)) {
      logSecurityEvent({
        type: 'ADMIN_PERMISSION_DENIED',
        userId,
        action,
        permission,
        message: 'Admin lacks specific permission'
      });
      return {
        success: false,
        error: 'Permission denied',
        message: `You do not have permission to perform: ${action}`
      };
    }
    
    // Step 3: Success logging
    logSecurityEvent({
      type: 'ADMIN_ACTION_SUCCESS',
      userId,
      action,
      data: Object.keys(data),
      message: 'Admin action validated successfully'
    });
    
    return {
      success: true,
      message: 'Admin action validated successfully'
    };
    
  } catch (error) {
    logSecurityEvent({
      type: 'ADMIN_ACTION_ERROR',
      userId,
      action,
      error: error.message,
      message: 'Unexpected error during admin action'
    });
    
    return {
      success: false,
      error: 'Internal error',
      message: 'An unexpected error occurred'
    };
  }
}

/**
 * Security middleware for super admin actions
 */
export function secureSuperAdminAction(userId, action, data = {}) {
  try {
    // Step 1: Super admin permission check
    if (!isSuperAdmin(userId)) {
      logSecurityEvent({
        type: 'SUPER_ADMIN_ACTION_DENIED',
        userId,
        action,
        message: 'Non-super-admin user attempted super admin action'
      });
      return {
        success: false,
        error: 'Access denied',
        message: 'Super admin privileges required'
      };
    }
    
    // Step 2: Success logging
    logSecurityEvent({
      type: 'SUPER_ADMIN_ACTION_SUCCESS',
      userId,
      action,
      data: Object.keys(data),
      message: 'Super admin action validated successfully'
    });
    
    return {
      success: true,
      message: 'Super admin action validated successfully'
    };
    
  } catch (error) {
    logSecurityEvent({
      type: 'SUPER_ADMIN_ACTION_ERROR',
      userId,
      action,
      error: error.message,
      message: 'Unexpected error during super admin action'
    });
    
    return {
      success: false,
      error: 'Internal error',
      message: 'An unexpected error occurred'
    };
  }
}

/**
 * Get security events
 */
export function getSecurityEvents(limit = 100) {
  return securityEvents.slice(-limit);
}

/**
 * Clear security events (for admin purposes)
 */
export function clearSecurityEvents() {
  securityEvents.length = 0;
  return { success: true, message: 'Security events cleared' };
}

/**
 * Security audit for the entire system
 */
export function auditSecuritySystem() {
  const audit = {
    timestamp: new Date().toISOString(),
    securityEvents: securityEvents.length,
    recentEvents: securityEvents.slice(-10),
    systemStatus: {
      configuration: secureConfig.audit(),
      qrSecurity: auditQRSecurity(),
      inputValidation: 'Input validation system active',
      rbac: 'RBAC system active',
      rateLimiting: 'Rate limiting system active'
    }
  };
  
  return audit;
}

/**
 * React hook for security middleware
 */
export function useSecurityMiddleware() {
  return {
    secureQRScan,
    secureFileUpload,
    secureProfileUpdate,
    secureLogin,
    secureRouteAccess,
    secureAdminAction,
    secureSuperAdminAction,
    getSecurityEvents,
    auditSecuritySystem
  };
}

export default {
  secureQRScan,
  secureFileUpload,
  secureProfileUpdate,
  secureLogin,
  secureRouteAccess,
  secureAdminAction,
  secureSuperAdminAction,
  getSecurityEvents,
  clearSecurityEvents,
  auditSecuritySystem,
  useSecurityMiddleware
}; 