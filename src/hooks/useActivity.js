import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';

export const useActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    scans: 0,
    quests: 0,
    events: 0,
    referrals: 0,
    totalWings: 0
  });

  // Fetch user activities
  const fetchActivities = useCallback(async (limit = 50) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_activity')
        .select(`
          *,
          user_profiles!user_activity_user_id_fkey (
            username,
            full_name
          )
        `)
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      // Process activities
      const processedActivities = data?.map(activity => ({
        id: activity.id,
        activity_type: activity.activity_type,
        activity_title: activity.activity_title,
        activity_description: activity.activity_description,
        wings_earned: activity.wings_earned,
        reward_id: activity.reward_id,
        activity_date: activity.activity_date,
        metadata: activity.metadata,
        user: activity.user_profiles
      })) || [];

      setActivities(processedActivities);

      // Calculate stats
      const newStats = {
        total: processedActivities.length,
        scans: processedActivities.filter(a => a.activity_type === 'scan').length,
        quests: processedActivities.filter(a => a.activity_type === 'quest').length,
        events: processedActivities.filter(a => a.activity_type === 'event').length,
        referrals: processedActivities.filter(a => a.activity_type === 'referral').length,
        totalWings: processedActivities.reduce((sum, a) => sum + (a.wings_earned || 0), 0)
      };

      setStats(newStats);

    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add new activity
  const addActivity = useCallback(async (activityData) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: activityData.type,
          activity_title: activityData.title,
          activity_description: activityData.description,
          wings_earned: activityData.wingsEarned || 0,
          reward_id: activityData.rewardId,
          metadata: activityData.metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setActivities(prev => [data, ...prev]);

      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        [data.activity_type]: prev[data.activity_type] + 1,
        totalWings: prev.totalWings + (data.wings_earned || 0)
      }));

      return data;
    } catch (err) {
      console.error('Error adding activity:', err);
      setError(err.message);
      throw err;
    }
  }, [user]);

  // Get activities by type
  const getActivitiesByType = useCallback((type) => {
    return activities.filter(activity => activity.activity_type === type);
  }, [activities]);

  // Get recent activities (last 7 days)
  const getRecentActivities = useCallback(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return activities.filter(activity => 
      new Date(activity.activity_date) > sevenDaysAgo
    );
  }, [activities]);

  // Get activities by date range
  const getActivitiesByDateRange = useCallback((startDate, endDate) => {
    return activities.filter(activity => {
      const activityDate = new Date(activity.activity_date);
      return activityDate >= startDate && activityDate <= endDate;
    });
  }, [activities]);

  // Get wings earned in date range
  const getWingsEarnedInRange = useCallback((startDate, endDate) => {
    const activitiesInRange = getActivitiesByDateRange(startDate, endDate);
    return activitiesInRange.reduce((sum, activity) => sum + (activity.wings_earned || 0), 0);
  }, [getActivitiesByDateRange]);

  // Refresh activities
  const refreshActivities = useCallback(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Initial load
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activities,
    loading,
    error,
    stats,
    addActivity,
    getActivitiesByType,
    getRecentActivities,
    getActivitiesByDateRange,
    getWingsEarnedInRange,
    refreshActivities
  };
}; 