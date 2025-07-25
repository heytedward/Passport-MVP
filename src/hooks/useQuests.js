import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from './useAuth';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export const useQuests = () => {
  const { user } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the quest structure (this would be in your database)
  const QUEST_DEFINITIONS = [
    {
      id: 'digital_collector',
      icon: '📱',
      title: 'Digital Collector',
      description: 'Scan QR codes on Papillon items to build your digital collection and unlock exclusive rewards.',
      target: 10,
      reward: 100,
      category: 'Collection',
      type: 'qr_scans'
    },
    {
      id: 'social_butterfly',
      icon: '👥',
      title: 'Social Butterfly',
      description: 'Share your Monarch Passport journey on Instagram, Twitter, or TikTok to inspire others and grow the community.',
      target: 5,
      reward: 75,
      category: 'Social',
      type: 'social_shares'
    },
    {
      id: 'daily_dedication',
      icon: '🎯',
      title: 'Daily Dedication',
      description: 'Complete daily challenges consistently to prove your dedication to the Monarch lifestyle.',
      target: 15,
      reward: 125,
      category: 'Daily',
      type: 'daily_completions'
    },
    {
      id: 'brand_explorer',
      icon: '🛍️',
      title: 'Brand Explorer', 
      description: 'Explore the Papillon brand universe by visiting our Shopify store and engaging with our content.',
      target: 3,
      reward: 50,
      category: 'Engagement',
      type: 'brand_interactions'
    }
  ];

  const fetchQuestProgress = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch user's actual progress from multiple tables
      const [scansResult, sharesResult, dailiesResult, brandResult] = await Promise.all([
        // QR Scans from user_closet (items earned via qr_scan)
        supabase
          .from('user_closet')
          .select('id')
          .eq('user_id', user.id)
          .eq('earned_via', 'qr_scan'),
          
        // Social shares (Instagram, Twitter, TikTok)
        supabase
          .from('user_activity')
          .select('id')
          .eq('user_id', user.id)
          .eq('activity_type', 'social_share'),
          
        // Daily completions
        supabase
          .from('daily_completions')
          .select('id')
          .eq('user_id', user.id),
          
        // Brand interactions (store visits, content engagement)
        supabase
          .from('user_activity')
          .select('id')
          .eq('user_id', user.id)
          .in('activity_type', ['store_visit', 'content_view', 'brand_interaction'])
      ]);

      // Map real progress to quest definitions
      const progressData = {
        qr_scans: scansResult.data?.length || 0,
        social_shares: sharesResult.data?.length || 0,
        daily_completions: dailiesResult.data?.length || 0,
        brand_interactions: brandResult.data?.length || 0
      };

      // Create quest objects with real progress
      const questsWithProgress = QUEST_DEFINITIONS.map(quest => {
        const progress = progressData[quest.type] || 0;
        const percent = Math.min((progress / quest.target) * 100, 100);
        const completed = progress >= quest.target;

        return {
          ...quest,
          progress,
          total: quest.target,
          percent: Math.floor(percent),
          completed
        };
      });

      setQuests(questsWithProgress);
      
    } catch (err) {
      console.error('Error fetching quest progress:', err);
      setError(err.message);
      // Fallback to definitions with 0 progress
      setQuests(QUEST_DEFINITIONS.map(quest => ({
        ...quest,
        progress: 0,
        total: quest.target,
        percent: 0,
        completed: false
      })));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const completeQuest = useCallback(async (questId) => {
    try {
      // Award quest completion rewards
      const quest = quests.find(q => q.id === questId);
      if (!quest || quest.completed) return;

      // Award WINGS using RPC function
      const { error: wingsError } = await supabase.rpc('add_wings_to_user', {
        user_id_param: user.id,
        wings_amount: quest.reward,
        activity_type_param: 'quest_completion',
        description_param: `Completed quest: ${quest.title}`
      });

      if (wingsError) throw wingsError;

      // Refresh quest progress
      await fetchQuestProgress();
      
      return { success: true, reward: quest.reward };
      
    } catch (err) {
      console.error('Error completing quest:', err);
      return { success: false, error: err.message };
    }
  }, [quests, user?.id, fetchQuestProgress]);

  useEffect(() => {
    fetchQuestProgress();
  }, [fetchQuestProgress]);

  return {
    quests,
    loading,
    error,
    refresh: fetchQuestProgress,
    completeQuest
  };
}; 