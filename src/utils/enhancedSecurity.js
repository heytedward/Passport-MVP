/**
 * Enhanced Security System for Monarch Passport MVP
 * 
 * This module provides comprehensive security enhancements:
 * - Content Security Policy management
 * - Enhanced QR code security
 * - Advanced rate limiting
 * - Security monitoring and alerts
 * - Threat detection and prevention
 * - Secure session management
 */

import { secureConfig } from './secureConfig.js';
import { 
  secureQRScan, 
  secureFileUpload, 
  secureProfileUpdate,
  secureLogin,
  secureRouteAccess,
  secureAdminAction,
  secureSuperAdminAction,
  getSecurityEvents,
  auditSecuritySystem 
} from './securityMiddleware.js';
import { 
  validateQRData, 
  validateFileUpload as validateFile,
  validateUserProfile,
  auditInputValidation 
} from './inputValidation.js';
import { 
  hasPermission, 
  isAdmin, 
  isSuperAdmin,
  auditRBAC 
} from './secureRBAC.js';

// Security monitoring and alerting
class SecurityMonitor {
  constructor() {
    this.alerts = [];
    this.threatLevel = 'LOW';
    this.suspiciousActivities = new Map();
    this.blockedIPs = new Set();
    this.securityMetrics = {
      totalScans: 0,
      failedScans: 0,
      suspiciousActivities: 0,
      blockedAttempts: 0,
      securityAlerts: 0
    };
  }

  // Track suspicious activity
  trackSuspiciousActivity(userId, activity, details = {}) {
    const key = `${userId}:${activity}`;
    const now = Date.now();
    const window = 5 * 60 * 1000; // 5 minutes

    if (!this.suspiciousActivities.has(key)) {
      this.suspiciousActivities.set(key, []);
    }

    const activities = this.suspiciousActivities.get(key);
    const recentActivities = activities.filter(timestamp => now - timestamp < window);
    recentActivities.push(now);
    this.suspiciousActivities.set(key, recentActivities);

    // Check if activity threshold exceeded
    if (recentActivities.length >= 10) {
      this.createAlert('SUSPICIOUS_ACTIVITY', {
        userId,
        activity,
        count: recentActivities.length,
        details
      });
      this.securityMetrics.suspiciousActivities++;
    }
  }

  // Create security alert
  createAlert(type, data) {
    const alert = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      data,
      severity: this.getAlertSeverity(type),
      acknowledged: false
    };

    this.alerts.push(alert);
    this.securityMetrics.securityAlerts++;

    // Update threat level
    this.updateThreatLevel();

    // Log alert
    if (secureConfig.get('DEBUG_MODE')) {
      console.warn(`🚨 Security Alert: ${type}`, data);
    }

    return alert;
  }

  // Get alert severity
  getAlertSeverity(type) {
    const severityMap = {
      'SUSPICIOUS_ACTIVITY': 'MEDIUM',
      'RATE_LIMIT_EXCEEDED': 'HIGH',
      'UNAUTHORIZED_ACCESS': 'HIGH',
      'MALICIOUS_INPUT': 'HIGH',
      'SYSTEM_ERROR': 'LOW',
      'PERMISSION_VIOLATION': 'MEDIUM'
    };
    return severityMap[type] || 'LOW';
  }

  // Update threat level
  updateThreatLevel() {
    const highSeverityAlerts = this.alerts.filter(
      alert => alert.severity === 'HIGH' && !alert.acknowledged
    ).length;

    const mediumSeverityAlerts = this.alerts.filter(
      alert => alert.severity === 'MEDIUM' && !alert.acknowledged
    ).length;

    if (highSeverityAlerts >= 3) {
      this.threatLevel = 'CRITICAL';
    } else if (highSeverityAlerts >= 1 || mediumSeverityAlerts >= 5) {
      this.threatLevel = 'HIGH';
    } else if (mediumSeverityAlerts >= 2) {
      this.threatLevel = 'MEDIUM';
    } else {
      this.threatLevel = 'LOW';
    }
  }

  // Get security status
  getSecurityStatus() {
    return {
      threatLevel: this.threatLevel,
      alerts: this.alerts.filter(alert => !alert.acknowledged),
      metrics: this.securityMetrics,
      suspiciousActivities: this.suspiciousActivities.size,
      blockedIPs: this.blockedIPs.size
    };
  }

  // Acknowledge alert
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.updateThreatLevel();
    }
  }

  // Clear old alerts
  clearOldAlerts() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => 
      new Date(alert.timestamp).getTime() > oneDayAgo
    );
  }
}

// Content Security Policy management
class ContentSecurityPolicy {
  constructor() {
    this.policies = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Required for React
        "'unsafe-eval'",   // Required for React development
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for styled-components
        'https://fonts.googleapis.com'
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com',
        'data:'
      ],
      'img-src': [
        "'self'",
        'data:',
        'https:',
        'blob:'
      ],
      'connect-src': [
        "'self'",
        'https://*.supabase.co',
        'https://*.vercel.app',
        'wss://*.supabase.co'
      ],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': []
    };
  }

  // Get CSP header value
  getCSPHeader() {
    return Object.entries(this.policies)
      .map(([directive, sources]) => {
        if (sources.length === 0) {
          return directive;
        }
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');
  }

  // Add policy for development
  addDevelopmentPolicy() {
    this.policies['script-src'].push('http://localhost:*');
    this.policies['connect-src'].push('http://localhost:*');
  }

  // Get strict policy for production
  getStrictPolicy() {
    const strictPolicies = { ...this.policies };
    
    // Remove unsafe directives in production
    strictPolicies['script-src'] = strictPolicies['script-src'].filter(
      src => !src.includes('unsafe')
    );
    strictPolicies['style-src'] = strictPolicies['style-src'].filter(
      src => !src.includes('unsafe')
    );

    return Object.entries(strictPolicies)
      .map(([directive, sources]) => {
        if (sources.length === 0) {
          return directive;
        }
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');
  }
}

// Enhanced QR code security
class EnhancedQRSecurity {
  constructor() {
    this.scanHistory = new Map();
    this.blockedCodes = new Set();
    this.verificationCache = new Map();
  }

  // Enhanced QR scan with additional security checks
  async enhancedQRScan(userId, qrData, context = {}) {
    try {
      // Step 1: Basic security middleware
      const securityResult = secureQRScan(userId, qrData);
      if (!securityResult.success) {
        return securityResult;
      }

      // Step 2: Check scan history for duplicates
      const scanKey = `${userId}:${qrData}`;
      if (this.scanHistory.has(scanKey)) {
        const lastScan = this.scanHistory.get(scanKey);
        const timeSinceLastScan = Date.now() - lastScan.timestamp;
        
        if (timeSinceLastScan < 60000) { // 1 minute
          return {
            success: false,
            error: 'Duplicate scan',
            message: 'This QR code was recently scanned. Please wait before scanning again.'
          };
        }
      }

      // Step 3: Check if code is blocked
      if (this.blockedCodes.has(qrData)) {
        return {
          success: false,
          error: 'Blocked code',
          message: 'This QR code has been blocked due to suspicious activity.'
        };
      }

      // Step 4: Enhanced validation
      const validationResult = validateQRData(qrData, userId);
      if (!validationResult.success) {
        return validationResult;
      }

      // Step 5: Rate limiting check
      const userScans = this.scanHistory.get(userId) || [];
      const recentScans = userScans.filter(
        scan => Date.now() - scan.timestamp < 300000 // 5 minutes
      );

      if (recentScans.length >= 20) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many scans in a short time. Please wait before scanning again.'
        };
      }

      // Step 6: Record successful scan
      this.scanHistory.set(scanKey, {
        timestamp: Date.now(),
        userId,
        context
      });

      // Step 7: Cache verification result
      this.verificationCache.set(qrData, {
        timestamp: Date.now(),
        result: securityResult.data
      });

      return {
        success: true,
        data: securityResult.data,
        message: 'QR code scanned successfully with enhanced security'
      };

    } catch (error) {
      return {
        success: false,
        error: 'Enhanced security error',
        message: 'An error occurred during enhanced security checks'
      };
    }
  }

  // Block suspicious QR code
  blockQRCode(qrData, reason) {
    this.blockedCodes.add(qrData);
    
    // Log blocking action
    if (secureConfig.get('DEBUG_MODE')) {
      console.warn(`🚫 QR Code blocked: ${qrData.substring(0, 20)}... - ${reason}`);
    }
  }

  // Get scan statistics
  getScanStatistics() {
    return {
      totalScans: this.scanHistory.size,
      blockedCodes: this.blockedCodes.size,
      cachedVerifications: this.verificationCache.size,
      uniqueUsers: new Set([...this.scanHistory.values()].map(scan => scan.userId)).size
    };
  }

  // Clear old scan history
  clearOldScans() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    for (const [key, scan] of this.scanHistory.entries()) {
      if (scan.timestamp < oneHourAgo) {
        this.scanHistory.delete(key);
      }
    }

    // Clear old cache entries
    for (const [key, cache] of this.verificationCache.entries()) {
      if (cache.timestamp < oneHourAgo) {
        this.verificationCache.delete(key);
      }
    }
  }
}

// Enhanced session management
class SecureSessionManager {
  constructor() {
    this.activeSessions = new Map();
    this.sessionTimeout = secureConfig.get('SESSION_TIMEOUT') || 3600; // 1 hour
  }

  // Create secure session
  createSession(userId, sessionData = {}) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      userId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      data: sessionData,
      ip: sessionData.ip || 'unknown',
      userAgent: sessionData.userAgent || 'unknown'
    };

    this.activeSessions.set(sessionId, session);
    return sessionId;
  }

  // Validate session
  validateSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivity;
    const timeSinceCreation = now - session.createdAt;

    // Check session timeout
    if (timeSinceLastActivity > (this.sessionTimeout * 1000)) {
      this.activeSessions.delete(sessionId);
      return { valid: false, reason: 'Session expired' };
    }

    // Check maximum session duration (24 hours)
    if (timeSinceCreation > (24 * 60 * 60 * 1000)) {
      this.activeSessions.delete(sessionId);
      return { valid: false, reason: 'Session too old' };
    }

    // Update last activity
    session.lastActivity = now;
    return { valid: true, session };
  }

  // Invalidate session
  invalidateSession(sessionId) {
    this.activeSessions.delete(sessionId);
  }

  // Invalidate all sessions for user
  invalidateUserSessions(userId) {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(sessionId);
      }
    }
  }

  // Generate secure session ID
  generateSessionId() {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < 32; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Get session statistics
  getSessionStatistics() {
    return {
      activeSessions: this.activeSessions.size,
      uniqueUsers: new Set([...this.activeSessions.values()].map(s => s.userId)).size,
      averageSessionAge: this.getAverageSessionAge()
    };
  }

  // Get average session age
  getAverageSessionAge() {
    if (this.activeSessions.size === 0) return 0;
    
    const now = Date.now();
    const totalAge = [...this.activeSessions.values()].reduce(
      (sum, session) => sum + (now - session.createdAt), 0
    );
    
    return totalAge / this.activeSessions.size;
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    const timeoutMs = this.sessionTimeout * 1000;
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity > timeoutMs) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}

// Initialize security systems
const securityMonitor = new SecurityMonitor();
const contentSecurityPolicy = new ContentSecurityPolicy();
const enhancedQRSecurity = new EnhancedQRSecurity();
const secureSessionManager = new SecureSessionManager();

// Add development policies if in development
if (process.env.NODE_ENV === 'development') {
  contentSecurityPolicy.addDevelopmentPolicy();
}

// Export enhanced security functions
export const enhancedSecurity = {
  // QR Code Security
  enhancedQRScan: (userId, qrData, context) => enhancedQRSecurity.enhancedQRScan(userId, qrData, context),
  blockQRCode: (qrData, reason) => enhancedQRSecurity.blockQRCode(qrData, reason),
  getQRStatistics: () => enhancedQRSecurity.getScanStatistics(),

  // Session Management
  createSession: (userId, sessionData) => secureSessionManager.createSession(userId, sessionData),
  validateSession: (sessionId) => secureSessionManager.validateSession(sessionId),
  invalidateSession: (sessionId) => secureSessionManager.invalidateSession(sessionId),
  invalidateUserSessions: (userId) => secureSessionManager.invalidateUserSessions(userId),

  // Security Monitoring
  trackSuspiciousActivity: (userId, activity, details) => securityMonitor.trackSuspiciousActivity(userId, activity, details),
  createAlert: (type, data) => securityMonitor.createAlert(type, data),
  getSecurityStatus: () => securityMonitor.getSecurityStatus(),
  acknowledgeAlert: (alertId) => securityMonitor.acknowledgeAlert(alertId),

  // Content Security Policy
  getCSPHeader: () => contentSecurityPolicy.getCSPHeader(),
  getStrictCSPHeader: () => contentSecurityPolicy.getStrictPolicy(),

  // Enhanced validation
  enhancedValidateQR: (qrData, userId) => validateQRData(qrData, userId),
  enhancedValidateFile: (file, userId) => validateFile(file, userId),
  enhancedValidateProfile: (profileData, userId) => validateUserProfile(profileData, userId),

  // Security middleware integration
  secureQRScan,
  secureFileUpload,
  secureProfileUpdate,
  secureLogin,
  secureRouteAccess,
  secureAdminAction,
  secureSuperAdminAction,

  // Permission checks
  hasPermission,
  isAdmin,
  isSuperAdmin,

  // Auditing
  auditSecurity: () => ({
    securitySystem: auditSecuritySystem(),
    inputValidation: auditInputValidation(),
    rbac: auditRBAC(),
    qrStatistics: enhancedQRSecurity.getScanStatistics(),
    sessionStatistics: secureSessionManager.getSessionStatistics(),
    securityStatus: securityMonitor.getSecurityStatus()
  }),

  // Cleanup functions
  cleanup: () => {
    securityMonitor.clearOldAlerts();
    enhancedQRSecurity.clearOldScans();
    secureSessionManager.cleanupExpiredSessions();
  }
};

// React hook for enhanced security
export const useEnhancedSecurity = () => {
  return {
    ...enhancedSecurity,
    
    // Hook-specific functions
    trackActivity: (activity, details) => {
      // Get user ID from auth context
      const userId = 'current-user-id'; // This would come from auth context
      securityMonitor.trackSuspiciousActivity(userId, activity, details);
    },

    // Enhanced QR scanning with automatic tracking
    scanQR: async (qrData, context) => {
      const userId = 'current-user-id'; // This would come from auth context
      const result = await enhancedQRSecurity.enhancedQRScan(userId, qrData, context);
      
      if (!result.success) {
        securityMonitor.trackSuspiciousActivity(userId, 'failed_qr_scan', {
          error: result.error,
          qrData: qrData.substring(0, 20) + '...'
        });
      }
      
      return result;
    }
  };
};

export default enhancedSecurity; 