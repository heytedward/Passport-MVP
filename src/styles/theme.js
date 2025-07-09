export const gradientThemes = {
  frequencyPulse: {
    name: 'Frequency Pulse',
    gradient: 'linear-gradient(135deg, #4C1C8C 0%, #7F3FBF 50%, #9D4EDD 100%)',
  },
  solarShine: {
    name: 'Solar Shine',
    gradient: 'linear-gradient(135deg, #FFB000 0%, #FF9F1C 50%, #FFED85 100%)',
  },
  echoGlass: {
    name: 'Echo Glass',
    gradient: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(108,108,108,0.3) 100%)',
  },
  retroFrame: {
    name: 'Retro Frame',
    gradient: 'linear-gradient(135deg, #6C6C6C 0%, #FAFAFA 100%)',
  },
  nightScan: {
    name: 'Night Scan',
    gradient: 'linear-gradient(135deg, #000000 0%, #4C1C8C 100%)',
  },
};

export const darkTheme = {
  colors: {
    primary: '#4C1C8C',        // Corrected Frequency Purple
    accent: {
      purple: '#4C1C8C',       // Frequency Purple
      gold: '#FFB000',         // Corrected Solar Gold
      cyan: '#7F3FBF',         // Purple variant
      pink: '#9D4EDD',         // Purple highlight
      green: '#10B981',        // Success green
    },
    highlight: '#FFB000',      // Solar Gold for CTAs
    background: '#000000',     // Corrected Echo Black
    text: {
      primary: '#FAFAFA',      // Corrected Drift White
      secondary: '#6C6C6C',    // Corrected Smoke Gray
      accent: '#FFB000',       // Solar Gold for highlights
    },
    glass: {
      background: 'rgba(76, 28, 140, 0.08)',      // Frequency Purple tint
      border: 'rgba(255, 176, 0, 0.3)',           // Solar Gold border
      overlay: 'rgba(250, 250, 250, 0.15)',       // Drift White overlay
      glow: 'rgba(76, 28, 140, 0.2)',            // Purple glow
    },
    neon: {
      purple: '#4C1C8C',       // Frequency Purple
      gold: '#FFB000',         // Solar Gold
      white: '#FAFAFA',        // Drift White
      gray: '#6C6C6C',         // Smoke Gray
      black: '#000000',        // Echo Black
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #4C1C8C 0%, #7F3FBF 50%, #9D4EDD 100%)',
    gold: 'linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%)',
    glass: 'linear-gradient(135deg, rgba(76,28,140,0.1) 0%, rgba(255,176,0,0.05) 100%)',
    neon: 'linear-gradient(135deg, #4C1C8C 0%, #FFB000 50%, #7F3FBF 100%)',
    liquid: 'linear-gradient(45deg, #4C1C8C, #7F3FBF, #FFB000, #9D4EDD)',
    retro: 'linear-gradient(135deg, #4C1C8C 0%, #6C6C6C 100%)',
    night: 'linear-gradient(135deg, #000000 0%, #4C1C8C 100%)',
  },
  typography: {
    fontFamily: {
      heading: 'Outfit, sans-serif',
      body: 'Space Grotesk, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    fontSize: {
      h1: '3rem',
      h2: '1.5rem',
      h3: '1.25rem',
      body: '1rem',
      small: '0.875rem',
      code: '0.9rem',
    },
    lineHeight: {
      heading: 1.2,
      body: 1.6,
      code: 1.4,
    }
  },
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      ambient: '1000ms',
    },
    timing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      sharp: 'cubic-bezier(0.4, 0, 1, 1)',
    }
  },
  glassmorphism: {
    modal: {
      opacity: 0.08,
      blur: '25px',
    },
    card: {
      opacity: 0.15,
      blur: '20px',
    },
    navigation: {
      opacity: 0.20,
      blur: '15px',
    },
    input: {
      opacity: 0.15,
      blur: '10px',
    }
  },
  effects: {
    neonGlow: '0 0 20px currentColor, 0 0 40px currentColor',
    glassBlur: 'blur(20px)',
    liquidMotion: 'cubic-bezier(0.23, 1, 0.320, 1)',
  },
  breakpoints: {
    mobile: '428px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px',
  },
  currentGradient: gradientThemes.frequencyPulse.gradient,
};

export const lightTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: '#000000',     // Keep black background
    text: {
      primary: '#000000',      // Black text for white/gray cards
      secondary: '#6C6C6C',    // Smoke Gray
      accent: '#4C1C8C',       // Frequency Purple
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.9)',  // White/gray glass cards
      border: 'rgba(255, 255, 255, 0.3)',      // Light border
      overlay: 'rgba(255, 255, 255, 0.1)',     // Light overlay
      glow: 'rgba(255, 176, 0, 0.2)',          // Gold glow
    }
  }
};

export default darkTheme; 