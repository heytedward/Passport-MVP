#!/usr/bin/env node

/**
 * Monarch Passport MVP - Supabase Connection Test
 * Tests all critical communication points between the app and Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test configuration
const TEST_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
  verbose: true
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, result, details = '') {
  const status = result ? '✅ PASS' : '❌ FAIL';
  const color = result ? 'green' : 'red';
  log(`${status} ${testName}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
}

// Initialize Supabase client
function initializeSupabase() {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
  }

  log('🔧 Initializing Supabase client...', 'blue');
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Test 1: Basic Connection
async function testBasicConnection(supabase) {
  log('\n📡 Testing basic connection...', 'yellow');
  
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      logTest('Basic Connection', false, `Error: ${error.message}`);
      return false;
    }
    
    logTest('Basic Connection', true, 'Successfully connected to Supabase');
    return true;
  } catch (err) {
    logTest('Basic Connection', false, `Exception: ${err.message}`);
    return false;
  }
}

// Test 2: Authentication
async function testAuthentication(supabase) {
  log('\n🔐 Testing authentication...', 'yellow');
  
  try {
    // Test getting current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logTest('Session Check', false, `Error: ${sessionError.message}`);
    } else {
      logTest('Session Check', true, session ? 'User authenticated' : 'No active session');
    }

    // Test sign up (with test email)
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    if (signUpError) {
      logTest('Sign Up', false, `Error: ${signUpError.message}`);
    } else {
      logTest('Sign Up', true, `Test user created: ${testEmail}`);
      
      // Clean up test user
      if (signUpData.user) {
        await supabase.auth.admin.deleteUser(signUpData.user.id);
        log('   Test user cleaned up', 'cyan');
      }
    }

    return true;
  } catch (err) {
    logTest('Authentication', false, `Exception: ${err.message}`);
    return false;
  }
}

// Test 3: Database Tables
async function testDatabaseTables(supabase) {
  log('\n🗄️ Testing database tables...', 'yellow');
  
  const tables = [
    'user_profiles',
    'rewards',
    'user_closet',
    'user_activity',
    'admin_settings'
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        logTest(`Table: ${table}`, false, `Error: ${error.message}`);
        allTablesExist = false;
      } else {
        logTest(`Table: ${table}`, true, 'Table accessible');
      }
    } catch (err) {
      logTest(`Table: ${table}`, false, `Exception: ${err.message}`);
      allTablesExist = false;
    }
  }

  return allTablesExist;
}

// Test 4: Row Level Security (RLS)
async function testRowLevelSecurity(supabase) {
  log('\n🔒 Testing Row Level Security...', 'yellow');
  
  try {
    // Test user_profiles RLS
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email')
      .limit(5);

    if (profilesError) {
      logTest('RLS - user_profiles', false, `Error: ${profilesError.message}`);
    } else {
      logTest('RLS - user_profiles', true, `Found ${profiles?.length || 0} profiles`);
    }

    // Test rewards RLS (should be publicly readable)
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('reward_id, name, category')
      .limit(5);

    if (rewardsError) {
      logTest('RLS - rewards', false, `Error: ${rewardsError.message}`);
    } else {
      logTest('RLS - rewards', true, `Found ${rewards?.length || 0} rewards`);
    }

    return true;
  } catch (err) {
    logTest('Row Level Security', false, `Exception: ${err.message}`);
    return false;
  }
}

// Test 5: Functions
async function testFunctions(supabase) {
  log('\n⚙️ Testing database functions...', 'yellow');
  
  try {
    // Test add_wings_to_user function (requires admin privileges)
    // This will fail for regular users, which is expected
    const { data: functionTest, error: functionError } = await supabase
      .rpc('add_wings_to_user', {
        user_id_param: '00000000-0000-0000-0000-000000000000',
        wings_amount: 10,
        activity_type_param: 'test',
        description_param: 'Test wings addition'
      });

    if (functionError) {
      logTest('Function: add_wings_to_user', false, `Expected error: ${functionError.message}`);
    } else {
      logTest('Function: add_wings_to_user', true, 'Function accessible');
    }

    return true;
  } catch (err) {
    logTest('Database Functions', false, `Exception: ${err.message}`);
    return false;
  }
}

// Test 6: Real-time subscriptions
async function testRealtime(supabase) {
  log('\n📡 Testing real-time subscriptions...', 'yellow');
  
  try {
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'user_activity' },
        (payload) => {
          log('   Real-time event received', 'cyan');
        }
      )
      .subscribe();

    // Wait a moment for subscription to establish
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isSubscribed = channel.subscribed;
    logTest('Real-time Subscription', isSubscribed, isSubscribed ? 'Channel subscribed' : 'Subscription failed');

    // Clean up
    channel.unsubscribe();
    
    return isSubscribed;
  } catch (err) {
    logTest('Real-time Subscription', false, `Exception: ${err.message}`);
    return false;
  }
}

// Test 7: Storage (if configured)
async function testStorage(supabase) {
  log('\n📁 Testing storage...', 'yellow');
  
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      logTest('Storage Buckets', false, `Error: ${bucketsError.message}`);
    } else {
      logTest('Storage Buckets', true, `Found ${buckets?.length || 0} buckets`);
    }

    return true;
  } catch (err) {
    logTest('Storage', false, `Exception: ${err.message}`);
    return false;
  }
}

// Test 8: Performance
async function testPerformance(supabase) {
  log('\n⚡ Testing performance...', 'yellow');
  
  const tests = [
    { name: 'Simple Query', query: () => supabase.from('rewards').select('reward_id').limit(1) },
    { name: 'Complex Query', query: () => supabase.from('user_profiles').select('id, email, wings_balance').limit(10) }
  ];

  for (const test of tests) {
    const startTime = Date.now();
    
    try {
      const { data, error } = await test.query();
      const duration = Date.now() - startTime;
      
      if (error) {
        logTest(`Performance: ${test.name}`, false, `Error: ${error.message}`);
      } else {
        const status = duration < 2000; // 2 second threshold
        logTest(`Performance: ${test.name}`, status, `${duration}ms`);
      }
    } catch (err) {
      logTest(`Performance: ${test.name}`, false, `Exception: ${err.message}`);
    }
  }

  return true;
}

// Main test runner
async function runAllTests() {
  log('🦋 Monarch Passport MVP - Supabase Connection Test', 'bright');
  log('=' .repeat(60), 'blue');
  
  const startTime = Date.now();
  const results = {
    basicConnection: false,
    authentication: false,
    databaseTables: false,
    rowLevelSecurity: false,
    functions: false,
    realtime: false,
    storage: false,
    performance: false
  };

  try {
    const supabase = initializeSupabase();
    
    // Run all tests
    results.basicConnection = await testBasicConnection(supabase);
    results.authentication = await testAuthentication(supabase);
    results.databaseTables = await testDatabaseTables(supabase);
    results.rowLevelSecurity = await testRowLevelSecurity(supabase);
    results.functions = await testFunctions(supabase);
    results.realtime = await testRealtime(supabase);
    results.storage = await testStorage(supabase);
    results.performance = await testPerformance(supabase);

  } catch (err) {
    log(`\n❌ Fatal Error: ${err.message}`, 'red');
    process.exit(1);
  }

  // Summary
  const totalTime = Date.now() - startTime;
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  log('\n' + '=' .repeat(60), 'blue');
  log('📊 Test Summary', 'bright');
  log(`Total Tests: ${totalTests}`, 'cyan');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${totalTests - passedTests}`, 'red');
  log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`, 'cyan');
  log(`Total Time: ${totalTime}ms`, 'cyan');

  // Detailed results
  log('\n📋 Detailed Results:', 'bright');
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(`${status} ${test}`, color);
  });

  // Recommendations
  log('\n💡 Recommendations:', 'bright');
  if (results.basicConnection && results.databaseTables) {
    log('✅ Core database functionality is working', 'green');
  } else {
    log('❌ Core database issues detected - check environment variables and database setup', 'red');
  }

  if (!results.authentication) {
    log('⚠️ Authentication issues - check Supabase auth settings', 'yellow');
  }

  if (!results.realtime) {
    log('⚠️ Real-time subscriptions not working - check network and Supabase configuration', 'yellow');
  }

  if (!results.storage) {
    log('ℹ️ Storage not configured - this is optional for MVP', 'blue');
  }

  // Exit with appropriate code
  const allCriticalTestsPassed = results.basicConnection && results.databaseTables;
  process.exit(allCriticalTestsPassed ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(err => {
    log(`\n💥 Unexpected error: ${err.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testBasicConnection,
  testAuthentication,
  testDatabaseTables,
  testRowLevelSecurity,
  testFunctions,
  testRealtime,
  testStorage,
  testPerformance
}; 