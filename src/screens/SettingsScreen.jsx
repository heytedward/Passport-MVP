import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import GlassCard from '../components/GlassCard';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useThemes } from '../hooks/useThemes';
import { gradientThemes } from '../styles/theme';
import { performAuthCleanup, forcePageReload, emergencyCleanup } from '../utils/authCleanup';

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
  position: relative;
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
  position: relative;
`;

const AvatarLoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.2rem;
  backdrop-filter: blur(2px);
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

const SocialIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid ${({ theme }) => theme.colors.glass};
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #000;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: ${({ theme }) => theme.colors.accent.gold};
  }
`;

const SocialIconImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
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

const SettingsScreen = ({ 
  themeMode = process.env.REACT_APP_DEFAULT_THEME_MODE || 'dark', 
  onToggleTheme = () => {}, 
  gradientKey = process.env.REACT_APP_DEFAULT_GRADIENT || 'monarch', 
  onGradientChange = () => {} 
}) => {
  const { user, signOut } = useAuth();
  const { ownedThemes, equippedTheme, equipTheme, checkThemeOwnership } = useThemes();
  const [open, setOpen] = useState('account');
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  const [emailPref, setEmailPref] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Update display name and avatar when user changes
  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
      setDisplayName(name);
      setOriginalDisplayName(name);
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      console.log('Loading user profile for:', user.id);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('avatar_url, display_name, email')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        console.log('Profile loaded:', profile);
        
        // Set avatar if available
        if (profile.avatar_url) {
          console.log('Setting avatar:', profile.avatar_url);
          setAvatar(profile.avatar_url);
        } else {
          console.log('No avatar URL found');
          setAvatar(null);
        }
        
        // Only set display name if we don't already have one from user metadata
        // and if the profile has a display_name
        if (profile.display_name && !user.user_metadata?.username) {
          setDisplayName(profile.display_name);
          setOriginalDisplayName(profile.display_name);
        }
      } else {
        console.log('No profile found for user');
        // Create a basic profile record if none exists
        try {
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              display_name: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
              email: user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Created new user profile');
          }
        } catch (insertError) {
          console.error('Error creating profile:', insertError);
        }
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
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setAvatarLoading(true);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        console.log('Starting avatar upload...');
        
        // First, try to create the storage bucket if it doesn't exist
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          const avatarsBucket = buckets?.find(bucket => bucket.name === 'avatars');
          
          if (!avatarsBucket) {
            console.log('Creating avatars storage bucket...');
            const { error: bucketError } = await supabase.storage.createBucket('avatars', {
              public: true,
              allowedMimeTypes: ['image/*'],
              fileSizeLimit: 5242880 // 5MB
            });
            
            if (bucketError) {
              console.error('Error creating bucket:', bucketError);
              throw new Error('Failed to create storage bucket');
            }
          }
        } catch (bucketError) {
          console.error('Error with storage bucket:', bucketError);
          // Continue with upload attempt anyway
        }

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        console.log('Avatar uploaded successfully:', data.publicUrl);

        // Update user profile with avatar_url
        try {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .upsert({ 
              id: user.id, 
              avatar_url: data.publicUrl,
              updated_at: new Date().toISOString()
            });

          if (updateError) {
            console.error('Profile update error:', updateError);
            throw new Error('Failed to update profile with avatar URL');
          }
          
          console.log('Profile updated with avatar URL');
        } catch (profileError) {
          console.error('Profile update failed:', profileError);
          throw profileError;
        }

        // Set avatar in local state
        setAvatar(data.publicUrl);
        
        // Show success message
        console.log('Avatar updated successfully!');
        alert('Profile picture updated successfully!');
        
      } catch (error) {
        console.error('Error uploading avatar:', error);
        
        // Show user-friendly error message
        let errorMessage = 'Failed to upload image. Please try again.';
        
        if (error.message.includes('storage')) {
          errorMessage = 'Storage service unavailable. Please try again later.';
        } else if (error.message.includes('file')) {
          errorMessage = 'Invalid file type. Please select an image file.';
        }
        
        alert(errorMessage);
        
        // Fallback to local preview (temporary)
        setAvatar(URL.createObjectURL(file));
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatar) return;
    
    try {
      setAvatarLoading(true);
      
      // Remove avatar from user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error removing avatar:', error);
        throw error;
      }

      setAvatar(null);
      alert('Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing avatar:', error);
      alert('Failed to remove profile picture. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  };

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
        alert('Sign out successful! Redirecting...');
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
        alert('Sign out successful! Redirecting...');
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Error signing out:', error);
      
      // If it's a timeout, force comprehensive cleanup
      if (error.message.includes('timeout')) {
        console.log('Network timeout detected, forcing comprehensive cleanup...');
        alert('Network timeout - performing comprehensive cleanup and redirecting...');
        
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
                <AvatarUpload>
                  <div style={{ position: 'relative' }}>
                    {avatar ? (
                      <AvatarImg src={avatar} alt="Avatar" />
                    ) : (
                      <AvatarPlaceholder>🦋</AvatarPlaceholder>
                    )}
                    {avatarLoading && (
                      <AvatarLoadingOverlay>
                        ⏳
                      </AvatarLoadingOverlay>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => fileInputRef.current.click()}
                    disabled={avatarLoading}
                    style={{
                      opacity: avatarLoading ? 0.6 : 1,
                      cursor: avatarLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {avatarLoading ? 'Uploading...' : 'Change'}
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
                <Label htmlFor="displayName">
                  Display Name
                </Label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    style={{
                      borderColor: displayName !== originalDisplayName 
                        ? 'rgba(255, 215, 0, 0.5)' 
                        : undefined,
                      boxShadow: displayName !== originalDisplayName 
                        ? '0 0 8px rgba(255, 215, 0, 0.2)' 
                        : undefined
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={async () => {
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
                        alert('Display name updated successfully!');
                      } catch (error) {
                        console.error('Error updating display name:', error);
                        alert('Failed to update display name. Please try again.');
                      }
                    }}
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '0.9rem',
                      background: displayName !== originalDisplayName 
                        ? 'rgba(255, 215, 0, 0.3)' 
                        : 'rgba(255, 215, 0, 0.2)',
                      border: displayName !== originalDisplayName 
                        ? '1px solid rgba(255, 215, 0, 0.5)' 
                        : '1px solid rgba(255, 215, 0, 0.3)',
                      color: displayName !== originalDisplayName ? '#000' : '#fff',
                      fontWeight: displayName !== originalDisplayName ? 'bold' : 'normal'
                    }}
                    disabled={displayName === originalDisplayName}
                  >
                    {displayName !== originalDisplayName ? 'Save Changes' : 'Save'}
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
              <SettingRow>
                <Label>Connected Accounts</Label>
                <SocialAccounts>
                  <SocialIcon title="Google">
                    <SocialIconImg 
                      src="/google-icon.svg" 
                      alt="Google" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <span style={{ display: 'none' }}>G</span>
                  </SocialIcon>
                  <SocialIcon title="Apple">
                    <SocialIconImg 
                      src="/apple-icon.svg" 
                      alt="Apple" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <span style={{ display: 'none' }}>🍎</span>
                  </SocialIcon>
                </SocialAccounts>
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