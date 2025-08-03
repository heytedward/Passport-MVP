import { supabase } from './supabaseClient';

// Progress tracking utility for theme unlocks
export const progressTracker = {
  // Update scan count and unlock themes
  async updateScanProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          total_scans: supabase.sql`total_scans + 1`,
          last_scan_date: new Date().toISOString()
        })
        .eq('id', userId)
        .select('total_scans, themes_unlocked')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating scan progress:', error);
      throw error;
    }
  },

  // Update quest completion count
  async updateQuestProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          total_quests_completed: supabase.sql`total_quests_completed + 1`,
          last_quest_completion_date: new Date().toISOString()
        })
        .eq('id', userId)
        .select('total_quests_completed, themes_unlocked')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating quest progress:', error);
      throw error;
    }
  },

  // Update item collection count
  async updateItemProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          total_items_collected: supabase.sql`total_items_collected + 1`
        })
        .eq('id', userId)
        .select('total_items_collected, themes_unlocked')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating item progress:', error);
      throw error;
    }
  },

  // Update WNGS balance
  async updateWingsProgress(userId, wingsEarned) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          wings_balance: supabase.sql`wings_balance + ${wingsEarned}`,
          current_week_wings: supabase.sql`current_week_wings + ${wingsEarned}`
        })
        .eq('id', userId)
        .select('wings_balance, themes_unlocked')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating wings progress:', error);
      throw error;
    }
  },

  // Get current progress
  async getCurrentProgress(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('total_scans, total_quests_completed, total_items_collected, wings_balance, themes_unlocked, equipped_theme')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting current progress:', error);
      throw error;
    }
  }
}; 