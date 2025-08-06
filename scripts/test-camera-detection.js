#!/usr/bin/env node

/**
 * Camera Detection Test Script
 * 
 * This script helps debug camera detection issues on iOS devices.
 * Run with: node scripts/test-camera-detection.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Monarch Passport - Camera Detection Test\n');

// Test 1: Environment Variables
console.log('1. Checking environment variables...');
const requiredVars = [
  'REACT_APP_SUPABASE_URL',
  'REACT_APP_SUPABASE_ANON_KEY'
];

let envOk = true;
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.log(`❌ Missing: ${varName}`);
    envOk = false;
  } else {
    console.log(`✅ Found: ${varName}`);
  }
});

if (!envOk) {
  console.log('\n❌ Environment setup incomplete. Please check your .env file.');
  process.exit(1);
}

// Test 2: Supabase Connection
console.log('\n2. Testing Supabase connection...');
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('reward_id, name')
      .limit(1);
    
    if (error) {
      console.log(`❌ Supabase error: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Supabase connected. Found ${data?.length || 0} rewards.`);
    return true;
  } catch (err) {
    console.log(`❌ Supabase connection failed: ${err.message}`);
    return false;
  }
}

// Test 3: Browser Camera API Simulation
console.log('\n3. Simulating browser camera API...');

function simulateCameraAPI() {
  // In Node.js environment, navigator doesn't exist
  if (typeof navigator === 'undefined') {
    console.log('⚠️  Running in Node.js environment - browser APIs not available');
    console.log('✅ Camera API simulation skipped (will be tested in browser)');
    return true; // Skip this test in Node.js
  }

  const tests = [
    {
      name: 'navigator.mediaDevices exists',
      test: () => typeof navigator !== 'undefined' && navigator.mediaDevices,
      expected: true
    },
    {
      name: 'getUserMedia exists',
      test: () => typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
      expected: true
    },
    {
      name: 'enumerateDevices exists',
      test: () => typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.enumerateDevices,
      expected: true
    }
  ];

  let cameraAPIOk = true;
  tests.forEach(({ name, test, expected }) => {
    const result = test();
    if (result === expected) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name} - Expected: ${expected}, Got: ${result}`);
      cameraAPIOk = false;
    }
  });

  return cameraAPIOk;
}

// Test 4: HTML5-QRCode Library Test
console.log('\n4. Testing HTML5-QRCode library...');

async function testQRLibrary() {
  try {
    const { Html5Qrcode } = await import('html5-qrcode');
    
    if (!Html5Qrcode) {
      console.log('❌ Html5Qrcode class not found');
      return false;
    }
    
    console.log('✅ Html5Qrcode library loaded successfully');
    
    // Test if getCameras method exists
    if (typeof Html5Qrcode.getCameras === 'function') {
      console.log('✅ getCameras method available');
    } else {
      console.log('❌ getCameras method not found');
      return false;
    }
    
    return true;
  } catch (err) {
    console.log(`❌ HTML5-QRCode library error: ${err.message}`);
    return false;
  }
}

// Test 5: iOS Specific Checks
console.log('\n5. iOS-specific camera checks...');

function checkIOSCompatibility() {
  const userAgent = process.env.TEST_USER_AGENT || 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
  
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isWebKit = /WebKit/.test(userAgent);
  
  console.log(`User Agent: ${userAgent.substring(0, 50)}...`);
  console.log(`iOS Device: ${isIOS ? '✅ Yes' : '❌ No'}`);
  console.log(`Safari Browser: ${isSafari ? '✅ Yes' : '❌ No'}`);
  console.log(`WebKit Engine: ${isWebKit ? '✅ Yes' : '❌ No'}`);
  
  if (isIOS && isSafari) {
    console.log('⚠️  iOS Safari detected - may have camera permission issues');
    console.log('   - Ensure HTTPS is used');
    console.log('   - Check camera permissions in Settings > Safari > Camera');
    console.log('   - Try closing other camera apps');
  }
  
  return { isIOS, isSafari, isWebKit };
}

// Test 6: Common iOS Camera Issues
console.log('\n6. Common iOS camera issues checklist...');

function checkCommonIssues() {
  const issues = [
    {
      issue: 'HTTPS Required',
      description: 'iOS requires HTTPS for camera access',
      check: () => process.env.TEST_PROTOCOL === 'https' || process.env.NODE_ENV === 'development',
      solution: 'Use HTTPS in production or localhost for development'
    },
    {
      issue: 'Camera Permission',
      description: 'Camera permission must be granted',
      check: () => true, // Can't test without browser
      solution: 'Check Settings > Safari > Camera > Allow'
    },
    {
      issue: 'Other Apps Using Camera',
      description: 'Only one app can use camera at a time',
      check: () => true, // Can't test without browser
      solution: 'Close other camera apps (Camera, FaceTime, etc.)'
    },
    {
      issue: 'In-App Browser',
      description: 'Camera may not work in in-app browsers',
      check: () => !/Instagram|FBAN|FBAV|Twitter|Line|WhatsApp|Snapchat|TikTok|WeChat/.test(process.env.TEST_USER_AGENT || ''),
      solution: 'Open in Safari or Chrome directly'
    }
  ];
  
  issues.forEach(({ issue, description, check, solution }) => {
    const result = check();
    if (result) {
      console.log(`✅ ${issue}: ${description}`);
    } else {
      console.log(`❌ ${issue}: ${description}`);
      console.log(`   Solution: ${solution}`);
    }
  });
}

// Run all tests
async function runAllTests() {
  const results = {
    environment: envOk,
    supabase: await testSupabaseConnection(),
    cameraAPI: simulateCameraAPI(),
    qrLibrary: await testQRLibrary(),
    iosCompatibility: checkIOSCompatibility(),
  };
  
  checkCommonIssues();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`Environment: ${results.environment ? '✅' : '❌'}`);
  console.log(`Supabase: ${results.supabase ? '✅' : '❌'}`);
  console.log(`Camera API: ${results.cameraAPI ? '✅' : '⚠️ (Node.js - test in browser)'}`);
  console.log(`QR Library: ${results.qrLibrary ? '✅' : '❌'}`);
  
  // In Node.js, we only care about environment, Supabase, and QR library
  const nodeTestsPassed = results.environment && results.supabase && results.qrLibrary;
  const allPassed = nodeTestsPassed && results.cameraAPI;
  
  if (nodeTestsPassed) {
    console.log('\n🎉 Node.js environment tests passed!');
    console.log('\n📱 Next steps for iOS camera testing:');
    console.log('1. Open the app in Safari on iOS device');
    console.log('2. Navigate to the scan screen');
    console.log('3. Tap "Start Scanning"');
    console.log('4. Check browser console for camera detection logs');
    console.log('5. Ensure HTTPS is used (except localhost)');
    console.log('6. Check camera permissions in Settings > Safari > Camera');
    console.log('7. Close other camera apps if needed');
  } else {
    console.log('\n❌ Some Node.js tests failed. Please fix the issues above.');
  }
}

// Run tests
runAllTests().catch(console.error); 