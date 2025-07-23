import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { useReferrals } from '../hooks/useReferrals';
import GlassCard from '../components/GlassCard';
import GlowButton from '../components/GlowButton';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #4C1C8C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const LoginCard = styled(GlassCard)`
  max-width: 450px;
  width: 100%;
  text-align: center;
  padding: 3rem 2.5rem;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: #FFB000;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 3px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 
    0 0 8px 0 rgba(255,215,0,0.1),
    0 0 16px 0 rgba(255,215,0,0.05),
    inset 0 1px 0 rgba(255,215,0,0.05);
  
  &:focus {
    outline: none;
    border: 3px solid #FFD700;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 
      0 0 16px 0 rgba(255,215,0,0.25),
      0 0 32px 0 rgba(255,215,0,0.12),
      inset 0 1px 0 rgba(255,215,0,0.15);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #FFB000;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 1rem;
  
  &:hover {
    color: #FFC533;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background: rgba(46, 204, 113, 0.1);
  border: 1px solid rgba(46, 204, 113, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: #2ecc71;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const LoginScreen = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { processReferralSignup } = useReferrals();
  const [isSignUp, setIsSignUp] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Check for referral code in URL
  useEffect(() => {
    // Check if we came from a referral link
    const pathParts = window.location.pathname.split('/');
    if (pathParts[1] === 'join' && pathParts[2]) {
      const code = pathParts[2].toUpperCase();
      setReferralCode(code);
      setIsSignUp(true); // Switch to signup mode
      
      // Show referral message
      setSuccess(`Welcome! You're joining via referral code: ${code}`);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    
    if (isSignUp) {
      if (!formData.username) {
        setError('Username is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.username,
            referral_code: referralCode || null
          }
        }
      });

      if (error) throw error;
      
      // Process referral if there's a code and user was created
      if (referralCode && data.user) {
        const referralResult = await processReferralSignup(referralCode, data.user.id);
        if (referralResult.success) {
          setSuccess(`Account created! You earned ${referralResult.bonusAmount} WINGS for joining via referral. Check your email to confirm your account.`);
        } else {
          setSuccess('Account created! Please check your email to confirm your account.');
        }
      } else if (data.user && !data.user.email_confirmed_at) {
        setSuccess('Account created! Please check your email to confirm your account.');
      } else {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1000);
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignUp) {
      handleSignUp();
    } else {
      handleLogin();
    }
  };

  if (loading) {
    return (
      <LoginContainer>
        <LoginCard>
          <Title>Loading...</Title>
        </LoginCard>
      </LoginContainer>
    );
  }

  return (
    <LoginContainer>
      <LoginCard>
        <Title>🦋 Monarch</Title>
        <Subtitle>
          {isSignUp ? 'Create your account to start collecting' : 'Welcome back to your digital passport'}
        </Subtitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <form onSubmit={handleSubmit}>
          <FormContainer>
            {isSignUp && (
              <InputGroup>
                <Label>Username</Label>
                <Input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </InputGroup>
            )}

            {isSignUp && (
              <InputGroup>
                <Label>Referral Code (Optional)</Label>
                <Input
                  type="text"
                  name="referralCode"
                  placeholder="Enter referral code"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase' }}
                />
                {referralCode && (
                  <div style={{ fontSize: '0.8rem', color: '#2ecc71', marginTop: '0.25rem' }}>
                    ✓ You'll earn 25 WINGS for joining + 25 more for your first scan!
                  </div>
                )}
              </InputGroup>
            )}
            
            <InputGroup>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </InputGroup>
            
            <InputGroup>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </InputGroup>
            
            {isSignUp && (
              <InputGroup>
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </InputGroup>
            )}
            
            <GlowButton
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </GlowButton>
          </FormContainer>
        </form>

        <ToggleButton onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </ToggleButton>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginScreen; 