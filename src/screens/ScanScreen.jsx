import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import GlassCard from '../components/GlassCard';
import GlowButton from '../components/GlowButton';

// Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const rewardReveal = keyframes`
  0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
  50% { opacity: 1; transform: scale(1.1) rotate(5deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem 6rem 1rem;
`;

const ScannerCard = styled(GlassCard)`
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 18, 18, 0.3);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const RewardModal = styled(GlassCard)`
  padding: 3rem 2rem;
  text-align: center;
  animation: ${rewardReveal} 0.6s ease-out;
  max-width: 90vw;
  width: 400px;
`;

const RewardIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const RewardTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const WingsEarned = styled.div`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.accent.gold};
  font-weight: 600;
  margin-bottom: 2rem;
`;

const ErrorCard = styled(GlassCard)`
  padding: 2rem;
  text-align: center;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const ClaimButton = styled.button`
  background: ${props => props.claimed 
    ? 'linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%)'
    : 'linear-gradient(135deg, #4C1C8C 0%, #7F3FBF 50%, #9D4EDD 100%)'
  };
  color: ${props => props.claimed ? '#000' : '#FAFAFA'};
  border: 2px solid #FFB000;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const SecondaryButton = styled.button`
  background: transparent;
  color: #aaa;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.6rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const QuestUpdateBanner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  padding: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  z-index: 10;
`;

const CheckMark = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2.5rem;
  color: white;
`;

const EnhancedRewardModal = ({ reward, onClose, onShowInCloset, user }) => {
  const [claimState, setClaimState] = useState('unclaimed');
  const [questUpdate, setQuestUpdate] = useState(null);
  const [showQuestUpdate, setShowQuestUpdate] = useState(false);

  const checkQuestProgress = async (userId, rewardCategory) => {
    try {
      const { data: questData } = await supabase
        .from('user_quest_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      if (!questData || questData.length === 0) return null;

      const scanQuest = questData.find(q => 
        q.quest_type === 'scan_items' || 
        q.quest_type === 'scan_physical_items' ||
        (q.quest_type === 'scan_category' && q.category === rewardCategory)
      );

      if (scanQuest) {
        const newProgress = (scanQuest.current_progress || 0) + 1;
        const isCompleted = newProgress >= scanQuest.target_value;

        await supabase
          .from('user_quest_progress')
          .update({
            current_progress: newProgress,
            status: isCompleted ? 'completed' : 'active',
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', scanQuest.id);

        return {
          questName: scanQuest.quest_title || 'Scan 10 Papillon Items',
          oldProgress: scanQuest.current_progress || 0,
          newProgress,
          total: scanQuest.target_value || 10,
          completed: isCompleted
        };
      }

      return null;
    } catch (error) {
      console.warn('Failed to check quest progress:', error);
      return null;
    }
  };

  const handleClaim = async () => {
    if (!reward || !user) return;
    setClaimState('claiming');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const questProgress = await checkQuestProgress(user.id, reward.category);
      if (questProgress) {
        setQuestUpdate(questProgress);
        setShowQuestUpdate(true);
        setTimeout(() => setShowQuestUpdate(false), 4000);
      }
      
      setClaimState('claimed');
    } catch (error) {
      console.error('Claim processing failed:', error);
      setClaimState('unclaimed');
    }
  };

  const getItemIcon = (category) => {
    const icons = {
      jackets: '🧥', tops: '👕', bottoms: '👖', headwear: '🧢',
      accessories: '⛓️', footwear: '👟', themes: '🎨'
    };
    return icons[category] || '🎁';
  };

  if (!reward) return null;

  return (
    <LoadingOverlay>
      <RewardModal>
        {showQuestUpdate && questUpdate && (
          <QuestUpdateBanner>
            ⚡ Quest Progress: {questUpdate.questName} ({questUpdate.newProgress}/{questUpdate.total})
            {questUpdate.completed && ' - COMPLETED! 🎉'}
          </QuestUpdateBanner>
        )}
        
        {claimState === 'unclaimed' && (
          <>
            <RewardIcon>{getItemIcon(reward.category)}</RewardIcon>
            <RewardTitle>Reward Found!</RewardTitle>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{reward.name}</h3>
            <p style={{ color: '#aaa', marginBottom: '1rem' }}>
              {reward.rarity} • #{reward.mintNumber}
            </p>
            {reward.wingsEarned > 0 && (
              <WingsEarned>+{reward.wingsEarned} WINGS 🦋</WingsEarned>
            )}
            <ButtonContainer>
              <ClaimButton onClick={handleClaim}>🎁 Claim Reward</ClaimButton>
              <SecondaryButton onClick={onClose}>Close</SecondaryButton>
            </ButtonContainer>
          </>
        )}
        
        {claimState === 'claiming' && (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <RewardTitle>Processing your reward...</RewardTitle>
            <p style={{ color: '#aaa' }}>Adding to closet and updating progress</p>
          </>
        )}
        
        {claimState === 'claimed' && (
          <>
            <CheckMark>✓</CheckMark>
            <RewardTitle>Reward Claimed!</RewardTitle>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>{reward.name}</h3>
            <p style={{ color: '#10B981', marginBottom: '1rem' }}>
              Successfully added to your closet
            </p>
            {reward.wingsEarned > 0 && (
              <p style={{ color: '#FFB000', marginBottom: '2rem' }}>
                +{reward.wingsEarned} WINGS earned!
              </p>
            )}
            <ButtonContainer>
              <ClaimButton claimed={true} onClick={onShowInCloset}>
                👕 Show in Closet
              </ClaimButton>
              <SecondaryButton onClick={onClose}>
                Continue Scanning
              </SecondaryButton>
            </ButtonContainer>
          </>
        )}
      </RewardModal>
    </LoadingOverlay>
  );
};

const ScanScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const [reward, setReward] = useState(null);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const qrCodeScannerRef = useRef(null);
  const scannerElementId = "qr-reader";

  // Check camera permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user) return;
      
      try {
        // Check if permissions API is available
        if (navigator.permissions && navigator.permissions.query) {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' });
          
          if (permissionStatus.state === 'denied') {
            setShowPermissionRequest(true);
            return;
          }
        }
        
        // Check if camera is available
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Don't start scanning automatically, just check availability
          setDebugInfo('Camera available, ready to scan');
        } else {
          setCameraError('Camera not supported in this browser');
        }
      } catch (error) {
        console.log('Permissions API not supported, will request on scan start');
        setDebugInfo('Permissions check skipped - will request on scan start');
      }
    };
    
    checkPermissions();
  }, [user]);

  // Helper functions - defined first since handleScanSuccess depends on them
  const validateQRPayload = useCallback((data) => {
    try {
      const payload = JSON.parse(data);
      
      // Check required fields
      if (payload.type !== 'monarch_reward') return false;
      if (!payload.rewardId) return false;
      if (!payload.season) return false;
      
      // Check timestamp if present (prevent old QR codes)
      if (payload.timestamp && payload.timestamp < Date.now() - 86400000) { // 24 hours
        throw new Error('QR code has expired');
      }
      
      return true;
    } catch (error) {
      console.error('QR validation error:', error);
      return false;
    }
  }, []);

  const checkExistingReward = useCallback(async (rewardId, userId) => {
    const { data, error } = await supabase
      .from('user_closet')
      .select('id')
      .eq('user_id', userId)
      .eq('reward_id', rewardId)
      .single();
    
    return { exists: !!data, error };
  }, []);

  const fetchReward = useCallback(async (rewardId) => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('reward_id', rewardId)
      .single();
    
    return { data, error };
  }, []);

  const generateMintNumber = useCallback(async (rewardId) => {
    const { data, error } = await supabase
      .from('user_closet')
      .select('mint_number')
      .eq('reward_id', rewardId)
      .order('mint_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching mint numbers:', error);
      return Math.floor(Math.random() * 999) + 1; // Fallback to random
    }

    return (data?.mint_number || 0) + 1;
  }, []);

  const addToCloset = useCallback(async (rewardData, userId) => {
    const mintNumber = await generateMintNumber(rewardData.reward_id);
    
    const { data, error } = await supabase
      .from('user_closet')
      .insert([
        {
          user_id: userId,
          reward_id: rewardData.reward_id,
          name: rewardData.name,
          rarity: rewardData.rarity,
          category: rewardData.category,
          mint_number: mintNumber,
          earned_date: new Date().toISOString(),
          earned_via: 'qr_scan',
          wings_earned: rewardData.wings_value || 0
        }
      ])
      .select()
      .single();

    return { data, error };
  }, [generateMintNumber]);

  const updateWingsBalance = useCallback(async (userId, wingsToAdd) => {
    const { data: currentBalance } = await supabase
      .from('user_profiles')
      .select('wings_balance')
      .eq('user_id', userId)
      .single();

    const newBalance = (currentBalance?.wings_balance || 0) + wingsToAdd;

    const { error } = await supabase
      .from('user_profiles')
      .update({ wings_balance: newBalance })
      .eq('user_id', userId);

    return { error };
  }, []);

  const logActivity = useCallback(async (userId, activityData) => {
    const { error } = await supabase
      .from('user_activity')
      .insert([
        {
          user_id: userId,
          activity_type: 'scan',
          activity_title: `Scanned: ${activityData.rewardName}`,
          activity_description: `Earned ${activityData.wingsEarned} WINGS • Mint #${activityData.mintNumber}`,
          wings_earned: activityData.wingsEarned,
          reward_id: activityData.rewardId,
          metadata: {
            mintNumber: activityData.mintNumber,
            rarity: activityData.rarity,
            category: activityData.category
          }
        }
      ]);

    if (error) {
      console.warn('Failed to log activity:', error);
    }
  }, []);

  // Handle successful QR scan - defined after helper functions
  const handleScanSuccess = useCallback(async (result) => {
    if (!result?.text || !user) return;

    setIsScanning(false);
    setIsLoading(true);
    setError(null);

    try {
      // Validate QR payload
      if (!validateQRPayload(result.text)) {
        throw new Error('Invalid QR code. This is not a Monarch reward code.');
      }

      const payload = JSON.parse(result.text);
      
      // Check if user already owns this reward
      const { exists, error: checkError } = await checkExistingReward(payload.rewardId, user.id);
      if (checkError) throw new Error('Failed to verify reward status');
      
      if (exists) {
        throw new Error('You already own this reward!');
      }

      // Fetch reward details
      const { data: rewardData, error: fetchError } = await fetchReward(payload.rewardId);
      if (fetchError || !rewardData) {
        throw new Error('Reward not found or no longer available');
      }

      // Add to user's closet
      const { data: closetItem, error: closetError } = await addToCloset(rewardData, user.id);
      if (closetError) throw new Error('Failed to add reward to your closet');

      // Update WINGS balance
      const wingsEarned = rewardData.wings_value || 0;
      if (wingsEarned > 0) {
        const { error: wingsError } = await updateWingsBalance(user.id, wingsEarned);
        if (wingsError) console.warn('Failed to update WINGS balance');
      }

      // Log activity
      await logActivity(user.id, {
        rewardId: rewardData.reward_id,
        rewardName: rewardData.name,
        wingsEarned,
        mintNumber: closetItem.mint_number,
        rarity: rewardData.rarity,
        category: rewardData.category
      });

      // Show reward modal
      setReward({
        ...rewardData,
        mintNumber: closetItem.mint_number,
        wingsEarned
      });

      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

    } catch (err) {
      setError(err.message);
      
      // Add error haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
         } finally {
       setIsLoading(false);
     }
   }, [user, validateQRPayload, checkExistingReward, fetchReward, addToCloset, updateWingsBalance, logActivity]);

  // iOS-optimized fallback scanning
  const startScanningSimple = useCallback(async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      const qrCodeScanner = new Html5Qrcode(scannerElementId);
      qrCodeScannerRef.current = qrCodeScanner;

      // Ultra-simple config for iOS compatibility
      const simpleConfig = {
        fps: 5,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0
      };

      // Try with environment camera first, then any camera
      let cameraToUse = devices.find(d => d.id.includes('environment')) || devices[0];
      
      await qrCodeScanner.start(
        cameraToUse.id,
        simpleConfig,
        (decodedText) => {
          handleScanSuccess({ text: decodedText });
        },
        () => {}
      );
      
      setCameraError(null);
    } catch (err) {
      console.error('Simple scanning failed:', err);
      setCameraError('Camera not supported on this device. Please try using a different browser or device.');
    }
  }, [handleScanSuccess]);

  const startScanning = useCallback(async () => {
    try {
      // Clear any previous errors
      setCameraError(null);
      setDebugInfo('Starting camera initialization...');
      
      // Check for HTTPS requirement on iOS
      const isLocalDevelopment = window.location.hostname === 'localhost' || 
                                window.location.hostname.startsWith('192.168.') || 
                                window.location.hostname.startsWith('10.') ||
                                window.location.hostname.startsWith('172.');
      
      if (window.location.protocol !== 'https:' && !isLocalDevelopment) {
        setCameraError('Camera requires HTTPS connection. Please use a secure connection.');
        setDebugInfo('HTTPS check failed');
        return;
      }
      
      setDebugInfo(`Protocol: ${window.location.protocol}, Host: ${window.location.hostname}`);

              // Enhanced permission handling for mobile browsers
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          setDebugInfo('MediaDevices API available, requesting permission...');
          try {
            // Request permission with progressive fallback
            let stream;
            
            try {
              setDebugInfo('Trying optimal camera constraints...');
              // Try with optimal constraints first
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: { ideal: "environment" },
                  width: { min: 480, ideal: 720, max: 1920 },
                  height: { min: 480, ideal: 720, max: 1920 }
                }
              });
              setDebugInfo('Optimal constraints successful');
            } catch (constraintError) {
              console.warn('Optimal constraints failed, trying basic constraints:', constraintError);
              setDebugInfo('Optimal failed, trying basic constraints...');
              // Fallback to basic constraints
              stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
              });
              setDebugInfo('Basic constraints successful');
            }
            
            // Stop the stream immediately, we just needed permission
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
              setDebugInfo('Permission stream stopped, proceeding to scanner...');
            }
        } catch (permissionError) {
          console.error('Permission error:', permissionError);
          
          // Provide specific error messages based on error type
          if (permissionError.name === 'NotAllowedError') {
            setCameraError('Camera permission denied. Please allow camera access in your browser settings and refresh the page.');
          } else if (permissionError.name === 'NotFoundError') {
            setCameraError('No camera found. Please ensure your device has a camera.');
          } else if (permissionError.name === 'NotSupportedError') {
            setCameraError('Camera not supported in this browser. Try using Chrome, Safari, or Firefox.');
          } else {
            setCameraError('Failed to access camera. Please check permissions and try again.');
          }
          return;
        }
      } else {
        setCameraError('Camera API not supported in this browser. Please use a modern browser.');
        return;
      }

      // Wait a moment for DOM element to be ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if camera is available with retry logic
      let devices;
      try {
        devices = await Html5Qrcode.getCameras();
      } catch (deviceError) {
        console.error('Failed to get cameras:', deviceError);
        setCameraError('Failed to access camera devices. Please check permissions and try again.');
        return;
      }
      
      if (!devices || devices.length === 0) {
        setCameraError('No camera found. Please ensure your device has a camera and permissions are granted.');
        return;
      }

      // Ensure scanner element exists
      const scannerElement = document.getElementById(scannerElementId);
      if (!scannerElement) {
        console.error('Scanner element not found');
        setCameraError('Scanner initialization failed. Please refresh the page.');
        return;
      }

      const qrCodeScanner = new Html5Qrcode(scannerElementId);
      qrCodeScannerRef.current = qrCodeScanner;

      // Mobile-optimized config with progressive enhancement
      const baseConfig = {
        fps: 8, // Reduced for better mobile performance
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      };

      // Smart camera selection for mobile devices
      let cameraId;
      
      // Priority order for camera selection
      const backCamera = devices.find(device => {
        const label = device.label.toLowerCase();
        return (
          label.includes('back') || 
          label.includes('rear') ||
          label.includes('environment') ||
          label.includes('camera2') || // iOS sometimes uses this
          (label.includes('camera') && !label.includes('front') && !label.includes('user'))
        );
      });
      
      // Fallback to any available camera
      cameraId = backCamera?.id || devices[devices.length - 1]?.id || devices[0]?.id;
      
      if (!cameraId) {
        setCameraError('No suitable camera found. Please ensure your device has a working camera.');
        return;
      }

      console.log('Using camera:', devices.find(d => d.id === cameraId)?.label || cameraId);

      // Start scanning with error handling
      try {
        await qrCodeScanner.start(
          cameraId,
          baseConfig,
          (decodedText) => {
            console.log('QR Code scanned:', decodedText);
            handleScanSuccess({ text: decodedText });
          },
          (error) => {
            // Ignore normal scanning errors (no QR in view)
          }
        );
        
        console.log('QR Scanner started successfully');
      } catch (startError) {
        console.error('Failed to start scanner:', startError);
        throw startError;
      }
    } catch (err) {
      console.error('Failed to start QR scanner:', err);
      if (err.toString().includes('NotAllowedError') || err.toString().includes('Permission')) {
        setCameraError('Camera permission denied. Please allow camera access and refresh the page.');
      } else if (err.toString().includes('NotFoundError') || err.toString().includes('camera')) {
        setCameraError('No camera found. Please ensure your device has a camera.');
      } else if (err.toString().includes('NotSupportedError')) {
        setCameraError('Camera not supported on this device or browser.');
      } else if (err.toString().includes('OverconstrainedError')) {
        setCameraError('Camera constraints not supported. Trying with basic settings...');
        // Retry with simpler config
        setTimeout(() => startScanningSimple(), 1000);
      } else {
        setCameraError('Failed to start camera. Please check permissions and try again.');
      }
    }
  }, [handleScanSuccess, startScanningSimple]);

  // Initialize QR scanner - only when explicitly requested
  useEffect(() => {
    if (isScanning && user && !showPermissionRequest && !cameraInitialized) {
      setCameraInitialized(true);
      startScanning();
    }
    
    return () => {
      if (!isScanning) {
        stopScanning();
      }
    };
  }, [isScanning, user, showPermissionRequest, cameraInitialized, startScanning]);

  const stopScanning = async () => {
    if (qrCodeScannerRef.current) {
      try {
        await qrCodeScannerRef.current.stop();
        qrCodeScannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      qrCodeScannerRef.current = null;
    }
  };

  const handleTryAgain = () => {
    setError(null);
    setCameraError(null);
    setIsScanning(true);
  };

  const handleRetryCamera = () => {
    setCameraError(null);
    setIsScanning(false);
    setTimeout(() => setIsScanning(true), 100);
  };

  const testBasicCamera = async () => {
    try {
      setDebugInfo('Testing basic camera access...');
      
      // Test if camera API exists
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }
      
      // Test basic camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true 
      });
      
      setDebugInfo('Camera access successful! Creating video element...');
      
      // Create a simple video element to test
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.height = '300px';
      video.style.objectFit = 'cover';
      
      // Replace scanner content with video
      const scannerElement = document.getElementById(scannerElementId);
      if (scannerElement) {
        scannerElement.innerHTML = '';
        scannerElement.appendChild(video);
      }
      
      setCameraError(null);
      setDebugInfo('Camera test successful - video should be showing');
      
    } catch (error) {
      console.error('Basic camera test failed:', error);
      setDebugInfo(`Camera test failed: ${error.message}`);
      setCameraError(`Camera test failed: ${error.message}`);
    }
  };

  const requestCameraPermission = async () => {
    try {
      setShowPermissionRequest(false);
      setDebugInfo('Requesting camera permission...');
      
      // Add debug info about the current environment
      const isHTTPS = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const userAgent = navigator.userAgent;
      
      setDebugInfo(`Environment: ${isHTTPS ? 'HTTPS' : 'HTTP'}, ${isLocalhost ? 'Localhost' : 'Remote'}, UA: ${userAgent.slice(0, 50)}...`);
      
      // Request camera permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      // Permission granted, stop the stream and start scanning
      stream.getTracks().forEach(track => track.stop());
      setCameraError(null);
      setDebugInfo('Permission granted, starting scanner...');
      setIsScanning(true);
      
    } catch (error) {
      console.error('Permission request failed:', error);
      setDebugInfo(`Permission failed: ${error.name} - ${error.message}`);
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else {
        setCameraError('Failed to access camera. Please check your device and browser settings.');
      }
    }
  };

  const handleStartScanning = () => {
    setError(null);
    setCameraError(null);
    setIsScanning(true);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    setCameraInitialized(false);
    stopScanning();
  };

  if (!user) {
    return (
      <Container>
        <ScannerCard>
          <h2 style={{ marginBottom: '1.5rem' }}>Please log in to scan rewards</h2>
          <GlowButton onClick={() => navigate('/login')}>
            Go to Login
          </GlowButton>
        </ScannerCard>
      </Container>
    );
  }

  return (
    <Container>
      {!isScanning && !showPermissionRequest && (
        <ScannerCard>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📱</div>
          <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Ready to Scan</h2>
          <p style={{ marginBottom: '2rem', color: '#ccc', lineHeight: '1.6' }}>
            Point your camera at a QR code on a Papillon item to earn rewards and add items to your closet.
          </p>
          
          {debugInfo && (
            <div style={{ 
              background: 'rgba(0, 255, 0, 0.1)', 
              border: '1px solid rgba(0, 255, 0, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: '#0f0',
              textAlign: 'left',
              fontFamily: 'monospace'
            }}>
              Status: {debugInfo}
            </div>
          )}

          {cameraError && (
            <div style={{ 
              background: 'rgba(231, 76, 60, 0.1)', 
              border: '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#e74c3c',
              textAlign: 'left'
            }}>
              ⚠️ {cameraError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <GlowButton onClick={handleStartScanning}>
              🎯 Start Scanning
            </GlowButton>
            <GlowButton 
              onClick={() => navigate('/')}
              style={{ 
                background: 'transparent',
                borderColor: '#666',
                color: '#ccc'
              }}
            >
              Back to Home
            </GlowButton>
          </div>
        </ScannerCard>
      )}

      {!isScanning && !showPermissionRequest && (
        <ScannerCard>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📱</div>
          <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Ready to Scan</h2>
          <p style={{ marginBottom: '2rem', color: '#ccc', lineHeight: '1.6' }}>
            Point your camera at a QR code on a Papillon item to earn rewards and add items to your closet.
          </p>
          
          {debugInfo && (
            <div style={{ 
              background: 'rgba(0, 255, 0, 0.1)', 
              border: '1px solid rgba(0, 255, 0, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: '#0f0',
              textAlign: 'left',
              fontFamily: 'monospace'
            }}>
              Status: {debugInfo}
            </div>
          )}

          {cameraError && (
            <div style={{ 
              background: 'rgba(231, 76, 60, 0.1)', 
              border: '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#e74c3c',
              textAlign: 'left'
            }}>
              ⚠️ {cameraError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <GlowButton onClick={handleStartScanning}>
              🎯 Start Scanning
            </GlowButton>
            <GlowButton 
              onClick={() => navigate('/')}
              style={{ 
                background: 'transparent',
                borderColor: '#666',
                color: '#ccc'
              }}
            >
              Back to Home
            </GlowButton>
          </div>
        </ScannerCard>
      )}

      {isScanning && !showPermissionRequest && (
        <>
          {/* Title overlay */}
          <div style={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            textAlign: 'center',
            color: '#fff'
          }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Scan a Papillon Item</h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#aaa', fontSize: '1rem' }}>
              Point your camera at a QR code to earn rewards
            </p>
            {debugInfo && (
              <div style={{ 
                margin: '1rem 0 0 0', 
                fontSize: '0.7rem', 
                color: '#0f0',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '0.5rem',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>
                {debugInfo}
              </div>
            )}
          </div>

          {/* Camera container */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: '#000'
          }}>
            <div 
              id={scannerElementId} 
              style={{
                width: '100%',
                height: '100%'
              }}
            />
            
            {/* Aligned viewfinder overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '250px',
              height: '250px',
              pointerEvents: 'none',
              zIndex: 5,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px'
            }}>
              {/* Corner accents */}
              {/* Top-left */}
              <div style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                width: '40px',
                height: '40px',
                borderTop: '4px solid #4C1C8C',
                borderLeft: '4px solid #4C1C8C',
                borderTopLeftRadius: '12px'
              }} />
              {/* Top-right */}
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '40px',
                height: '40px',
                borderTop: '4px solid #FFB000',
                borderRight: '4px solid #FFB000',
                borderTopRightRadius: '12px'
              }} />
              {/* Bottom-left */}
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                left: '-2px',
                width: '40px',
                height: '40px',
                borderBottom: '4px solid #FFB000',
                borderLeft: '4px solid #FFB000',
                borderBottomLeftRadius: '12px'
              }} />
              {/* Bottom-right */}
              <div style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '40px',
                height: '40px',
                borderBottom: '4px solid #4C1C8C',
                borderRight: '4px solid #4C1C8C',
                borderBottomRightRadius: '12px'
              }} />
              
              {/* Scanning animation line */}
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #4C1C8C, transparent)',
                animation: 'scan-line 2s ease-in-out infinite'
              }} />
            </div>
            
            {/* Add CSS animation for scanning line */}
            <style>{`
              @keyframes scan-line {
                0% { transform: translateY(0); opacity: 1; }
                50% { transform: translateY(125px); opacity: 0.8; }
                100% { transform: translateY(250px); opacity: 0; }
              }
            `}</style>
          </div>

          {/* Cancel button */}
          <div style={{
            position: 'absolute',
            bottom: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10
          }}>
            <GlowButton onClick={() => navigate('/')}>
              Cancel
            </GlowButton>
          </div>

          {/* Camera error overlay */}
          {cameraError && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 15,
              padding: '1.5rem',
              background: 'rgba(18, 18, 18, 0.95)',
              borderRadius: '16px',
              border: '2px solid rgba(231, 76, 60, 0.4)',
              textAlign: 'center',
              maxWidth: '90vw',
              width: '350px',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📱</div>
              
              <h3 style={{ color: '#e74c3c', marginBottom: '1rem', fontSize: '1.1rem' }}>
                Camera Access Required
              </h3>
              
              <p style={{ color: '#ccc', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.4' }}>
                {cameraError}
              </p>
              
              {/* Mobile-specific instructions */}
              {/iPad|iPhone|iPod|Android/.test(navigator.userAgent) && (
                <div style={{ 
                  background: 'rgba(255, 193, 7, 0.15)', 
                  border: '1px solid rgba(255, 193, 7, 0.4)',
                  borderRadius: '12px',
                  padding: '1.2rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  color: '#ffc107',
                  textAlign: 'left'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center' }}>
                    📋 Mobile Tips:
                  </div>
                  <div style={{ lineHeight: '1.6' }}>
                    • Tap "Allow" when prompted for camera access<br/>
                    • Check browser settings if permission was denied<br/>
                    • Try refreshing the page<br/>
                    • Ensure you're not in Private/Incognito mode<br/>
                    • Make sure your camera isn't being used by another app
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <GlowButton 
                  onClick={handleRetryCamera} 
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '12px 20px',
                    background: '#4C1C8C',
                    borderColor: '#4C1C8C'
                  }}
                >
                  🔄 Retry Camera
                </GlowButton>
                <GlowButton 
                  onClick={() => window.location.reload()} 
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '12px 20px',
                    background: '#FFB000',
                    borderColor: '#FFB000',
                    color: '#000'
                  }}
                >
                  🔄 Refresh Page
                </GlowButton>
                <GlowButton 
                  onClick={() => navigate('/')} 
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '12px 20px',
                    background: 'transparent',
                    borderColor: '#666',
                    color: '#ccc'
                  }}
                >
                  ← Go Back
                </GlowButton>
              </div>
            </div>
          )}
        </>
      )}

      {error && (
        <ErrorCard>
          <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Scan Failed</h3>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <GlowButton onClick={handleTryAgain}>
              Try Again
            </GlowButton>
            <GlowButton onClick={() => navigate('/')}>
              Go Home
            </GlowButton>
          </div>
        </ErrorCard>
      )}

      {isLoading && (
        <LoadingOverlay>
          <ScannerCard>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <h3>Processing your reward...</h3>
          </ScannerCard>
        </LoadingOverlay>
      )}

      {reward && (
        <EnhancedRewardModal
          reward={reward}
          onClose={() => setReward(null)}
          onShowInCloset={() => {
            setReward(null);
            navigate('/closet');
          }}
          user={user}
        />
      )}
    </Container>
  );
};

export default ScanScreen; 