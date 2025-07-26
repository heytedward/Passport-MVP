/**
 * Monarch Rewards Hook
 * PapillonLabs Monarch Passport MVP
 * 
 * This hook combines static rewards configuration with limited edition tracking
 * to provide a unified interface for reward management.
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import MONARCH_REWARDS, { RewardUtils } from '../config/monarchRewards';
import { useLimitedEditions } from './useLimitedEditions';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export const useMonarchRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRewards, setUserRewards] = useState([]);
  const [userLoading, setUserLoading] = useState(true);

  // Use the limited editions hook
  const {
    activeLimitedEditions,
    userClaims,
    claimLimitedEdition,
    hasUserClaimed,
    getUserMintNumber,
    loading: limitedEditionLoading,
    error: limitedEditionError
  } = useLimitedEditions();

  // Load all rewards with limited edition status
  const loadRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allRewards = RewardUtils.getActiveRewards();
      const rewardsWithStatus = [];

      for (const reward of allRewards) {
        let limitedEditionStatus = null;

        // Check if this is a limited edition reward
        if (reward.limitedEdition) {
          // Find matching limited edition from the hook
          const limitedEdition = activeLimitedEditions.find(
            le => le.reward_id === reward.rewardId
          );
          
          if (limitedEdition) {
            limitedEditionStatus = {
              totalSupply: limitedEdition.total_supply,
              claimedCount: limitedEdition.claimed_count,
              availableCount: limitedEdition.available_count,
              claimPercentage: limitedEdition.claim_percentage,
              daysRemaining: limitedEdition.days_remaining,
              isActive: true
            };
          }
        }

        rewardsWithStatus.push({
          ...reward,
          limitedEditionStatus,
          isLimitedEdition: !!reward.limitedEdition,
          userHasClaimed: hasUserClaimed(reward.rewardId),
          userMintNumber: getUserMintNumber(reward.rewardId),
          totalWingsValue: RewardUtils.getTotalWingsValue(reward.rewardId),
          shopifyUrl: RewardUtils.getShopifyUrl(reward.rewardId),
          primaryImage: RewardUtils.getPrimaryImage(reward.rewardId)
        });
      }

      setRewards(rewardsWithStatus);
    } catch (err) {
      console.error('Error loading rewards:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeLimitedEditions, hasUserClaimed, getUserMintNumber]);

  // Load user's rewards from closet
  const loadUserRewards = useCallback(async () => {
    try {
      setUserLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUserRewards([]);
        return;
      }

      const { data, error } = await supabase
        .from('user_closet')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_date', { ascending: false });

      if (error) throw error;

      // Enhance user rewards with static configuration data
      const enhancedUserRewards = (data || []).map(userReward => {
        const staticReward = RewardUtils.getRewardById(userReward.reward_id);
        return {
          ...userReward,
          staticData: staticReward,
          isLimitedEdition: staticReward?.limitedEdition ? true : false,
          totalWingsValue: staticReward ? RewardUtils.getTotalWingsValue(staticReward.rewardId) : userReward.wings_earned,
          shopifyUrl: staticReward ? RewardUtils.getShopifyUrl(staticReward.rewardId) : null,
          primaryImage: staticReward ? RewardUtils.getPrimaryImage(staticReward.rewardId) : null
        };
      });

      setUserRewards(enhancedUserRewards);
    } catch (err) {
      console.error('Error loading user rewards:', err);
      setError(err.message);
    } finally {
      setUserLoading(false);
    }
  }, []);

  // Claim a reward (handles both regular and limited edition)
  const claimReward = useCallback(async (rewardId, qrScanLocation = null) => {
    try {
      setError(null);
      
      const reward = RewardUtils.getRewardById(rewardId);
      if (!reward) {
        throw new Error(`Reward not found: ${rewardId}`);
      }

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Handle limited edition claims
      if (reward.limitedEdition) {
        return await claimLimitedEdition(rewardId, qrScanLocation);
      }

      // Handle regular reward claims
      const { data, error } = await supabase
        .from('user_closet')
        .insert({
          user_id: user.id,
          reward_id: rewardId,
          name: reward.name,
          rarity: reward.rarity,
          category: reward.category,
          mint_number: 1, // Regular items don't have mint numbers
          earned_date: new Date().toISOString(),
          earned_via: 'qr_scan',
          wings_earned: reward.wingsValue,
          metadata: {
            qr_scan_location: qrScanLocation,
            static_reward_id: rewardId
          }
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('You have already claimed this reward');
        }
        throw error;
      }

      // Award WINGS
      await supabase
        .from('user_profiles')
        .update({
          wings_balance: supabase.raw('wings_balance + ?', [reward.wingsValue]),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Refresh user rewards
      await loadUserRewards();

      return {
        success: true,
        message: `Successfully claimed ${reward.name}!`,
        reward: data
      };
    } catch (err) {
      console.error('Error claiming reward:', err);
      setError(err.message);
      return {
        success: false,
        message: err.message
      };
    }
  }, [claimLimitedEdition, loadUserRewards]);

  // Get rewards by category
  const getRewardsByCategory = useCallback((category) => {
    return rewards.filter(reward => reward.category === category);
  }, [rewards]);

  // Get rewards by rarity
  const getRewardsByRarity = useCallback((rarity) => {
    return rewards.filter(reward => reward.rarity === rarity);
  }, [rewards]);

  // Get limited edition rewards
  const getLimitedEditionRewards = useCallback(() => {
    return rewards.filter(reward => reward.isLimitedEdition);
  }, [rewards]);

  // Get regular rewards
  const getRegularRewards = useCallback(() => {
    return rewards.filter(reward => !reward.isLimitedEdition);
  }, [rewards]);

  // Get user's limited edition claims
  const getUserLimitedEditions = useCallback(() => {
    return userRewards.filter(reward => reward.isLimitedEdition);
  }, [userRewards]);

  // Get user's regular rewards
  const getUserRegularRewards = useCallback(() => {
    return userRewards.filter(reward => !reward.isLimitedEdition);
  }, [userRewards]);

  // Check if user can claim a reward
  const canUserClaim = useCallback((rewardId) => {
    const reward = rewards.find(r => r.rewardId === rewardId);
    if (!reward) return false;

    // Check if user already claimed
    if (reward.userHasClaimed) return false;

    // Check if limited edition is available
    if (reward.isLimitedEdition && reward.limitedEditionStatus) {
      return reward.limitedEditionStatus.availableCount > 0;
    }

    return true;
  }, [rewards]);

  // Get reward statistics
  const getRewardStats = useCallback(() => {
    const totalRewards = rewards.length;
    const limitedEditions = getLimitedEditionRewards().length;
    const regularRewards = getRegularRewards().length;
    const userTotalRewards = userRewards.length;
    const userLimitedEditions = getUserLimitedEditions().length;
    const userRegularRewards = getUserRegularRewards().length;

    const totalWingsValue = rewards.reduce((sum, reward) => sum + reward.totalWingsValue, 0);
    const userTotalWings = userRewards.reduce((sum, reward) => sum + (reward.totalWingsValue || 0), 0);

    return {
      totalRewards,
      limitedEditions,
      regularRewards,
      totalWingsValue,
      userTotalRewards,
      userLimitedEditions,
      userRegularRewards,
      userTotalWings,
      claimPercentage: totalRewards > 0 ? (userTotalRewards / totalRewards) * 100 : 0
    };
  }, [rewards, userRewards, getLimitedEditionRewards, getRegularRewards, getUserLimitedEditions, getUserRegularRewards]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  useEffect(() => {
    loadUserRewards();
  }, [loadUserRewards]);

  return {
    // Data
    rewards,
    userRewards,
    loading: loading || limitedEditionLoading,
    userLoading,
    error: error || limitedEditionError,
    
    // Actions
    claimReward,
    refresh: () => {
      loadRewards();
      loadUserRewards();
    },
    
    // Filtered data
    getRewardsByCategory,
    getRewardsByRarity,
    getLimitedEditionRewards,
    getRegularRewards,
    getUserLimitedEditions,
    getUserRegularRewards,
    
    // Utilities
    canUserClaim,
    getRewardStats,
    getRewardById: RewardUtils.getRewardById,
    
    // Limited edition specific
    hasUserClaimed,
    getUserMintNumber,
    
    // Computed values
    totalRewards: rewards.length,
    userTotalRewards: userRewards.length,
    stats: getRewardStats()
  };
};

// Hook for admin functions
export const useMonarchRewardsAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize limited editions from static configuration
  const initializeLimitedEditions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { initializeLimitedEditions: initFunction } = await import('../utils/rewardIntegration');
      const results = await initFunction();

      return {
        success: true,
        results
      };
    } catch (err) {
      console.error('Error initializing limited editions:', err);
      setError(err.message);
      return {
        success: false,
        message: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync static rewards with database
  const syncStaticRewards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { syncStaticRewards: syncFunction } = await import('../utils/rewardIntegration');
      const results = await syncFunction();

      return {
        success: true,
        results
      };
    } catch (err) {
      console.error('Error syncing static rewards:', err);
      setError(err.message);
      return {
        success: false,
        message: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate reward configuration
  const validateConfiguration = useCallback(async () => {
    try {
      const { validateRewardConfiguration: validateFunction } = await import('../utils/rewardIntegration');
      return validateFunction();
    } catch (err) {
      console.error('Error validating configuration:', err);
      return {
        errors: [err.message],
        warnings: [],
        isValid: false
      };
    }
  }, []);

  // Get analytics
  const getAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { getRewardAnalytics: analyticsFunction } = await import('../utils/rewardIntegration');
      const analytics = await analyticsFunction();

      return {
        success: true,
        analytics
      };
    } catch (err) {
      console.error('Error getting analytics:', err);
      setError(err.message);
      return {
        success: false,
        message: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    initializeLimitedEditions,
    syncStaticRewards,
    validateConfiguration,
    getAnalytics
  };
}; 