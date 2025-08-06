import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import GlassCard from '../components/GlassCard';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { performAuthCleanup, forcePageReload, emergencyCleanup } from '../utils/authCleanup';

import { supabase } from '../utils/supabaseClient';
import AvatarUpload from '../components/AvatarUpload';
import ThemeTestingSection from '../components/ThemeTestingSection';
import ErrorBoundary from '../components/ErrorBoundary';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px 16px 120px 16px;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 16px 12px 100px 12px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 8px 80px 8px;
  }
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%);
  color: #000;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-size: 1rem;
  width: 100%;
  justify-content: center;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.9rem;
    margin-top: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 18px;
    font-size: 0.85rem;
    margin-top: 16px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 176, 0, 0.3);
  }
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 60px 0 32px 0;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin: 50px 0 24px 0;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin: 40px 0 20px 0;
  }
`;

const Accordion = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
`;

const AccordionSection = styled(GlassCard)`
  margin-bottom: 24px;
  border-radius: 18px;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colors?.accent?.gold || '#FFD700'};
  box-shadow: 
    0 0 20px 0 rgba(255,215,0,0.2),
    0 0 40px 0 rgba(255,215,0,0.1),
    inset 0 1px 0 rgba(255,215,0,0.15);
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
    border-radius: 14px;
  }
`;

const AccordionHeader = styled.button`
  width: 100%;
  background: none;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  font-size: 1.25rem;
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  
  @media (max-width: 768px) {
    padding: 20px 24px;
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    padding: 18px 20px;
    font-size: 1rem;
  }
  
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.glass};
  }
`;

const AccordionContent = styled.div`
  padding: 0 28px 24px 28px;
  background: none;
  animation: fadeIn 0.3s;
  
  @media (max-width: 768px) {
    padding: 0 24px 20px 24px;
  }
  
  @media (max-width: 480px) {
    padding: 0 20px 16px 20px;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 18px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
    gap: 16px;
    flex-wrap: wrap;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 14px;
    gap: 12px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Label = styled.label`
  font-size: 1.08rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    width: 100%;
  }
`;

const Input = styled.input`
  font-size: 1.08rem;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.glass};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease;
  max-width: 200px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 6px 10px;
    max-width: 180px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    padding: 8px 12px;
    max-width: 160px;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent.gold};
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
  }
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.gold};
  }
`;

const Toggle = styled.input.attrs({ type: 'checkbox' })`
  width: 40px;
  height: 22px;
  accent-color: ${({ theme }) => theme.colors.accent};
  
  @media (max-width: 480px) {
    width: 36px;
    height: 20px;
  }
`;

const Button = styled.button`
  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    padding: 6px 14px;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 8px 16px;
    font-size: 0.85rem;
    width: 100%;
  }
  
  &:hover, &:focus {
    background: ${({ theme }) => theme.gradients.gold};
    outline: none;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;



const PencilIconButton = styled.button`
  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  border-radius: 8px;
  padding: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  
  @media (max-width: 768px) {
    padding: 6px;
    font-size: 0.9rem;
    min-width: 32px;
    height: 32px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    font-size: 0.85rem;
    min-width: 36px;
    height: 36px;
  }
  
  &:hover, &:focus {
    background: ${({ theme }) => theme.gradients.gold};
    outline: none;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SignOutButton = styled(Button)`
  width: 100%;
  background: linear-gradient(135deg, rgba(231, 76, 60, 0.8) 0%, rgba(192, 57, 43, 0.8) 100%);
  border: 2px solid rgba(231, 76, 60, 0.3);
  color: #fff;
  font-weight: 700;
  margin-top: 16px;
  
  &:hover {
    background: linear-gradient(135deg, rgba(231, 76, 60, 1) 0%, rgba(192, 57, 43, 1) 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
  }
`;

const UserInfo = styled.div`
  margin-bottom: 16px;
  color: #fff;
  font-size: 0.9rem;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 10px;
  }
`;

const SettingsScreen = ({ 
  themeMode = process.env.REACT_APP_DEFAULT_THEME_MODE || 'dark', 
  onToggleTheme = () => {}, 
  gradientKey = process.env.REACT_APP_DEFAULT_GRADIENT || 'monarch', 
  onGradientChange = () => {} 
}) => {
  const { user, signOut, profile, refreshProfile, avatarUrl } = useAuth();
  const [open, setOpen] = useState('account');
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [emailPref, setEmailPref] = useState(true);
  const [avatar, setAvatar] = useState(null);

  // Update display name and avatar when user or profile changes
  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
      setDisplayName(name);
      setOriginalDisplayName(name);
      
      // Set avatar from useAuth context (which handles fallback hierarchy)
      setAvatar(avatarUrl);

      // Ensure profile exists in database
      ensureProfileExists();
    }
  }, [user, profile, avatarUrl]);

  const ensureProfileExists = async () => {
    if (!user || profile) return; // Skip if user doesn't exist or profile already exists
    
    try {
      console.log('Ensuring profile exists for user:', user.id);
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          display_name: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        console.log('Profile created successfully');
        // Refresh the profile to get the updated data
        await refreshProfile();
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
    }
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log('🔄 Sign out button clicked!');
      console.log('User before sign out:', user);
      console.log('Sign out function:', signOut);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign out timeout - network issue')), 5000);
      });
      
      // Try the useAuth signOut first with timeout
      if (signOut) {
        console.log('Using useAuth signOut with timeout...');
        const result = await Promise.race([
          signOut(),
          timeoutPromise
        ]);
        console.log('Sign out result:', result);
        
        // Perform comprehensive cleanup
        await performAuthCleanup();
        
        console.log('Sign out successful, navigating to home...');
        navigate('/');
      } else {
        console.log('useAuth signOut not available, trying direct Supabase...');
        // Fallback to direct Supabase signOut with timeout
        const { error } = await Promise.race([
          supabase.auth.signOut(),
          timeoutPromise
        ]);
        if (error) throw error;
        
        // Perform comprehensive cleanup
        await performAuthCleanup();
        
        console.log('Sign out successful, navigating to home...');
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Error signing out:', error);
      
      // If it's a timeout, force comprehensive cleanup
      if (error.message.includes('timeout')) {
        console.log('Network timeout detected, forcing comprehensive cleanup...');
        
        // Use emergency cleanup for timeout scenarios
        emergencyCleanup();
        return;
      }
      
      // For any other error, try comprehensive cleanup
      console.log('Sign out failed, attempting comprehensive cleanup...');
      try {
        await performAuthCleanup();
        forcePageReload();
      } catch (cleanupError) {
        console.error('Cleanup failed, using emergency cleanup:', cleanupError);
        emergencyCleanup();
      }
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Container>
      <PageTitle>Account & Profile</PageTitle>
      
      <Accordion>
        <AccordionSection>
          <AccordionHeader
            aria-expanded={open === 'account'}
            onClick={() => setOpen(open === 'account' ? '' : 'account')}
          >
            Account & Profile
            <span>{open === 'account' ? '▲' : '▼'}</span>
          </AccordionHeader>
          {open === 'account' && (
            <AccordionContent>
              <SettingRow style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Label style={{ marginBottom: '12px' }}>Profile Picture</Label>
                <AvatarUpload
                  userId={user?.id}
                  currentAvatarUrl={avatarUrl}
                  onAvatarUpdate={async (newAvatarUrl) => {
                    console.log('🔄 Avatar updated, syncing state...', newAvatarUrl);
                    
                    // Update local state immediately
                    setAvatar(newAvatarUrl);
                    
                    // Refresh the global profile state
                    try {
                      await refreshProfile();
                      console.log('✅ Profile refreshed successfully');
                    } catch (error) {
                      console.error('❌ Failed to refresh profile:', error);
                    }
                    
                    // Force a small delay to ensure state propagation
                    setTimeout(() => {
                      console.log('🔄 State sync complete');
                    }, 500);
                  }}
                  size={80}
                  showButton={true}
                />
              </SettingRow>
              
              <SettingRow>
                <Label htmlFor="displayName">Display Name</Label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && isEditingDisplayName && displayName !== originalDisplayName) {
                        e.preventDefault();
                        // Trigger save
                        e.target.nextSibling?.click();
                      } else if (e.key === 'Escape' && isEditingDisplayName) {
                        e.preventDefault();
                        // Trigger cancel
                        setDisplayName(originalDisplayName);
                        setIsEditingDisplayName(false);
                      }
                    }}
                    placeholder="Enter your display name"
                    disabled={!isEditingDisplayName}
                    style={{
                      borderColor: displayName !== originalDisplayName 
                        ? 'rgba(255, 215, 0, 0.5)' 
                        : undefined,
                      boxShadow: displayName !== originalDisplayName 
                        ? '0 0 8px rgba(255, 215, 0, 0.2)' 
                        : undefined,
                      opacity: isEditingDisplayName ? 1 : 0.7,
                      cursor: isEditingDisplayName ? 'text' : 'default'
                    }}
                  />
                  <PencilIconButton 
                    type="button" 
                    onClick={async () => {
                      if (!isEditingDisplayName) {
                        // Enter edit mode
                        setIsEditingDisplayName(true);
                      } else if (displayName !== originalDisplayName) {
                        // Save changes
                        try {
                          const { error } = await supabase
                            .from('user_profiles')
                            .upsert({ 
                              id: user.id, 
                              display_name: displayName,
                              updated_at: new Date().toISOString()
                            });
                          
                          if (error) throw error;
                          
                          // Update user metadata
                          const { error: metadataError } = await supabase.auth.updateUser({
                            data: { username: displayName }
                          });
                          
                          if (metadataError) throw metadataError;
                          
                          setOriginalDisplayName(displayName);
                          setIsEditingDisplayName(false);
                          alert('Display name updated successfully!');
                        } catch (error) {
                          console.error('Error updating display name:', error);
                          alert('Failed to update display name. Please try again.');
                        }
                      } else {
                        // Cancel editing - reset to original value
                        setDisplayName(originalDisplayName);
                        setIsEditingDisplayName(false);
                      }
                    }}
                    style={{ 
                      background: isEditingDisplayName && displayName !== originalDisplayName
                        ? 'rgba(255, 215, 0, 0.3)' 
                        : 'rgba(255, 215, 0, 0.2)',
                      border: isEditingDisplayName && displayName !== originalDisplayName
                        ? '1px solid rgba(255, 215, 0, 0.5)' 
                        : '1px solid rgba(255, 215, 0, 0.3)',
                      color: isEditingDisplayName && displayName !== originalDisplayName ? '#000' : '#fff',
                      fontWeight: isEditingDisplayName && displayName !== originalDisplayName ? 'bold' : 'normal'
                    }}
                    disabled={isEditingDisplayName && displayName === originalDisplayName}
                    title={isEditingDisplayName ? (displayName !== originalDisplayName ? 'Save' : 'Cancel') : 'Edit'}
                  >
                    {isEditingDisplayName ? (displayName !== originalDisplayName ? '✓' : '✕') : '✏️'}
                  </PencilIconButton>
                </div>
              </SettingRow>
              
              <SettingRow>
                <Label>Email</Label>
                <span style={{ color: '#FFB000', textDecoration: 'underline' }}>
                  {user?.email || 'Not logged in'}
                </span>
              </SettingRow>
              
              <SettingRow>
                <Label htmlFor="emailPref">Email Preferences</Label>
                <Toggle
                  id="emailPref"
                  checked={emailPref}
                  onChange={e => setEmailPref(e.target.checked)}
                />
              </SettingRow>
              
              <SettingRow>
                <Label>Password/Security</Label>
                <Button type="button">Change Password</Button>
              </SettingRow>

              {user ? (
                <div>
                  <UserInfo>
                    <strong>Logged in as:</strong> {user.email}
                  </UserInfo>
                  
                  {/* Theme Testing Section */}
                  <ErrorBoundary>
                    <ThemeTestingSection />
                  </ErrorBoundary>
                  
                  <SignOutButton
                    onClick={handleLogout}
                  >
                    Sign Out
                  </SignOutButton>
                </div>
              ) : (
                <Button
                  style={{ marginTop: 12, width: '100%' }}
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
              )}
            </AccordionContent>
          )}
        </AccordionSection>
        
        <AccordionSection>
          <AccordionHeader
            aria-expanded={open === 'theme'}
            onClick={() => setOpen(open === 'theme' ? '' : 'theme')}
          >
            App Experience
            <span>{open === 'theme' ? '▲' : '▼'}</span>
          </AccordionHeader>
          {open === 'theme' && (
            <AccordionContent>
              <SettingRow>
                <Label>Dark Mode</Label>
                <Toggle
                  type="checkbox"
                  checked={themeMode === 'dark'}
                  onChange={onToggleTheme}
                />
              </SettingRow>
            </AccordionContent>
          )}
        </AccordionSection>
        
        {/* Back Button at the bottom */}
        <BackButton onClick={() => navigate('/profile')}>
          ← Back to Profile
        </BackButton>
      </Accordion>
    </Container>
  );
};

export default SettingsScreen; 