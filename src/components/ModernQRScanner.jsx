import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import styled from 'styled-components';

const ScannerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VideoElement = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  
  /* Critical iOS Safari fixes */
  -webkit-playsinline: true;
  playsinline: true;
  autoplay: true;
  muted: true;
  
  /* Hardware acceleration */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
`;

const CanvasElement = styled.canvas`
  display: none;
`;

const Overlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  pointer-events: none;
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: 2px solid #4C1C8C;
    border-radius: 12px;
    background: linear-gradient(45deg, 
      #4C1C8C 0%, transparent 25%, transparent 75%, #FFB000 100%);
    animation: scan-border 2s linear infinite;
  }
  
  @keyframes scan-border {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const ModernQRScanner = ({ onScanSuccess, onScanError, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState({
    videoWidth: 0,
    videoHeight: 0,
    frameCount: 0,
    lastScanAttempt: null
  });

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up QR scanner...');
    
    // Stop animation loop
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔌 Video track stopped');
      });
      streamRef.current = null;
    }
    
    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  }, []);

  // Initialize camera
  const initializeCamera = useCallback(async (retryCount = 0) => {
    try {
      console.log(`📱 Initializing camera... (attempt ${retryCount + 1})`);
      setError(null);
      
      // Check for iOS Safari and adjust constraints
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // For testing on problematic devices, try simpler constraints:
      // const constraints = { video: true };
      
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: isIOS ? 1280 : 1920, max: 1920 },
          height: { ideal: isIOS ? 720 : 1080, max: 1080 }
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        console.log('⚠️ Failed with complex constraints, trying simpler ones...');
        // Fallback to simpler constraints for problematic devices
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // iOS Safari specific setup
        if (isIOS) {
          videoRef.current.setAttribute('playsinline', '');
          videoRef.current.setAttribute('muted', '');
          videoRef.current.setAttribute('autoplay', '');
          videoRef.current.playsInline = true;
          videoRef.current.muted = true;
        }
        
        // Ensure video element is properly configured for mobile
        videoRef.current.load();
        
        // Additional mobile-specific setup
        if (isIOS) {
          // iOS Safari specific attributes
          videoRef.current.setAttribute('webkit-playsinline', '');
          videoRef.current.setAttribute('x-webkit-airplay', 'allow');
        }
        
        // Wait for video to load with extended timeout for mobile devices
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Camera initialization timeout - video did not load within 10 seconds'));
          }, 10000); // Increased to 10 seconds for mobile devices
          
          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve();
          };
          videoRef.current.onerror = (error) => {
            clearTimeout(timeout);
            reject(error);
          };
        });
        
        console.log('✅ Camera initialized successfully');
        
        // Additional check to ensure video stream is working
        if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          console.log(`📹 Video stream active: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          setIsScanning(true);
          startScanning();
        } else {
          console.warn('⚠️ Video stream initialized but no dimensions available');
          // Still try to start scanning - dimensions might be available later
          setIsScanning(true);
          startScanning();
        }
      }
    } catch (err) {
      console.error('❌ Camera initialization failed:', err);
      let errorMessage = 'Failed to access camera. ';
      
      if (err && err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions.';
      } else if (err && err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err && err.name === 'NotReadableError') {
        errorMessage += 'Camera is busy. Close other camera apps.';
      } else if (err && err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please check your device and try again.';
      }
      
      setError(errorMessage);
      onScanError?.({ message: errorMessage, originalError: err });
      
      // Retry with different strategies
      if (retryCount === 0) {
        if (err?.name === 'NotAllowedError') {
          console.log('🔄 Retrying camera initialization (permission issue)...');
          setTimeout(() => initializeCamera(1), 1000);
        } else if (err?.message?.includes('timeout')) {
          console.log('🔄 Retrying camera initialization (timeout issue)...');
          setTimeout(() => initializeCamera(1), 2000);
        } else if (err?.name === 'NotFoundError' || err?.name === 'NotReadableError') {
          console.log('🔄 Retrying camera initialization (device issue)...');
          setTimeout(() => initializeCamera(1), 3000);
        }
      }
    }
  }, [onScanError]);

  // QR scanning loop
  const startScanning = useCallback(() => {
    let frameCount = 0;
    
    const scan = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Additional safety checks for video element
      if (!video || !canvas) {
        console.warn('⚠️ Video or canvas element not available');
        return;
      }
      
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.warn('⚠️ Canvas context not available');
        return;
      }

      // Wait for video to have data and dimensions
      if (video.readyState >= video.HAVE_METADATA && video.videoWidth > 0 && video.videoHeight > 0) {
        frameCount++;
        
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data for QR detection
        let imageData;
        try {
          imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          if (!imageData || !imageData.data) {
            console.warn('⚠️ Invalid image data received');
            return;
          }
        } catch (err) {
          console.warn('⚠️ Error getting image data:', err);
          return;
        }
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev,
          videoWidth: video?.videoWidth || 0,
          videoHeight: video?.videoHeight || 0,
          frameCount: frameCount,
          lastScanAttempt: new Date().toISOString()
        }));
        
        // Log every 30 frames (about once per second) for debugging
        if (frameCount % 30 === 0) {
          console.log('🔍 Scanning frame:', frameCount, 'Video size:', video?.videoWidth || 0, 'x', video?.videoHeight || 0, 'Canvas size:', canvas.width, 'x', canvas.height);
        }
        
        // Attempt QR code detection with multiple options
        let qrCode = null;
        
        try {
          // Try standard detection first
          qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert"
          });
          
          // If no QR found, try with inversion
          if (!qrCode) {
            qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth"
            });
          }
          
          // If still no QR found, try with different options
          if (!qrCode) {
            qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "onlyInvert"
            });
          }
        } catch (qrError) {
          console.warn('⚠️ Error during QR detection:', qrError);
          // Continue scanning even if QR detection fails
          // Don't call onScanError here as this is not a critical error
        }

        if (qrCode && qrCode.data) {
          console.log('🎯 QR Code detected:', qrCode.data);
          console.log('QR Code details:', {
            data: qrCode.data,
            location: qrCode?.location,
            version: qrCode?.version,
            errorCorrectionLevel: qrCode?.errorCorrectionLevel
          });
          
          setScanCount(prev => prev + 1);
          
          // Vibration feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
          
          onScanSuccess?.(qrCode.data, qrCode);
          return; // Stop scanning after successful detection
        }
      }

      // Continue scanning
      animationRef.current = requestAnimationFrame(scan);
    };

    scan();
  }, [isScanning, onScanSuccess]);

  // Component lifecycle
  useEffect(() => {
    initializeCamera();
    
    return cleanup;
  }, [initializeCamera, cleanup]);

  // Handle component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <ScannerContainer>
      <VideoElement 
        ref={videoRef} 
        playsInline 
        muted 
        autoPlay
      />
      <CanvasElement ref={canvasRef} />
      
      {isScanning && <Overlay />}
      
      {/* Error overlay */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '90vw',
          zIndex: 20
        }}>
          <h3>Camera Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => initializeCamera(0)}
            style={{
              background: '#4C1C8C',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              marginRight: '12px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'white',
              border: '1px solid white',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      )}
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 15
        }}>
          Scans: {scanCount} | Status: {isScanning ? 'Active' : 'Inactive'}
          <br />
          Video: {debugInfo.videoWidth}x{debugInfo.videoHeight}
          <br />
          Frames: {debugInfo.frameCount}
          <br />
          <button
            onClick={() => {
              console.log('🧪 Manual test triggered');
              onScanSuccess?.('test_manual_scan', { data: 'test_manual_scan' });
            }}
            style={{
              background: 'rgba(255, 176, 0, 0.8)',
              color: 'black',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            Test Scan
          </button>
        </div>
      )}
      
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: 'none',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 15
        }}
      >
        ×
      </button>
    </ScannerContainer>
  );
};

export default ModernQRScanner;
