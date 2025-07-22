import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import GlassCard from '../components/GlassCard';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useThemes } from '../hooks/useThemes';
import { gradientThemes } from '../styles/theme';

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
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.glass};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Toggle = styled.input.attrs({ type: 'checkbox' })`
  width: 40px;
  height: 22px;
  accent-color: ${({ theme }) => theme.colors.accent};
`;

const AvatarUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AvatarImg = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.accent};
`;

const AvatarPlaceholder = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2rem;
  border: 2px solid ${({ theme }) => theme.colors.accent};
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

const SocialAccounts = styled.div`
  display: flex;
  gap: 12px;
`;

const SocialIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid ${({ theme }) => theme.colors.glass};
  padding: 2px;
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

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const SettingsScreen = ({ themeMode = 'dark', onToggleTheme = () => {}, gradientKey = 'monarch', onGradientChange = () => {} }) => {
  const { user, signOut } = useAuth();
  const { ownedThemes, equippedTheme, equipTheme, checkThemeOwnership } = useThemes();
  const [open, setOpen] = useState('account');
  const [displayName, setDisplayName] = useState('');
  const [emailPref, setEmailPref] = useState(true);

  // Update display name and avatar when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.username || user.email?.split('@')[0] || 'User');
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('avatar_url, display_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.avatar_url) setAvatar(profile.avatar_url);
        if (profile.display_name) setDisplayName(profile.display_name);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      try {
        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update user profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ avatar_url: data.publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setAvatar(data.publicUrl);
      } catch (error) {
        console.error('Error uploading avatar:', error);
        // Fallback to local preview
        setAvatar(URL.createObjectURL(file));
      }
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Starting sign out process...');
      await signOut();
      console.log('Sign out successful, navigating to home...');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
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
                <AvatarUpload>
                  {avatar ? (
                    <AvatarImg src={avatar} alt="Avatar" />
                  ) : (
                    <AvatarPlaceholder>🦋</AvatarPlaceholder>
                  )}
                  <Button type="button" onClick={() => fileInputRef.current.click()}>
                    Change
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                  />
                </AvatarUpload>
              </SettingRow>
              <SettingRow>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
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
              <SettingRow>
                <Label>Connected Accounts</Label>
                <SocialAccounts>
                  <SocialIcon src="/google-icon.svg" alt="Google" title="Google" />
                  <SocialIcon src="/apple-icon.svg" alt="Apple" title="Apple" />
                </SocialAccounts>
              </SettingRow>
              {user ? (
                <div>
                  <div style={{ marginBottom: '1rem', color: '#fff', fontSize: '0.9rem' }}>
                    <strong>Logged in as:</strong> {user.email}
                  </div>
                  <Button
                    style={{ marginTop: 12, width: '100%', background: 'rgba(231, 76, 60, 0.2)', borderColor: 'rgba(231, 76, 60, 0.3)' }}
                    onClick={handleLogout}
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