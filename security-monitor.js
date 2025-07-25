#!/usr/bin/env node

/**
 * 🔒 Monarch Passport MVP - Security Monitor
 * Real-time monitoring for unusual activity and security events
 */

const fs = require('fs');
const crypto = require('crypto');
const { EventEmitter } = require('events');

class SecurityMonitor extends EventEmitter {
  constructor() {
    super();
    this.alertThresholds = {
      failedLogins: { count: 5, window: 300000 }, // 5 failures in 5 minutes
      rapidScanning: { count: 100, window: 3600000 }, // 100 scans in 1 hour
      adminActivity: { count: 10, window: 3600000 }, // 10 admin actions in 1 hour
      suspiciousIPs: { count: 20, window: 3600000 }, // 20 requests from same IP in 1 hour
      largeUploads: { size: 10485760, count: 5 }, // 5 uploads over 10MB
      apiErrors: { count: 50, window: 300000 } // 50 errors in 5 minutes
    };
    
    this.eventStore = new Map();
    this.alertHistory = [];
    this.monitoringStartTime = Date.now();
    this.logFile = 'security-monitor.log';
    
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    console.log('🔒 Security Monitor initialized');
    console.log('📊 Monitoring thresholds:', this.alertThresholds);
    
    // Set up periodic cleanup
    setInterval(() => this.cleanupOldEvents(), 300000); // Every 5 minutes
    
    // Set up daily summary
    setInterval(() => this.generateDailySummary(), 86400000); // Every 24 hours
  }

  // Log security event
  logSecurityEvent(eventType, data) {
    const event = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: eventType,
      data: {
        ...data,
        userAgent: data.userAgent || 'Unknown',
        ipAddress: data.ipAddress || 'Unknown'
      }
    };

    // Store event
    if (!this.eventStore.has(eventType)) {
      this.eventStore.set(eventType, []);
    }
    this.eventStore.get(eventType).push(event);

    // Log to file
    this.writeToLog(event);

    // Check for alerts
    this.checkAlerts(eventType, event);

    this.emit('securityEvent', event);
    return event.id;
  }

  // Write event to log file
  writeToLog(event) {
    const logEntry = JSON.stringify({
      timestamp: new Date(event.timestamp).toISOString(),
      type: event.type,
      data: event.data
    }) + '\n';

    fs.appendFileSync(this.logFile, logEntry);
  }

  // Check for security alerts
  checkAlerts(eventType, event) {
    const now = Date.now();
    
    switch (eventType) {
      case 'failed_login':
        this.checkFailedLogins(event, now);
        break;
      case 'qr_scan':
        this.checkRapidScanning(event, now);
        break;
      case 'admin_action':
        this.checkAdminActivity(event, now);
        break;
      case 'api_request':
        this.checkSuspiciousIPs(event, now);
        break;
      case 'file_upload':
        this.checkLargeUploads(event, now);
        break;
      case 'api_error':
        this.checkApiErrors(event, now);
        break;
    }
  }

  // Check for failed login attempts
  checkFailedLogins(event, now) {
    const threshold = this.alertThresholds.failedLogins;
    const recentEvents = this.getRecentEvents('failed_login', now - threshold.window);
    
    if (recentEvents.length >= threshold.count) {
      this.triggerAlert('FAILED_LOGIN_THRESHOLD', {
        count: recentEvents.length,
        timeWindow: threshold.window / 1000,
        affectedUser: event.data.userId,
        ipAddress: event.data.ipAddress
      });
    }
  }

  // Check for rapid QR scanning
  checkRapidScanning(event, now) {
    const threshold = this.alertThresholds.rapidScanning;
    const userScans = this.getRecentEvents('qr_scan', now - threshold.window)
      .filter(e => e.data.userId === event.data.userId);
    
    if (userScans.length >= threshold.count) {
      this.triggerAlert('RAPID_SCANNING', {
        count: userScans.length,
        timeWindow: threshold.window / 1000,
        userId: event.data.userId,
        scannedItems: userScans.map(e => e.data.rewardId)
      });
    }
  }

  // Check for suspicious admin activity
  checkAdminActivity(event, now) {
    const threshold = this.alertThresholds.adminActivity;
    const recentAdminActions = this.getRecentEvents('admin_action', now - threshold.window);
    
    if (recentAdminActions.length >= threshold.count) {
      this.triggerAlert('EXCESSIVE_ADMIN_ACTIVITY', {
        count: recentAdminActions.length,
        timeWindow: threshold.window / 1000,
        adminUser: event.data.userId,
        actions: recentAdminActions.map(e => e.data.action)
      });
    }
  }

  // Check for suspicious IP activity
  checkSuspiciousIPs(event, now) {
    const threshold = this.alertThresholds.suspiciousIPs;
    const ipRequests = this.getRecentEvents('api_request', now - threshold.window)
      .filter(e => e.data.ipAddress === event.data.ipAddress);
    
    if (ipRequests.length >= threshold.count) {
      this.triggerAlert('SUSPICIOUS_IP_ACTIVITY', {
        count: ipRequests.length,
        timeWindow: threshold.window / 1000,
        ipAddress: event.data.ipAddress,
        endpoints: [...new Set(ipRequests.map(e => e.data.endpoint))]
      });
    }
  }

  // Check for large file uploads
  checkLargeUploads(event, now) {
    const threshold = this.alertThresholds.largeUploads;
    
    if (event.data.fileSize > threshold.size) {
      const recentLargeUploads = this.getRecentEvents('file_upload', now - 3600000) // 1 hour
        .filter(e => e.data.fileSize > threshold.size);
      
      if (recentLargeUploads.length >= threshold.count) {
        this.triggerAlert('LARGE_FILE_UPLOADS', {
          count: recentLargeUploads.length,
          totalSize: recentLargeUploads.reduce((sum, e) => sum + e.data.fileSize, 0),
          userId: event.data.userId
        });
      }
    }
  }

  // Check for API errors
  checkApiErrors(event, now) {
    const threshold = this.alertThresholds.apiErrors;
    const recentErrors = this.getRecentEvents('api_error', now - threshold.window);
    
    if (recentErrors.length >= threshold.count) {
      this.triggerAlert('HIGH_ERROR_RATE', {
        count: recentErrors.length,
        timeWindow: threshold.window / 1000,
        errorTypes: [...new Set(recentErrors.map(e => e.data.errorType))],
        endpoints: [...new Set(recentErrors.map(e => e.data.endpoint))]
      });
    }
  }

  // Get recent events of a specific type
  getRecentEvents(eventType, since) {
    const events = this.eventStore.get(eventType) || [];
    return events.filter(event => event.timestamp >= since);
  }

  // Trigger security alert
  triggerAlert(alertType, details) {
    const alert = {
      id: crypto.randomUUID(),
      type: alertType,
      timestamp: Date.now(),
      severity: this.getAlertSeverity(alertType),
      details,
      resolved: false
    };

    this.alertHistory.push(alert);
    this.writeToLog({ ...alert, type: 'SECURITY_ALERT' });
    
    console.log(`🚨 SECURITY ALERT: ${alertType}`);
    console.log('Details:', JSON.stringify(details, null, 2));
    
    this.emit('securityAlert', alert);
    
    // Send notification (implement your notification system)
    this.sendAlertNotification(alert);
    
    return alert.id;
  }

  // Get alert severity
  getAlertSeverity(alertType) {
    const severityMap = {
      'FAILED_LOGIN_THRESHOLD': 'HIGH',
      'RAPID_SCANNING': 'MEDIUM',
      'EXCESSIVE_ADMIN_ACTIVITY': 'HIGH',
      'SUSPICIOUS_IP_ACTIVITY': 'MEDIUM',
      'LARGE_FILE_UPLOADS': 'MEDIUM',
      'HIGH_ERROR_RATE': 'HIGH'
    };
    return severityMap[alertType] || 'MEDIUM';
  }

  // Send alert notification
  sendAlertNotification(alert) {
    // Implement your notification system here
    // Examples: email, Slack, PagerDuty, SMS
    console.log(`📧 Sending ${alert.severity} alert notification for ${alert.type}`);
    
    // For now, just log to console and file
    const notification = {
      timestamp: new Date().toISOString(),
      alert: alert,
      notificationSent: true
    };
    
    fs.appendFileSync('security-alerts.log', JSON.stringify(notification) + '\n');
  }

  // Clean up old events
  cleanupOldEvents() {
    const cutoff = Date.now() - 86400000; // 24 hours ago
    
    for (const [eventType, events] of this.eventStore.entries()) {
      const filteredEvents = events.filter(event => event.timestamp > cutoff);
      this.eventStore.set(eventType, filteredEvents);
    }
    
    // Clean up old alerts
    this.alertHistory = this.alertHistory.filter(alert => alert.timestamp > cutoff);
  }

  // Generate daily security summary
  generateDailySummary() {
    const now = Date.now();
    const dayAgo = now - 86400000;
    
    const summary = {
      date: new Date().toISOString().split('T')[0],
      period: '24 hours',
      events: {},
      alerts: this.alertHistory.filter(alert => alert.timestamp > dayAgo),
      topRisks: this.identifyTopRisks(dayAgo, now)
    };

    // Count events by type
    for (const [eventType, events] of this.eventStore.entries()) {
      const dayEvents = events.filter(event => event.timestamp > dayAgo);
      summary.events[eventType] = dayEvents.length;
    }

    console.log('\n📊 DAILY SECURITY SUMMARY');
    console.log('='.repeat(50));
    console.log(JSON.stringify(summary, null, 2));
    
    // Save to file
    fs.writeFileSync(`security-summary-${summary.date}.json`, JSON.stringify(summary, null, 2));
    
    this.emit('dailySummary', summary);
  }

  // Identify top security risks
  identifyTopRisks(since, until) {
    const risks = [];
    
    // Check for patterns that might indicate security issues
    const failedLogins = this.getRecentEvents('failed_login', since);
    if (failedLogins.length > 20) {
      risks.push({
        type: 'Brute Force Attack',
        severity: 'HIGH',
        count: failedLogins.length,
        description: 'High number of failed login attempts detected'
      });
    }

    const adminActions = this.getRecentEvents('admin_action', since);
    if (adminActions.length > 50) {
      risks.push({
        type: 'Unusual Admin Activity',
        severity: 'MEDIUM',
        count: adminActions.length,
        description: 'Higher than normal admin activity detected'
      });
    }

    return risks;
  }

  // Get current security status
  getSecurityStatus() {
    const now = Date.now();
    const hourAgo = now - 3600000;
    
    return {
      status: 'MONITORING',
      uptime: now - this.monitoringStartTime,
      recentAlerts: this.alertHistory.filter(alert => alert.timestamp > hourAgo),
      activeThreats: this.alertHistory.filter(alert => !alert.resolved && alert.timestamp > hourAgo),
      eventCounts: Object.fromEntries(
        Array.from(this.eventStore.entries()).map(([type, events]) => [
          type,
          events.filter(event => event.timestamp > hourAgo).length
        ])
      )
    };
  }

  // Manual alert resolution
  resolveAlert(alertId) {
    const alert = this.alertHistory.find(alert => alert.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      console.log(`✅ Alert ${alertId} resolved`);
      return true;
    }
    return false;
  }
}

// Usage examples for integration
class MonitoringService {
  constructor() {
    this.monitor = new SecurityMonitor();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.monitor.on('securityAlert', (alert) => {
      // Handle security alerts
      this.handleSecurityAlert(alert);
    });

    this.monitor.on('dailySummary', (summary) => {
      // Handle daily summaries
      this.handleDailySummary(summary);
    });
  }

  handleSecurityAlert(alert) {
    // Implement your alert handling logic
    console.log('Handling security alert:', alert.type);
    
    // Example: Auto-block IP for suspicious activity
    if (alert.type === 'SUSPICIOUS_IP_ACTIVITY') {
      this.blockSuspiciousIP(alert.details.ipAddress);
    }
  }

  handleDailySummary(summary) {
    // Implement your daily summary handling
    console.log('Daily security summary generated');
  }

  blockSuspiciousIP(ipAddress) {
    // Implement IP blocking logic (firewall rules, etc.)
    console.log(`🚫 Blocking suspicious IP: ${ipAddress}`);
  }

  // Integration methods for your application
  trackUserLogin(userId, success, ipAddress, userAgent) {
    if (!success) {
      this.monitor.logSecurityEvent('failed_login', {
        userId,
        ipAddress,
        userAgent,
        timestamp: Date.now()
      });
    }
  }

  trackQRScan(userId, rewardId, ipAddress) {
    this.monitor.logSecurityEvent('qr_scan', {
      userId,
      rewardId,
      ipAddress,
      timestamp: Date.now()
    });
  }

  trackAdminAction(adminId, action, target, ipAddress) {
    this.monitor.logSecurityEvent('admin_action', {
      userId: adminId,
      action,
      target,
      ipAddress,
      timestamp: Date.now()
    });
  }

  trackFileUpload(userId, filename, fileSize, ipAddress) {
    this.monitor.logSecurityEvent('file_upload', {
      userId,
      filename,
      fileSize,
      ipAddress,
      timestamp: Date.now()
    });
  }

  trackAPIRequest(endpoint, method, statusCode, ipAddress, userId) {
    this.monitor.logSecurityEvent('api_request', {
      endpoint,
      method,
      statusCode,
      ipAddress,
      userId,
      timestamp: Date.now()
    });

    if (statusCode >= 400) {
      this.monitor.logSecurityEvent('api_error', {
        endpoint,
        method,
        statusCode,
        errorType: statusCode >= 500 ? 'server_error' : 'client_error',
        ipAddress,
        userId,
        timestamp: Date.now()
      });
    }
  }
}

// Export for use in your application
module.exports = { SecurityMonitor, MonitoringService };

// Run standalone for testing
if (require.main === module) {
  const service = new MonitoringService();
  
  console.log('🔒 Security Monitor running...');
  console.log('Press Ctrl+C to stop');
  
  // Simulate some events for testing
  setTimeout(() => {
    service.trackUserLogin('user123', false, '192.168.1.1', 'Mozilla/5.0...');
    service.trackQRScan('user456', 'reward001', '192.168.1.2');
    service.trackAdminAction('admin001', 'delete_user', 'user789', '192.168.1.3');
  }, 1000);
  
  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Security Monitor stopping...');
    process.exit(0);
  });
}