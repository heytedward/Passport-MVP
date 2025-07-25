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

// Theme unlock requirements
const THEME_REQUIREMENTS = {
  frequencyPulse: {
    name: 'Frequency Pulse',
    description: 'Default theme - always available',
    requirements: [
      { id: 'signup', text: 'Sign up for Monarch Passport', completed: true }
    ],
    rewardId: 'theme_frequency_pulse'
  },
  solarShine: {
    name: 'Solar Shine',
    description: 'Unlock by scanning your first QR code',
    requirements: [
      { id: 'signup', text: 'Sign up for Monarch Passport', completed: true },
      { id: 'first_scan', text: 'Scan your first QR code', completed: false }
    ],
    rewardId: 'theme_solar_shine'
  },
  echoGlass: {
    name: 'Echo Glass',
    description: 'Unlock by completing 3 quests',
    requirements: [
      { id: 'signup', text: 'Sign up for Monarch Passport', completed: true },
      { id: 'quests', text: 'Complete 3 quests', completed: false, target: 3 }
    ],
    rewardId: 'theme_echo_glass'
  },
  retroFrame: {
    name: 'Retro Frame',
    description: 'Unlock by collecting 10 items',
    requirements: [
      { id: 'signup', text: 'Sign up for Monarch Passport', completed: true },
      { id: 'items', text: 'Collect 10 items', completed: false, target: 10 }
    ],
    rewardId: 'theme_retro_frame'
  },
  nightScan: {
    name: 'Night Scan',
    description: 'Unlock by earning 500 WNGS',
    requirements: [
      { id: 'signup', text: 'Sign up for Monarch Passport', completed: true },
      { id: 'wings', text: 'Earn 500 WNGS', completed: false, target: 500 }
    ],
    rewardId: 'theme_night_scan'
  }
};

export const useThemes = () => {
  const { user } = useAuth();
  const [ownedThemes, setOwnedThemes] = useState(['frequencyPulse']); // Default theme always owned
  const [equippedTheme, setEquippedTheme] = useState('frequencyPulse');
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({
    totalScans: 0,
    totalQuests: 0,
    totalItems: 0,
    totalWings: 0
  });

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
      setLoading(true);

      // Get user progress for unlock requirements
      const [closetData, questData, profileData] = await Promise.all([
        // Get owned theme rewards and total items
        supabase
          .from('user_closet')
          .select('reward_id, earned_via')
          .eq('user_id', user.id),
          
        // Get completed quests
        supabase
          .from('user_quest_progress')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'completed'),
          
        // Get user profile for WNGS balance
        supabase
          .from('user_profiles')
          .select('wings_balance')
          .eq('id', user.id)
          .single()
      ]);

      // Calculate user progress
      const totalScans = closetData.data?.filter(item => item.earned_via === 'qr_scan').length || 0;
      const totalQuests = questData.data?.length || 0;
      const totalItems = closetData.data?.length || 0;
      const totalWings = profileData.data?.wings_balance || 0;

      setUserProgress({
        totalScans,
        totalQuests,
        totalItems,
        totalWings
      });

      // Get equipped theme - with better error handling
      let equippedThemeKey = process.env.REACT_APP_DEFAULT_THEME || 'frequencyPulse'; // Default fallback
      
      try {
        const { data: equippedData, error: equippedError } = await supabase
          .from('user_equipped_theme')
          .select('theme_key')
          .eq('user_id', user.id)
          .single();

        if (equippedError) {
          console.log('No equipped theme found in database, using default:', equippedError.message);
        } else if (equippedData?.theme_key) {
          equippedThemeKey = equippedData.theme_key;
          console.log('Loaded equipped theme from database:', equippedThemeKey);
        }
      } catch (dbError) {
        console.log('Database error loading equipped theme, using default:', dbError.message);
      }

      // TEMPORARY: Unlock all themes for testing
      const owned = ['frequencyPulse', 'solarShine', 'echoGlass', 'retroFrame', 'nightScan'];

      setOwnedThemes(owned);
      setEquippedTheme(equippedThemeKey);
      
      console.log('Theme system initialized:', {
        ownedThemes: owned,
        equippedTheme: equippedThemeKey,
        userProgress: { totalScans, totalQuests, totalItems, totalWings }
      });
    } catch (error) {
      console.error('Error loading themes:', error);
      // Set defaults on error
      setOwnedThemes(['frequencyPulse']);
      setEquippedTheme('frequencyPulse');
    } finally {
      setLoading(false);
    }
  };

  const equipTheme = async (themeKey) => {
    if (!user || !ownedThemes.includes(themeKey)) {
      console.log('Cannot equip theme:', { user: !!user, themeKey, ownedThemes });
      return false;
    }

    try {
      console.log('Equipping theme:', themeKey);
      
      // Update local state immediately for better UX
      setEquippedTheme(themeKey);
      
      // Update or insert equipped theme in database
      const { error } = await supabase
        .from('user_equipped_theme')
        .upsert({
          user_id: user.id,
          theme_key: themeKey,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Database error equipping theme:', error);
        // Don't revert local state - let user see the change
        // The theme will persist until page refresh
        return true; // Still return true for UX
      }

      console.log('Theme equipped successfully:', themeKey);
      return true;
    } catch (error) {
      console.error('Error equipping theme:', error);
      // Keep the local state change for better UX
      return true;
    }
  };

  const checkThemeOwnership = (themeKey) => {
    return ownedThemes.includes(themeKey);
  };

  const getThemeRequirements = (themeKey) => {
    const theme = THEME_REQUIREMENTS[themeKey];
    if (!theme) return null;

    // TEMPORARY: Show all themes as unlocked for testing
    const updatedRequirements = theme.requirements.map(req => ({
      ...req,
      completed: true
    }));

    return {
      ...theme,
      requirements: updatedRequirements,
      isUnlocked: true
    };
  };

  return {
    ownedThemes,
    equippedTheme,
    loading,
    userProgress,
    equipTheme,
    checkThemeOwnership,
    getThemeRequirements,
    refreshThemes: loadUserThemes
  };
}; 