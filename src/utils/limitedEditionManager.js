/**
 * Limited Edition Manager
 * PapillonLabs Monarch Passport MVP
 * 
 * Comprehensive utility functions for checking and managing limited edition availability.
 * Includes analytics, user collections, and real-time availability tracking.
 */

import { supabase } from './supabaseClient.js';
import { validateUserId, validateQRData } from './inputValidation.js';
import { logSecurityEvent } from './securityMiddleware.js';

// TypeScript-style type definitions
/**
 * @typedef {Object} LimitedEditionAvailability
 * @property {boolean} available - Whether the item is currently available
 * @property {number} remainingCount - Number of items remaining
 * @property {number} totalSupply - Total supply of the limited edition
 * @property {number} claimedCount - Number of items already claimed
 * @property {boolean} isActive - Whether the limited edition is active
 * @property {Date|null} startDate - Start date of availability
 * @property {Date|null} endDate - End date of availability
 * @property {boolean} isExpired - Whether the limited edition has expired
 * @property {boolean} isNotStarted - Whether the limited edition hasn't started yet
 * @property {string} status - Human-readable status message
 * @property {string} rewardId - The reward ID
 */

/**
 * @typedef {Object} LimitedEditionStats
 * @property {number} totalSupply - Total supply of the limited edition
 * @property {number} claimedCount - Number of items already claimed
 * @property {number} remainingCount - Number of items remaining
 * @property {number} claimRate - Claim rate as percentage
 * @property {number} dailyClaimRate - Average daily claim rate
 * @property {Date} firstClaimDate - Date of first claim
 * @property {Date} lastClaimDate - Date of last claim
 * @property {number} averageTimeBetweenClaims - Average time between claims in hours
 * @property {Array} recentActivity - Recent claim activity
 * @property {Object} exclusivityBreakdown - Breakdown by exclusivity level
 */

/**
 * @typedef {Object} UserLimitedEditionItem
 * @property {string} id - Claim ID
 * @property {string} limitedEditionId - Limited edition item ID
 * @property {string} rewardId - Reward ID
 * @property {number} mintNumber - Mint number of the item
 * @property {Date} claimedAt - When the item was claimed
 * @property {string} qrScanLocation - Location where QR was scanned
 * @property {Object} limitedEditionInfo - Limited edition item information
 * @property {Object} staticRewardInfo - Static reward information
 * @property {string} exclusivityLevel - Exclusivity level
 * @property {number} totalSupply - Total supply
 */

/**
 * Check limited edition availability for a specific reward
 * @param {string} rewardId - The reward ID to check
 * @returns {Promise<LimitedEditionAvailability>} Availability status
 */
export async function checkLimitedEditionAvailability(rewardId) {
  try {
    // Input validation
    if (!rewardId || typeof rewardId !== 'string') {
      throw new Error('Invalid reward ID provided');
    }

    // Log security event
    logSecurityEvent({
      type: 'LIMITED_EDITION_AVAILABILITY_CHECK',
      rewardId,
      message: 'Checking limited edition availability'
    });

    // Query limited edition item
    const { data: limitedEditionItem, error } = await supabase
      .from('limited_edition_items')
      .select('*')
      .eq('reward_id', rewardId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No limited edition found for this reward
        return {
          available: false,
          remainingCount: 0,
          totalSupply: 0,
          claimedCount: 0,
          isActive: false,
          startDate: null,
          endDate: null,
          isExpired: false,
          isNotStarted: false,
          status: 'Not a limited edition item',
          rewardId
        };
      }
      throw error;
    }

    // Parse dates
    const startDate = limitedEditionItem.start_date ? new Date(limitedEditionItem.start_date) : null;
    const endDate = limitedEditionItem.end_date ? new Date(limitedEditionItem.end_date) : null;
    const now = new Date();

    // Check time-based availability
    const isNotStarted = startDate && now < startDate;
    const isExpired = endDate && now > endDate;
    const isActive = !isNotStarted && !isExpired;

    // Calculate remaining count
    const remainingCount = Math.max(0, limitedEditionItem.total_supply - limitedEditionItem.claimed_count);
    const available = isActive && remainingCount > 0;

    // Generate status message
    let status = 'Available';
    if (isNotStarted) {
      status = `Available from ${startDate.toLocaleDateString()}`;
    } else if (isExpired) {
      status = 'Limited edition has ended';
    } else if (remainingCount === 0) {
      status = 'Sold out';
    } else if (remainingCount <= 10) {
      status = `Only ${remainingCount} remaining!`;
    }

    return {
      available,
      remainingCount,
      totalSupply: limitedEditionItem.total_supply,
      claimedCount: limitedEditionItem.claimed_count,
      isActive,
      startDate,
      endDate,
      isExpired,
      isNotStarted,
      status,
      rewardId
    };

  } catch (error) {
    console.error('Error checking limited edition availability:', error);
    
    logSecurityEvent({
      type: 'LIMITED_EDITION_AVAILABILITY_ERROR',
      rewardId,
      error: error.message,
      message: 'Error checking limited edition availability'
    });

    return {
      available: false,
      remainingCount: 0,
      totalSupply: 0,
      claimedCount: 0,
      isActive: false,
      startDate: null,
      endDate: null,
      isExpired: false,
      isNotStarted: false,
      status: 'Error checking availability',
      rewardId,
      error: error.message
    };
  }
}

/**
 * Get comprehensive statistics for a limited edition item
 * @param {string} rewardId - The reward ID to get stats for
 * @returns {Promise<LimitedEditionStats>} Limited edition statistics
 */
export async function getLimitedEditionStats(rewardId) {
  try {
    // Input validation
    if (!rewardId || typeof rewardId !== 'string') {
      throw new Error('Invalid reward ID provided');
    }

    // Log security event
    logSecurityEvent({
      type: 'LIMITED_EDITION_STATS_REQUEST',
      rewardId,
      message: 'Requesting limited edition statistics'
    });

    // Get limited edition item
    const { data: limitedEditionItem, error: itemError } = await supabase
      .from('limited_edition_items')
      .select('*')
      .eq('reward_id', rewardId)
      .single();

    if (itemError) {
      throw itemError;
    }

    // Get all claims for this limited edition
    const { data: claims, error: claimsError } = await supabase
      .from('limited_edition_claims')
      .select('*')
      .eq('limited_edition_id', limitedEditionItem.id)
      .order('claimed_at', { ascending: true });

    if (claimsError) {
      throw claimsError;
    }

    // Calculate basic stats
    const totalSupply = limitedEditionItem.total_supply;
    const claimedCount = claims.length;
    const remainingCount = Math.max(0, totalSupply - claimedCount);
    const claimRate = totalSupply > 0 ? (claimedCount / totalSupply) * 100 : 0;

    // Calculate time-based stats
    let firstClaimDate = null;
    let lastClaimDate = null;
    let dailyClaimRate = 0;
    let averageTimeBetweenClaims = 0;

    if (claims.length > 0) {
      firstClaimDate = new Date(claims[0].claimed_at);
      lastClaimDate = new Date(claims[claims.length - 1].claimed_at);

      // Calculate daily claim rate
      const daysSinceStart = Math.max(1, (lastClaimDate - firstClaimDate) / (1000 * 60 * 60 * 24));
      dailyClaimRate = claimedCount / daysSinceStart;

      // Calculate average time between claims
      if (claims.length > 1) {
        let totalTimeBetweenClaims = 0;
        for (let i = 1; i < claims.length; i++) {
          const timeDiff = new Date(claims[i].claimed_at) - new Date(claims[i - 1].claimed_at);
          totalTimeBetweenClaims += timeDiff;
        }
        averageTimeBetweenClaims = totalTimeBetweenClaims / (claims.length - 1) / (1000 * 60 * 60); // in hours
      }
    }

    // Get recent activity (last 10 claims)
    const recentActivity = claims
      .slice(-10)
      .reverse()
      .map(claim => ({
        mintNumber: claim.mint_number,
        claimedAt: new Date(claim.claimed_at),
        userId: claim.user_id,
        location: claim.qr_scan_location
      }));

    // Calculate exclusivity breakdown
    const exclusivityBreakdown = {
      total: claimedCount,
      byMintNumber: claims.reduce((acc, claim) => {
        const mintRange = Math.floor(claim.mint_number / 10) * 10;
        const rangeKey = `${mintRange}-${mintRange + 9}`;
        acc[rangeKey] = (acc[rangeKey] || 0) + 1;
        return acc;
      }, {}),
      averageMintNumber: claims.length > 0 ? 
        claims.reduce((sum, claim) => sum + claim.mint_number, 0) / claims.length : 0
    };

    return {
      totalSupply,
      claimedCount,
      remainingCount,
      claimRate: Math.round(claimRate * 100) / 100,
      dailyClaimRate: Math.round(dailyClaimRate * 100) / 100,
      firstClaimDate,
      lastClaimDate,
      averageTimeBetweenClaims: Math.round(averageTimeBetweenClaims * 100) / 100,
      recentActivity,
      exclusivityBreakdown
    };

  } catch (error) {
    console.error('Error getting limited edition stats:', error);
    
    logSecurityEvent({
      type: 'LIMITED_EDITION_STATS_ERROR',
      rewardId,
      error: error.message,
      message: 'Error getting limited edition statistics'
    });

    return {
      totalSupply: 0,
      claimedCount: 0,
      remainingCount: 0,
      claimRate: 0,
      dailyClaimRate: 0,
      firstClaimDate: null,
      lastClaimDate: null,
      averageTimeBetweenClaims: 0,
      recentActivity: [],
      exclusivityBreakdown: {},
      error: error.message
    };
  }
}

/**
 * Get all limited edition items owned by a user
 * @param {string} userId - The user ID to get items for
 * @returns {Promise<UserLimitedEditionItem[]>} User's limited edition items
 */
export async function getUserLimitedEditionItems(userId) {
  try {
    // Input validation
    const userValidation = validateUserId(userId);
    if (!userValidation.success) {
      throw new Error(userValidation.error);
    }

    // Log security event
    logSecurityEvent({
      type: 'USER_LIMITED_EDITION_ITEMS_REQUEST',
      userId,
      message: 'Requesting user limited edition items'
    });

    // Get user's limited edition claims with related data
    const { data: userClaims, error: claimsError } = await supabase
      .from('limited_edition_claims')
      .select(`
        *,
        limited_edition_items (
          *,
          reward_id,
          total_supply,
          start_date,
          end_date,
          is_active
        )
      `)
      .eq('user_id', userId)
      .order('claimed_at', { ascending: false });

    if (claimsError) {
      throw claimsError;
    }

    // Transform data into UserLimitedEditionItem format
    const userItems = userClaims.map(claim => {
      const limitedEditionInfo = claim.limited_edition_items;
      
      // Calculate exclusivity level based on total supply
      let exclusivityLevel = 'limited';
      if (limitedEditionInfo.total_supply <= 10) {
        exclusivityLevel = 'mythic';
      } else if (limitedEditionInfo.total_supply <= 25) {
        exclusivityLevel = 'legendary';
      } else if (limitedEditionInfo.total_supply <= 50) {
        exclusivityLevel = 'ultra_rare';
      } else if (limitedEditionInfo.total_supply <= 100) {
        exclusivityLevel = 'vip';
      } else if (limitedEditionInfo.total_supply <= 500) {
        exclusivityLevel = 'exclusive';
      }

      return {
        id: claim.id,
        limitedEditionId: claim.limited_edition_id,
        rewardId: limitedEditionInfo.reward_id,
        mintNumber: claim.mint_number,
        claimedAt: new Date(claim.claimed_at),
        qrScanLocation: claim.qr_scan_location,
        limitedEditionInfo: {
          id: limitedEditionInfo.id,
          totalSupply: limitedEditionInfo.total_supply,
          startDate: limitedEditionInfo.start_date ? new Date(limitedEditionInfo.start_date) : null,
          endDate: limitedEditionInfo.end_date ? new Date(limitedEditionInfo.end_date) : null,
          isActive: limitedEditionInfo.is_active,
          createdAt: new Date(limitedEditionInfo.created_at),
          updatedAt: new Date(limitedEditionInfo.updated_at)
        },
        exclusivityLevel,
        totalSupply: limitedEditionInfo.total_supply,
        rarityPercentage: ((claim.mint_number / limitedEditionInfo.total_supply) * 100).toFixed(1)
      };
    });

    // Sort by exclusivity level and mint number
    const exclusivityOrder = {
      'mythic': 1,
      'legendary': 2,
      'ultra_rare': 3,
      'vip': 4,
      'exclusive': 5,
      'limited': 6
    };

    userItems.sort((a, b) => {
      // First sort by exclusivity level
      const levelA = exclusivityOrder[a.exclusivityLevel] || 999;
      const levelB = exclusivityOrder[b.exclusivityLevel] || 999;
      
      if (levelA !== levelB) {
        return levelA - levelB;
      }
      
      // Then sort by mint number (lower is rarer)
      return a.mintNumber - b.mintNumber;
    });

    return userItems;

  } catch (error) {
    console.error('Error getting user limited edition items:', error);
    
    logSecurityEvent({
      type: 'USER_LIMITED_EDITION_ITEMS_ERROR',
      userId,
      error: error.message,
      message: 'Error getting user limited edition items'
    });

    return [];
  }
}

/**
 * Get limited edition collection summary for a user
 * @param {string} userId - The user ID to get summary for
 * @returns {Promise<Object>} User's limited edition collection summary
 */
export async function getUserLimitedEditionSummary(userId) {
  try {
    const userItems = await getUserLimitedEditionItems(userId);
    
    if (userItems.length === 0) {
      return {
        totalItems: 0,
        totalSupply: 0,
        averageRarity: 0,
        exclusivityBreakdown: {},
        rarestItem: null,
        mostRecentItem: null,
        collectionValue: 0
      };
    }

    // Calculate summary statistics
    const totalItems = userItems.length;
    const totalSupply = userItems.reduce((sum, item) => sum + item.totalSupply, 0);
    const averageRarity = totalSupply / totalItems;

    // Exclusivity breakdown
    const exclusivityBreakdown = userItems.reduce((acc, item) => {
      acc[item.exclusivityLevel] = (acc[item.exclusivityLevel] || 0) + 1;
      return acc;
    }, {});

    // Find rarest item (lowest mint number relative to supply)
    const rarestItem = userItems.reduce((rarest, item) => {
      const rarityScore = item.mintNumber / item.totalSupply;
      const rarestScore = rarest ? rarest.mintNumber / rarest.totalSupply : 1;
      return rarityScore < rarestScore ? item : rarest;
    });

    // Find most recent item
    const mostRecentItem = userItems.reduce((recent, item) => {
      return item.claimedAt > recent.claimedAt ? item : recent;
    });

    // Calculate collection value (based on exclusivity and rarity)
    const collectionValue = userItems.reduce((value, item) => {
      const exclusivityMultiplier = {
        'mythic': 10,
        'legendary': 8,
        'ultra_rare': 6,
        'vip': 4,
        'exclusive': 2,
        'limited': 1
      };
      
      const rarityMultiplier = 1 + (1 - (item.mintNumber / item.totalSupply));
      const itemValue = exclusivityMultiplier[item.exclusivityLevel] * rarityMultiplier;
      
      return value + itemValue;
    }, 0);

    return {
      totalItems,
      totalSupply,
      averageRarity: Math.round(averageRarity),
      exclusivityBreakdown,
      rarestItem,
      mostRecentItem,
      collectionValue: Math.round(collectionValue * 100) / 100
    };

  } catch (error) {
    console.error('Error getting user limited edition summary:', error);
    return {
      totalItems: 0,
      totalSupply: 0,
      averageRarity: 0,
      exclusivityBreakdown: {},
      rarestItem: null,
      mostRecentItem: null,
      collectionValue: 0,
      error: error.message
    };
  }
}

/**
 * Check if a user has already claimed a specific limited edition item
 * @param {string} userId - The user ID to check
 * @param {string} rewardId - The reward ID to check
 * @returns {Promise<Object>} Claim status information
 */
export async function checkUserLimitedEditionClaim(userId, rewardId) {
  try {
    // Input validation
    const userValidation = validateUserId(userId);
    if (!userValidation.success) {
      throw new Error(userValidation.error);
    }

    if (!rewardId || typeof rewardId !== 'string') {
      throw new Error('Invalid reward ID provided');
    }

    // Get limited edition item
    const { data: limitedEditionItem, error: itemError } = await supabase
      .from('limited_edition_items')
      .select('id')
      .eq('reward_id', rewardId)
      .single();

    if (itemError) {
      return {
        hasClaimed: false,
        canClaim: false,
        reason: 'Not a limited edition item'
      };
    }

    // Check if user has already claimed
    const { data: userClaim, error: claimError } = await supabase
      .from('limited_edition_claims')
      .select('*')
      .eq('limited_edition_id', limitedEditionItem.id)
      .eq('user_id', userId)
      .single();

    if (claimError && claimError.code !== 'PGRST116') {
      throw claimError;
    }

    const hasClaimed = !!userClaim;

    // Check availability
    const availability = await checkLimitedEditionAvailability(rewardId);
    const canClaim = !hasClaimed && availability.available;

    return {
      hasClaimed,
      canClaim,
      userClaim: hasClaimed ? {
        mintNumber: userClaim.mint_number,
        claimedAt: new Date(userClaim.claimed_at),
        location: userClaim.qr_scan_location
      } : null,
      availability,
      reason: hasClaimed ? 'Already claimed' : 
              !availability.available ? availability.status : 
              'Available for claim'
    };

  } catch (error) {
    console.error('Error checking user limited edition claim:', error);
    return {
      hasClaimed: false,
      canClaim: false,
      reason: 'Error checking claim status',
      error: error.message
    };
  }
}

/**
 * Get all active limited edition items
 * @returns {Promise<Array>} List of active limited edition items
 */
export async function getActiveLimitedEditions() {
  try {
    const { data: activeItems, error } = await supabase
      .from('limited_edition_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return activeItems.map(item => ({
      id: item.id,
      rewardId: item.reward_id,
      totalSupply: item.total_supply,
      claimedCount: item.claimed_count,
      remainingCount: Math.max(0, item.total_supply - item.claimed_count),
      startDate: item.start_date ? new Date(item.start_date) : null,
      endDate: item.end_date ? new Date(item.end_date) : null,
      isActive: item.is_active,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));

  } catch (error) {
    console.error('Error getting active limited editions:', error);
    return [];
  }
}

/**
 * Get limited edition analytics for admin dashboard
 * @returns {Promise<Object>} Comprehensive limited edition analytics
 */
export async function getLimitedEditionAnalytics() {
  try {
    // Get all limited edition items
    const { data: allItems, error: itemsError } = await supabase
      .from('limited_edition_items')
      .select('*');

    if (itemsError) {
      throw itemsError;
    }

    // Get all claims
    const { data: allClaims, error: claimsError } = await supabase
      .from('limited_edition_claims')
      .select('*');

    if (claimsError) {
      throw claimsError;
    }

    // Calculate analytics
    const totalLimitedEditions = allItems.length;
    const activeLimitedEditions = allItems.filter(item => item.is_active).length;
    const totalSupply = allItems.reduce((sum, item) => sum + item.total_supply, 0);
    const totalClaimed = allClaims.length;
    const totalRemaining = Math.max(0, totalSupply - totalClaimed);
    const overallClaimRate = totalSupply > 0 ? (totalClaimed / totalSupply) * 100 : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentClaims = allClaims.filter(claim => 
      new Date(claim.claimed_at) >= sevenDaysAgo
    );

    // Popular limited editions
    const claimCounts = allClaims.reduce((acc, claim) => {
      acc[claim.limited_edition_id] = (acc[claim.limited_edition_id] || 0) + 1;
      return acc;
    }, {});

    const popularItems = Object.entries(claimCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([limitedEditionId, count]) => {
        const item = allItems.find(item => item.id === limitedEditionId);
        return {
          rewardId: item?.reward_id,
          totalSupply: item?.total_supply,
          claimedCount: count,
          claimRate: item ? (count / item.total_supply) * 100 : 0
        };
      });

    return {
      totalLimitedEditions,
      activeLimitedEditions,
      totalSupply,
      totalClaimed,
      totalRemaining,
      overallClaimRate: Math.round(overallClaimRate * 100) / 100,
      recentActivity: {
        last7Days: recentClaims.length,
        last30Days: allClaims.filter(claim => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return new Date(claim.claimed_at) >= thirtyDaysAgo;
        }).length
      },
      popularItems,
      averageSupply: totalLimitedEditions > 0 ? Math.round(totalSupply / totalLimitedEditions) : 0
    };

  } catch (error) {
    console.error('Error getting limited edition analytics:', error);
    return {
      totalLimitedEditions: 0,
      activeLimitedEditions: 0,
      totalSupply: 0,
      totalClaimed: 0,
      totalRemaining: 0,
      overallClaimRate: 0,
      recentActivity: { last7Days: 0, last30Days: 0 },
      popularItems: [],
      averageSupply: 0,
      error: error.message
    };
  }
}

// Export all functions
export {
  checkLimitedEditionAvailability,
  getLimitedEditionStats,
  getUserLimitedEditionItems,
  getUserLimitedEditionSummary,
  checkUserLimitedEditionClaim,
  getActiveLimitedEditions,
  getLimitedEditionAnalytics
}; 