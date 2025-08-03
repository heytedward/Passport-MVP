import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';

export const useAdmin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    totalWings: 0,
    activeUsers: 0,
    successRate: 0,
    dailyActiveUsers: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_activity (
            activity_type,
            activity_date,
            wings_earned
          ),
          user_closet (
            id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedUsers = data?.map(user => {
        const activities = user.user_activity || [];
        const lastActivity = activities.length > 0 ? 
          new Date(Math.max(...activities.map(a => new Date(a.activity_date)))) : null;
        
        return {
          id: user.id,
          name: user.full_name || user.username || 'Unknown User',
          email: user.email,
          wings: user.wings_balance || 0,
          items: user.user_closet?.length || 0,
          status: user.role === 'banned' ? 'banned' : 'active',
          joinDate: user.created_at,
          lastScan: lastActivity,
          totalScans: activities.filter(a => a.activity_type === 'scan').length,
          tier: getTier(user.wings_balance || 0)
        };
      }) || [];

      setUsers(processedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    }
  }, [isAdmin]);

  // Fetch rewards
  const fetchRewards = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRewards(data || []);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError(err.message);
    }
  }, [isAdmin]);

  // Fetch categories with stats
  const fetchCategories = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Get all rewards grouped by category
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards')
        .select('category, is_active');

      if (rewardsError) throw rewardsError;

      // Get scan counts by category
      const { data: scanData, error: scanError } = await supabase
        .from('user_activity')
        .select('metadata')
        .eq('activity_type', 'scan');

      if (scanError) throw scanError;

      // Process category stats
      const categoryStats = {};
      rewardsData?.forEach(reward => {
        if (!categoryStats[reward.category]) {
          categoryStats[reward.category] = {
            name: reward.category,
            enabled: reward.is_active,
            itemCount: 0,
            scanCount: 0,
            revenue: 0
          };
        }
        categoryStats[reward.category].itemCount++;
      });

      // Count scans by category from metadata
      scanData?.forEach(scan => {
        const category = scan.metadata?.category;
        if (category && categoryStats[category]) {
          categoryStats[category].scanCount++;
        }
      });

      setCategories(Object.values(categoryStats));
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    }
  }, [isAdmin]);

  // Fetch recent activity
  const fetchRecentActivity = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select(`
          *,
          user_profiles!user_activity_user_id_fkey (
            email,
            username
          )
        `)
        .order('activity_date', { ascending: false })
        .limit(20);

      if (error) throw error;

      const processedActivity = data?.map(activity => ({
        id: activity.id,
        user: activity.user_profiles?.email || activity.user_profiles?.username || 'Unknown',
        action: activity.activity_type === 'scan' ? 'QR Scan' : 
                activity.activity_type === 'quest' ? 'Quest Complete' :
                activity.activity_type === 'referral' ? 'Referral' : 'Activity',
        reward: activity.activity_title,
        time: formatTimeAgo(activity.activity_date),
        status: activity.wings_earned > 0 ? 'success' : 'failed'
      })) || [];

      setRecentActivity(processedActivity);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setError(err.message);
    }
  }, [isAdmin]);

  // Fetch admin stats
  const fetchStats = useCallback(async () => {
    if (!isAdmin) return;

    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Get total scans
      const { count: totalScans } = await supabase
        .from('user_activity')
        .select('*', { count: 'exact', head: true })
        .eq('activity_type', 'scan');

      // Get total wings
      const { data: wingsData } = await supabase
        .from('user_profiles')
        .select('wings_balance');

      const totalWings = wingsData?.reduce((sum, user) => sum + (user.wings_balance || 0), 0) || 0;

      // Get active users (users with activity in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: activeUsers } = await supabase
        .from('user_activity')
        .select('user_id', { count: 'exact', head: true })
        .gte('activity_date', sevenDaysAgo.toISOString());

      // Get daily active users
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: dailyActiveUsers } = await supabase
        .from('user_activity')
        .select('user_id', { count: 'exact', head: true })
        .gte('activity_date', today.toISOString());

      // Calculate success rate (successful scans vs total scans)
      const { count: successfulScans } = await supabase
        .from('user_activity')
        .select('*', { count: 'exact', head: true })
        .eq('activity_type', 'scan')
        .gt('wings_earned', 0);

      const successRate = totalScans > 0 ? (successfulScans / totalScans) * 100 : 0;

      // Calculate conversion rate (users with items vs total users)
      const { count: usersWithItems } = await supabase
        .from('user_closet')
        .select('user_id', { count: 'exact', head: true });

      const conversionRate = totalUsers > 0 ? (usersWithItems / totalUsers) * 100 : 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalScans: totalScans || 0,
        totalWings,
        activeUsers: activeUsers || 0,
        successRate: Math.round(successRate),
        dailyActiveUsers: dailyActiveUsers || 0,
        conversionRate: Math.round(conversionRate)
      });

    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message);
    }
  }, [isAdmin]);

  // Helper functions
  const getTier = (wings) => {
    if (wings >= 5000) return 'platinum';
    if (wings >= 2000) return 'gold';
    if (wings >= 1000) return 'silver';
    return 'bronze';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Load all admin data
  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;

    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchRewards(),
        fetchCategories(),
        fetchRecentActivity(),
        fetchStats()
      ]);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, fetchUsers, fetchRewards, fetchCategories, fetchRecentActivity, fetchStats]);

  // Initial load
  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  return {
    users,
    rewards,
    categories,
    recentActivity,
    stats,
    loading,
    error,
    isAdmin,
    refreshData: loadAdminData
  };
}; 