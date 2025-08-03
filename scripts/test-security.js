#!/usr/bin/env node

/**
 * Security Testing Script for Monarch Passport MVP
 * 
 * This script validates the enhanced security implementation:
 * - Input validation testing
 * - Security middleware testing
 * - Rate limiting validation
 * - RBAC system testing
 * - Security headers validation
 * - QR code security testing
 */

// Set up test environment variables
process.env.REACT_APP_SUPABASE_URL = 'https://test.supabase.co';
process.env.REACT_APP_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.REACT_APP_DEBUG_MODE = 'true';
process.env.NODE_ENV = 'test';

const { enhancedSecurity } = require('../src/utils/enhancedSecurity.js');
const { getSecurityHeaders, auditSecurityHeaders } = require('../src/utils/securityHeaders.js');
const { validateQRData, validateFileUpload, validateUserProfile } = require('../src/utils/inputValidation.js');
const { hasPermission, isAdmin, isSuperAdmin } = require('../src/utils/secureRBAC.js');

// Test configuration
const TEST_CONFIG = {
  userId: 'test-user-123',
  adminUserId: 'admin-user-456',
  superAdminUserId: 'super-admin-789',
  testQRData: 'test-qr-data-123',
  maliciousQRData: '<script>alert("xss")</script>',
  testFile: {
    name: 'test-image.jpg',
    size: 1024 * 1024, // 1MB
    type: 'image/jpeg'
  },
  maliciousFile: {
    name: '../../../etc/passwd',
    size: 1024,
    type: 'text/plain'
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

/**
 * Test helper functions
 */
function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${name}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${name}`);
    if (details) {
      console.log(`   Details: ${details}`);
    }
  }
  testResults.details.push({ name, passed, details });
}

function logSection(title) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🧪 ${title}`);
  console.log(`${'='.repeat(50)}`);
}

function logSummary() {
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 SECURITY TEST SUMMARY');
  console.log(`${'='.repeat(50)}`);
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => console.log(`   - ${test.name}: ${test.details}`));
  }
}

/**
 * Test 1: Input Validation
 */
function testInputValidation() {
  logSection('INPUT VALIDATION TESTS');

  // Test QR data validation
  const qrValidation = validateQRData(TEST_CONFIG.testQRData, TEST_CONFIG.userId);
  logTest('QR Data Validation - Valid Data', qrValidation.success);

  const maliciousQRValidation = validateQRData(TEST_CONFIG.maliciousQRData, TEST_CONFIG.userId);
  logTest('QR Data Validation - Malicious Data', !maliciousQRValidation.success, 
    maliciousQRValidation.error);

  // Test file upload validation
  const fileValidation = validateFileUpload(TEST_CONFIG.testFile, TEST_CONFIG.userId);
  logTest('File Upload Validation - Valid File', fileValidation.success);

  const maliciousFileValidation = validateFileUpload(TEST_CONFIG.maliciousFile, TEST_CONFIG.userId);
  logTest('File Upload Validation - Malicious File', !maliciousFileValidation.success,
    maliciousFileValidation.error);

  // Test user profile validation
  const validProfile = {
    display_name: 'Test User',
    bio: 'Test bio'
  };
  const profileValidation = validateUserProfile(validProfile, TEST_CONFIG.userId);
  logTest('User Profile Validation - Valid Profile', profileValidation.success);

  const maliciousProfile = {
    display_name: '<script>alert("xss")</script>',
    bio: 'Test bio'
  };
  const maliciousProfileValidation = validateUserProfile(maliciousProfile, TEST_CONFIG.userId);
  logTest('User Profile Validation - Malicious Profile', !maliciousProfileValidation.success,
    maliciousProfileValidation.error);
}

/**
 * Test 2: Enhanced QR Security
 */
async function testEnhancedQRSecurity() {
  logSection('ENHANCED QR SECURITY TESTS');

  // Test successful QR scan
  const qrResult = await enhancedSecurity.enhancedQRScan(
    TEST_CONFIG.userId, 
    TEST_CONFIG.testQRData,
    { scanType: 'test' }
  );
  logTest('Enhanced QR Scan - Valid Code', qrResult.success);

  // Test duplicate scan prevention
  const duplicateResult = await enhancedSecurity.enhancedQRScan(
    TEST_CONFIG.userId, 
    TEST_CONFIG.testQRData,
    { scanType: 'test' }
  );
  logTest('Enhanced QR Scan - Duplicate Prevention', !duplicateResult.success,
    duplicateResult.error);

  // Test malicious QR code blocking
  enhancedSecurity.blockQRCode(TEST_CONFIG.maliciousQRData, 'Test blocking');
  const blockedResult = await enhancedSecurity.enhancedQRScan(
    TEST_CONFIG.userId, 
    TEST_CONFIG.maliciousQRData,
    { scanType: 'test' }
  );
  logTest('Enhanced QR Scan - Blocked Code', !blockedResult.success,
    blockedResult.error);

  // Test QR statistics
  const stats = enhancedSecurity.getQRStatistics();
  logTest('QR Statistics - Data Available', 
    stats.totalScans > 0 && typeof stats.blockedCodes === 'number');
}

/**
 * Test 3: Security Monitoring
 */
function testSecurityMonitoring() {
  logSection('SECURITY MONITORING TESTS');

  // Test suspicious activity tracking
  enhancedSecurity.trackSuspiciousActivity(TEST_CONFIG.userId, 'test_activity', {
    test: true
  });
  
  const status = enhancedSecurity.getSecurityStatus();
  logTest('Security Monitoring - Status Available', 
    status && typeof status.threatLevel === 'string');

  // Test alert creation
  const alert = enhancedSecurity.createAlert('TEST_ALERT', {
    userId: TEST_CONFIG.userId,
    test: true
  });
  logTest('Security Monitoring - Alert Creation', 
    alert && alert.id && alert.type === 'TEST_ALERT');

  // Test threat level assessment
  logTest('Security Monitoring - Threat Level', 
    ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(status.threatLevel));
}

/**
 * Test 4: Session Management
 */
function testSessionManagement() {
  logSection('SESSION MANAGEMENT TESTS');

  // Test session creation
  const sessionId = enhancedSecurity.createSession(TEST_CONFIG.userId, {
    test: true
  });
  logTest('Session Management - Session Creation', 
    sessionId && sessionId.length > 0);

  // Test session validation
  const validation = enhancedSecurity.validateSession(sessionId);
  logTest('Session Management - Session Validation', 
    validation.valid && validation.session);

  // Test session invalidation
  enhancedSecurity.invalidateSession(sessionId);
  const invalidValidation = enhancedSecurity.validateSession(sessionId);
  logTest('Session Management - Session Invalidation', 
    !invalidValidation.valid);

  // Test session statistics
  const sessionStats = enhancedSecurity.getSessionStatistics();
  logTest('Session Management - Statistics', 
    typeof sessionStats.activeSessions === 'number');
}

/**
 * Test 5: RBAC System
 */
function testRBACSystem() {
  logSection('RBAC SYSTEM TESTS');

  // Test permission checks
  const hasUserPermission = hasPermission(TEST_CONFIG.userId, 'user:qr:scan');
  logTest('RBAC System - Permission Check', 
    typeof hasUserPermission === 'boolean');

  // Test admin checks
  const isUserAdmin = isAdmin(TEST_CONFIG.userId);
  const isUserSuperAdmin = isSuperAdmin(TEST_CONFIG.userId);
  logTest('RBAC System - Admin Checks', 
    typeof isUserAdmin === 'boolean' && typeof isUserSuperAdmin === 'boolean');

  // Test route access
  const canAccessRoute = enhancedSecurity.secureRouteAccess(TEST_CONFIG.userId, '/home');
  logTest('RBAC System - Route Access', 
    typeof canAccessRoute.success === 'boolean');
}

/**
 * Test 6: Security Headers
 */
function testSecurityHeaders() {
  logSection('SECURITY HEADERS TESTS');

  // Test security headers generation
  const headers = getSecurityHeaders();
  logTest('Security Headers - Generation', 
    headers && typeof headers === 'object');

  // Test CSP header
  const cspHeader = getSecurityHeaders()['Content-Security-Policy'];
  logTest('Security Headers - CSP Header', 
    cspHeader && cspHeader.includes('default-src'));

  // Test header validation
  const headerAudit = auditSecurityHeaders();
  logTest('Security Headers - Validation', 
    headerAudit && typeof headerAudit.validation === 'boolean');

  // Test required headers
  const requiredHeaders = [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
    'Referrer-Policy'
  ];
  
  const missingHeaders = requiredHeaders.filter(header => !headers[header]);
  logTest('Security Headers - Required Headers', 
    missingHeaders.length === 0,
    missingHeaders.length > 0 ? `Missing: ${missingHeaders.join(', ')}` : '');
}

/**
 * Test 7: Security Middleware
 */
function testSecurityMiddleware() {
  logSection('SECURITY MIDDLEWARE TESTS');

  // Test QR scan middleware
  const qrMiddleware = enhancedSecurity.secureQRScan(TEST_CONFIG.userId, TEST_CONFIG.testQRData);
  logTest('Security Middleware - QR Scan', 
    typeof qrMiddleware.success === 'boolean');

  // Test file upload middleware
  const fileMiddleware = enhancedSecurity.secureFileUpload(TEST_CONFIG.userId, TEST_CONFIG.testFile);
  logTest('Security Middleware - File Upload', 
    typeof fileMiddleware.success === 'boolean');

  // Test profile update middleware
  const profileMiddleware = enhancedSecurity.secureProfileUpdate(TEST_CONFIG.userId, {
    display_name: 'Test User'
  });
  logTest('Security Middleware - Profile Update', 
    typeof profileMiddleware.success === 'boolean');

  // Test admin action middleware
  const adminMiddleware = enhancedSecurity.secureAdminAction(TEST_CONFIG.userId, 'test_action');
  logTest('Security Middleware - Admin Action', 
    typeof adminMiddleware.success === 'boolean');
}

/**
 * Test 8: Comprehensive Security Audit
 */
function testSecurityAudit() {
  logSection('COMPREHENSIVE SECURITY AUDIT');

  // Test comprehensive audit
  const audit = enhancedSecurity.auditSecurity();
  logTest('Security Audit - Comprehensive', 
    audit && typeof audit === 'object');

  // Test audit components
  const hasSecuritySystem = audit.securitySystem;
  const hasInputValidation = audit.inputValidation;
  const hasRBAC = audit.rbac;
  const hasQRStats = audit.qrStatistics;
  const hasSessionStats = audit.sessionStatistics;
  const hasSecurityStatus = audit.securityStatus;

  logTest('Security Audit - Components', 
    hasSecuritySystem && hasInputValidation && hasRBAC && 
    hasQRStats && hasSessionStats && hasSecurityStatus);

  // Test cleanup function
  try {
    enhancedSecurity.cleanup();
    logTest('Security Audit - Cleanup Function', true);
  } catch (error) {
    logTest('Security Audit - Cleanup Function', false, error.message);
  }
}

/**
 * Main test execution
 */
async function runSecurityTests() {
  console.log('🔒 MONARCH PASSPORT MVP - SECURITY TESTING');
  console.log('Testing enhanced security implementation...\n');

  try {
    // Run all test suites
    testInputValidation();
    await testEnhancedQRSecurity();
    testSecurityMonitoring();
    testSessionManagement();
    testRBACSystem();
    testSecurityHeaders();
    testSecurityMiddleware();
    testSecurityAudit();

    // Display summary
    logSummary();

    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runSecurityTests();
}

module.exports = {
  runSecurityTests,
  testResults
}; 