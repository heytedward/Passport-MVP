import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

import { darkTheme, lightTheme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';

import { useAuth, AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';


import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import PassportScreen from './screens/PassportScreen';
import SeasonRoadmapScreen from './screens/SeasonRoadmapScreen';
import ScanScreen from './screens/ScanScreen';
import ClosetScreen from './screens/ClosetScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import QuestsScreen from './screens/QuestsScreen';
import LoginScreen from './screens/LoginScreen';
import AdminDashboard from './screens/AdminDashboard';
import CircularQRGenerator from './components/CircularQRGenerator';
import AuthCallback from './components/AuthCallback';

import NavBar from './components/NavBar';


const AppContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 100vh;
  position: relative;
`;

const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw",
    scale: 0.8
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: "100vw",
    scale: 1.2
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

function App() {
  const location = useLocation();
  const { user } = useAuth();
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('themeMode');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <AuthProvider>
      <ThemeProvider theme={currentTheme}>
        <GlobalStyle />
        <AppContainer>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public routes */}
              <Route path="/join/:referralCode" element={<LoginScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              {/* Protected routes - require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/passport" element={<PassportScreen />} />
                <Route path="/season-roadmap" element={<SeasonRoadmapScreen />} />
                <Route path="/scan" element={<ScanScreen />} />
                <Route path="/closet" element={<ClosetScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/settings" element={<SettingsScreen themeMode={themeMode} onToggleTheme={toggleTheme} />} />
                <Route path="/quests" element={<QuestsScreen />} />
                <Route path="/generate-qr" element={<CircularQRGenerator />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
              
              {/* Catch all route - redirect to login */}
              <Route path="*" element={<LoginScreen />} />
            </Routes>
          </AnimatePresence>
          
          {/* Only show NavBar for authenticated users */}
          {user && <NavBar />}
        </AppContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;