#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates that all required environment variables are present
 * and have valid values. It runs before the app starts to catch issues early.
 */

const fs = require('fs');
const path = require('path');

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

// Required environment variables for the app
const requiredEnvVars = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY'
];

// Optional but recommended environment variables
const recommendedEnvVars = [
  'REACT_APP_SUPABASE_SERVICE_ROLE_KEY',
  'REACT_APP_DEBUG_MODE',
  'REACT_APP_BETA_FEATURES_ENABLED'
];

// Environment variables that should NOT be in production
const developmentOnlyVars = [
  'REACT_APP_DEBUG_MODE'
];

// Patterns that indicate sensitive data (more specific to avoid false positives)
const sensitivePatterns = [
  /sk_live_[a-zA-Z0-9]{24}/,
  /pk_live_[a-zA-Z0-9]{24}/,
  /sk_test_[a-zA-Z0-9]{24}/,
  /pk_test_[a-zA-Z0-9]{24}/,
  /eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*/,
  /[A-Za-z0-9+/]{32,}={0,2}/,
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
];

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}${colors.bold}❌ ERROR: ${message}${colors.reset}`);
}

function logWarning(message) {
  console.warn(`${colors.yellow}${colors.bold}⚠️  WARNING: ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}${colors.bold}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function checkForSensitiveData() {
  logInfo('Checking for sensitive data patterns...');
  
  const envFile = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envFile)) {
    logWarning('.env file not found. Make sure to create one from .env.example');
    return;
  }

  const envContent = fs.readFileSync(envFile, 'utf8');
  const lines = envContent.split('\n');
  
  let foundSensitive = false;
  
  lines.forEach((line, index) => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=');
      
      if (value) {
        sensitivePatterns.forEach(pattern => {
          if (pattern.test(value)) {
            logWarning(`Line ${index + 1}: Potential sensitive data found in ${key}`);
            foundSensitive = true;
          }
        });
      }
    }
  });
  
  if (!foundSensitive) {
    logSuccess('No obvious sensitive data patterns detected');
  }
  
  // Don't fail the build for sensitive data warnings - just log them
  return foundSensitive;
}

function validateEnvVars() {
  logInfo('Validating environment variables...');
  
  const missing = [];
  const present = [];
  const recommended = [];
  
  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  });
  
  // Check recommended variables
  recommendedEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      recommended.push(varName);
    }
  });
  
  // Check for development-only variables in production
  if (process.env.NODE_ENV === 'production') {
    developmentOnlyVars.forEach(varName => {
      if (process.env[varName]) {
        logWarning(`${varName} should not be set in production`);
      }
    });
  }
  
  // Report results
  if (missing.length > 0) {
    logError(`Missing required environment variables: ${missing.join(', ')}`);
    logInfo('Please add these to your .env file');
    process.exit(1);
  }
  
  if (recommended.length > 0) {
    logWarning(`Recommended environment variables not set: ${recommended.join(', ')}`);
  }
  
  logSuccess(`All required environment variables are present (${present.length}/${requiredEnvVars.length})`);
}

function checkGitHooks() {
  logInfo('Checking Git hooks...');
  
  const hooksDir = path.join(process.cwd(), '.git', 'hooks');
  const preCommitHook = path.join(hooksDir, 'pre-commit');
  
  if (!fs.existsSync(preCommitHook)) {
    logWarning('Pre-commit hook not found. Consider installing husky for automatic validation.');
    return false;
  } else {
    logSuccess('Git hooks are configured');
    return true;
  }
}

function main() {
  console.log(`${colors.cyan}${colors.bold}🔒 Environment Validation${colors.reset}\n`);
  
  try {
    // Load environment variables
    require('dotenv').config();
    
    validateEnvVars();
    checkForSensitiveData();
    checkGitHooks();
    
    console.log(`\n${colors.green}${colors.bold}🎉 Environment validation completed successfully!${colors.reset}`);
    
  } catch (error) {
    logError(`Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { validateEnvVars, checkForSensitiveData }; 