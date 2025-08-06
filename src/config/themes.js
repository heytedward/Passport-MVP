// Monarch Passport MVP - Complete Theme System
// Fashion brand Papillon - Premium luxury themes

export const themes = {
  frequencyPulse: {
    key: 'frequencyPulse',
    name: "Frequency Pulse",
    description: "Purple frequency pulse with elegant energy",
    colors: {
      background: "linear-gradient(135deg, #4C1C8C 0%, #7C3AED 100%)",
      backgroundGradient: "linear-gradient(135deg, #4C1C8C 0%, #7C3AED 100%)",
      cardBackground: "rgba(76, 28, 140, 0.2)",
      cardBorder: "1px solid rgba(147, 51, 234, 0.4)",
      cardBackdropFilter: "blur(15px)",
      buttonGradient: "linear-gradient(135deg, #4C1C8C 0%, #7C3AED 50%, #A855F7 100%)",
      buttonHover: "linear-gradient(135deg, #3B1A6B 0%, #6B2BD6 50%, #9744E6 100%)",
      textPrimary: "#F3E8FF",
      textSecondary: "#DDD6FE",
      textMuted: "#C4B5FD",
      accent: "#9333EA",
      accentStroke: "2px solid #9333EA",
      successColor: "#10B981",
      errorColor: "#EF4444",
      warningColor: "#F59E0B"
    },
    unlocked: true,
    isDefault: true,
    category: "themes",
    rarity: "EPIC",
    previewImage: null
  },
  
  solarShine: {
    key: 'solarShine',
    name: "Solar Shine",
    description: "Warm solar radiance with golden energy",
    colors: {
      background: "linear-gradient(135deg, #FF8C00 0%, #FFB000 100%)",
      backgroundGradient: "linear-gradient(135deg, #FF8C00 0%, #FFB000 100%)",
      cardBackground: "rgba(255, 176, 0, 0.15)",
      cardBorder: "1px solid rgba(255, 215, 0, 0.3)",
      cardBackdropFilter: "blur(12px)",
      buttonGradient: "linear-gradient(135deg, #FF8C00 0%, #FFB000 50%, #FFED4E 100%)",
      buttonHover: "linear-gradient(135deg, #E67E00 0%, #E69A00 50%, #E6D645 100%)",
      textPrimary: "#FFFAF0",
      textSecondary: "#FFE4B5",
      textMuted: "#DEB887",
      accent: "#FF8C00",
      accentStroke: "2px solid #FF8C00",
      successColor: "#32D74B",
      errorColor: "#FF453A",
      warningColor: "#FF9F0A"
    },
    unlocked: true,
    isDefault: false,
    category: "themes",
    rarity: "EPIC",
    previewImage: null
  },
  
  echoGlass: {
    key: 'echoGlass',
    name: "Echo Glass",
    description: "Dark glass theme with mysterious elegance",
    colors: {
      background: "#000000",
      backgroundGradient: null, // solid color
      cardBackground: "rgba(148, 163, 184, 0.1)",
      cardBorder: "1px solid rgba(203, 213, 225, 0.2)",
      cardBackdropFilter: "blur(10px)",
      buttonGradient: "linear-gradient(135deg, #1E293B 0%, #475569 50%, #64748B 100%)",
      buttonHover: "linear-gradient(135deg, #0F172A 0%, #334155 50%, #475569 100%)",
      textPrimary: "#F1F5F9",
      textSecondary: "#CBD5E1",
      textMuted: "#94A3B8",
      accent: "#64748B",
      accentStroke: "2px solid #64748B",
      successColor: "#10B981",
      errorColor: "#EF4444",
      warningColor: "#F59E0B"
    },
    unlocked: true,
    isDefault: false,
    category: "themes",
    rarity: "EPIC",
    previewImage: null
  },
  
  retroFrame: {
    key: 'retroFrame',
    name: "Retro Frame",
    description: "Classic retro frame with golden accents",
    colors: {
      background: "linear-gradient(135deg, #2D2D2D 0%, #4A4A4A 100%)",
      backgroundGradient: "linear-gradient(135deg, #2D2D2D 0%, #4A4A4A 100%)",
      cardBackground: "rgba(212, 175, 55, 0.1)",
      cardBorder: "1px solid rgba(255, 215, 0, 0.3)",
      cardBackdropFilter: "blur(12px)",
      buttonGradient: "linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #FFF8DC 100%)",
      buttonHover: "linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #F0E68C 100%)",
      textPrimary: "#FFF8DC",
      textSecondary: "#F0E68C",
      textMuted: "#DEB887",
      accent: "#D4AF37",
      accentStroke: "2px solid #D4AF37",
      successColor: "#10B981",
      errorColor: "#EF4444",
      warningColor: "#F59E0B"
    },
    unlocked: true,
    isDefault: false,
    category: "themes",
    rarity: "EPIC",
    previewImage: null
  },
  
  nightScan: {
    key: 'nightScan',
    name: "Night Scan",
    description: "Dark purple night scanning theme",
    colors: {
      background: "linear-gradient(135deg, #1A0A2E 0%, #16213E 100%)",
      backgroundGradient: "linear-gradient(135deg, #1A0A2E 0%, #16213E 100%)",
      cardBackground: "rgba(66, 32, 110, 0.15)",
      cardBorder: "1px solid rgba(102, 51, 153, 0.3)",
      cardBackdropFilter: "blur(15px)",
      buttonGradient: "linear-gradient(135deg, #42206E 0%, #663399 50%, #8A4FFF 100%)",
      buttonHover: "linear-gradient(135deg, #2D1B4E 0%, #4B2C6B 50%, #6A4F93 100%)",
      textPrimary: "#E6E6FA",
      textSecondary: "#D8BFD8",
      textMuted: "#B8A9C9",
      accent: "#8A4FFF",
      accentStroke: "2px solid #8A4FFF",
      successColor: "#10B981",
      errorColor: "#EF4444",
      warningColor: "#F59E0B"
    },
    unlocked: true,
    isDefault: false,
    category: "themes",
    rarity: "EPIC",
    previewImage: null
  }
};

// Theme management utilities
export const getTheme = (themeKey) => {
  return themes[themeKey] || themes.frequencyPulse;
};

export const getAllThemes = () => {
  return Object.values(themes);
};

export const getUnlockedThemes = (userOwnedThemes = []) => {
  return getAllThemes().filter(theme => 
    theme.unlocked || userOwnedThemes.includes(theme.key)
  );
};

export const getLockedThemes = (userOwnedThemes = []) => {
  return getAllThemes().filter(theme => 
    !theme.unlocked && !userOwnedThemes.includes(theme.key)
  );
};

// Theme application utilities
export const applyThemeToElement = (element, themeKey) => {
  const theme = getTheme(themeKey);
  if (!theme || !element) return;

  const { colors } = theme;
  
  // Apply background
  if (colors.backgroundGradient) {
    element.style.background = colors.backgroundGradient;
  } else {
    element.style.background = colors.background;
  }
  
  // Apply CSS custom properties for styled-components
  element.style.setProperty('--theme-background', colors.background);
  element.style.setProperty('--theme-card-bg', colors.cardBackground);
  element.style.setProperty('--theme-card-border', colors.cardBorder);
  element.style.setProperty('--theme-card-blur', colors.cardBackdropFilter);
  element.style.setProperty('--theme-button-gradient', colors.buttonGradient);
  element.style.setProperty('--theme-button-hover', colors.buttonHover);
  element.style.setProperty('--theme-text-primary', colors.textPrimary);
  element.style.setProperty('--theme-text-secondary', colors.textSecondary);
  element.style.setProperty('--theme-text-muted', colors.textMuted);
  element.style.setProperty('--theme-accent', colors.accent);
  element.style.setProperty('--theme-accent-stroke', colors.accentStroke);
  element.style.setProperty('--theme-success', colors.successColor);
  element.style.setProperty('--theme-error', colors.errorColor);
  element.style.setProperty('--theme-warning', colors.warningColor);
};

// Theme preview generation
export const generateThemePreview = (themeKey) => {
  const theme = getTheme(themeKey);
  if (!theme) return null;

  return {
    themeKey,
    name: theme.name,
    description: theme.description,
    colors: theme.colors,
    unlocked: theme.unlocked,
    isDefault: theme.isDefault
  };
};

// Default theme key
export const DEFAULT_THEME_KEY = 'frequencyPulse';

// Export theme keys for easy access
export const THEME_KEYS = {
  FREQUENCY_PULSE: 'frequencyPulse',
  SOLAR_SHINE: 'solarShine',
  ECHO_GLASS: 'echoGlass',
  RETRO_FRAME: 'retroFrame',
  NIGHT_SCAN: 'nightScan'
};

export default themes; 