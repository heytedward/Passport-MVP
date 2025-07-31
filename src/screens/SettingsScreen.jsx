import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import GlassCard from '../components/GlassCard';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useThemes } from '../hooks/useThemes';
import { gradientThemes } from '../styles/theme';
import { performAuthCleanup, forcePageReload, emergencyCleanup } from '../utils/authCleanup';

import { supabase } from '../utils/supabaseClient';
import AvatarUpload from '../components/AvatarUpload';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 8px 120px 8px;
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
  &:hover, &:focus {
    background: ${({ theme }) => theme.colors.glass};
  }
`;

const AccordionContent = styled.div`
  padding: 0 28px 24px 28px;
  background: none;
  animation: fadeIn 0.3s;
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
`;

const Label = styled.label`
  font-size: 1.08rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  font-size: 1.08rem;
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.glass};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease;
  
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
  transition: background 0.2s;
  &:hover, &:focus {
    background: ${({ theme }) => theme.gradients.gold};
    outline: none;
  }
`;



const GradientSwatchRow = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 12px;
  margin-bottom: 6px;
`;

const GradientSwatch = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 3px solid transparent;
  background: ${({ gradient }) => gradient};
  box-shadow: 
    0 0 12px 0 rgba(255,215,0,0.15),
    0 0 24px 0 rgba(255,215,0,0.08),
    inset 0 1px 0 rgba(255,215,0,0.1);
  cursor: pointer;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s, transform 0.15s;
  position: relative;
  &:hover, &:focus {
    border-color: ${({ theme }) => theme.colors.highlight};
    transform: scale(1.06);
    box-shadow: 
      0 0 20px 0 rgba(255,215,0,0.3),
      0 0 40px 0 rgba(255,215,0,0.15),
      inset 0 1px 0 rgba(255,215,0,0.2);
  }
  ${({ selected, theme }) => selected && `
    border-color: ${theme.colors.highlight};
    box-shadow: 
      0 0 24px 0 rgba(255,215,0,0.4),
      0 0 48px 0 rgba(255,215,0,0.2),
      inset 0 1px 0 rgba(255,215,0,0.3);
    &::after {
      content: '';
      position: absolute;
      top: 6px; right: 6px;
      width: 12px; height: 12px;
      border-radius: 50%;
      background: ${theme.colors.highlight};
      box-shadow: 0 0 8px 2px ${theme.colors.highlight}55;
    }
  `}
`;

const SwatchLabel = styled.div`
  font-size: 0.82rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: 2px;
  max-width: 60px;
`;



const SettingsScreen = ({ 
  themeMode = process.env.REACT_APP_DEFAULT_THEME_MODE || 'dark', 
  onToggleTheme = () => {}, 
  gradientKey = process.env.REACT_APP_DEFAULT_GRADIENT || 'monarch', 
  onGradientChange = () => {} 
}) => {
  const { user, signOut, profile, refreshProfile } = useAuth();
  const { ownedThemes, equippedTheme, equipTheme, checkThemeOwnership } = useThemes();
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
      
      // Set avatar from profile if available
      if (profile?.avatar_url) {
        setAvatar(profile.avatar_url);
      } else {
        setAvatar(null);
      }

      // Ensure profile exists in database
      ensureProfileExists();
    }
  }, [user, profile]);

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

  // Remove loadUserProfile function since we're now using the profile from useAuth
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
              <SettingRow>
                <Label>Profile Picture</Label>
                <AvatarUpload
                  userId={user?.id}
                  currentAvatarUrl={avatar}
                  onAvatarUpdate={async (newAvatarUrl) => {
                    setAvatar(newAvatarUrl);
                    // Refresh the profile to ensure consistency
                    await refreshProfile();
                  }}
                  size={80}
                  showButton={true}
                />
              </SettingRow>
              <SettingRow>
                <Label htmlFor="displayName">
                  Display Name
                </Label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                  <Button 
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
                      padding: '8px 16px', 
                      fontSize: '0.9rem',
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
                  >
                    {isEditingDisplayName ? (displayName !== originalDisplayName ? 'Save' : 'Cancel') : 'Change'}
                  </Button>
                </div>
              </SettingRow>
              <SettingRow>
                <Label>Email</Label>
                <span>{user?.email || 'Not logged in'}</span>
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
                  <div style={{ marginBottom: '1rem', color: '#fff', fontSize: '0.9rem' }}>
                    <strong>Logged in as:</strong> {user.email}
                  </div>
                  <Button
                    style={{ marginTop: 12, width: '100%', background: 'rgba(231, 76, 60, 0.2)', borderColor: 'rgba(231, 76, 60, 0.3)' }}
                    onClick={() => {
                      console.log('🔄 Sign out button clicked!');
                      alert('Sign out button clicked!');
                      handleLogout();
                    }}
                  >
                    Sign Out
                  </Button>
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
      </Accordion>
    </Container>
  );
};

export default SettingsScreen; 