import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle from './styles/GlobalStyle';
import theme from './styles/theme';
import { supabase } from './utils/supabaseClient';
import { useTheme } from './hooks/useTheme';

// Lazy load components for better performance
const HomeScreen = React.lazy(() => import('./screens/HomeScreen'));
const LoginScreen = React.lazy(() => import('./screens/LoginScreen'));
const ScanScreen = React.lazy(() => import('./screens/ScanScreen'));
const ClosetScreen = React.lazy(() => import('./screens/ClosetScreen'));
const PassportScreen = React.lazy(() => import('./screens/PassportScreen'));
const ProfileScreen = React.lazy(() => import('./screens/ProfileScreen'));
const SettingsScreen = React.lazy(() => import('./screens/SettingsScreen'));
const QuestsScreen = React.lazy(() => import('./screens/QuestsScreen'));
const SeasonRoadmapScreen = React.lazy(() => import('./screens/SeasonRoadmapScreen'));
const AdminScreen = React.lazy(() => import('./screens/AdminScreen'));
const WelcomeScreen = React.lazy(() => import('./screens/WelcomeScreen'));
const CircularQRGenerator = React.lazy(() => import('./components/CircularQRGenerator'));
const TestQRGenerator = React.lazy(() => import('./components/TestQRGenerator'));
const SVGQRGenerator = React.lazy(() => import('./components/SVGQRGenerator'));
const PNGQRGenerator = React.lazy(() => import('./components/PNGQRGenerator'));


// Components
const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute'));
const AuthCallback = React.lazy(() => import('./components/AuthCallback'));

// Loading component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    color: '#FFB000'
  }}>
    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Loading Monarch Passport...</div>
  </div>
);

function App() {
  // Make supabase available globally for testing
  if (typeof window !== 'undefined') {
    window.supabase = supabase;
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/scan" element={<ScanScreen />} />
            <Route path="/closet" element={<ClosetScreen />} />
            <Route path="/passport" element={<PassportScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/quests" element={<QuestsScreen />} />
            <Route path="/roadmap" element={<SeasonRoadmapScreen />} />
            <Route path="/admin" element={<AdminScreen />} />
          </Route>
          
          {/* Development/Testing routes */}
          <Route path="/qr-generator" element={<CircularQRGenerator />} />
          <Route path="/test-qr" element={<TestQRGenerator />} />
          <Route path="/svg-qr" element={<SVGQRGenerator />} />
          <Route path="/png-qr" element={<PNGQRGenerator />} />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </ThemeProvider>
  );
}

export default App;