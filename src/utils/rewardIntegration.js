/**
 * Reward Integration Utilities
 * PapillonLabs Monarch Passport MVP
 * 
 * This module provides utilities for integrating static rewards configuration
 * with the limited edition tracking system and database operations.
 */

import { createClient } from '@supabase/supabase-js';
import MONARCH_REWARDS, { RewardUtils } from '../config/monarchRewards';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/**
 * Initialize limited edition items in database from static configuration
 */
export const initializeLimitedEditions = async () => {
  try {
    console.log('🦋 Initializing limited edition items from static configuration...');
    
    const limitedEditionRewards = RewardUtils.getLimitedEditionRewards();
    const results = [];

    for (const reward of limitedEditionRewards) {
      try {
        // Check if limited edition already exists
        const { data: existing } = await supabase
          .from('limited_edition_items')
          .select('id')
          .eq('reward_id', reward.rewardId)
          .single();

        if (existing) {
          console.log(`✅ Limited edition already exists: ${reward.rewardId}`);
          results.push({ rewardId: reward.rewardId, status: 'exists' });
          continue;
        }

        // Create limited edition item
        const { data, error } = await supabase
          .rpc('create_limited_edition_item', {
            p_reward_id: reward.rewardId,
            p_total_supply: reward.limitedEdition.totalSupply,
            p_start_date: new Date().toISOString(),
            p_end_date: reward.limitedEdition.endDate || null
          });

        if (error) {
          console.error(`❌ Error creating limited edition ${reward.rewardId}:`, error);
          results.push({ rewardId: reward.rewardId, status: 'error', error: error.message });
        } else {
          console.log(`✅ Created limited edition: ${reward.rewardId} (${reward.limitedEdition.totalSupply} pieces)`);
          results.push({ rewardId: reward.rewardId, status: 'created', itemId: data });
        }
      } catch (err) {
        console.error(`❌ Error processing limited edition ${reward.rewardId}:`, err);
        results.push({ rewardId: reward.rewardId, status: 'error', error: err.message });
      }
    }

    return results;
  } catch (error) {
    console.error('❌ Error initializing limited editions:', error);
    throw error;
  }
};

/**
 * Sync static rewards with database
 */
export const syncStaticRewards = async () => {
  try {
    console.log('🦋 Syncing static rewards with database...');
    
    const allRewards = RewardUtils.getActiveRewards();
    const results = [];

    for (const reward of allRewards) {
      try {
        // Check if reward exists in static_rewards table
        const { data: existing } = await supabase
          .from('static_rewards')
          .select('reward_id')
          .eq('reward_id', reward.rewardId)
          .single();

        if (existing) {
          console.log(`✅ Static reward already exists: ${reward.rewardId}`);
          results.push({ rewardId: reward.rewardId, status: 'exists' });
          continue;
        }

        // Create static reward record
        const { error } = await supabase
          .from('static_rewards')
          .insert({
            reward_id: reward.rewardId,
            name: reward.name,
            description: reward.description,
            category: reward.category,
            rarity: reward.rarity,
            wings_value: reward.wingsValue,
            season: reward.season,
            is_active: reward.isActive,
            data: {
              shopifyProductId: reward.shopifyProductId,
              shopifyPrice: reward.shopifyPrice,
              shopifyHandle: reward.shopifyHandle,
              images: reward.images,
              metadata: reward.metadata,
              limitedEdition: reward.limitedEdition
            }
          });

        if (error) {
          console.error(`❌ Error creating static reward ${reward.rewardId}:`, error);
          results.push({ rewardId: reward.rewardId, status: 'error', error: error.message });
        } else {
          console.log(`✅ Created static reward: ${reward.rewardId}`);
          results.push({ rewardId: reward.rewardId, status: 'created' });
        }
      } catch (err) {
        console.error(`❌ Error processing static reward ${reward.rewardId}:`, err);
        results.push({ rewardId: reward.rewardId, status: 'error', error: err.message });
      }
    }

    return results;
  } catch (error) {
    console.error('❌ Error syncing static rewards:', error);
    throw error;
  }
};

/**
 * Get reward data with limited edition status
 */
export const getRewardWithLimitedEditionStatus = async (rewardId) => {
  try {
    // Get static reward data
    const staticReward = RewardUtils.getRewardById(rewardId);
    if (!staticReward) {
      throw new Error(`Reward not found: ${rewardId}`);
    }

    // Get limited edition status if applicable
    let limitedEditionStatus = null;
    if (staticReward.limitedEdition) {
      const { data, error } = await supabase
        .rpc('get_limited_edition_status', { p_reward_id: rewardId });

      if (error) {
        console.error(`Error getting limited edition status for ${rewardId}:`, error);
      } else if (data && data.length > 0) {
        limitedEditionStatus = data[0];
      }
    }

    return {
      ...staticReward,
      limitedEditionStatus
    };
  } catch (error) {
    console.error(`Error getting reward with limited edition status for ${rewardId}:`, error);
    throw error;
  }
};

/**
 * Get all rewards with limited edition status
 */
export const getAllRewardsWithStatus = async () => {
  try {
    const allRewards = RewardUtils.getActiveRewards();
    const results = [];

    for (const reward of allRewards) {
      try {
        const rewardWithStatus = await getRewardWithLimitedEditionStatus(reward.rewardId);
        results.push(rewardWithStatus);
      } catch (err) {
        console.error(`Error getting status for ${reward.rewardId}:`, err);
        results.push({ ...reward, limitedEditionStatus: null, error: err.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Error getting all rewards with status:', error);
    throw error;
  }
};

/**
 * Validate reward configuration
 */
export const validateRewardConfiguration = () => {
  const errors = [];
  const warnings = [];

  const allRewards = RewardUtils.getActiveRewards();

  // Check for duplicate reward IDs
  const rewardIds = allRewards.map(r => r.rewardId);
  const duplicates = rewardIds.filter((id, index) => rewardIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate reward IDs found: ${duplicates.join(', ')}`);
  }

  // Check for valid Shopify configurations
  allRewards.forEach(reward => {
    if (!reward.shopifyProductId) {
      warnings.push(`Missing Shopify product ID for ${reward.rewardId}`);
    }
    if (!reward.shopifyPrice || reward.shopifyPrice <= 0) {
      warnings.push(`Invalid Shopify price for ${reward.rewardId}`);
    }
    if (reward.images.length === 0) {
      warnings.push(`No images configured for ${reward.rewardId}`);
    }
  });

  // Check limited edition configurations
  const limitedEditions = RewardUtils.getLimitedEditionRewards();
  limitedEditions.forEach(reward => {
    const config = reward.limitedEdition;
    if (config.totalSupply <= 0) {
      errors.push(`Invalid total supply for ${reward.rewardId}`);
    }
    if (config.bonusWings < 0) {
      errors.push(`Invalid bonus WINGS for ${reward.rewardId}`);
    }
    if (config.endDate && new Date(config.endDate) <= new Date()) {
      warnings.push(`End date has passed for ${reward.rewardId}`);
    }
  });

  return { errors, warnings, isValid: errors.length === 0 };
};

/**
 * Get reward analytics
 */
export const getRewardAnalytics = async () => {
  try {
    const allRewards = RewardUtils.getActiveRewards();
    const limitedEditions = RewardUtils.getLimitedEditionRewards();
    const regularRewards = RewardUtils.getRegularRewards();

    // Get limited edition analytics from database
    const { data: limitedEditionAnalytics, error } = await supabase
      .from('limited_edition_analytics')
      .select('*');

    if (error) {
      console.error('Error fetching limited edition analytics:', error);
    }

    return {
      totalRewards: allRewards.length,
      limitedEditionRewards: limitedEditions.length,
      regularRewards: regularRewards.length,
      totalWingsValue: allRewards.reduce((sum, reward) => sum + RewardUtils.getTotalWingsValue(reward.rewardId), 0),
      limitedEditionAnalytics: limitedEditionAnalytics || [],
      categories: [...new Set(allRewards.map(r => r.category))],
      rarities: [...new Set(allRewards.map(r => r.rarity))],
      seasons: [...new Set(allRewards.map(r => r.season))]
    };
  } catch (error) {
    console.error('Error getting reward analytics:', error);
    throw error;
  }
};

/**
 * Export reward data for external systems
 */
export const exportRewardData = (format = 'json') => {
  try {
    const allRewards = RewardUtils.getActiveRewards();
    
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(allRewards, null, 2);
      
      case 'csv':
        const headers = ['rewardId', 'name', 'category', 'rarity', 'wingsValue', 'season', 'isLimitedEdition', 'totalSupply', 'shopifyPrice'];
        const rows = allRewards.map(reward => [
          reward.rewardId,
          reward.name,
          reward.category,
          reward.rarity,
          reward.wingsValue,
          reward.season,
          reward.limitedEdition ? 'Yes' : 'No',
          reward.limitedEdition?.totalSupply || 'N/A',
          reward.shopifyPrice
        ]);
        
        return [headers, ...rows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n');
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting reward data:', error);
    throw error;
  }
};

/**
 * Import reward data from external sources
 */
export const importRewardData = async (data, format = 'json') => {
  try {
    let parsedData;
    
    switch (format.toLowerCase()) {
      case 'json':
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        break;
      
      case 'csv':
        // Basic CSV parsing - in production, use a proper CSV library
        const lines = data.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        parsedData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, ''));
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        break;
      
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }

    console.log(`🦋 Importing ${parsedData.length} rewards...`);
    
    // Validate and process imported data
    const results = [];
    for (const item of parsedData) {
      try {
        // Basic validation
        if (!item.rewardId || !item.name) {
          results.push({ rewardId: item.rewardId || 'unknown', status: 'error', error: 'Missing required fields' });
          continue;
        }

        // Process the imported item
        // This would typically involve creating/updating database records
        results.push({ rewardId: item.rewardId, status: 'imported' });
      } catch (err) {
        results.push({ rewardId: item.rewardId || 'unknown', status: 'error', error: err.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Error importing reward data:', error);
    throw error;
  }
};

// Export utility functions
export const RewardIntegration = {
  initializeLimitedEditions,
  syncStaticRewards,
  getRewardWithLimitedEditionStatus,
  getAllRewardsWithStatus,
  validateRewardConfiguration,
  getRewardAnalytics,
  exportRewardData,
  importRewardData
};

export default RewardIntegration; 