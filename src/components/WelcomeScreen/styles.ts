import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap');
  
  :root {
    /* Brand Colors */
    --frequency-purple: #622CC6;
    --solar-gold: #F44019;
    --echo-black: #121212;
    --smoke-gray: #9E9E9E;
    --drift-white: #FFFFFF;

    /* Gradients */
    --frequency-pulse: linear-gradient(135deg, var(--frequency-purple) 0%, #9D4EDD 100%);
    --solar-shine: linear-gradient(135deg, #FF9F1C 0%, var(--solar-gold) 100%);
    --echo-glass: linear-gradient(135deg, rgba(18, 18, 18, 0.8) 0%, rgba(18, 18, 18, 0.6) 100%);
    --retro-frame: linear-gradient(135deg, #E0E0E0 0%, var(--smoke-gray) 100%);
    --night-scan: linear-gradient(135deg, #1A237E 0%, var(--echo-black) 100%);

    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;

    /* Border Radius */
    --border-radius-sm: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 16px;

    /* Transitions */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  button {
    font-family: inherit;
  }
`; 