/**
 * Limited Edition QR Processor
 * PapillonLabs Monarch Passport MVP
 * 
 * This module provides utilities for processing limited edition QR codes
 * with enhanced validation, atomic claiming, and proper error handling.
 */

import { createClient } from '@supabase/supabase-js';
import MONARCH_REWARDS, { RewardUtils } from '../config/monarchRewards';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/**
 * Check limited edition availability before claiming
 * @param {string} rewardId - The reward ID to check
 * @returns {Promise<Object>} Availability status and details
 */
export const checkLimitedEditionAvailability = async (rewardId) => {
  try {
    console.log(`🔍 Checking limited edition availability for: ${rewardId}`);

    // Get static reward configuration
    const staticReward = RewardUtils.getRewardById(rewardId);
    if (!staticReward) {
      return {
        available: false,
        error: 'Reward not found in configuration',
        reason: 'INVALID_REWARD'
      };
    }

    // Check if it's a limited edition
    if (!staticReward.limitedEdition) {
      return {
        available: true,
        isLimitedEdition: false,
        reward: staticReward,
        reason: 'REGULAR_REWARD'
      };
    }

    // Get limited edition status from database
    const { data, error } = await supabase
      .rpc('get_limited_edition_status', { p_reward_id: rewardId });

    if (error) {
      console.error('Error checking limited edition status:', error);
      return {
        available: false,
        error: 'Failed to check limited edition status',
        reason: 'DATABASE_ERROR'
      };
    }

    if (!data || data.length === 0) {
      return {
        available: false,
        error: 'Limited edition not found in database',
        reason: 'NOT_INITIALIZED'
      };
    }

    const status = data[0];
    const isAvailable = status.available_count > 0 && status.is_active;

    return {
      available: isAvailable,
      isLimitedEdition: true,
      reward: staticReward,
      status: {
        totalSupply: status.total_supply,
        claimedCount: status.claimed_count,
        availableCount: status.available_count,
        claimPercentage: status.claim_percentage,
        isActive: status.is_active,
        startDate: status.start_date,
        endDate: status.end_date,
        userHasClaimed: status.user_has_claimed,
        userMintNumber: status.user_mint_number
      },
      reason: isAvailable ? 'AVAILABLE' : 'EXHAUSTED'
    };
  } catch (error) {
    console.error('Error in checkLimitedEditionAvailability:', error);
    return {
      available: false,
      error: error.message,
      reason: 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Claim a limited edition item with atomic operations
 * @param {string} rewardId - The reward ID to claim
 * @param {string} userId - The user ID claiming the reward
 * @param {string} qrScanLocation - Optional QR scan location
 * @returns {Promise<Object>} Claim result with mint number and details
 */
export const claimLimitedEditionItem = async (rewardId, userId, qrScanLocation = null) => {
  try {
    console.log(`🎯 Claiming limited edition: ${rewardId} for user: ${userId}`);

    // Check availability first
    const availability = await checkLimitedEditionAvailability(rewardId);
    if (!availability.available) {
      return {
        success: false,
        error: availability.error,
        reason: availability.reason
      };
    }

    // Use the atomic claim function from the database
    const { data, error } = await supabase
      .rpc('claim_limited_edition_item', {
        p_reward_id: rewardId,
        p_user_id: userId,
        p_qr_scan_location: qrScanLocation
      });

    if (error) {
      console.error('Error claiming limited edition:', error);
      return {
        success: false,
        error: error.message,
        reason: 'CLAIM_FAILED'
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No response from claim function',
        reason: 'NO_RESPONSE'
      };
    }

    const result = data[0];
    
    if (!result.success) {
      return {
        success: false,
        error: result.message,
        reason: 'CLAIM_REJECTED'
      };
    }

    // Get the static reward data for additional details
    const staticReward = RewardUtils.getRewardById(rewardId);
    const totalWingsValue = RewardUtils.getTotalWingsValue(rewardId);

    return {
      success: true,
      mintNumber: result.mint_number,
      claimedAt: result.claimed_at,
      message: result.message,
      reward: staticReward,
      totalWingsValue,
      limitedEdition: staticReward?.limitedEdition,
      qrScanLocation
    };
  } catch (error) {
    console.error('Error in claimLimitedEditionItem:', error);
    return {
      success: false,
      error: error.message,
      reason: 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Process limited edition QR code with enhanced validation
 * @param {Object} qrData - QR code data object
 * @param {string} userId - The user ID processing the QR
 * @param {string} qrScanLocation - Optional QR scan location
 * @returns {Promise<Object>} Processing result
 */
export const processLimitedEditionQR = async (qrData, userId, qrScanLocation = null) => {
  try {
    console.log('🔄 Processing limited edition QR code:', qrData);

    // Validate QR data structure
    if (!qrData || !qrData.rewardId) {
      return {
        success: false,
        error: 'Invalid QR code data',
        reason: 'INVALID_QR_DATA'
      };
    }

    const rewardId = qrData.rewardId;

    // Check if reward exists in static configuration
    const staticReward = RewardUtils.getRewardById(rewardId);
    if (!staticReward) {
      return {
        success: false,
        error: 'Reward not found in configuration',
        reason: 'REWARD_NOT_FOUND'
      };
    }

    // Check if user is authenticated
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
        reason: 'NOT_AUTHENTICATED'
      };
    }

    // Check if user already claimed this reward
    const { data: existingClaim } = await supabase
      .from('limited_edition_claims')
      .select('id, mint_number')
      .eq('user_id', userId)
      .eq('limited_edition_id', 
        (await supabase
          .from('limited_edition_items')
          .select('id')
          .eq('reward_id', rewardId)
          .single()
        ).data?.id
      )
      .maybeSingle();

    if (existingClaim) {
      return {
        success: false,
        error: 'You have already claimed this limited edition item',
        reason: 'ALREADY_CLAIMED',
        existingClaim: {
          mintNumber: existingClaim.mint_number
        }
      };
    }

    // Check availability
    const availability = await checkLimitedEditionAvailability(rewardId);
    if (!availability.available) {
      return {
        success: false,
        error: availability.error,
        reason: availability.reason,
        status: availability.status
      };
    }

    // Claim the limited edition item
    const claimResult = await claimLimitedEditionItem(rewardId, userId, qrScanLocation);
    
    if (!claimResult.success) {
      return claimResult;
    }

    // Log activity for limited edition claim
    try {
      await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          activity_type: 'limited_edition_claim',
          activity_title: `Limited Edition: ${staticReward.name}`,
          activity_description: `Claimed mint #${claimResult.mintNumber} • ${claimResult.totalWingsValue} WINGS earned`,
          wings_earned: claimResult.totalWingsValue,
          reward_id: rewardId,
          metadata: {
            mintNumber: claimResult.mintNumber,
            limitedEditionId: rewardId,
            totalSupply: staticReward.limitedEdition.totalSupply,
            exclusivityLevel: staticReward.limitedEdition.exclusivityLevel,
            qrScanLocation
          }
        });
    } catch (activityError) {
      console.warn('Failed to log limited edition activity:', activityError);
    }

    return {
      success: true,
      reward: staticReward,
      claimResult,
      availability: availability.status
    };
  } catch (error) {
    console.error('Error in processLimitedEditionQR:', error);
    return {
      success: false,
      error: error.message,
      reason: 'PROCESSING_ERROR'
    };
  }
};

/**
 * Get enhanced reward modal data for limited edition items
 * @param {string} rewardId - The reward ID
 * @param {Object} claimResult - The claim result from processLimitedEditionQR
 * @returns {Object} Enhanced modal data
 */
export const getLimitedEditionModalData = (rewardId, claimResult = null) => {
  try {
    const staticReward = RewardUtils.getRewardById(rewardId);
    if (!staticReward) {
      return null;
    }

    const isLimitedEdition = !!staticReward.limitedEdition;
    const exclusivityLevel = staticReward.limitedEdition?.exclusivityLevel;
    const exclusivityInfo = RewardUtils.getExclusivityLevel(exclusivityLevel);

    return {
      reward: staticReward,
      isLimitedEdition,
      exclusivityInfo,
      claimResult,
      modalType: isLimitedEdition ? 'limited_edition' : 'regular',
      primaryImage: RewardUtils.getPrimaryImage(rewardId),
      shopifyUrl: RewardUtils.getShopifyUrl(rewardId),
      totalWingsValue: RewardUtils.getTotalWingsValue(rewardId),
      colors: RewardUtils.getMonarchColors()
    };
  } catch (error) {
    console.error('Error in getLimitedEditionModalData:', error);
    return null;
  }
};

/**
 * Validate QR code payload for limited edition compatibility
 * @param {string} qrText - Raw QR code text
 * @returns {Object} Validation result
 */
export const validateLimitedEditionQR = (qrText) => {
  try {
    const payload = JSON.parse(qrText);
    
    // Basic validation
    if (payload.type !== 'monarch_reward') {
      return {
        valid: false,
        error: 'Invalid QR code type',
        reason: 'INVALID_TYPE'
      };
    }

    if (!payload.rewardId) {
      return {
        valid: false,
        error: 'Missing reward ID',
        reason: 'MISSING_REWARD_ID'
      };
    }

    // Check if reward exists in static configuration
    const staticReward = RewardUtils.getRewardById(payload.rewardId);
    if (!staticReward) {
      return {
        valid: false,
        error: 'Reward not found in configuration',
        reason: 'REWARD_NOT_FOUND'
      };
    }

    // Check if reward is active
    if (!staticReward.isActive) {
      return {
        valid: false,
        error: 'Reward is not currently available',
        reason: 'REWARD_INACTIVE'
      };
    }

    // Check timestamp if present (prevent old QR codes)
    if (payload.timestamp && payload.timestamp < Date.now() - 86400000) { // 24 hours
      return {
        valid: false,
        error: 'QR code has expired',
        reason: 'EXPIRED'
      };
    }

    return {
      valid: true,
      payload,
      reward: staticReward,
      isLimitedEdition: !!staticReward.limitedEdition
    };
  } catch (error) {
    console.error('Error validating limited edition QR:', error);
    return {
      valid: false,
      error: 'Invalid QR code format',
      reason: 'INVALID_FORMAT'
    };
  }
};

/**
 * Get limited edition analytics for a specific reward
 * @param {string} rewardId - The reward ID
 * @returns {Promise<Object>} Analytics data
 */
export const getLimitedEditionAnalytics = async (rewardId) => {
  try {
    const { data, error } = await supabase
      .from('limited_edition_analytics')
      .select('*')
      .eq('reward_id', rewardId)
      .single();

    if (error) {
      console.error('Error fetching limited edition analytics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getLimitedEditionAnalytics:', error);
    return null;
  }
};

// Export utility functions
export const LimitedEditionQRProcessor = {
  checkLimitedEditionAvailability,
  claimLimitedEditionItem,
  processLimitedEditionQR,
  getLimitedEditionModalData,
  validateLimitedEditionQR,
  getLimitedEditionAnalytics
};

export default LimitedEditionQRProcessor; 