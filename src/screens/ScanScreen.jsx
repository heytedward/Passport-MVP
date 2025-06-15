import React from 'react';
import styled, { useTheme } from 'styled-components';
import { QrReader } from 'react-qr-reader';
import GlassButton from '../components/GlassButton';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 8px 100px 8px;
`;

const Instruction = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.08rem;
  margin-bottom: 18px;
  text-align: center;
  max-width: 340px;
`;

const ScanScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container>
      <h2 style={{ color: theme.colors.accent, marginBottom: 16 }}>Scan QR Code</h2>
      <Instruction>
        Hold your QR code up to the camera. If your camera is unavailable or not working, you can enter your code manually below.
      </Instruction>
      <QrReader
        constraints={{ facingMode: 'environment' }}
        onResult={(result, error) => {
          if (!!result) {
            alert(`Scanned: ${result?.text}`);
            navigate('/home');
          }
        }}
        style={{ width: '100%', maxWidth: 340, borderRadius: 16 }}
      />
      <GlassButton style={{ marginTop: 24 }} onClick={() => navigate('/profile')}>
        Cancel
      </GlassButton>
      <GlassButton onClick={() => navigate('/manual-input')}>
        Enter Code Manually
      </GlassButton>
    </Container>
  );
};

export default ScanScreen; 