import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';

const THEME_REQUIREMENTS = {
  frequencyPulse: {
    name: 'Frequency Pulse',
    description: 'Default theme - always available',
    requirements: [
      { id: 'signup', text: 'Sign up for Monarch Passport', completed: true }
    ]
  },
  solarShine: {
    name: 'Solar Shine',
    description: 'Unlock by scanning your first QR code',
    requirements: [
      { id: 'first_scan', text: 'Scan your first QR code', target: 1 }
    ]
  },
  echoGlass: {
    name: 'Echo Glass',
    description: 'Unlock by completing 3 quests',
    requirements: [
      { id: 'quests', text: 'Complete 3 quests', target: 3 }
    ]
  },
  retroFrame: {
    name: 'Retro Frame',
    description: 'Unlock by collecting 10 items',
    requirements: [
      { id: 'items', text: 'Collect 10 items', target: 10 }
    ]
  },
  nightScan: {
    name: 'Night Scan',
    description: 'Unlock by earning 500 WNGS',
    requirements: [
      { id: 'wings', text: 'Earn 500 WNGS', target: 500 }
    ]
  }
};

export const useThemes = () => {
  const { user } = useAuth();
  const [ownedThemes, setOwnedThemes] = useState(['frequencyPulse']);
  const [equippedTheme, setEquippedTheme] = useState('frequencyPulse');
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({
    totalScans: 0,
    totalQuests: 0,
    totalItems: 0,
    totalWings: 0
  });

  // Load user themes and progress from database
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    console.log('🦋 useThemes useEffect triggered for user:', user.id);
    loadUserThemes();
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('🦋 Themes loading timeout - forcing completion');
        setLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [user]);

  const loadUserThemes = async () => {
    try {
      console.log('🦋 Loading themes for user:', user.id);
      setLoading(true);
      
      // Query all theme and progress columns
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('themes_unlocked, equipped_theme, total_scans, total_quests_completed, total_items_collected, wings_balance')
        .eq('id', user.id)
        .single();

      console.log('🦋 Profile query result:', { profile, error });

      if (error) {
        console.log('🦋 Profile error, using defaults:', error);
        // If profile doesn't exist, use default values
        setOwnedThemes(['frequencyPulse']);
        setEquippedTheme('frequencyPulse');
        setUserProgress({
          totalScans: 0,
          totalQuests: 0,
          totalItems: 0,
          totalWings: 0
        });
      } else {
        console.log('🦋 Profile found, using data:', profile);
        // Use actual data from database
        setOwnedThemes(profile.themes_unlocked || ['frequencyPulse']);
        setEquippedTheme(profile.equipped_theme || 'frequencyPulse');
        setUserProgress({
          totalScans: profile.total_scans || 0,
          totalQuests: profile.total_quests_completed || 0,
          totalItems: profile.total_items_collected || 0,
          totalWings: profile.wings_balance || 0
        });
      }

    } catch (error) {
      console.error('🦋 Error loading user themes:', error);
      // Use default values on error
      setOwnedThemes(['frequencyPulse']);
      setEquippedTheme('frequencyPulse');
      setUserProgress({
        totalScans: 0,
        totalQuests: 0,
        totalItems: 0,
        totalWings: 0
      });
    } finally {
      console.log('🦋 Setting loading to false');
      setLoading(false);
    }
  };

  // Equip a theme
  const equipTheme = async (themeKey) => {
    if (!user || !ownedThemes.includes(themeKey)) return false;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ equipped_theme: themeKey })
        .eq('id', user.id);

      if (error) throw error;

      setEquippedTheme(themeKey);
      return true;
    } catch (error) {
      console.error('Error equipping theme:', error);
      return false;
    }
  };

  // Check if theme is unlocked
  const checkThemeOwnership = (themeKey) => {
    return ownedThemes.includes(themeKey);
  };

  // Get theme requirements with progress
  const getThemeRequirements = (themeKey) => {
    const themeReq = THEME_REQUIREMENTS[themeKey];
    if (!themeReq) return null;

    const requirements = themeReq.requirements.map(req => {
      let completed = false;
      let progress = 0;

      switch (req.id) {
        case 'signup':
          completed = true;
          break;
        case 'first_scan':
          progress = userProgress.totalScans;
          completed = userProgress.totalScans >= (req.target || 1);
          break;
        case 'quests':
          progress = userProgress.totalQuests;
          completed = userProgress.totalQuests >= (req.target || 0);
          break;
        case 'items':
          progress = userProgress.totalItems;
          completed = userProgress.totalItems >= (req.target || 0);
          break;
        case 'wings':
          progress = userProgress.totalWings;
          completed = userProgress.totalWings >= (req.target || 0);
          break;
      }

      return {
        ...req,
        completed,
        progress,
        progressText: req.target ? `${progress}/${req.target}` : null
      };
    });

    return {
      ...themeReq,
      requirements
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
    loadUserThemes
  };
}; 