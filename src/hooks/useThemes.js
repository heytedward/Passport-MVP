import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';

// Theme mapping from database reward IDs to theme keys
const THEME_MAPPING = {
  'theme_frequency_pulse': 'frequencyPulse',
  'theme_solar_shine': 'solarShine', 
  'theme_echo_glass': 'echoGlass',
  'theme_retro_frame': 'retroFrame',
  'theme_night_scan': 'nightScan'
};

export const useThemes = () => {
  const { user } = useAuth();
  const [ownedThemes, setOwnedThemes] = useState(['frequencyPulse']); // Default theme always owned
  const [equippedTheme, setEquippedTheme] = useState('frequencyPulse');
  const [loading, setLoading] = useState(true);

  // Load user's owned and equipped themes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadUserThemes();
  }, [user]);

  const loadUserThemes = async () => {
    try {
      // Get owned theme rewards
      const { data: closetData } = await supabase
        .from('user_closet')
        .select('reward_id')
        .eq('user_id', user.id)
        .like('reward_id', 'theme_%');

      // Get equipped theme
      const { data: equippedData } = await supabase
        .from('user_equipped_theme')
        .select('theme_key')
        .eq('user_id', user.id)
        .single();

      // Convert reward IDs to theme keys
      const owned = ['frequencyPulse']; // Default theme
      if (closetData) {
        closetData.forEach(item => {
          const themeKey = THEME_MAPPING[item.reward_id];
          if (themeKey && !owned.includes(themeKey)) {
            owned.push(themeKey);
          }
        });
      }

      setOwnedThemes(owned);
      setEquippedTheme(equippedData?.theme_key || 'frequencyPulse');
    } catch (error) {
      console.error('Error loading themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const equipTheme = async (themeKey) => {
    if (!user || !ownedThemes.includes(themeKey)) return false;

    try {
      // Update or insert equipped theme
      const { error } = await supabase
        .from('user_equipped_theme')
        .upsert({
          user_id: user.id,
          theme_key: themeKey,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setEquippedTheme(themeKey);
      return true;
    } catch (error) {
      console.error('Error equipping theme:', error);
      return false;
    }
  };

  const checkThemeOwnership = (themeKey) => {
    return ownedThemes.includes(themeKey);
  };

  return {
    ownedThemes,
    equippedTheme,
    loading,
    equipTheme,
    checkThemeOwnership,
    refreshThemes: loadUserThemes
  };
}; 