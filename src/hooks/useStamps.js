import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';
import { STAMP_IMAGES } from '../utils/stampImages';

// Timeout wrapper for database calls
const withTimeout = (promise, ms = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), ms)
    )
  ]);
};

// Complete 9 stamps for perfect 3x3 grid
export const STAMPS = [
  { 
    stamp_id: 'received_passport', 
    name: 'Received Passport', 
    description: 'Welcome to the Monarch family',
    image: STAMP_IMAGES.passport.imageUrl,
    category: 'milestone'
  },
  { 
    stamp_id: 'morning_gm', 
    name: 'GM', 
    description: 'Said GM to the community',
    image: STAMP_IMAGES.gm.imageUrl,
    category: 'social'
  },
  { 
    stamp_id: 'quest_completed', 
    name: 'Quest Master', 
    description: 'Completed your first quest',
    image: STAMP_IMAGES.quest.imageUrl,
    category: 'achievement'
  },
  { 
    stamp_id: 'qr_scanner', 
    name: 'QR Scanner Pro', 
    description: 'Scanned your first QR code',
    image: STAMP_IMAGES.qr.imageUrl,
    category: 'scan'
  },
  { 
    stamp_id: 'first_item', 
    name: 'First Item', 
    description: 'Scanned your first clothing item',
    image: STAMP_IMAGES.first_item.imageUrl,
    category: 'scan'
  },
  { 
    stamp_id: 'style_icon', 
    name: 'Style Icon', 
    description: 'Collected items from 3+ different categories',
    image: STAMP_IMAGES.style.imageUrl,
    category: 'collection'
  },
  { 
    stamp_id: 'social_share', 
    name: 'Social Butterfly', 
    description: 'Shared content on social media',
    image: STAMP_IMAGES.social.imageUrl,
    category: 'social'
  },
  { 
    stamp_id: 'streak_master', 
    name: 'Streak Master', 
    description: 'Maintained a 7-day login streak',
    image: STAMP_IMAGES.streak.imageUrl,
    category: 'dedication'
  },
  { 
    stamp_id: 'master_collector', 
    name: 'Master Collector', 
    description: 'Achieved elite collector status',
    image: STAMP_IMAGES.master.imageUrl,
    category: 'elite'
  }
];

export const useStamps = () => {
  const { user } = useAuth();
  const [userStamps, setUserStamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add debugging
  useEffect(() => {
    console.log('🔍 useStamps - User state:', user ? 'Authenticated' : 'Not authenticated');
    console.log('🔍 useStamps - Loading state:', loading);
    console.log('🔍 useStamps - Error state:', error);
  }, [user, loading, error]);
  
  // Get stamps with unlock status
  const stampsWithStatus = STAMPS.map(stamp => ({
    ...stamp,
    unlocked: userStamps.some(userStamp => userStamp.stamp_id === stamp.stamp_id),
    earnedAt: userStamps.find(userStamp => userStamp.stamp_id === stamp.stamp_id)?.created_at
  }));
  
  // Statistics
  const unlockedCount = stampsWithStatus.filter(stamp => stamp.unlocked).length;
  const totalCount = STAMPS.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);
  
  // Load user stamps from database with enhanced timeout handling
  const loadUserStamps = useCallback(async (userId) => {
    const targetUserId = userId || user?.id;
    console.log('🔍 loadUserStamps called - User ID:', targetUserId);
    
    if (!targetUserId) {
      console.log('⚠️ No user ID found, setting empty stamps and loading false');
      setUserStamps([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Starting database query for user stamps...');
      
      // Add timeout wrapper with 10 second timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const queryPromise = supabase
        .from('user_stamps')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) throw error;
      
      setUserStamps(data || []);
      console.log('✅ Stamps loaded successfully:', data?.length || 0, 'stamps');
    } catch (err) {
      console.error('❌ Stamps loading failed:', err);
      setError(err.message);
      // Don't block the app - set empty stamps array
      setUserStamps([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Check if user has a specific stamp
  const hasStamp = useCallback((stampId) => {
    return userStamps.some(stamp => stamp.stamp_id === stampId);
  }, [userStamps]);

  // Generic function to award a stamp
  const awardStamp = useCallback(async (stampId, metadata = {}) => {
    if (!user?.id) {
      throw new Error('User must be logged in to earn stamps');
    }

    // Check if user already has this stamp
    if (hasStamp(stampId)) {
      console.log(`User already has stamp: ${stampId}`);
      return { success: true, alreadyEarned: true };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('user_stamps')
        .insert([{
          user_id: user.id,
          stamp_id: stampId,
          metadata,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Update local state
      setUserStamps(prev => [data, ...prev]);

      // Check if this was the 8th stamp (trigger Master Collector)
      const newUnlockedCount = userStamps.length + 1;
      if (newUnlockedCount === 8 && !hasStamp('master_collector')) {
        // Award Master Collector stamp
        setTimeout(() => {
          awardMasterStamp();
        }, 1000);
      }

      return { success: true, data, alreadyEarned: false };
    } catch (err) {
      console.error(`Error awarding stamp ${stampId}:`, err);
      throw err;
    }
  }, [user?.id, hasStamp, userStamps.length]);

  // Specific stamp award functions
  const awardPassportStamp = useCallback(async () => {
    return awardStamp('received_passport', { 
      trigger: 'first_login',
      timestamp: new Date().toISOString()
    });
  }, [awardStamp]);

  const awardGMStamp = useCallback(async () => {
    return awardStamp('morning_gm', { 
      trigger: 'daily_gm_quest',
      timestamp: new Date().toISOString()
    });
  }, [awardStamp]);

  const awardQuestStamp = useCallback(async (questType = 'general') => {
    return awardStamp('quest_completed', { 
      trigger: 'quest_completion',
      quest_type: questType,
      timestamp: new Date().toISOString()
    });
  }, [awardStamp]);

  const awardQRStamp = useCallback(async () => {
    return awardStamp('qr_scanner', { 
      trigger: 'first_qr_scan',
      timestamp: new Date().toISOString()
    });
  }, [awardStamp]);

  const awardFirstItemStamp = useCallback(async (itemType = 'clothing') => {
    return awardStamp('first_item', { 
      trigger: 'first_item_scan',
      item_type: itemType,
      timestamp: new Date().toISOString()
    });
  }, [awardStamp]);

  const awardSocialStamp = useCallback(async (platform = 'instagram') => {
    return awardStamp('social_share', { 
      trigger: 'social_sharing',
      platform,
      timestamp: new Date().toISOString()
    });
  }, [awardStamp]);

  const awardStreakStamp = useCallback(async (streakDays = 7) => {
    return awardStamp('streak_master', { 
      trigger: 'login_streak',
      streak_days: streakDays,
      timestamp: new Date().toISOString()
    });
  }, [awardStamp]);

  const awardStyleStamp = useCallback(async (categoriesCount = 3) => {
    return awardStamp('style_icon', { 
      trigger: 'style_diversity',
      categories_collected: categoriesCount,
      timestamp: new Date().toISOString()
    });
  }, [awardStamp]);

  const awardMasterStamp = useCallback(async () => {
    return awardStamp('master_collector', { 
      trigger: 'achievement_milestone',
      stamps_count: 8,
      timestamp: new Date().toISOString()
    });
  }, [awardStamp]);

  // Load stamps when user authentication changes with race condition prevention
  useEffect(() => {
    console.log('🔍 useStamps useEffect triggered - User ID:', user?.id);
    
    // Only load stamps if we have finished the initial auth check
    if (user?.id || user === null) {
      // Use a flag to prevent race conditions
      let isMounted = true;
      
      const loadStamps = async () => {
        try {
          await loadUserStamps();
        } catch (error) {
          if (isMounted) {
            console.error('❌ Error in stamps useEffect:', error);
          }
        }
      };
      
      loadStamps();
      
      return () => {
        isMounted = false;
      };
    }
  }, [user?.id, loadUserStamps]);

  // Add a maximum loading timeout to prevent infinite loading
  useEffect(() => {
    const maxLoadingTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Maximum loading time reached, forcing loading to false');
        setLoading(false);
        setError('Loading timeout - please refresh the page');
      }
    }, 10000); // 10 second maximum loading time

    return () => clearTimeout(maxLoadingTimeout);
  }, [loading]);

  // Real-time subscription for stamp updates (disabled to prevent conflicts)
  useEffect(() => {
    if (!user?.id) return;

    // Temporarily disable real-time subscriptions to prevent conflicts
    // const subscription = supabase
    //   .channel('user_stamps_changes')
    //   .on('postgres_changes', 
    //     { 
    //       event: 'INSERT', 
    //       schema: 'public', 
    //       table: 'user_stamps',
    //       filter: `user_id=eq.${user.id}`
    //     }, 
    //     (payload) => {
    //       setUserStamps(prev => [payload.new, ...prev]);
    //     }
    //   )
    //   .subscribe();

    // return () => {
    //   subscription.unsubscribe();
    // };
  }, [user?.id]);

  return {
    // Data
    stamps: stampsWithStatus,
    userStamps,
    
    // Statistics
    unlockedCount,
    totalCount,
    completionPercentage,
    
    // State
    loading,
    error,
    
    // Functions
    hasStamp,
    loadUserStamps,
    refreshStamps: loadUserStamps, // Add alias for manual refresh
    
    // Award functions
    awardPassportStamp,
    awardGMStamp,
    awardQuestStamp,
    awardQRStamp,
    awardFirstItemStamp,
    awardSocialStamp,
    awardStreakStamp,
    awardStyleStamp,
    awardMasterStamp
  };
}; 