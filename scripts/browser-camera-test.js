/**
 * Browser Camera Test Script
 * 
 * Run this in the browser console to test camera detection on iOS devices.
 * Copy and paste this entire script into the browser console.
 */

console.log('🔍 Monarch Passport - Browser Camera Test\n');

// Test 1: Browser Environment
console.log('1. Checking browser environment...');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

console.log(`iOS Device: ${isIOS ? '✅ Yes' : '❌ No'}`);
console.log(`Safari Browser: ${isSafari ? '✅ Yes' : '❌ No'}`);
console.log(`HTTPS/SSL: ${isHTTPS ? '✅ Yes' : '❌ No'}`);

// Test 2: Camera API Availability
console.log('\n2. Testing camera API availability...');

const cameraAPITests = [
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
cameraAPITests.forEach(({ name, test, expected }) => {
  const result = test();
  if (result === expected) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name} - Expected: ${expected}, Got: ${result}`);
    cameraAPIOk = false;
  }
});

// Test 3: Camera Permission Status
console.log('\n3. Testing camera permission status...');

async function testCameraPermission() {
  try {
    // Check if we can enumerate devices (this works without permission)
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    console.log(`Found ${videoDevices.length} camera device(s)`);
    
    if (videoDevices.length === 0) {
      console.log('❌ No camera devices found');
      return false;
    }
    
    // Check if devices have labels (indicates permission granted)
    const devicesWithLabels = videoDevices.filter(device => device.label && device.label.length > 0);
    const devicesWithoutLabels = videoDevices.filter(device => !device.label || device.label.length === 0);
    
    console.log(`Devices with labels (permission granted): ${devicesWithLabels.length}`);
    console.log(`Devices without labels (permission needed): ${devicesWithoutLabels.length}`);
    
    if (devicesWithLabels.length > 0) {
      console.log('✅ Camera permission appears to be granted');
      return true;
    } else {
      console.log('⚠️ Camera permission not granted - will need to request');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error checking camera devices: ${error.message}`);
    return false;
  }
}

// Test 4: Request Camera Permission
console.log('\n4. Testing camera permission request...');

async function testCameraRequest() {
  try {
    console.log('Requesting camera permission...');
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    
    console.log('✅ Camera permission granted successfully!');
    console.log(`Stream active: ${stream.active}`);
    console.log(`Video tracks: ${stream.getVideoTracks().length}`);
    
    // Stop the stream immediately
    stream.getTracks().forEach(track => {
      track.stop();
      console.log(`Stopped track: ${track.label}`);
    });
    
    return true;
    
  } catch (error) {
    console.log(`❌ Camera permission request failed: ${error.name} - ${error.message}`);
    
    if (error.name === 'NotAllowedError') {
      console.log('💡 Solution: Allow camera access when prompted');
    } else if (error.name === 'NotFoundError') {
      console.log('💡 Solution: Ensure device has a camera');
    } else if (error.name === 'NotReadableError') {
      console.log('💡 Solution: Close other camera apps (Camera, FaceTime, etc.)');
    } else if (error.name === 'OverconstrainedError') {
      console.log('💡 Solution: Try with different camera constraints');
    } else if (error.name === 'NotSupportedError') {
      console.log('💡 Solution: Use a supported browser (Safari, Chrome, Firefox)');
    }
    
    return false;
  }
}

// Test 5: HTML5-QRCode Library Test
console.log('\n5. Testing HTML5-QRCode library...');

async function testQRLibrary() {
  try {
    // Check if the library is loaded in the page
    if (typeof window.Html5Qrcode !== 'undefined') {
      console.log('✅ Html5Qrcode library found in window object');
      return true;
    }
    
    // Try to import it dynamically
    const { Html5Qrcode } = await import('html5-qrcode');
    
    if (!Html5Qrcode) {
      console.log('❌ Html5Qrcode class not found');
      return false;
    }
    
    console.log('✅ Html5Qrcode library loaded successfully');
    
    // Test if getCameras method exists
    if (typeof Html5Qrcode.getCameras === 'function') {
      console.log('✅ getCameras method available');
      
      // Try to get cameras
      try {
        const cameras = await Html5Qrcode.getCameras();
        console.log(`✅ getCameras() returned ${cameras.length} camera(s)`);
        return true;
      } catch (error) {
        console.log(`⚠️ getCameras() failed: ${error.message}`);
        console.log('This is expected on some iOS devices - fallback will be used');
        return true; // Still consider it a pass since we have fallback
      }
    } else {
      console.log('❌ getCameras method not found');
      return false;
    }
    
  } catch (err) {
    console.log(`❌ HTML5-QRCode library error: ${err.message}`);
    return false;
  }
}

// Test 6: In-App Browser Detection
console.log('\n6. Checking for in-app browser...');

function checkInAppBrowser() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isInApp = /Instagram|FBAN|FBAV|Twitter|Line|WhatsApp|Snapchat|TikTok|WeChat/i.test(userAgent);
  
  if (isInApp) {
    console.log('❌ In-app browser detected - camera may not work');
    console.log('💡 Solution: Open in Safari or Chrome directly');
    return false;
  } else {
    console.log('✅ Not in in-app browser');
    return true;
  }
}

// Run all tests
async function runBrowserTests() {
  console.log('\n🚀 Running browser camera tests...\n');
  
  const results = {
    environment: isHTTPS && (!isIOS || isSafari),
    cameraAPI: cameraAPIOk,
    permission: await testCameraPermission(),
    request: await testCameraRequest(),
    qrLibrary: await testQRLibrary(),
    inAppBrowser: checkInAppBrowser()
  };
  
  console.log('\n📊 Browser Test Results Summary:');
  console.log(`Environment (HTTPS + Browser): ${results.environment ? '✅' : '❌'}`);
  console.log(`Camera API Available: ${results.cameraAPI ? '✅' : '❌'}`);
  console.log(`Camera Permission Status: ${results.permission ? '✅' : '⚠️'}`);
  console.log(`Camera Permission Request: ${results.request ? '✅' : '❌'}`);
  console.log(`QR Library: ${results.qrLibrary ? '✅' : '❌'}`);
  console.log(`Not In-App Browser: ${results.inAppBrowser ? '✅' : '❌'}`);
  
  const criticalTests = results.environment && results.cameraAPI && results.qrLibrary && results.inAppBrowser;
  const permissionTests = results.permission || results.request;
  
  if (criticalTests && permissionTests) {
    console.log('\n🎉 All critical tests passed! Camera should work in the app.');
    console.log('\n📱 Next steps:');
    console.log('1. Navigate to the scan screen in the app');
    console.log('2. Tap "Start Scanning"');
    console.log('3. Camera should start successfully');
    console.log('4. Check console for detailed camera detection logs');
  } else if (criticalTests) {
    console.log('\n⚠️ Critical tests passed but permission issues detected.');
    console.log('\n💡 Solutions:');
    console.log('1. Allow camera permission when prompted');
    console.log('2. Check Settings > Safari > Camera > Allow');
    console.log('3. Close other camera apps');
    console.log('4. Refresh the page and try again');
  } else {
    console.log('\n❌ Critical tests failed. Camera may not work.');
    console.log('\n💡 Solutions:');
    if (!results.environment) console.log('- Use HTTPS or localhost');
    if (!results.cameraAPI) console.log('- Use a modern browser (Safari, Chrome, Firefox)');
    if (!results.qrLibrary) console.log('- Check if QR library is properly loaded');
    if (!results.inAppBrowser) console.log('- Open in Safari or Chrome directly, not in social media apps');
  }
}

// Auto-run the tests
runBrowserTests().catch(console.error);

// Export for manual testing
window.monarchCameraTest = {
  runTests: runBrowserTests,
  testPermission: testCameraPermission,
  testRequest: testCameraRequest,
  testQRLibrary: testQRLibrary
};

console.log('\n💡 You can also run individual tests:');
console.log('monarchCameraTest.testPermission()');
console.log('monarchCameraTest.testRequest()');
console.log('monarchCameraTest.testQRLibrary()'); 