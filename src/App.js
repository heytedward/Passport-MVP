import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { darkTheme, lightTheme, gradientThemes } from './styles/theme';
import ScanScreen from './screens/ScanScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import PassportScreen from './screens/PassportScreen';
import ProfileScreen from './screens/ProfileScreen';
import ResponsiveNavBar from './components/NavBar';
import styled from 'styled-components';
import SettingsScreen from './screens/SettingsScreen';
import HomeScreen from './screens/HomeScreen';
import ClosetScreen from './screens/ClosetScreen';
import QuestsScreen from './screens/QuestsScreen';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
    font-size: ${({ theme }) => theme.typography.fontSize.body};
    line-height: ${({ theme }) => theme.typography.lineHeight.body};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.typography.fontFamily.heading};
    line-height: ${({ theme }) => theme.typography.lineHeight.heading};
  }

  h1 { font-size: ${({ theme }) => theme.typography.fontSize.h1}; }
  h2 { font-size: ${({ theme }) => theme.typography.fontSize.h2}; }
  h3 { font-size: ${({ theme }) => theme.typography.fontSize.h3}; }

  code, pre {
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
    font-size: ${({ theme }) => theme.typography.fontSize.code};
    line-height: ${({ theme }) => theme.typography.lineHeight.code};
  }
  
  button {
    font-family: inherit;
  }

  /* Focus styles */
  :focus {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .glass-card {
      background: rgba(76, 28, 140, 0.3);
      border-width: 2px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  padding-bottom: 100px; /* Space for nav bar */
`;

const App = () => {
  const [themeMode, setThemeMode] = React.useState('dark');
  const [gradientKey, setGradientKey] = React.useState(() => {
    return localStorage.getItem('papillon-gradient') || 'frequencyPulse';
  });

  const handleToggleTheme = () => setThemeMode(mode => (mode === 'dark' ? 'light' : 'dark'));
  const handleGradientChange = key => {
    setGradientKey(key);
    localStorage.setItem('papillon-gradient', key);
  };

  // Inject the selected gradient into the theme
  const theme = {
    ...(themeMode === 'dark' ? darkTheme : lightTheme),
    currentGradient: gradientThemes[gradientKey].gradient,
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <AppContainer>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/passport" element={<PassportScreen />} />
            <Route path="/scan" element={<ScanScreen />} />
            <Route path="/closet" element={<ClosetScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/welcome" element={<WelcomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/settings" element={<SettingsScreen themeMode={themeMode} onToggleTheme={handleToggleTheme} gradientKey={gradientKey} onGradientChange={handleGradientChange} />} />
            <Route path="/quests" element={<QuestsScreen />} />
          </Routes>
          <ResponsiveNavBar />
        </AppContainer>
      </Router>
    </ThemeProvider>
  );
};

export default App;