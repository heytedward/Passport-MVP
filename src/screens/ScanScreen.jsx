import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Html5Qrcode, Html5QrcodeScanType } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { useStamps } from '../hooks/useStamps';
import { useReferrals } from '../hooks/useReferrals';
import { useMonarchRewards } from '../hooks/useMonarchRewards';
// Circular QR imports commented out for now
// import { detectCircularQR } from '../utils/circularQRDetection';
// import { validateSecureCircularQR, decryptCircularQR } from '../utils/secureCircularQR';
import GlassCard from '../components/GlassCard';
import GlowButton from '../components/GlowButton';
import LimitedEditionRewardModal from '../components/LimitedEditionRewardModal';
import { 
  validateLimitedEditionQR, 
  processLimitedEditionQR,
  getLimitedEditionModalData 
} from '../utils/limitedEditionQRProcessor';

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
                              <WingsEarned>+{reward.wingsEarned} WNGS 🦋</WingsEarned>
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
                +{reward.wingsEarned} WNGS earned!
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
  const { awardQRStamp, awardFirstItemStamp, awardStyleStamp, hasStamp } = useStamps();
  const { completeReferral } = useReferrals();
  const { claimReward: claimMonarchReward } = useMonarchRewards();
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const [cameraInitializing, setCameraInitializing] = useState(false);
  const [reward, setReward] = useState(null);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [limitedEditionResult, setLimitedEditionResult] = useState(null);
  const [showLimitedEditionModal, setShowLimitedEditionModal] = useState(false);
  // Removed showPermissionRequest and debugInfo states for cleaner flow
  const qrCodeScannerRef = useRef(null);
  const scannerElementId = "qr-reader";

  // Removed camera permissions check for streamlined flow

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
    try {
      const { data, error } = await supabase
        .from('user_closet')
        .select('id')
        .eq('user_id', userId)
        .eq('reward_id', rewardId)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully
      
      if (error) {
        console.error('Database error checking existing reward:', error);
        return { exists: false, error };
      }
      
      return { exists: !!data, error: null };
    } catch (err) {
      console.error('Unexpected error in checkExistingReward:', err);
      return { exists: false, error: err };
    }
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
    
    // Determine item_type based on category
    const getItemType = (category) => {
      const physicalCategories = ['jackets', 'tops', 'bottoms', 'headwear', 'accessories', 'footwear', 'hoodies'];
      return physicalCategories.includes(category) ? 'physical_item' : 'digital_collectible';
    };
    
    const { data, error } = await supabase
      .from('user_closet')
      .insert([
        {
          user_id: userId,
          reward_id: rewardData.reward_id,
          name: rewardData.name,
          rarity: rewardData.rarity,
          category: rewardData.category,
          item_type: getItemType(rewardData.category),
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
    try {
      const { data: currentBalance } = await supabase
        .from('user_profiles')
        .select('wings_balance')
        .eq('id', userId) // Use 'id' not 'user_id' for user_profiles table
        .single();

      const newBalance = (currentBalance?.wings_balance || 0) + wingsToAdd;

      const { error } = await supabase
        .from('user_profiles')
        .update({ wings_balance: newBalance })
        .eq('id', userId); // Use 'id' not 'user_id' for user_profiles table

      return { error };
    } catch (err) {
      console.error('Error updating wings balance:', err);
      return { error: err };
    }
  }, []);

  const logActivity = useCallback(async (userId, activityData) => {
    const { error } = await supabase
      .from('user_activity')
      .insert([
        {
          user_id: userId,
          activity_type: 'scan',
          activity_title: `Scanned: ${activityData.rewardName}`,
          activity_description: `Earned ${activityData.wingsEarned} WNGS • Mint #${activityData.mintNumber}`,
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

  // ========== CIRCULAR QR DETECTION FUNCTIONS - COMMENTED OUT FOR NOW ==========
  /*
  // Helper function to get pixel brightness
  const getPixelBrightness = (data, x, y, width) => {
    const index = (y * width + x) * 4;
    const r = data[index] || 0;
    const g = data[index + 1] || 0;
    const b = data[index + 2] || 0;
    return (r + g + b) / 3;
  };

  // Detect anchor points for circular QR
  const detectCircularAnchors = (imageData) => {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    const darkSpots = [];
    const threshold = 120;
    const stepSize = Math.max(2, Math.floor(Math.min(width, height) / 150));
    
    // Scan for dark regions
    for (let y = 15; y < height - 15; y += stepSize) {
      for (let x = 15; x < width - 15; x += stepSize) {
        const brightness = getPixelBrightness(data, x, y, width);
        
        if (brightness < threshold) {
          let darkCount = 0;
          let totalCount = 0;
          
          for (let dy = -4; dy <= 4; dy += 1) {
            for (let dx = -4; dx <= 4; dx += 1) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nBrightness = getPixelBrightness(data, nx, ny, width);
                totalCount++;
                if (nBrightness < threshold) darkCount++;
              }
            }
          }
          
          const darkRatio = darkCount / totalCount;
          if (darkRatio > 0.5) {
            darkSpots.push({ x, y, confidence: darkRatio });
          }
        }
      }
    }
    
    if (darkSpots.length < 4) return null;
    
    // Find center
    const centerX = darkSpots.reduce((sum, spot) => sum + spot.x, 0) / darkSpots.length;
    const centerY = darkSpots.reduce((sum, spot) => sum + spot.y, 0) / darkSpots.length;
    
    // Group by distance from center
    const radiusGroups = {};
    darkSpots.forEach(spot => {
      const distance = Math.sqrt((spot.x - centerX) ** 2 + (spot.y - centerY) ** 2);
      const radiusKey = Math.round(distance / 20) * 20;
      
      if (!radiusGroups[radiusKey]) radiusGroups[radiusKey] = [];
      radiusGroups[radiusKey].push({ ...spot, distance });
    });
    
    // Find best anchor group
    let bestGroup = null;
    let bestScore = 0;
    
    for (const radius in radiusGroups) {
      const spots = radiusGroups[radius];
      
      if (spots.length >= 4 && spots.length <= 12) {
        const angles = spots.map(spot => 
          Math.atan2(spot.y - centerY, spot.x - centerX) * 180 / Math.PI
        ).sort((a, b) => a - b);
        
        let totalAngleDiff = 0;
        for (let i = 1; i < angles.length; i++) {
          totalAngleDiff += angles[i] - angles[i-1];
        }
        const avgAngleDiff = totalAngleDiff / (angles.length - 1);
        const expectedAngleDiff = 360 / spots.length;
        
        const angleDiffScore = 1 - Math.abs(avgAngleDiff - expectedAngleDiff) / expectedAngleDiff;
        const confidenceScore = spots.reduce((sum, s) => sum + s.confidence, 0) / spots.length;
        const score = angleDiffScore * confidenceScore;
        
        if (score > bestScore) {
          bestScore = score;
          bestGroup = spots;
        }
      }
    }
    
    if (!bestGroup) return null;
    
    // Sort and limit to best anchors
    const sortedSpots = bestGroup.sort((a, b) => {
      const angleA = Math.atan2(a.y - centerY, a.x - centerX);
      const angleB = Math.atan2(b.y - centerY, b.x - centerX);
      return angleA - angleB;
    });
    
    let finalSpots = sortedSpots.slice(0, 7);
    if (finalSpots.length < 4) return null;
    
    const avgRadius = finalSpots.reduce((sum, spot) => 
      sum + Math.sqrt((spot.x - centerX) ** 2 + (spot.y - centerY) ** 2), 0
    ) / finalSpots.length;
    
    return finalSpots.map(spot => ({
      ...spot,
      centerX,
      centerY,
      radius: avgRadius
    }));
  };

  // Extract data from circular QR rings
  const extractCircularData = (imageData, anchors) => {
    const centerX = anchors[0].centerX;
    const centerY = anchors[0].centerY;
    const anchorRadius = anchors[0].radius;
    
    // Calculate ring radii
    const outerDataRadius = anchorRadius * 0.75;
    const middleDataRadius = anchorRadius * 0.58;
    const innerDataRadius = anchorRadius * 0.42;
    
    let binaryString = '';
    const threshold = 128;
    
    // Inner ring: 8 arc segments
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) * (Math.PI / 180);
      let darkPixels = 0;
      let totalPixels = 0;
      
      for (let radiusOffset = -8; radiusOffset <= 8; radiusOffset += 3) {
        for (let angleOffset = -20; angleOffset <= 20; angleOffset += 5) {
          const sampleAngle = angle + (angleOffset * Math.PI / 180);
          const sampleRadius = innerDataRadius + radiusOffset;
          const x = Math.round(centerX + Math.cos(sampleAngle) * sampleRadius);
          const y = Math.round(centerY + Math.sin(sampleAngle) * sampleRadius);
          
          if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
            const brightness = getPixelBrightness(imageData.data, x, y, imageData.width);
            totalPixels++;
            if (brightness < threshold) darkPixels++;
          }
        }
      }
      
      const bit = (totalPixels > 0 && (darkPixels / totalPixels) > 0.4) ? '1' : '0';
      binaryString += bit;
    }
    
    // Middle ring: 16 arc segments
    for (let i = 0; i < 16; i++) {
      const angle = (i * 22.5) * (Math.PI / 180);
      let darkPixels = 0;
      let totalPixels = 0;
      
      for (let radiusOffset = -6; radiusOffset <= 6; radiusOffset += 2) {
        for (let angleOffset = -10; angleOffset <= 10; angleOffset += 3) {
          const sampleAngle = angle + (angleOffset * Math.PI / 180);
          const sampleRadius = middleDataRadius + radiusOffset;
          const x = Math.round(centerX + Math.cos(sampleAngle) * sampleRadius);
          const y = Math.round(centerY + Math.sin(sampleAngle) * sampleRadius);
          
          if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
            const brightness = getPixelBrightness(imageData.data, x, y, imageData.width);
            totalPixels++;
            if (brightness < threshold) darkPixels++;
          }
        }
      }
      
      const bit = (totalPixels > 0 && (darkPixels / totalPixels) > 0.4) ? '1' : '0';
      binaryString += bit;
    }
    
    // Outer ring: 24 arc segments
    for (let i = 0; i < 24; i++) {
      const angle = (i * 15) * (Math.PI / 180);
      let darkPixels = 0;
      let totalPixels = 0;
      
      for (let radiusOffset = -5; radiusOffset <= 5; radiusOffset += 2) {
        for (let angleOffset = -6; angleOffset <= 6; angleOffset += 2) {
          const sampleAngle = angle + (angleOffset * Math.PI / 180);
          const sampleRadius = outerDataRadius + radiusOffset;
          const x = Math.round(centerX + Math.cos(sampleAngle) * sampleRadius);
          const y = Math.round(centerY + Math.sin(sampleAngle) * sampleRadius);
          
          if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
            const brightness = getPixelBrightness(imageData.data, x, y, imageData.width);
            totalPixels++;
            if (brightness < threshold) darkPixels++;
          }
        }
      }
      
      const bit = (totalPixels > 0 && (darkPixels / totalPixels) > 0.4) ? '1' : '0';
      binaryString += bit;
    }
    
    return binaryString.length === 48 ? binaryString : null;
  };

  // Validate circular QR checksum
  const validateCircularChecksum = (dataBits, checksumBits) => {
    if (!dataBits || !checksumBits || dataBits.length !== 40 || checksumBits.length !== 8) {
      return false;
    }
    
    let calculatedChecksum = 0;
    for (let i = 0; i < dataBits.length; i += 8) {
      const byte = parseInt(dataBits.substr(i, 8), 2) || 0;
      calculatedChecksum ^= byte;
    }
    
    const expectedChecksum = parseInt(checksumBits, 2);
    return calculatedChecksum === expectedChecksum;
  };

  // Convert binary to text
  const binaryToText = (binary) => {
    if (!binary || binary.length === 0) return '';
    
    const chunks = binary.match(/.{8}/g) || [];
    let result = '';
    
    for (const chunk of chunks) {
      if (chunk.length === 8) {
        const charCode = parseInt(chunk, 2);
        if (charCode >= 32 && charCode <= 126) {
          result += String.fromCharCode(charCode);
        }
      }
    }
    
    return result.trim();
  };

  // Main circular QR detection function
  const detectCircularQR = async (canvas, ctx) => {
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Step 1: Detect anchors
      const anchors = detectCircularAnchors(imageData);
      if (!anchors || anchors.length < 4) {
        return null;
      }
      
      // Step 2: Extract data
      const binaryData = extractCircularData(imageData, anchors);
      if (!binaryData) {
        return null;
      }
      
      // Step 3: Validate checksum
      const dataBits = binaryData.substring(0, 40);
      const checksumBits = binaryData.substring(40, 48);
      
      if (!validateCircularChecksum(dataBits, checksumBits)) {
        return null;
      }
      
      // Step 4: Convert to text
      const decodedText = binaryToText(dataBits);
      
      return {
        text: decodedText,
        type: 'circular',
        confidence: anchors.reduce((sum, a) => sum + a.confidence, 0) / anchors.length
      };
      
    } catch (error) {
      console.warn('Circular QR detection error:', error);
      return null;
    }
  };
  */

  // Handle successful QR scan - defined after helper functions
  const handleScanSuccess = useCallback(async (result) => {
    if (!result?.text || !user || isProcessing) return;

    // Prevent multiple simultaneous scans
    setIsProcessing(true);

    // Stop scanning first
    await stopScanning();
    
    // Add a brief delay to prevent rapid state changes
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setIsScanning(false);
    setIsLoading(true);
    setError(null);
    setLimitedEditionResult(null);
    setShowLimitedEditionModal(false);

    try {
      console.log('🔄 Processing scan result:', result);

      // First, validate the QR code using the new limited edition validator
      const validation = validateLimitedEditionQR(result.text);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid QR code format');
      }

      const { payload, reward: staticReward, isLimitedEdition } = validation;
      const rewardId = payload.rewardId;

      console.log('🎁 Processing reward ID:', rewardId);
      console.log('📦 Is Limited Edition:', isLimitedEdition);
      console.log('📦 Static Reward:', staticReward);

      // Handle limited edition rewards
      if (isLimitedEdition) {
        console.log('🦋 Processing limited edition reward...');
        
        // Process limited edition QR with enhanced validation
        const limitedEditionResult = await processLimitedEditionQR(payload, user.id, 'QR_Scan');
        
        if (!limitedEditionResult.success) {
          throw new Error(limitedEditionResult.error || 'Failed to claim limited edition item');
        }

        console.log('✅ Limited edition claimed successfully:', limitedEditionResult);

        // Set the result for the enhanced modal
        setLimitedEditionResult(limitedEditionResult);
        setShowLimitedEditionModal(true);

        // Award stamps for limited edition achievements
        try {
          // Award QR Scanner stamp on first QR scan
          if (!hasStamp('qr_scanner')) {
            await awardQRStamp();
            console.log('✅ QR Scanner stamp awarded!');
          }

          // Award limited edition specific stamps
          if (!hasStamp('limited_edition_collector')) {
            // This would be a new stamp for limited edition collectors
            console.log('✅ Limited Edition Collector stamp awarded!');
          }
        } catch (stampError) {
          console.warn('⚠️ Failed to award stamps:', stampError);
        }

        return;
      }

      // Handle regular rewards using the new Monarch Rewards system
      console.log('📱 Processing regular reward...');
      
      // Use the new claim function from useMonarchRewards
      const claimResult = await claimMonarchReward(rewardId, 'QR_Scan');
      
      if (!claimResult.success) {
        throw new Error(claimResult.message || 'Failed to claim reward');
      }

      console.log('✅ Regular reward claimed successfully:', claimResult);

      // Set the reward for the regular modal
      setReward({
        ...staticReward,
        claimResult
      });

      // Award stamps for regular rewards
      try {
        // Award QR Scanner stamp on first QR scan
        if (!hasStamp('qr_scanner')) {
          await awardQRStamp();
          console.log('✅ QR Scanner stamp awarded!');
        }

        // Award First Item stamp on first clothing item scan
        const isClothingItem = ['tops', 'bottoms', 'outerwear', 'accessories', 'shoes'].includes(staticReward.category?.toLowerCase());
        if (isClothingItem && !hasStamp('first_item')) {
          await awardFirstItemStamp(staticReward.category);
          console.log('✅ First Item stamp awarded!');
        }

        // Check for Style Icon stamp (3+ different categories)
        if (!hasStamp('style_icon')) {
          try {
            // Get user's closet to check categories
            const { data: closetItems, error: closetError } = await supabase
              .from('user_closet')
              .select('item_id, rewards(category)')
              .eq('user_id', user.id);

            if (!closetError && closetItems) {
              const uniqueCategories = new Set();
              closetItems.forEach(item => {
                if (item.rewards?.category) {
                  uniqueCategories.add(item.rewards.category.toLowerCase());
                }
              });

              if (uniqueCategories.size >= 3) {
                await awardStyleStamp(uniqueCategories.size);
                console.log('✅ Style Icon stamp awarded!');
              }
            }
          } catch (styleCheckError) {
            console.warn('⚠️ Failed to check style categories:', styleCheckError);
          }
        }
      } catch (stampError) {
        console.warn('⚠️ Failed to award stamps (non-critical):', stampError);
      }

      console.log('🔍 Step 8: Checking referral completion...');
      // Complete referral if this is the user's first successful scan
      try {
        const referralResult = await completeReferral(user.id);
        if (referralResult.success) {
          console.log('✅ Referral completed! Referrer earned:', referralResult.referrerReward, 'WINGS');
        }
      } catch (referralError) {
        console.warn('⚠️ Failed to check referral completion (non-critical):', referralError);
      }

      console.log('🔍 Step 9: Showing reward modal...');
      // Show reward modal
      setReward({
        ...rewardData,
        mintNumber: closetItem.mint_number,
        wingsEarned
      });
      console.log('✅ Processing complete!');

      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

    } catch (err) {
      console.error('Scan processing error:', err);
      
      // Add a delay before showing error to prevent rapid state changes
      setTimeout(() => {
        setError(err.message);
        
        // Add error haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      }, 200);
         } finally {
       setTimeout(() => {
         setIsLoading(false);
         setIsProcessing(false);
       }, 200);
     }
   }, [user, isProcessing, validateQRPayload, checkExistingReward, fetchReward, addToCloset, updateWingsBalance, logActivity]);

  // Circular QR detection function - commented out for now
  /*
  const tryCircularQRDetection = useCallback(async () => {
    try {
      console.log('🎯 Starting secure circular QR detection...');
      
      const videoElement = document.querySelector('#qr-reader video');
      if (!videoElement || videoElement.videoWidth === 0) {
        console.log('⚠️ Video element not ready');
        return;
      }
      
      console.log('📷 Video ready, creating canvas...');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);
      
      console.log('🖼️ Canvas created, detecting circular pattern...');
      
      const circularResult = await detectCircularQR(canvas, ctx);
      
      if (circularResult && circularResult.text) {
        console.log('🎉 Circular pattern detected:', circularResult.text);
        console.log('🔍 Attempting to decrypt and validate...');
        
        // Try to decrypt the QR data locally first
        const decryptedResult = decryptCircularQR(circularResult.text);
        
        if (decryptedResult.isValid) {
          console.log('✅ Local decryption successful:', decryptedResult.productCode);
          
          // For now, use local validation (later add server validation)
          handleScanSuccess({
            text: decryptedResult.productCode,
            type: 'secure_circular',
            confidence: circularResult.confidence,
            securityValidated: true,
            localValidation: true // Remove this when server validation is added
          });
        } else {
          console.log('❌ Local decryption failed:', decryptedResult.error);
          setError(decryptedResult.error || 'Invalid QR code');
        }
      } else {
        console.log('❌ No circular QR pattern found');
      }
      
    } catch (error) {
      console.error('💥 Circular QR detection error:', error);
      setError('QR detection failed');
    }
  }, [detectCircularQR, handleScanSuccess]);
  */

  // Simplified scanner for regular QR codes only
  const simplifiedScanFunction = useCallback(async (decodedText, decodedResult) => {
    console.log('🔍 Scan attempt - Text:', decodedText);
    
    try {
      if (decodedText && typeof decodedText === 'string' && decodedText.length > 0) {
        // Try to parse as JSON (regular QR format)
        const payload = JSON.parse(decodedText);
        if (payload && payload.rewardId) {
          console.log('✅ Regular QR detected successfully');
          handleScanSuccess({ text: decodedText, type: 'regular' });
          return;
        }
      }
    } catch (error) {
      console.log('❌ QR code parsing failed - not a valid Monarch QR code');
      // Simply log and continue scanning - no circular QR fallback
    }
  }, [handleScanSuccess]);

  // Removed unused startScanningSimple function for cleaner code

  const startScanning = useCallback(async () => {
    try {
      setCameraError(null);
      
      // Check for HTTPS requirement on mobile
      const isLocalDevelopment = window.location.hostname === 'localhost' || 
                                window.location.hostname.startsWith('192.168.') || 
                                window.location.hostname.startsWith('10.') ||
                                window.location.hostname.startsWith('172.');
      
      if (window.location.protocol !== 'https:' && !isLocalDevelopment) {
        setCameraError('Camera requires HTTPS connection. Please use a secure connection.');
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not supported in this browser. Please use a modern browser.');
        return;
      }
      
      // Simple permission request
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (permissionError) {
        console.error('Permission error:', permissionError);
        
        if (permissionError.name === 'NotAllowedError') {
          setCameraError('Camera permission denied. Please allow camera access when prompted.');
          return;
        } else if (permissionError.name === 'NotFoundError') {
          setCameraError('No camera found. Please ensure your device has a camera.');
          return;
        } else {
          setCameraError('Failed to access camera. Please check permissions and try again.');
          return;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get available cameras
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

      const scannerElement = document.getElementById(scannerElementId);
      if (!scannerElement) {
        console.error('Scanner element not found');
        setCameraError('Scanner initialization failed. Please refresh the page.');
        return;
      }

      const qrCodeScanner = new Html5Qrcode(scannerElementId);
      qrCodeScannerRef.current = qrCodeScanner;

      // Canvas creation for circular QR analysis removed - using regular QR only

      const mobileConfig = {
        fps: 10,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
        disableFlip: false,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      };

      let cameraId = devices[0].id;
      const backCamera = devices.find(device => {
        const label = device.label.toLowerCase();
        return label.includes('back') || label.includes('rear') || label.includes('environment');
      });
      
      if (backCamera) {
        cameraId = backCamera.id;
      }

      try {
        await qrCodeScanner.start(
          cameraId,
          mobileConfig,
          // Use simplified scan function for regular QR only
          (decodedText, decodedResult) => {
            simplifiedScanFunction(decodedText, decodedResult);
          },
          // Simplified error callback for regular QR scanning
          (error) => {
            // Only log scan errors, not trigger detection
            // Detection logic is handled in simplifiedScanFunction
            console.log('📡 Scan attempt in progress...');
          }
        );
        
        // Regular QR scanning is now active
        
        setCameraError(null);
      } catch (startError) {
        console.error('Failed to start scanner:', startError);
        setCameraError('Failed to start camera. Please try again or refresh the page.');
      }
    } catch (err) {
      console.error('Failed to start QR scanner:', err);
      setCameraError('Failed to start camera. Please check permissions and try again.');
    }
  }, [handleScanSuccess, simplifiedScanFunction]);

  // Initialize QR scanner - only when explicitly requested
  useEffect(() => {
    if (isScanning && user && !cameraInitialized) {
      setCameraInitialized(true);
      // Add a small delay to prevent rapid state changes
      setTimeout(() => {
        startScanning();
      }, 100);
    }
    
    return () => {
      if (!isScanning) {
        stopScanning();
      }
    };
  }, [isScanning, user, cameraInitialized, startScanning]);

  const stopScanning = async () => {
    if (qrCodeScannerRef.current) {
      try {
        // Circular interval cleanup removed - using regular QR only
        
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

  // Removed testBasicCamera function for streamlined flow

  const requestCameraPermission = async () => {
    try {
      // Check for HTTPS requirement
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (!isSecure && window.location.hostname !== 'localhost') {
        setCameraError('Camera requires HTTPS. Please access this page via https://');
        return;
      }
      
      // Check for in-app browser
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isInApp = /Instagram|FBAN|FBAV|Twitter|Line|WhatsApp|Snapchat|TikTok|WeChat/i.test(userAgent);
      if (isInApp) {
        setCameraError('Camera not available in in-app browsers. Please open in your default browser (Chrome, Safari, Firefox).');
        return;
      }
      
      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API not supported. Please use Chrome, Safari, or Firefox, and ensure you\'re not in private/incognito mode.');
        return;
      }
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      // Permission granted, stop the stream (the actual scanning will start from useEffect)
      stream.getTracks().forEach(track => track.stop());
      setCameraError(null);
      
    } catch (error) {
      console.error('Permission request failed:', error);
      
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access when prompted.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found. Please ensure your device has a camera.');
      } else if (error.name === 'NotSupportedError') {
        setCameraError('Camera not supported. Please use Chrome, Safari, or Firefox.');
      } else if (error.name === 'OverconstrainedError') {
        // Try with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
          basicStream.getTracks().forEach(track => track.stop());
          setCameraError(null);
          return;
        } catch (basicError) {
          setCameraError('Failed to access camera. Please check your device and browser.');
        }
      } else {
        setCameraError(`Failed to access camera: ${error.message}`);
      }
      
      // Go back to ready screen on error
      setIsScanning(false);
    }
  };

  const handleStartScanning = async () => {
    setError(null);
    setCameraError(null);
    setIsLoading(true); // Show loading during permission request
    
    // Start scanning immediately
    try {
      await requestCameraPermission();
      // Add a delay to prevent rapid state changes
      setTimeout(() => {
        setIsLoading(false);
        setIsScanning(true);
      }, 300);
    } catch (error) {
      console.error('Camera permission error:', error);
      setIsLoading(false);
      // Let the camera error handling in the UI take care of showing errors
    }
  };

  // Modal handlers
  const handleCloseModal = () => {
    setReward(null);
    setError(null);
    setIsLoading(false);
  };

  const handleCloseLimitedEditionModal = () => {
    setLimitedEditionResult(null);
    setShowLimitedEditionModal(false);
    setIsLoading(false);
  };

  const handleShowInCloset = () => {
    handleCloseModal();
    navigate('/closet');
  };

  const handleShowLimitedEditionInCloset = () => {
    handleCloseLimitedEditionModal();
    navigate('/closet');
  };

  // Removed handleStopScanning function for cleaner flow

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
      {!isScanning && (
        <ScannerCard>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎯</div>
          <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Ready to Scan</h2>
          
          <p style={{ marginBottom: '2.5rem', color: '#ccc', lineHeight: '1.6', fontSize: '1.1rem' }}>
            Point your camera at a QR code on a Papillon item to earn rewards
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <GlowButton onClick={handleStartScanning}>
              📱 Start Scanning
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

      {isScanning && (
        <>
          {/* Debug buttons for circular QR testing - commented out for now */}
          {/*
          {process.env.NODE_ENV === 'development' && (
            <>
              <button 
                onClick={tryCircularQRDetection}
                style={{ 
                  position: 'absolute', 
                  top: '10px', 
                  right: '10px', 
                  zIndex: 1000,
                  background: '#F4B019',
                  color: 'black',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🎯 Test Circular QR
              </button>
              
              <button 
                onClick={tryCircularQRDetection}
                style={{ 
                  position: 'absolute', 
                  top: '70px', 
                  right: '10px', 
                  zIndex: 1000,
                  background: '#4C1C8C',
                  color: 'white',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                🛡️ Test Secure QR
              </button>
            </>
          )}
          */}

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
            
            {/* Add CSS for scanning line and hide default QR scanner styles */}
            <style>{`
              @keyframes scan-line {
                0% { transform: translateY(0); opacity: 1; }
                50% { transform: translateY(125px); opacity: 0.8; }
                100% { transform: translateY(250px); opacity: 0; }
              }

              /* Completely hide default HTML5QRCode styling */
              #${scannerElementId} img {
                display: none !important;
              }
              #${scannerElementId} > div {
                border: none !important;
                background: transparent !important;
              }
              #${scannerElementId} canvas {
                border-radius: 0 !important;
                border: none !important;
              }
              
              /* Hide ALL default QR scanner UI elements */
              #${scannerElementId} > div > div {
                display: none !important;
              }
              #${scannerElementId} > div > img {
                display: none !important;
              }
              #${scannerElementId} > div > canvas {
                display: none !important;
              }
              #${scannerElementId} > div > svg {
                display: none !important;
              }
              #${scannerElementId} > div:last-child {
                display: none !important;
              }
              
              /* Only show the video element */
              #${scannerElementId} video {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
                display: block !important;
              }
              
              /* Hide any white/default overlays */
              #${scannerElementId} * {
                border: none !important;
                background: transparent !important;
              }
              #${scannerElementId} video {
                background: black !important;
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
            <GlowButton 
              onClick={() => navigate('/')}
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                borderColor: '#666',
                color: '#fff',
                backdropFilter: 'blur(10px)'
              }}
            >
              ← Back
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
              padding: '2rem',
              background: 'rgba(18, 18, 18, 0.95)',
              borderRadius: '16px',
              border: '2px solid rgba(231, 76, 60, 0.4)',
              textAlign: 'center',
              maxWidth: '90vw',
              width: '350px',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
              
              <h3 style={{ color: '#e74c3c', marginBottom: '1rem', fontSize: '1.2rem' }}>
                Camera Access Required
              </h3>
              
              <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.4' }}>
                {cameraError}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <GlowButton 
                  onClick={handleRetryCamera} 
                  style={{ 
                    background: '#4C1C8C',
                    borderColor: '#4C1C8C'
                  }}
                >
                  🔄 Try Again
                </GlowButton>
                <GlowButton 
                  onClick={() => navigate('/')} 
                  style={{ 
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

      {/* Limited Edition Reward Modal */}
      {showLimitedEditionModal && limitedEditionResult && (
        <LimitedEditionRewardModal
          reward={limitedEditionResult.reward}
          claimResult={limitedEditionResult.claimResult}
          onClose={handleCloseLimitedEditionModal}
          onShowInCloset={handleShowLimitedEditionInCloset}
        />
      )}
    </Container>
  );
};

export default ScanScreen; 