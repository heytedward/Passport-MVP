import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ModernQRScanner from '../components/ModernQRScanner';
import GlassCard from '../components/GlassCard';
import GlowButton from '../components/GlowButton';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem 6rem 1rem;
`;

const ScannerCard = styled(GlassCard)`
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const ScanScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScanSuccess = (data, qrCode) => {
    console.log('✅ QR Scan successful:', data);
    
    // Validate data before setting state
    if (!data) {
      console.error('❌ No data received from QR scan');
      setError('Invalid QR code data received');
      setIsScanning(false);
      return;
    }
    
    setScanResult(data);
    setIsScanning(false);
    
    // Process the QR code data here
    try {
      const payload = JSON.parse(data);
      if (payload?.rewardId) {
        // Handle reward processing
        console.log('🎁 Reward detected:', payload.rewardId);
      }
    } catch (err) {
      console.warn('QR data is not JSON:', data);
      // This is not an error - QR codes can contain plain text
    }
  };

  const handleScanError = (error) => {
    console.error('❌ QR Scan error:', error);
    setError(error?.message || 'An unknown error occurred');
    setIsScanning(false);
  };

  const handleStartScanning = () => {
    setError(null);
    setScanResult(null);
    setIsScanning(true);
  };

  const handleCloseScanner = () => {
    setIsScanning(false);
  };

  if (!user?.id) {
    return (
      <Container>
        <ScannerCard>
          <h2 style={{ marginBottom: '1.5rem' }}>Please log in to scan rewards</h2>
          <GlowButton onClick={() => navigate('/login')}>
            Go to Login
          </GlowButton>
        </ScannerCard>
      </Container>
    );
  }

  if (isScanning) {
    return (
      <ModernQRScanner
        onScanSuccess={handleScanSuccess}
        onScanError={handleScanError}
        onClose={handleCloseScanner}
      />
    );
  }

  return (
    <Container>
      <ScannerCard>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎯</div>
        <h2 style={{ marginBottom: '1rem', color: '#fff' }}>
          {scanResult ? 'Scan Complete!' : 'Ready to Scan'}
        </h2>
        
        {scanResult ? (
          <div>
            <p style={{ marginBottom: '2rem', color: '#4C1C8C', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {scanResult || 'No data available'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <GlowButton onClick={handleStartScanning}>
                📱 Scan Another
              </GlowButton>
              <GlowButton 
                onClick={() => navigate('/')}
                style={{ 
                  background: 'transparent',
                  borderColor: '#666',
                  color: '#ccc'
                }}
              >
                Back to Home
              </GlowButton>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '2.5rem', color: '#ccc', lineHeight: '1.6', fontSize: '1.1rem' }}>
              Point your camera at a QR code on a Papillon item to earn rewards
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <GlowButton onClick={handleStartScanning}>
                📱 Start Scanning
              </GlowButton>
              <GlowButton 
                onClick={() => navigate('/')}
                style={{ 
                  background: 'transparent',
                  borderColor: '#666',
                  color: '#ccc'
                }}
              >
                Back to Home
              </GlowButton>
            </div>
          </div>
        )}

        {error && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: 'rgba(231, 76, 60, 0.1)', 
            border: '1px solid rgba(231, 76, 60, 0.3)',
            borderRadius: '8px',
            color: '#e74c3c'
          }}>
            <strong>Error:</strong> {error}
            <br />
            <button 
              onClick={() => setError(null)}
              style={{
                marginTop: '8px',
                background: 'transparent',
                border: '1px solid #e74c3c',
                color: '#e74c3c',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
      </ScannerCard>
    </Container>
  );
};

export default ScanScreen; 