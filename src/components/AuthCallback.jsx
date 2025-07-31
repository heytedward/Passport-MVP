import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import styled from 'styled-components';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #4C1C8C 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Message = styled.div`
  text-align: center;
  color: #FFFFFF;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left: 4px solid #FFB000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 2rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('🦋 Confirming your account...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          setMessage('❌ Confirmation failed. Redirecting to login...');
          setTimeout(() => {
            navigate('/login?error=confirmation-failed');
          }, 3000);
          return;
        }

        if (data.session) {
          console.log('✅ Email confirmed, user logged in');
          setMessage('✅ Email confirmed! Welcome to Monarch Passport!');
          
          // Redirect to home with success message
          setTimeout(() => {
            navigate('/', { 
              state: { 
                message: '🎉 Email confirmed! Welcome to Monarch Passport!' 
              }
            });
          }, 2000);
        } else {
          console.log('ℹ️ No active session, redirecting to login');
          setMessage('Please log in to continue...');
          setTimeout(() => {
            navigate('/login?message=please-login');
          }, 2000);
        }
      } catch (error) {
        console.error('💥 Unexpected error in auth callback:', error);
        setMessage('An unexpected error occurred. Redirecting...');
        setTimeout(() => {
          navigate('/login?error=unexpected-error');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <Container>
      <Spinner />
      <Message>{message}</Message>
    </Container>
  );
};

export default AuthCallback; 