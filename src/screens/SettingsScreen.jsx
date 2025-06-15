import React, { useState, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import GlassCard from '../components/GlassCard';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
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
  box-shadow: 0 0 32px 0 ${({ theme }) => theme.colors.accent}22;
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
  border: 2.5px solid transparent;
  background: ${({ gradient }) => gradient};
  box-shadow: 0 0 16px 0 rgba(255,215,0,0.10), 0 0 8px 0 rgba(127,63,191,0.10);
  cursor: pointer;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s, transform 0.15s;
  position: relative;
  &:hover, &:focus {
    border-color: ${({ theme }) => theme.colors.highlight};
    box-shadow: 0 0 24px 0 rgba(255,215,0,0.18);
    transform: scale(1.06);
  }
  ${({ selected, theme }) => selected && `
    border-color: ${theme.colors.highlight};
    box-shadow: 0 0 32px 0 rgba(255,215,0,0.22);
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

const SettingsScreen = ({ themeMode, onToggleTheme, gradientKey, onGradientChange }) => {
  const [open, setOpen] = useState('account');
  const [displayName, setDisplayName] = useState('Ava Papillon');
  const [emailPref, setEmailPref] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  React.useEffect(() => {
    const session = supabase.auth.getSession ? supabase.auth.getSession() : null;
    if (session && session.user) setIsLoggedIn(true);
    else setIsLoggedIn(false);
  }, []);

  const handleAvatarChange = e => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    window.location.href = 'https://papillonbrand.us';
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
                <span>ava@papillonos.com</span>
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
              <Button
                style={{ marginTop: 12, width: '100%' }}
                onClick={isLoggedIn ? handleLogout : handleLogin}
              >
                {isLoggedIn ? 'Logout' : 'Login'}
              </Button>
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
              <SettingRow>
                <Label>Passport Theme</Label>
                <GradientSwatchRow>
                  {Object.entries(gradientThemes).map(([key, { name, gradient }]) => (
                    <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <GradientSwatch
                        type="button"
                        gradient={gradient}
                        selected={gradientKey === key}
                        aria-label={name}
                        onClick={() => onGradientChange(key)}
                      />
                      <SwatchLabel>{name.split(' ')[0]}</SwatchLabel>
                    </div>
                  ))}
                </GradientSwatchRow>
                <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: 2, marginBottom: 8 }}>
                  This only affects the Passport screen.
                </div>
              </SettingRow>
            </AccordionContent>
          )}
        </AccordionSection>
      </Accordion>
    </Container>
  );
};

export default SettingsScreen; 