import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import GlassCard from '../components/GlassCard';
import GlowButton from '../components/GlowButton';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const LoginContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled(GlassCard)`
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const SocialButton = styled(GlowButton)`
  width: 100%;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  
  img {
    width: 24px;
    height: 24px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 2rem 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.colors.glass};
  }
  
  span {
    padding: 0 1rem;
    font-family: ${({ theme }) => theme.typography.fontFamily.body};
  }
`;

const LoginScreen = () => {
  const navigate = useNavigate();

  const handleSocialLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/home`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Title>Welcome Back</Title>
        
        <SocialButton onClick={() => handleSocialLogin('google')}>
          <img src="/google-icon.svg" alt="Google" />
          Continue with Google
        </SocialButton>
        
        <SocialButton onClick={() => handleSocialLogin('twitter')}>
          <img src="/twitter-icon.svg" alt="Twitter" />
          Continue with X
        </SocialButton>
        
        <Divider>
          <span>or</span>
        </Divider>
        
        <GlowButton variant="accent" onClick={() => navigate('/')}>
          Back to Home
        </GlowButton>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginScreen; 