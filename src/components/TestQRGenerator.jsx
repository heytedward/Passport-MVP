import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 176, 0, 0.2);
  border-radius: 16px;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #FFB000;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 176, 0, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  margin-bottom: 1rem;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #4C1C8C, #7F3FBF);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(76, 28, 140, 0.3);
  }
`;

const QRCodeContainer = styled.div`
  text-align: center;
  margin: 2rem 0;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const TestQRGenerator = () => {
  const [qrData, setQrData] = useState('test');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const generateQRCode = () => {
    if (!qrData.trim()) return;
    
    // Use a free QR code API that generates SVG
    const encodedData = encodeURIComponent(qrData);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&format=svg`;
    setQrCodeUrl(qrUrl);
  };

  const testRewards = [
    {
      name: 'Test Reward 1',
      data: JSON.stringify({
        type: 'monarch_reward',
        rewardId: 'test_001',
        season: 'spring_2024',
        name: 'Test Jacket',
        rarity: 'rare',
        wngs_value: 50
      })
    },
    {
      name: 'Test Reward 2', 
      data: JSON.stringify({
        type: 'monarch_reward',
        rewardId: 'test_002',
        season: 'spring_2024',
        name: 'Test Tee',
        rarity: 'common',
        wngs_value: 25
      })
    },
    {
      name: 'Plain Text Test',
      data: 'Hello World! This is a test QR code.'
    },
    {
      name: 'URL Test',
      data: 'https://papillonbrand.us'
    }
  ];

  return (
    <Container>
      <Card>
        <Title>🧪 QR Code Test Generator</Title>
        
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#FFB000', marginBottom: '1rem' }}>Quick Test Options:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {testRewards.map((reward, index) => (
              <Button
                key={index}
                onClick={() => {
                  setQrData(reward.data);
                  setTimeout(() => generateQRCode(), 100);
                }}
                style={{ fontSize: '0.9rem', padding: '0.75rem 1rem' }}
              >
                {reward.name}
              </Button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#FFB000', marginBottom: '1rem' }}>Custom QR Code:</h3>
          <Input
            type="text"
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            placeholder="Enter text, URL, or JSON data for QR code..."
          />
          <Button onClick={generateQRCode}>
            Generate QR Code
          </Button>
        </div>

        {qrCodeUrl && (
          <QRCodeContainer>
            <h3 style={{ color: '#FFB000', marginBottom: '1rem' }}>Generated QR Code:</h3>
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              style={{ 
                border: '2px solid rgba(255, 176, 0, 0.3)',
                borderRadius: '8px',
                maxWidth: '100%'
              }}
            />
            <div style={{ marginTop: '1rem', color: '#ccc', fontSize: '0.9rem' }}>
              <strong>Data:</strong> {qrData}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <Button onClick={() => window.open(qrCodeUrl, '_blank')}>
                Download QR Code
              </Button>
            </div>
          </QRCodeContainer>
        )}

        <div style={{ 
          background: 'rgba(76, 28, 140, 0.1)', 
          padding: '1.5rem', 
          borderRadius: '8px',
          borderLeft: '4px solid #4C1C8C'
        }}>
          <h4 style={{ color: '#4C1C8C', marginBottom: '1rem' }}>📱 Testing Instructions:</h4>
          <ol style={{ color: '#ccc', lineHeight: '1.6' }}>
            <li>Generate a QR code using one of the test options above</li>
            <li>Open the scanner at <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>/scan</code></li>
            <li>Point your camera at the QR code on this screen</li>
            <li>Check the console for detection logs</li>
            <li>Verify the scanned data matches what you generated</li>
          </ol>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button onClick={() => window.location.href = '/scan'}>
            🎯 Go to Scanner
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default TestQRGenerator;
