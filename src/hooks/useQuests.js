import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';

// Quest configurations matching the database
const QUEST_CONFIGS = {
  digital_collector: {
    id: 'digital_collector',
    icon: '📱',
    title: 'Digital Collector',
    description: 'Scan QR codes on Papillon items to build your digital collection and unlock exclusive rewards.',
    category: 'Collection',
    reward: 100
  },
  store_explorer: {
    id: 'store_explorer',
    icon: '🏪',
    title: 'Store Explorer',
    description: 'Visit different Papillon store locations and experience the brand in person across multiple cities.',
    category: 'Exploration',
    reward: 75
  },
  social_butterfly: {
    id: 'social_butterfly',
    icon: '👥',
    title: 'Social Butterfly',
    description: 'Share your Monarch Passport journey on social media to inspire others and grow the community.',
    category: 'Social',
    reward: 50
  },
  daily_dedication: {
    id: 'daily_dedication',
    icon: '🎯',
    title: 'Daily Dedication',
    description: 'Complete daily challenges consistently to prove your dedication to the Monarch lifestyle.',
    category: 'Daily',
    reward: 125
  }
};

export const useQuests = () => {
  const { user } = useAuth();
  const [questProgress, setQuestProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questStats, setQuestStats] = useState({
    totalQuests: 0,
    completedQuests: 0,
    activeQuests: 0,
    totalRewards: 0
  });

  // Initialize user quests if they don't exist
  const initializeQuests = useCallback(async (userId) => {
    try {
      console.log('🎯 Initializing quests for user:', userId);
      const { data, error } = await supabase.rpc('initialize_user_quests', {
        user_id_param: userId
      });

      if (error) throw error;
      console.log('✅ Quests initialized:', data);
      return data;
    } catch (err) {
      console.error('❌ Error initializing quests:', err);
      throw err;
    }
  }, []);

  // Load quest progress from database
  const loadQuestProgress = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, setting empty quest progress');
      setQuestProgress([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🎯 Loading quest progress for user:', user.id);

      // First ensure quests are initialized
      await initializeQuests(user.id);

      // Then fetch current progress
      const { data: progressData, error: progressError } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('season', 'Spring_25')
        .order('created_at', { ascending: true });

      if (progressError) throw progressError;

      console.log('📊 Raw quest progress data:', progressData);

      // Transform database data to match UI expectations
      const transformedQuests = progressData.map(quest => {
        const config = QUEST_CONFIGS[quest.quest_type] || {};
        const percent = quest.total_required > 0 
          ? Math.round((quest.progress / quest.total_required) * 100) 
          : 0;

        return {
          id: quest.id,
          quest_id: quest.quest_id,
          icon: config.icon || '❓',
          title: quest.quest_name || config.title || 'Unknown Quest',
          description: config.description || 'Complete this quest to earn rewards.',
          progress: quest.progress || 0,
          total: quest.total_required || 1,
          reward: config.reward || 0,
          percent: Math.min(percent, 100),
          category: config.category || 'General',
          completed: quest.is_completed || false,
          completedAt: quest.completed_at,
          questType: quest.quest_type
        };
      });

      setQuestProgress(transformedQuests);

      // Calculate stats
      const totalQuests = transformedQuests.length;
      const completedQuests = transformedQuests.filter(q => q.completed).length;
      const activeQuests = totalQuests - completedQuests;
      const totalRewards = transformedQuests
        .filter(q => q.completed)
        .reduce((sum, q) => sum + q.reward, 0);

      setQuestStats({
        totalQuests,
        completedQuests,
        activeQuests,
        totalRewards
      });

      console.log('✅ Quest progress loaded:', {
        questCount: transformedQuests.length,
        completed: completedQuests,
        active: activeQuests
      });

    } catch (err) {
      console.error('❌ Error loading quest progress:', err);
      setError(err.message);
      // Don't fall back to mock data - show empty state instead
      setQuestProgress([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, initializeQuests]);

  // Get quest progress for a specific quest type
  const getQuestProgress = useCallback((questType) => {
    return questProgress.find(quest => quest.questType === questType) || null;
  }, [questProgress]);

  // Get real-time quest statistics
  const getQuestStatistics = useCallback(async () => {
    if (!user?.id) return null;

    try {
      // Fetch user stats for aggregated data
      const { data: stats, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // If no stats exist, create them
      if (!stats) {
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        return newStats;
      }

      return stats;
    } catch (err) {
      console.error('❌ Error fetching quest statistics:', err);
      return null;
    }
  }, [user?.id]);

  // Get real progress for specific quest types
  const getRealQuestProgress = useCallback(async () => {
    if (!user?.id) return {};

    try {
      // Get QR scan count from user_closet
      const { data: closetItems, error: closetError } = await supabase
        .from('user_closet')
        .select('id')
        .eq('user_id', user.id)
        .eq('earned_via', 'qr_scan');

      if (closetError) throw closetError;

      // Get social shares count from user_activity
      const { data: socialShares, error: socialError } = await supabase
        .from('user_activity')
        .select('id')
        .eq('user_id', user.id)
        .eq('activity_type', 'social_share');

      if (socialError) throw socialError;

      // Get daily completions count
      const { data: dailyCompletions, error: dailyError } = await supabase
        .from('daily_completions')
        .select('id')
        .eq('user_id', user.id);

      if (dailyError) throw dailyError;

      return {
        qr_scans: closetItems?.length || 0,
        social_shares: socialShares?.length || 0,
        daily_completions: dailyCompletions?.length || 0,
        store_visits: 0 // TODO: Implement store visit tracking
      };

    } catch (err) {
      console.error('❌ Error fetching real quest progress:', err);
      return {};
    }
  }, [user?.id]);

  // Update quest progress (called when user performs actions)
  const updateQuestProgress = useCallback(async (questType, incrementAmount = 1) => {
    if (!user?.id) {
      throw new Error('User must be logged in to update quest progress');
    }

    try {
      console.log(`🎯 Updating quest progress: ${questType} +${incrementAmount}`);
      
      const { data, error } = await supabase.rpc('update_quest_progress', {
        user_id_param: user.id,
        quest_type_param: questType,
        increment_amount: incrementAmount
      });

      if (error) throw error;

      console.log('✅ Quest progress updated:', data);

      // Refresh quest progress to get latest data
      await loadQuestProgress();

      return data;
    } catch (err) {
      console.error(`❌ Error updating quest progress for ${questType}:`, err);
      throw err;
    }
  }, [user?.id, loadQuestProgress]);

  // Log QR scan with quest progress update
  const logQRScan = useCallback(async (scanData) => {
    if (!user?.id) {
      throw new Error('User must be logged in to log QR scan');
    }

    try {
      console.log('📱 Logging QR scan:', scanData);
      
      const { data, error } = await supabase.rpc('log_qr_scan', {
        user_id_param: user.id,
        reward_id_param: scanData.reward_id,
        item_name_param: scanData.item_name,
        category_param: scanData.category,
        rarity_param: scanData.rarity,
        wings_earned_param: scanData.wings_earned,
        location_param: scanData.location || 'Unknown'
      });

      if (error) throw error;

      console.log('✅ QR scan logged:', data);

      // Refresh quest progress to show updated data
      await loadQuestProgress();

      return data;
    } catch (err) {
      console.error('❌ Error logging QR scan:', err);
      throw err;
    }
  }, [user?.id, loadQuestProgress]);

  // Log social share with quest progress update
  const logSocialShare = useCallback(async (platform, contentType = 'general') => {
    if (!user?.id) {
      throw new Error('User must be logged in to log social share');
    }

    try {
      console.log('📢 Logging social share:', platform);
      
      const { data, error } = await supabase.rpc('log_social_share', {
        user_id_param: user.id,
        platform_param: platform,
        content_type_param: contentType
      });

      if (error) throw error;

      console.log('✅ Social share logged:', data);

      // Refresh quest progress to show updated data
      await loadQuestProgress();

      return data;
    } catch (err) {
      console.error('❌ Error logging social share:', err);
      throw err;
    }
  }, [user?.id, loadQuestProgress]);

  // Load quest progress when user changes
  useEffect(() => {
    if (user?.id || user === null) {
      loadQuestProgress();
    }
  }, [user?.id, loadQuestProgress]);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Quest loading timeout');
        setLoading(false);
        setError('Loading timeout - please try again');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading]);

  return {
    // Data
    questProgress,
    questStats,
    
    // State
    loading,
    error,
    
    // Functions
    getQuestProgress,
    getQuestStatistics,
    getRealQuestProgress,
    updateQuestProgress,
    logQRScan,
    logSocialShare,
    refreshQuests: loadQuestProgress
  };
};