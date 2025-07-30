#!/usr/bin/env node

/**
 * Monarch Passport MVP - Supabase Environment Check
 * Quick check for Supabase environment variables
 */

require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironment() {
  log('🦋 Monarch Passport MVP - Environment Check', 'bright');
  log('=' .repeat(50), 'blue');

  const requiredVars = [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY'
  ];

  const optionalVars = [
    'REACT_APP_BETA_PASSWORD',
    'REACT_APP_SECRET_KEY'
  ];

  let allRequiredPresent = true;

  log('\n📋 Required Environment Variables:', 'yellow');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log(`✅ ${varName}: ${value.substring(0, 20)}...`, 'green');
    } else {
      log(`❌ ${varName}: Missing`, 'red');
      allRequiredPresent = false;
    }
  });

  log('\n📋 Optional Environment Variables:', 'yellow');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      log(`✅ ${varName}: ${value.substring(0, 20)}...`, 'green');
    } else {
      log(`⚠️ ${varName}: Not set (optional)`, 'yellow');
    }
  });

  log('\n📊 Summary:', 'bright');
  if (allRequiredPresent) {
    log('✅ All required environment variables are set!', 'green');
    log('🚀 You can now run the Supabase connection test.', 'cyan');
  } else {
    log('❌ Missing required environment variables.', 'red');
    log('📝 Please check your .env file and ensure all required variables are set.', 'yellow');
  }

  log('\n💡 Next Steps:', 'bright');
  if (allRequiredPresent) {
    log('1. Run: npm run test:supabase', 'cyan');
    log('2. Or access the Connection Test tab in the Admin panel', 'cyan');
  } else {
    log('1. Create or update your .env file', 'cyan');
    log('2. Add your Supabase URL and anon key', 'cyan');
    log('3. Restart your development server', 'cyan');
  }

  return allRequiredPresent;
}

// Run if this file is executed directly
if (require.main === module) {
  const success = checkEnvironment();
  process.exit(success ? 0 : 1);
}

module.exports = { checkEnvironment }; 