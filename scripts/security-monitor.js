#!/usr/bin/env node

/**
 * Security Monitoring System for Monarch Passport MVP
 * 
 * This script monitors for unusual activity, security threats, and potential breaches
 * in real-time and provides alerts and logging capabilities.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Security monitoring configuration
const config = {
  // Alert thresholds
  thresholds: {
    failedLogins: 5, // Alert after 5 failed logins
    suspiciousIPs: 10, // Alert after 10 requests from same IP
    unusualActivity: 20, // Alert after 20 unusual events
    fileUploads: 50, // Alert after 50 file uploads in short time
    apiCalls: 100 // Alert after 100 API calls in short time
  },
  
  // Time windows for monitoring (in minutes)
  timeWindows: {
    failedLogins: 15,
    suspiciousIPs: 5,
    unusualActivity: 10,
    fileUploads: 5,
    apiCalls: 1
  },
  
  // Suspicious patterns
  suspiciousPatterns: {
    // SQL injection attempts
    sqlInjection: [
      /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
      /(\b(or|and)\b\s+\d+\s*=\s*\d+)/i,
      /(\b(union|select|insert|update|delete|drop|create|alter)\b.*\b(union|select|insert|update|delete|drop|create|alter)\b)/i
    ],
    
    // XSS attempts
    xssAttempts: [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i
    ],
    
    // Path traversal attempts
    pathTraversal: [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/i,
      /%2e%2e%5c/i
    ],
    
    // Command injection attempts
    commandInjection: [
      /(\b(cat|ls|pwd|whoami|id|uname|ps|netstat|ifconfig|ipconfig)\b)/i,
      /(\b(rm|del|erase|format|fdisk|mkfs)\b)/i,
      /(\b(wget|curl|nc|telnet|ssh|ftp)\b)/i
    ]
  },
  
  // Log file paths
  logFiles: {
    security: 'logs/security.log',
    access: 'logs/access.log',
    error: 'logs/error.log',
    alerts: 'logs/alerts.log'
  }
};

// In-memory monitoring data
let monitoringData = {
  failedLogins: new Map(),
  suspiciousIPs: new Map(),
  unusualActivity: new Map(),
  fileUploads: new Map(),
  apiCalls: new Map(),
  alerts: []
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logAlert(message, severity = 'warning') {
  const timestamp = new Date().toISOString();
  const alert = {
    timestamp,
    severity,
    message,
    id: crypto.randomBytes(8).toString('hex')
  };
  
  monitoringData.alerts.push(alert);
  
  const color = severity === 'critical' ? 'red' : 
               severity === 'high' ? 'yellow' : 'blue';
  
  console.log(`${colors[color]}${colors.bold}🚨 ALERT [${severity.toUpperCase()}]: ${message}${colors.reset}`);
  
  // Log to file
  writeToLog(config.logFiles.alerts, `${timestamp} [${severity.toUpperCase()}] ${message}`);
  
  // Send notification (implement your preferred method)
  sendNotification(alert);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}${colors.bold}✅ ${message}${colors.reset}`);
}

function writeToLog(logFile, message) {
  try {
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    fs.appendFileSync(logFile, `${message}\n`);
  } catch (error) {
    console.error(`Failed to write to log file ${logFile}:`, error.message);
  }
}

function sendNotification(alert) {
  // Implement your preferred notification method:
  // - Email
  // - Slack/Discord webhook
  // - SMS
  // - Push notification
  // - Webhook to external monitoring service
  
  // Example: Send to webhook
  if (process.env.SECURITY_WEBHOOK_URL) {
    try {
      const https = require('https');
      const data = JSON.stringify({
        text: `🚨 Security Alert: ${alert.message}`,
        severity: alert.severity,
        timestamp: alert.timestamp,
        id: alert.id
      });
      
      const options = {
        hostname: new URL(process.env.SECURITY_WEBHOOK_URL).hostname,
        port: 443,
        path: new URL(process.env.SECURITY_WEBHOOK_URL).pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      
      const req = https.request(options, (res) => {
        // Handle response
      });
      
      req.on('error', (error) => {
        console.error('Failed to send notification:', error.message);
      });
      
      req.write(data);
      req.end();
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }
  }
}

function checkSuspiciousPatterns(input) {
  const patterns = config.suspiciousPatterns;
  const matches = [];
  
  Object.entries(patterns).forEach(([type, patternList]) => {
    patternList.forEach(pattern => {
      if (pattern.test(input)) {
        matches.push({ type, pattern: pattern.toString() });
      }
    });
  });
  
  return matches;
}

function recordFailedLogin(userId, ip, reason) {
  const timestamp = Date.now();
  const key = `${userId}:${ip}`;
  
  if (!monitoringData.failedLogins.has(key)) {
    monitoringData.failedLogins.set(key, []);
  }
  
  const attempts = monitoringData.failedLogins.get(key);
  attempts.push({ timestamp, reason });
  
  // Remove old attempts outside the time window
  const cutoff = timestamp - (config.timeWindows.failedLogins * 60 * 1000);
  const recentAttempts = attempts.filter(attempt => attempt.timestamp > cutoff);
  monitoringData.failedLogins.set(key, recentAttempts);
  
  // Check threshold
  if (recentAttempts.length >= config.thresholds.failedLogins) {
    logAlert(`Multiple failed login attempts detected for user ${userId} from IP ${ip}`, 'high');
  }
  
  // Log the event
  writeToLog(config.logFiles.security, `${new Date(timestamp).toISOString()} FAILED_LOGIN user=${userId} ip=${ip} reason=${reason}`);
}

function recordSuspiciousActivity(ip, activity, details) {
  const timestamp = Date.now();
  
  if (!monitoringData.suspiciousIPs.has(ip)) {
    monitoringData.suspiciousIPs.set(ip, []);
  }
  
  const activities = monitoringData.suspiciousIPs.get(ip);
  activities.push({ timestamp, activity, details });
  
  // Remove old activities outside the time window
  const cutoff = timestamp - (config.timeWindows.suspiciousIPs * 60 * 1000);
  const recentActivities = activities.filter(act => act.timestamp > cutoff);
  monitoringData.suspiciousIPs.set(ip, recentActivities);
  
  // Check threshold
  if (recentActivities.length >= config.thresholds.suspiciousIPs) {
    logAlert(`Suspicious activity detected from IP ${ip}`, 'high');
  }
  
  // Log the event
  writeToLog(config.logFiles.security, `${new Date(timestamp).toISOString()} SUSPICIOUS_ACTIVITY ip=${ip} activity=${activity} details=${JSON.stringify(details)}`);
}

function recordFileUpload(userId, ip, fileName, fileSize) {
  const timestamp = Date.now();
  const key = `${userId}:${ip}`;
  
  if (!monitoringData.fileUploads.has(key)) {
    monitoringData.fileUploads.set(key, []);
  }
  
  const uploads = monitoringData.fileUploads.get(key);
  uploads.push({ timestamp, fileName, fileSize });
  
  // Remove old uploads outside the time window
  const cutoff = timestamp - (config.timeWindows.fileUploads * 60 * 1000);
  const recentUploads = uploads.filter(upload => upload.timestamp > cutoff);
  monitoringData.fileUploads.set(key, recentUploads);
  
  // Check threshold
  if (recentUploads.length >= config.thresholds.fileUploads) {
    logAlert(`Multiple file uploads detected for user ${userId} from IP ${ip}`, 'medium');
  }
  
  // Log the event
  writeToLog(config.logFiles.access, `${new Date(timestamp).toISOString()} FILE_UPLOAD user=${userId} ip=${ip} file=${fileName} size=${fileSize}`);
}

function recordApiCall(userId, ip, endpoint, method) {
  const timestamp = Date.now();
  const key = `${userId}:${ip}`;
  
  if (!monitoringData.apiCalls.has(key)) {
    monitoringData.apiCalls.set(key, []);
  }
  
  const calls = monitoringData.apiCalls.get(key);
  calls.push({ timestamp, endpoint, method });
  
  // Remove old calls outside the time window
  const cutoff = timestamp - (config.timeWindows.apiCalls * 60 * 1000);
  const recentCalls = calls.filter(call => call.timestamp > cutoff);
  monitoringData.apiCalls.set(key, recentCalls);
  
  // Check threshold
  if (recentCalls.length >= config.thresholds.apiCalls) {
    logAlert(`High API call rate detected for user ${userId} from IP ${ip}`, 'medium');
  }
  
  // Log the event
  writeToLog(config.logFiles.access, `${new Date(timestamp).toISOString()} API_CALL user=${userId} ip=${ip} endpoint=${endpoint} method=${method}`);
}

function analyzeRequest(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'] || '';
  const userId = req.user?.id || 'anonymous';
  
  // Check for suspicious patterns in request
  const url = req.url;
  const body = JSON.stringify(req.body || {});
  const headers = JSON.stringify(req.headers);
  
  const suspiciousPatterns = checkSuspiciousPatterns(url + body + headers);
  
  if (suspiciousPatterns.length > 0) {
    recordSuspiciousActivity(ip, 'suspicious_patterns', {
      patterns: suspiciousPatterns,
      url,
      userAgent
    });
    
    logAlert(`Suspicious patterns detected in request from IP ${ip}`, 'high');
  }
  
  // Record API call
  recordApiCall(userId, ip, req.path, req.method);
  
  next();
}

function generateSecurityReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalAlerts: monitoringData.alerts.length,
      failedLogins: monitoringData.failedLogins.size,
      suspiciousIPs: monitoringData.suspiciousIPs.size,
      fileUploads: monitoringData.fileUploads.size,
      apiCalls: monitoringData.apiCalls.size
    },
    recentAlerts: monitoringData.alerts.slice(-10),
    topSuspiciousIPs: Array.from(monitoringData.suspiciousIPs.entries())
      .map(([ip, activities]) => ({ ip, count: activities.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  };
  
  return report;
}

function startMonitoring() {
  logSuccess('Security monitoring system started');
  
  // Create log directories
  Object.values(config.logFiles).forEach(logFile => {
    const logDir = path.dirname(logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  });
  
  // Log startup
  writeToLog(config.logFiles.security, `${new Date().toISOString()} MONITORING_STARTED`);
  
  // Periodic cleanup of old data
  setInterval(() => {
    const now = Date.now();
    
    // Clean up old monitoring data
    Object.keys(monitoringData).forEach(key => {
      if (key !== 'alerts' && monitoringData[key] instanceof Map) {
        for (const [mapKey, entries] of monitoringData[key]) {
          const cutoff = now - (config.timeWindows[key] * 60 * 1000);
          const filtered = entries.filter(entry => entry.timestamp > cutoff);
          
          if (filtered.length === 0) {
            monitoringData[key].delete(mapKey);
          } else {
            monitoringData[key].set(mapKey, filtered);
          }
        }
      }
    });
    
    // Keep only last 1000 alerts
    if (monitoringData.alerts.length > 1000) {
      monitoringData.alerts = monitoringData.alerts.slice(-1000);
    }
  }, 5 * 60 * 1000); // Run every 5 minutes
}

// Export functions for use in your application
module.exports = {
  recordFailedLogin,
  recordSuspiciousActivity,
  recordFileUpload,
  recordApiCall,
  analyzeRequest,
  generateSecurityReport,
  startMonitoring,
  checkSuspiciousPatterns,
  logAlert
};

// Start monitoring if run directly
if (require.main === module) {
  startMonitoring();
  
  // Example usage
  setTimeout(() => {
    recordFailedLogin('user123', '192.168.1.100', 'invalid_password');
    recordSuspiciousActivity('192.168.1.100', 'sql_injection_attempt', { pattern: 'SELECT * FROM users' });
    
    const report = generateSecurityReport();
    console.log('\nSecurity Report:', JSON.stringify(report, null, 2));
  }, 2000);
} 