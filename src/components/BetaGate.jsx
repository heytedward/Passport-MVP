import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const BetaContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
`;

const BetaCard = styled.div`
  background: linear-gradient(135deg, rgba(30,30,40,0.95) 0%, rgba(76,28,140,0.15) 100%);
  backdrop-filter: blur(20px);
  border: 3px solid #FFB000;
  border-radius: 20px;
  padding: 3rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 
    0 0 32px 0 rgba(255,176,0,0.25), 
    0 0 24px 0 rgba(255,176,0,0.15),
    0 20px 40px rgba(0,0,0,0.3);
`;

const BetaTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  color: #FFB000;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const BetaInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid rgba(255,176,0,0.3);
  border-radius: 12px;
  font-size: 1rem;
  margin: 1rem 0;
  background: rgba(255,255,255,0.1);
  color: white;
  font-family: 'Space Grotesk', sans-serif;
  
  &::placeholder {
    color: rgba(255,255,255,0.6);
  }
  
  &:focus {
    outline: none;
    border-color: #FFB000;
    box-shadow: 0 0 0 3px rgba(255,176,0,0.1);
  }
`;

const BetaButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%);
  border: none;
  border-radius: 12px;
  color: #000000;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(255,176,0,0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const BetaGate = ({ children }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user already has access (stored in localStorage)
    const betaAccess = localStorage.getItem('monarch_beta_access');
    if (betaAccess === 'granted') {
      setHasAccess(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Set your beta password here
    const BETA_PASSWORD = 'papillon2025'; // Change this!
    
    if (password === BETA_PASSWORD) {
      localStorage.setItem('monarch_beta_access', 'granted');
      setHasAccess(true);
      setError('');
    } else {
      setError('Invalid access code. Contact support for access.');
      setPassword('');
    }
  };

  // Show loading state while checking localStorage
  if (isLoading) {
    return (
      <BetaContainer>
        <BetaCard>
          <BetaTitle>🦋 Monarch Passport</BetaTitle>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
            Loading...
          </p>
        </BetaCard>
      </BetaContainer>
    );
  }

  if (hasAccess) {
    return children;
  }

  return (
    <BetaContainer>
      <BetaCard>
        <BetaTitle>🦋 Monarch Passport</BetaTitle>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
          Private Beta Access Required
        </p>
        
        <form onSubmit={handleSubmit}>
          <BetaInput
            type="password"
            placeholder="Enter beta access code"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
          />
          
          {error && (
            <p style={{ color: '#e74c3c', fontSize: '0.9rem', margin: '0.5rem 0' }}>
              {error}
            </p>
          )}
          
          <BetaButton type="submit">
            Access Beta
          </BetaButton>
        </form>
        
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '1rem' }}>
          Need access? Contact: support@monarchpassport.com
        </p>
      </BetaCard>
    </BetaContainer>
  );
};

export default BetaGate; 