import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from './useAuth';
import { themes, getTheme, getAllThemes, getUnlockedThemes, getLockedThemes, DEFAULT_THEME_KEY } from '../config/themes';

// Timeout wrapper for database calls
const withTimeout = (promise, ms = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), ms)
    )
  ]);
};

export const useTheme = () => {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME_KEY);
  const [ownedThemes, setOwnedThemes] = useState([DEFAULT_THEME_KEY]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewTheme, setPreviewTheme] = useState(null);
  
  // Add switch state management
  const [isSwitchingTheme, setIsSwitchingTheme] = useState(false);
  const switchingTimeoutRef = useRef(null);
  
  const hasInitializedRef = useRef(false);
  const isProcessingRef = useRef(false);

  // Apply theme to the app (define this first to avoid circular dependency)
  const applyTheme = useCallback((themeKey) => {
    const theme = getTheme(themeKey);
    if (!theme) return;

    // Apply theme to document root
    const root = document.documentElement;
    const { colors } = theme;

    // Apply background
    if (colors.backgroundGradient) {
      root.style.background = colors.backgroundGradient;
    } else {
      root.style.background = colors.background;
    }

    // Apply CSS custom properties
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-card-bg', colors.cardBackground);
    root.style.setProperty('--theme-card-border', colors.cardBorder);
    root.style.setProperty('--theme-card-blur', colors.cardBackdropFilter);
    root.style.setProperty('--theme-button-gradient', colors.buttonGradient);
    root.style.setProperty('--theme-button-hover', colors.buttonHover);
    root.style.setProperty('--theme-text-primary', colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-accent-stroke', colors.accentStroke);
    root.style.setProperty('--theme-success', colors.successColor);
    root.style.setProperty('--theme-error', colors.errorColor);
    root.style.setProperty('--theme-warning', colors.warningColor);

    console.log('🦋 Applied theme:', themeKey);
  }, []);

  // Load user's theme preferences from Supabase
  const loadUserTheme = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    // CRITICAL: Don't load if actively switching themes
    if (isSwitchingTheme) {
      console.log('🔒 Skipping theme load - switch in progress');
      return;
    }

    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;

    try {
      console.log('🦋 Loading theme preferences for user:', user.id);
      setLoading(true);
      setError(null);

      // INSTANT: Load from localStorage first (no delay)
      const storedTheme = localStorage.getItem(`theme_${user.id}`);
      if (storedTheme && themes[storedTheme]) {
        console.log('📦 Using stored theme:', storedTheme);
        setCurrentTheme(storedTheme);
        applyTheme(storedTheme);
      }

      // Background: Sync with database (don't block UI)
      try {
        const { data: profileData, error: profileError } = await Promise.race([
          supabase
            .from('user_profiles')
            .select('equipped_theme, owned_themes')
            .eq('id', user.id)
            .single(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]);

        // Only update if database has different theme AND we're not switching
        if (!profileError && !isSwitchingTheme && profileData?.equipped_theme && 
            profileData.equipped_theme !== currentTheme && 
            themes[profileData.equipped_theme]) {
          
          console.log('🔄 Syncing with database theme:', profileData.equipped_theme);
          setCurrentTheme(profileData.equipped_theme);
          applyTheme(profileData.equipped_theme);
          localStorage.setItem(`theme_${user.id}`, profileData.equipped_theme);
        }

        // Update owned themes
        if (profileData?.owned_themes && Array.isArray(profileData.owned_themes)) {
          setOwnedThemes(profileData.owned_themes);
        } else {
          // Fallback: Give access to all themes for demo
          setOwnedThemes(Object.keys(themes));
        }

      } catch (dbError) {
        console.warn('⚠️ Database sync failed, using localStorage:', dbError);
        // Fallback: Give access to all themes
        setOwnedThemes(Object.keys(themes));
      }

    } catch (err) {
      console.warn('🦋 Theme loading failed:', err);
      // Don't revert theme on error - keep current
    } finally {
      setLoading(false);
      isProcessingRef.current = false;
    }
  }, [user, isSwitchingTheme, currentTheme, applyTheme]);

  // Save theme preference to Supabase
  const saveThemePreference = useCallback(async (themeKey) => {
    if (!user || !themes[themeKey]) {
      return { success: false, error: 'Invalid theme or user' };
    }

    try {
      console.log('💾 Saving theme preference:', themeKey);

      // Save locally immediately (instant)
      localStorage.setItem(`theme_${user.id}`, themeKey);

      // Database save with timeout (background)
      const { error: updateError } = await Promise.race([
        supabase
          .from('user_profiles')
          .update({ equipped_theme: themeKey })
          .eq('id', user.id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Save timeout')), 3000)
        )
      ]);

      if (updateError) {
        console.warn('⚠️ Database save failed, using localStorage:', updateError);
        return { success: true }; // Still success because localStorage worked
      }

      console.log('✅ Theme saved to database');
      return { success: true };

    } catch (err) {
      console.warn('⚠️ Theme save failed:', err);
      return { success: true }; // localStorage already worked
    }
  }, [user]);

  // Unlock a theme for the user
  const unlockTheme = useCallback(async (themeKey) => {
    if (!user || !themes[themeKey]) {
      return { success: false, error: 'Invalid theme or user' };
    }

    try {
      console.log('🦋 Unlocking theme:', themeKey);

      // Add theme to owned themes if not already owned
      const newOwnedThemes = ownedThemes.includes(themeKey) 
        ? ownedThemes 
        : [...ownedThemes, themeKey];

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ owned_themes: newOwnedThemes })
        .eq('id', user.id);

      if (updateError) {
        console.error('🦋 Error unlocking theme:', updateError);
        return { success: false, error: updateError.message };
      }

      setOwnedThemes(newOwnedThemes);
      return { success: true };

    } catch (err) {
      console.error('🦋 Error in unlockTheme:', err);
      return { success: false, error: err.message };
    }
  }, [user, ownedThemes]);

  // Unlock all themes for testing (admin function)
  const unlockAllThemes = useCallback(async () => {
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      console.log('🦋 Unlocking all themes for testing');

      const allThemeKeys = Object.keys(themes);
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ owned_themes: allThemeKeys })
        .eq('id', user.id);

      if (updateError) {
        console.error('🦋 Error unlocking all themes:', updateError);
        return { success: false, error: updateError.message };
      }

      setOwnedThemes(allThemeKeys);
      return { success: true };

    } catch (err) {
      console.error('🦋 Error in unlockAllThemes:', err);
      return { success: false, error: err.message };
    }
  }, [user]);



  // Switch to a new theme
  const switchTheme = useCallback(async (themeKey) => {
    if (!themes[themeKey]) {
      console.error('🦋 Invalid theme key:', themeKey);
      return { success: false, error: 'Invalid theme' };
    }

    console.log('⚡ Instant theme switch:', themeKey);

    // Lock switching to prevent database overrides
    setIsSwitchingTheme(true);
    
    // Clear any existing timeout
    if (switchingTimeoutRef.current) {
      clearTimeout(switchingTimeoutRef.current);
    }

    // 1. Apply theme immediately (no delay)
    setCurrentTheme(themeKey);
    applyTheme(themeKey);
    setPreviewTheme(null);
    
    // 2. Store in localStorage immediately (instant persistence)
    if (user?.id) {
      localStorage.setItem(`theme_${user.id}`, themeKey);
    }

    // 3. Background database save (don't await - no blocking)
    saveThemePreference(themeKey).catch(err => 
      console.warn('⚠️ Background theme save failed:', err)
    );

    // 4. Unlock after short delay to prevent interference
    switchingTimeoutRef.current = setTimeout(() => {
      setIsSwitchingTheme(false);
    }, 500); // Short lock to prevent database interference

    return { success: true };
  }, [applyTheme, saveThemePreference, user]);

  // Preview a theme without saving
  const previewThemeAction = useCallback((themeKey) => {
    if (!themes[themeKey]) return;

    setPreviewTheme(themeKey);
    applyTheme(themeKey);
  }, [applyTheme]);

  // Clear theme preview
  const clearPreview = useCallback(() => {
    if (previewTheme) {
      setPreviewTheme(null);
      applyTheme(currentTheme); // Restore current theme
    }
  }, [previewTheme, currentTheme, applyTheme]);

  // Get available themes
  const getAvailableThemes = useCallback(() => {
    return getUnlockedThemes(ownedThemes);
  }, [ownedThemes]);

  // Get locked themes
  const getLockedThemesList = useCallback(() => {
    return getLockedThemes(ownedThemes);
  }, [ownedThemes]);

  // Check if user owns a theme
  const ownsTheme = useCallback((themeKey) => {
    return ownedThemes.includes(themeKey) || (themes[themeKey]?.unlocked || false);
  }, [ownedThemes]);

  // Initialize theme system
  useEffect(() => {
    if (user && !hasInitializedRef.current && !isSwitchingTheme) {
      hasInitializedRef.current = true;
      loadUserTheme();
    }
  }, [user, loadUserTheme, isSwitchingTheme]);

  // Apply current theme when it changes
  useEffect(() => {
    if (currentTheme && !loading) {
      applyTheme(currentTheme);
    }
  }, [currentTheme, loading, applyTheme]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (switchingTimeoutRef.current) {
        clearTimeout(switchingTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    currentTheme,
    ownedThemes,
    loading,
    error,
    previewTheme,
    
    // Theme data
    themes: getAllThemes(),
    availableThemes: getAvailableThemes(),
    lockedThemes: getLockedThemesList(),
    currentThemeData: getTheme(currentTheme),
    
    // Actions
    switchTheme,
    previewTheme: previewThemeAction,
    clearPreview,
    unlockTheme,
    unlockAllThemes,
    ownsTheme,
    
    // Utilities
    getTheme,
    reload: loadUserTheme
  };
};

export default useTheme; 