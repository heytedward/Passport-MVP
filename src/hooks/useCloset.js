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

  // Cache duration: 30 seconds
  const CACHE_DURATION = 30 * 1000;

  // Check if cache is still valid
  const isCacheValid = useMemo(() => {
    if (!lastFetch) return false;
    return Date.now() - lastFetch < CACHE_DURATION;
  }, [lastFetch]);

  // Simplified closet data fetch
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

      // First check if user profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        // Create user profile if it doesn't exist
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
            full_name: user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User',
            wings_balance: 0,
            current_week_wings: 0,
            week_start_date: new Date().toISOString(),
            role: 'user',
            clothing_size: user.user_metadata?.clothing_size || null
          });

        if (createError) {
          throw createError;
        }
      }

      // Single query for all closet items
      const { data, error } = await supabase
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

      if (error) {
        throw error;
      }

      // Process items with rarity-based system
      const processedItems = (data || []).map(item => ({
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

      // Calculate stats based on rarity
      const newStats = {
        total: processedItems.length,
        physical: processedItems.filter(item => item.category !== 'themes').length,
        digital: processedItems.filter(item => item.category === 'themes').length,
        limited: processedItems.filter(item => item.rarity === 'legendary').length,
        legendary: processedItems.filter(item => item.rarity === 'legendary').length,
        epic: processedItems.filter(item => item.rarity === 'epic').length,
        rare: processedItems.filter(item => item.rarity === 'rare').length,
        uncommon: processedItems.filter(item => item.rarity === 'uncommon').length,
        common: processedItems.filter(item => item.rarity === 'common').length
      };

      setStats(newStats);
      setLastFetch(Date.now());

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isCacheValid]);

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

  // Equip/unequip an item with optimistic updates
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

  // Initial load
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

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        console.warn('Closet loading timeout - forcing completion');
        setLoading(false);
        setError('Loading timeout - please refresh');
      }, 8000); // 8 second timeout
      
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