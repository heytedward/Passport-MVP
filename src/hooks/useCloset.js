import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';

export const useCloset = () => {
  const { user } = useAuth();
  const [closetItems, setClosetItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    physical: 0,
    digital: 0,
    limited: 0,
    legendary: 0,
    epic: 0,
    rare: 0,
    uncommon: 0,
    common: 0
  });

  // Increased cache duration to 2 minutes for better performance
  const CACHE_DURATION = 2 * 60 * 1000;

  // Check if cache is still valid
  const isCacheValid = useMemo(() => {
    if (!lastFetch) return false;
    return Date.now() - lastFetch < CACHE_DURATION;
  }, [lastFetch]);

  // Optimized closet data fetch with single query and better error handling
  const fetchClosetItems = useCallback(async (forceRefresh = false) => {
    if (!user) {
      return;
    }

    // Return cached data if still valid and not forcing refresh
    if (isCacheValid && !forceRefresh && closetItems.length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use the optimized database function for better performance
      const { data, error } = await supabase
        .rpc('get_user_closet_cards', { user_id_param: user.id });

      if (error) {
        // Fallback to direct query if function doesn't exist
        console.warn('Optimized function not available, using fallback query');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_closet')
          .select(`
            *,
            rewards:reward_id (
              name,
              description,
              category,
              rarity,
              wings_value,
              season,
              image_url,
              is_active
            )
          `)
          .eq('user_id', user.id)
          .order('earned_date', { ascending: false });

        if (fallbackError) {
          throw fallbackError;
        }
        
        // Process fallback data
        const processedItems = (fallbackData || []).map(item => ({
          id: item.id,
          item_id: item.reward_id,
          name: item.name || item.rewards?.name || 'Unknown Item',
          rarity: item.rarity || item.rewards?.rarity || 'common',
          category: item.category || item.rewards?.category || 'misc',
          mint_number: item.mint_number,
          wings_earned: item.wings_earned || item.rewards?.wings_value || 0,
          earned_date: item.earned_date,
          earned_via: item.earned_via,
          is_equipped: item.is_equipped || false,
          reward_data: item.rewards,
          image_url: item.rewards?.image_url
        }));

        setClosetItems(processedItems);
        updateStats(processedItems);
      } else {
        // Use optimized function data
        setClosetItems(data || []);
        updateStats(data || []);
      }

      setLastFetch(Date.now());

    } catch (err) {
      console.error('Error fetching closet items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isCacheValid, closetItems.length]);

  // Optimized stats calculation
  const updateStats = useCallback((items) => {
    const newStats = {
      total: items.length,
      physical: 0,
      digital: 0,
      limited: 0,
      legendary: 0,
      epic: 0,
      rare: 0,
      uncommon: 0,
      common: 0
    };

    // Single pass through items for all stats
    items.forEach(item => {
      if (item.category !== 'themes') {
        newStats.physical++;
      } else {
        newStats.digital++;
      }

      switch (item.rarity) {
        case 'legendary':
          newStats.legendary++;
          newStats.limited++;
          break;
        case 'epic':
          newStats.epic++;
          break;
        case 'rare':
          newStats.rare++;
          break;
        case 'uncommon':
          newStats.uncommon++;
          break;
        case 'common':
          newStats.common++;
          break;
      }
    });

    setStats(newStats);
  }, []);

  // Memoized computed values for better performance
  const equippedItems = useMemo(() => 
    closetItems.filter(item => item.is_equipped), 
    [closetItems]
  );

  const itemsByCategory = useMemo(() => {
    const categories = {};
    closetItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });
    return categories;
  }, [closetItems]);

  const itemsByRarity = useMemo(() => {
    const rarities = {};
    closetItems.forEach(item => {
      if (!rarities[item.rarity]) {
        rarities[item.rarity] = [];
      }
      rarities[item.rarity].push(item);
    });
    return rarities;
  }, [closetItems]);

  // Optimized equip/unequip with better error handling
  const toggleEquipItem = useCallback(async (itemId) => {
    if (!user) return;

    try {
      // Optimistic update
      setClosetItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, is_equipped: !item.is_equipped }
          : item
      ));

      const { error } = await supabase
        .from('user_closet')
        .update({ is_equipped: !closetItems.find(item => item.id === itemId)?.is_equipped })
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error toggling equip status:', err);
      setError(err.message);
      // Revert optimistic update on error
      await fetchClosetItems(true);
    }
  }, [user, closetItems, fetchClosetItems]);

  // Get items by category (memoized)
  const getItemsByCategory = useCallback((category) => {
    return itemsByCategory[category] || [];
  }, [itemsByCategory]);

  // Get items by rarity (memoized)
  const getItemsByRarity = useCallback((rarity) => {
    return itemsByRarity[rarity] || [];
  }, [itemsByRarity]);

  // Refresh closet data
  const refreshCloset = useCallback(() => {
    fetchClosetItems(true);
  }, [fetchClosetItems]);

  // Initial load with better error handling
  useEffect(() => {
    if (user) {
      fetchClosetItems();
    } else {
      // Reset state when user is not authenticated
      setClosetItems([]);
      setLoading(false);
      setError(null);
    }
  }, [user, fetchClosetItems]);

  // Reduced timeout to 5 seconds for faster feedback
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.warn('Closet loading timeout - forcing completion');
        setLoading(false);
        setError('Loading timeout - please refresh');
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  return {
    closetItems,
    loading,
    error,
    stats,
    equippedItems,
    toggleEquipItem,
    getEquippedItems: () => equippedItems,
    getItemsByCategory,
    getItemsByRarity,
    refreshCloset,
    isCacheValid
  };
}; 