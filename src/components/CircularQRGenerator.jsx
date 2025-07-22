import React, { useState, useEffect } from 'react';

const CircularQRGenerator = () => {
  const [inputData, setInputData] = useState('test');
  const [encodedBits, setEncodedBits] = useState('');
  const [showLogo, setShowLogo] = useState(true);

  const rewards = {
    'monarch_jacket_001': {
      name: 'Monarch Varsity Jacket',
      description: 'Limited edition varsity jacket with embroidered Monarch logo',
      category: 'jackets',
      rarity: 'rare',
      wngs_value: 75,
      shortId: 'jkt01'
    },
    'monarch_tee_001': {
      name: 'Monarch Classic Tee',
      description: 'Premium cotton t-shirt with subtle Monarch branding',
      category: 'tops',
      rarity: 'common',
      wngs_value: 15,
      shortId: 'tee01'
    },
    'monarch_cap_001': {
      name: 'Monarch Snapback',
      description: 'Embroidered snapback cap with adjustable strap',
      category: 'headwear',
      rarity: 'uncommon',
      wngs_value: 35,
      shortId: 'cap01'
    },
    'test_reward': {
      name: 'Test Demo Item',
      description: 'Demo item for testing circular QR detection',
      category: 'demo',
      rarity: 'legendary',
      wngs_value: 300,
      shortId: 'test'
    }
  };

  // Encoding functions - MUST match the scanner exactly
  const stringToBinary = (str) => {
    return str.split('').map(char => 
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  };

  const calculateChecksum = (bits) => {
    let checksum = 0;
    for (let i = 0; i < bits.length; i += 8) {
      const byte = parseInt(bits.substr(i, 8), 2) || 0;
      checksum ^= byte;
    }
    return checksum.toString(2).padStart(8, '0');
  };

  const encodeData = (data) => {
    const truncatedData = data.substring(0, 5);
    const binaryData = stringToBinary(truncatedData);
    const paddedBinary = binaryData.padEnd(40, '0');
    const checksum = calculateChecksum(paddedBinary);
    return paddedBinary + checksum;
  };

  useEffect(() => {
    setEncodedBits(encodeData(inputData));
  }, [inputData]);

  const downloadSVG = () => {
    const svg = document.getElementById('circular-qr-svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monarch-${inputData}-circular-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #121212 0%, #1a1a2e 50%, #16213e 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(76, 28, 140, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(244, 176, 25, 0.2)',
        padding: '2rem 0',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #F4B019, #FFD700)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 0.5rem 0'
        }}>
          🦋 Monarch Circular QR Generator
        </h1>
        <p style={{
          color: '#B19CD9',
          fontSize: '1.2rem',
          margin: 0,
          opacity: 0.9
        }}>
          Generate scannable circular QR codes with Papillon branding
        </p>
      </div>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: 'minmax(400px, 1fr) minmax(500px, 1fr)',
        gap: '3rem',
        alignItems: 'start'
      }}>
        
        {/* Controls Panel */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(244, 176, 25, 0.2)',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
        }}>
          <h2 style={{
            color: '#F4B019',
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            ⚙️ Generator Settings
          </h2>
          
          {/* Input Section */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              color: '#F4B019',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '1rem'
            }}>
              Product Code (max 5 characters):
            </label>
            <input
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(244, 176, 25, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              placeholder="Enter code..."
              maxLength={5}
              onFocus={(e) => e.target.style.borderColor = '#F4B019'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(244, 176, 25, 0.3)'}
            />
            <p style={{
              color: '#B19CD9',
              fontSize: '0.9rem',
              margin: '0.5rem 0 0 0',
              opacity: 0.8
            }}>
              {inputData.length}/5 characters used
            </p>
          </div>

          {/* Product Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              color: '#F4B019',
              fontWeight: '600',
              marginBottom: '0.75rem',
              fontSize: '1rem'
            }}>
              Quick Select Products:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem'
            }}>
              {Object.entries(rewards).map(([id, reward]) => (
                <button
                  key={id}
                  onClick={() => setInputData(reward.shortId)}
                  style={{
                    padding: '1rem',
                    background: inputData === reward.shortId 
                      ? 'linear-gradient(135deg, #4C1C8C, #7F3FBF)'
                      : 'rgba(76, 28, 140, 0.2)',
                    border: inputData === reward.shortId 
                      ? '2px solid #F4B019'
                      : '2px solid rgba(127, 63, 191, 0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (inputData !== reward.shortId) {
                      e.target.style.background = 'rgba(76, 28, 140, 0.4)';
                      e.target.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (inputData !== reward.shortId) {
                      e.target.style.background = 'rgba(76, 28, 140, 0.2)';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {reward.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>
                    Code: {reward.shortId}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#4CAF50',
                    fontWeight: '600' 
                  }}>
                    {reward.wngs_value} WNGS
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Logo Toggle */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  accentColor: '#F4B019'
                }}
              />
              Show Papillon Logo in Center
            </label>
          </div>

          {/* Binary Display */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(244, 176, 25, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              color: '#B19CD9',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🔢 Binary Encoding
            </h3>
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '8px',
              padding: '1rem',
              fontFamily: '"Fira Code", "Monaco", monospace',
              fontSize: '0.85rem',
              color: '#4CAF50',
              wordBreak: 'break-all',
              lineHeight: '1.4'
            }}>
              {encodedBits}
            </div>
            <div style={{ 
              marginTop: '1rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}>
              <div style={{ color: '#B19CD9' }}>
                <strong>Data:</strong> {encodedBits.substring(0, 40)}
              </div>
              <div style={{ color: '#B19CD9' }}>
                <strong>Checksum:</strong> {encodedBits.substring(40, 48)}
              </div>
              <div style={{ color: '#F4B019' }}>
                <strong>Total:</strong> 48 bits
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={downloadSVG}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #F4B019, #FFD700)',
                color: '#121212',
                fontWeight: '700',
                fontSize: '1rem',
                padding: '1rem 1.5rem',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(244, 176, 25, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(244, 176, 25, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(244, 176, 25, 0.3)';
              }}
            >
              <span>📥</span>
              Download SVG
            </button>
            <button
              onClick={() => setInputData('')}
              style={{
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <span>🔄</span>
            </button>
          </div>
        </div>

        {/* QR Code Display */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(244, 176, 25, 0.2)',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: '#121212',
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            🎯 Generated QR Code
          </h2>
          
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <svg
              id="circular-qr-svg"
              width="350"
              height="350"
              viewBox="0 0 300 300"
              style={{ display: 'block', margin: '0 auto' }}
            >
              {/* White background */}
              <rect width="300" height="300" fill="#FFFFFF" />
              
              {/* Outer positioning ring - HIGH CONTRAST */}
              <circle cx="150" cy="150" r="145" fill="none" stroke="#000000" strokeWidth="6" />
              
              {/* Segmented outer ring for positioning - HIGH CONTRAST */}
              {Array.from({length: 12}, (_, i) => {
                const angle = (i * 30) * (Math.PI / 180);
                const startAngle = angle - (15 * Math.PI / 180);
                const endAngle = angle + (15 * Math.PI / 180);
                const outerRadius = 145;
                const innerRadius = 130;
                
                const x1 = 150 + Math.cos(startAngle) * innerRadius;
                const y1 = 150 + Math.sin(startAngle) * innerRadius;
                const x2 = 150 + Math.cos(endAngle) * innerRadius;
                const y2 = 150 + Math.sin(endAngle) * innerRadius;
                const x3 = 150 + Math.cos(endAngle) * outerRadius;
                const y3 = 150 + Math.sin(endAngle) * outerRadius;
                const x4 = 150 + Math.cos(startAngle) * outerRadius;
                const y4 = 150 + Math.sin(startAngle) * outerRadius;
                
                const isBlack = i % 3 === 0;
                
                return (
                  <path
                    key={`outer-${i}`}
                    d={`M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${outerRadius} ${outerRadius} 0 0 0 ${x4} ${y4} Z`}
                    fill={isBlack ? '#000000' : '#FFFFFF'}
                    stroke="#000000"
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Middle ring - HIGH CONTRAST */}
              <circle cx="150" cy="150" r="120" fill="none" stroke="#000000" strokeWidth="3" />
              
              {/* Data rings - MAXIMUM CONTRAST FOR CAMERA DETECTION */}
              {[
                { segments: 8, radius: { inner: 65, outer: 75 }, angleSpan: 18, startBit: 0 },
                { segments: 16, radius: { inner: 85, outer: 95 }, angleSpan: 9, startBit: 8 },
                { segments: 24, radius: { inner: 105, outer: 115 }, angleSpan: 6, startBit: 24 }
              ].map((ring, ringIndex) => 
                Array.from({length: ring.segments}, (_, i) => {
                  const angle = (i * (360 / ring.segments)) * (Math.PI / 180);
                  const startAngle = angle - (ring.angleSpan * Math.PI / 180);
                  const endAngle = angle + (ring.angleSpan * Math.PI / 180);
                  
                  const x1 = 150 + Math.cos(startAngle) * ring.radius.inner;
                  const y1 = 150 + Math.sin(startAngle) * ring.radius.inner;
                  const x2 = 150 + Math.cos(endAngle) * ring.radius.inner;
                  const y2 = 150 + Math.sin(endAngle) * ring.radius.inner;
                  const x3 = 150 + Math.cos(endAngle) * ring.radius.outer;
                  const y3 = 150 + Math.sin(endAngle) * ring.radius.outer;
                  const x4 = 150 + Math.cos(startAngle) * ring.radius.outer;
                  const y4 = 150 + Math.sin(startAngle) * ring.radius.outer;
                  
                  const bitIndex = ring.startBit + i;
                  const isSet = encodedBits[bitIndex] === '1';
                  
                  return (
                    <path
                      key={`ring-${ringIndex}-${i}`}
                      d={`M ${x1} ${y1} A ${ring.radius.inner} ${ring.radius.inner} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${ring.radius.outer} ${ring.radius.outer} 0 0 0 ${x4} ${y4} Z`}
                      fill={isSet ? '#000000' : '#FFFFFF'}
                      stroke="#000000"
                      strokeWidth="0.5"
                    />
                  );
                })
              )}
              
              {/* Center logo area - HIGH CONTRAST */}
              <circle cx="150" cy="150" r="55" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
              <circle cx="150" cy="150" r="45" fill="none" stroke="#000000" strokeWidth="3" />
              
              {/* Positioning markers - SOLID BLACK */}
              <circle cx="150" cy="115" r="4" fill="#000000" />
              <circle cx="185" cy="150" r="4" fill="#000000" />
              <circle cx="150" cy="185" r="4" fill="#000000" />
              <circle cx="115" cy="150" r="4" fill="#000000" />
              
              {/* PAPILLON LOGO - HIGH CONTRAST */}
              {showLogo ? (
                <g transform="translate(150, 145) scale(0.03) translate(-965, -410)">
                  {/* Top circle */}
                  <path d="M965.35,380.63c-53.21,1.58-99.94-37.36-100.16-97.49-.2-54.36,38.41-99.68,100.16-100.14,55.99-.42,98.03,40.8,99.26,97.88,1.22,56.35-42.99,101.52-99.27,99.75Z" fill="#000000"/>
                  
                  {/* Bottom circle */}
                  <path d="M966.46,439.05c47.18-2.32,98.18,37.36,98.17,98.68,0,55.27-41.86,99.73-99.63,98.75-60.67-1.03-99.14-42.83-99.9-97.4-.86-61.26,50.23-102.87,101.37-100.03Z" fill="#000000"/>
                  
                  {/* Left curved element */}
                  <path d="M236.74,262.16c4.24,.25,7.04-2.85,10.3-4.95,35.77-23.06,78.33-20.59,112.28,4.79,40.25,30.08,54.38,86.37,35.04,136.47-14.39,37.29-41.54,62.37-78.27,77.53-17.69,7.3-36.28,11.97-55.09,11.84-37.53-.26-71.65-11.49-100.36-36.96-28.13-24.95-43.88-56.5-51.22-92.84-11.23-55.55-1.27-108.45,21.14-159.34,23.73-53.88,60.05-98.07,107.56-132.82C284.89,31.68,337.56,12.12,394.65,3.7c29.15-4.3,58.57-4.72,87.59-1.92,48.25,4.66,94.63,17.27,137.57,40.86,66.42,36.48,115.74,89.41,149.97,156.48,21.05,41.23,34.11,85.05,39.19,131.26,3.15,28.68,5.46,57.46,3.87,86.17-2.65,48.19-11.14,95.48-25.31,141.79-27.17,88.79-71.22,168.99-123.39,245.11-37.17,54.23-77.54,106.01-120.45,155.83-30.53,35.45-61.47,70.51-93.43,104.72-23.31,24.95-46.07,50.49-69.42,75.41-70.8,75.55-143.47,149.3-217.8,221.35-30.3,29.37-61.18,58.3-93.28,85.83-13.53,11.6-28.74,14.4-45.38,11.63-16.21-2.71-27.3-20.35-23.7-36.76,1.96-8.91,6.27-16.77,11.15-24.44,17.42-27.41,37.62-52.79,57.51-78.36,57.5-73.89,115.36-147.49,173.21-221.11,48.68-61.95,96.29-124.71,142.59-188.46,55.87-76.92,109.09-155.58,153.83-239.6,32.46-60.96,59.52-124.21,76.27-191.5,8.52-34.21,13.5-68.98,13.22-104.18-.37-48.6-11.37-95.01-37.3-136.42-33.78-53.94-82.9-86.77-145.84-97.34-59.39-9.98-112.46,6.05-159.33,42.87-24.3,19.09-41.59,43.47-49.46,73.87-.44,1.72-1.16,3.41,.21,5.37Z" fill="#000000"/>
                  
                  {/* Right curved element */}
                  <path d="M1695.11,264.15c-3.87-22.28-12.68-40.21-25.49-56.03-31.54-38.96-73.39-60.6-122.15-68-76.02-11.54-139.34,14.6-190.01,70.76-29.32,32.5-44.49,72.67-51.91,115.55-10.35,59.8-1.62,118.08,14.96,175.64,20.57,71.42,52.55,137.82,89.39,202.03,52.52,91.52,113.86,177.08,177.14,261.33,54.59,72.67,110.97,143.95,167.02,215.48,47.73,60.91,95.63,121.69,141.96,183.68,9.97,13.33,19.6,26.96,27.71,41.55,5.95,10.71,8.2,21.92,3.05,33.67-5.14,11.73-13.86,18.21-26.95,19.23-16.72,1.3-30.31-3.95-43.08-15.07-82.91-72.22-159.38-151.09-236.49-229.24-33.47-33.93-65.79-69.06-98.59-103.68-31.86-33.64-63.52-67.51-94.03-102.36-35.26-40.27-70.04-80.95-103.23-123.02-37.15-47.08-71.74-95.89-102.59-147.23-36.79-61.24-65.49-126.16-84.5-195.23-15.29-55.58-21.92-112.14-19.43-169.67,4.56-105.31,40.12-197.82,115.47-273.1,53.73-53.67,119.21-85.11,194-95.75,92.53-13.17,179.85,2.43,257.42,56.57,75.73,52.85,123.95,124.99,138.04,216.96,7.33,47.83,3.27,95.62-23.74,138.08-25.55,40.17-61.92,64.11-109.97,69.79-41.07,4.85-77.82-6.27-110.35-30.22-45.3-33.36-64.26-94.2-43.97-145.77,16.74-42.55,57.05-69.78,101.87-68.7,16.18,.39,30.85,5.69,44.53,14.04,4.13,2.52,8.2,5.16,13.93,8.77Z" fill="#000000"/>
                </g>
              ) : (
                <text
                  x="150"
                  y="155"
                  textAnchor="middle"
                  fontFamily="Arial, sans-serif"
                  fontSize="16"
                  fontWeight="bold"
                  fill="#666"
                >
                  LOGO
                </text>
              )}
            </svg>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'left'
          }}>
            <h3 style={{
              color: '#121212',
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Encoded: "{inputData}"
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              fontSize: '0.9rem',
              color: '#495057'
            }}>
              <div>
                <strong style={{ color: '#121212' }}>Total bits:</strong> 48
              </div>
              <div>
                <strong style={{ color: '#121212' }}>Filled segments:</strong> {encodedBits.split('1').length - 1}/48
              </div>
              <div>
                <strong style={{ color: '#121212' }}>Contrast:</strong> Maximum
              </div>
              <div>
                <strong style={{ color: '#121212' }}>Format:</strong> Circular QR
              </div>
            </div>
            
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(76, 28, 140, 0.1)',
              borderRadius: '8px',
              borderLeft: '4px solid #4C1C8C'
            }}>
              <h4 style={{ 
                color: '#4C1C8C', 
                margin: '0 0 0.5rem 0',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                📱 Testing Instructions
              </h4>
              <ol style={{ 
                color: '#495057', 
                margin: 0, 
                paddingLeft: '1.2rem',
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                <li>Download the SVG file</li>
                <li>Open scanner: <code style={{ background: 'rgba(0,0,0,0.1)', padding: '2px 4px', borderRadius: '3px' }}>/scan</code></li>
                <li>Point camera at QR code</li>
                <li>Watch console for detection logs</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularQRGenerator; 