import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export const useLimitedEditions = () => {
  const [activeLimitedEditions, setActiveLimitedEditions] = useState([]);
  const [userClaims, setUserClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch active limited editions
  const fetchActiveLimitedEditions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('get_active_limited_editions');

      if (error) throw error;

      setActiveLimitedEditions(data || []);
    } catch (err) {
      console.error('Error fetching active limited editions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's limited edition claims
  const fetchUserClaims = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .rpc('get_user_limited_editions', { p_user_id: user.id });

      if (error) throw error;

      setUserClaims(data || []);
    } catch (err) {
      console.error('Error fetching user claims:', err);
      setError(err.message);
    }
  }, []);

  // Claim a limited edition item
  const claimLimitedEdition = useCallback(async (rewardId, qrScanLocation = null) => {
    try {
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .rpc('claim_limited_edition_item', {
          p_reward_id: rewardId,
          p_user_id: user.id,
          p_qr_scan_location: qrScanLocation
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        
        if (result.success) {
          // Refresh data after successful claim
          await Promise.all([
            fetchActiveLimitedEditions(),
            fetchUserClaims()
          ]);
          
          return {
            success: true,
            mintNumber: result.mint_number,
            claimedAt: result.claimed_at,
            message: result.message
          };
        } else {
          return {
            success: false,
            message: result.message
          };
        }
      }

      return {
        success: false,
        message: 'Unknown error occurred'
      };
    } catch (err) {
      console.error('Error claiming limited edition:', err);
      setError(err.message);
      return {
        success: false,
        message: err.message
      };
    }
  }, [fetchActiveLimitedEditions, fetchUserClaims]);

  // Get status of a specific limited edition
  const getLimitedEditionStatus = useCallback(async (rewardId) => {
    try {
      const { data, error } = await supabase
        .rpc('get_limited_edition_status', { p_reward_id: rewardId });

      if (error) throw error;

      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      console.error('Error getting limited edition status:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Check if user has claimed a specific limited edition
  const hasUserClaimed = useCallback((rewardId) => {
    return userClaims.some(claim => claim.reward_id === rewardId);
  }, [userClaims]);

  // Get user's mint number for a specific limited edition
  const getUserMintNumber = useCallback((rewardId) => {
    const claim = userClaims.find(claim => claim.reward_id === rewardId);
    return claim ? claim.mint_number : null;
  }, [userClaims]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchActiveLimitedEditions(),
        fetchUserClaims()
      ]);
    };

    loadData();
  }, [fetchActiveLimitedEditions, fetchUserClaims]);

  // Refresh data
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchActiveLimitedEditions(),
      fetchUserClaims()
    ]);
  }, [fetchActiveLimitedEditions, fetchUserClaims]);

  return {
    // Data
    activeLimitedEditions,
    userClaims,
    loading,
    error,
    
    // Actions
    claimLimitedEdition,
    getLimitedEditionStatus,
    refresh,
    
    // Helpers
    hasUserClaimed,
    getUserMintNumber,
    
    // Computed values
    totalUserClaims: userClaims.length,
    availableLimitedEditions: activeLimitedEditions.filter(item => item.available_count > 0)
  };
};

// Hook for admin functions
export const useLimitedEditionAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a new limited edition item
  const createLimitedEdition = useCallback(async (rewardId, totalSupply, startDate, endDate = null) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('create_limited_edition_item', {
          p_reward_id: rewardId,
          p_total_supply: totalSupply,
          p_start_date: startDate,
          p_end_date: endDate
        });

      if (error) throw error;

      return {
        success: true,
        itemId: data
      };
    } catch (err) {
      console.error('Error creating limited edition:', err);
      setError(err.message);
      return {
        success: false,
        message: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset limited edition for testing
  const resetLimitedEdition = useCallback(async (rewardId) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('reset_limited_edition_for_testing', { p_reward_id: rewardId });

      if (error) throw error;

      return {
        success: true,
        message: 'Limited edition reset successfully'
      };
    } catch (err) {
      console.error('Error resetting limited edition:', err);
      setError(err.message);
      return {
        success: false,
        message: err.message
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get analytics data
  const getAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('limited_edition_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createLimitedEdition,
    resetLimitedEdition,
    getAnalytics
  };
}; 