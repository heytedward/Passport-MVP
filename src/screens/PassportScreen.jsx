import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useStamps } from '../hooks/useStamps';
import FlippableCard from '../components/FlippableCard';

const Container = styled.div`
  padding: 2rem 1rem 6rem 1rem;
  max-width: 100vw;
  overflow-x: hidden;
`;

const ScreenTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const PassportBook = styled.div`
  background: linear-gradient(135deg, rgba(30,30,40,0.85) 0%, rgba(76,28,140,0.13) 100%), rgba(76, 28, 140, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 3px solid #FFB000;
  border-radius: 20px;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 500px;
  box-shadow: 
    0 0 20px 0 rgba(255,176,0,0.2),
    0 0 40px 0 rgba(255,176,0,0.1),
    inset 0 1px 0 rgba(255,176,0,0.15);
  position: relative;
  
  @media (max-width: 767px) {
    padding: 1.5rem;
    margin: 1.5rem auto;
    max-width: 95%;
  }
`;

const PassportHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px dashed rgba(255,176,0,0.3);
`;

const PassportTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.8rem;
  color: #FFB000;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255,176,0,0.3);
  
  @media (max-width: 767px) {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }
`;

const PassportSubtitle = styled.div`
  color: rgba(255,176,0,0.7);
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const StatsContainer = styled.div`
  background: rgba(255,176,0,0.1);
  border: 1px solid rgba(255,176,0,0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.5rem;
`;

const StatsText = styled.div`
  color: #FFB000;
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 8px;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255,176,0,0.2);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #FFB000 0%, #FFD700 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
  width: ${({ percentage }) => percentage}%;
  box-shadow: 0 0 8px rgba(255,176,0,0.4);
`;

const StampsSection = styled.div`
  margin-top: 2rem;
`;

const StampsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 1.2rem;
  justify-items: center;
  align-items: center;
  padding: 1rem 0;
  max-width: 320px;
  margin: 0 auto;
  
  @media (max-width: 767px) {
    gap: 1rem;
    grid-template-columns: repeat(3, 1fr);
    max-width: 280px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.8rem;
    max-width: 240px;
  }
`;

const StampSlot = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 12px;
  position: relative;
  cursor: ${({ unlocked }) => unlocked ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Base border styling */
  border: 2px solid ${({ unlocked }) => 
    unlocked ? '#FFB000' : 'rgba(255,176,0,0.3)'};
  
  ${({ unlocked }) => unlocked ? css`
    /* Unlocked: solid gold border with glow */
    background: rgba(255,176,0,0.05);
    box-shadow: 
      0 0 12px 0 rgba(255,176,0,0.3),
      0 0 24px 0 rgba(255,176,0,0.15);
      
    &:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 
        0 0 16px 0 rgba(255,176,0,0.4),
        0 0 32px 0 rgba(255,176,0,0.2);
    }
  ` : css`
    /* Locked: dashed border */
    border-style: dashed;
    background: rgba(255,255,255,0.02);
    box-shadow: 
      0 0 8px 0 rgba(255,176,0,0.1);
  `}
  
  /* Special styling for Master Collector stamp */
  ${({ isMaster, unlocked }) => isMaster && unlocked && css`
    border: 2px solid #FFD700;
    background: linear-gradient(135deg, rgba(255,176,0,0.1) 0%, rgba(255,215,0,0.1) 100%);
    box-shadow: 
      0 0 16px 0 rgba(255,215,0,0.4),
      0 0 32px 0 rgba(255,215,0,0.2);
      
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 12px;
      padding: 2px;
      background: linear-gradient(45deg, #FFD700, #FFB000, #FFD700);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: xor;
      z-index: -1;
    }
  `}
  
  @media (max-width: 767px) {
    width: 75px;
    height: 75px;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    width: 65px;
    height: 65px;
  }
`;

const StampImage = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  ${({ unlocked }) => !unlocked && css`
    filter: grayscale(100%) brightness(0.4);
    opacity: 0.6;
  `}
  
  @media (max-width: 767px) {
    width: 55px;
    height: 55px;
  }
  
  @media (max-width: 480px) {
    width: 45px;
    height: 45px;
  }
`;

const StampBadge = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  
  ${({ unlocked }) => unlocked ? css`
    background: #10B981;
    color: white;
    box-shadow: 0 2px 8px rgba(16,185,129,0.3);
  ` : css`
    background: rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.5);
    border: 1px solid rgba(255,255,255,0.3);
  `}
  
  @media (max-width: 480px) {
    width: 16px;
    height: 16px;
    font-size: 10px;
    top: -4px;
    right: -4px;
  }
`;

const LoadingSkeleton = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(255,176,0,0.1) 0%, rgba(255,176,0,0.2) 50%, rgba(255,176,0,0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @media (max-width: 767px) {
    width: 75px;
    height: 75px;
  }
  
  @media (max-width: 480px) {
    width: 65px;
    height: 65px;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ef4444;
  padding: 2rem;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 12px;
  margin: 1rem 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.6);
`;

const PassportScreen = () => {
  const [selectedStamp, setSelectedStamp] = useState(null);
  const { stamps, loading, error, unlockedCount, totalCount, completionPercentage, loadUserStamps } = useStamps();

  const handleStampClick = (stamp) => {
    if (stamp.unlocked) {
      setSelectedStamp(stamp);
    }
  };

  const handleCloseModal = () => {
    setSelectedStamp(null);
  };

  const handleRefresh = () => {
    loadUserStamps();
  };

  if (loading) {
    return (
      <Container>
        <ScreenTitle>My Monarch Passport</ScreenTitle>
        <PassportBook>
          <PassportHeader>
            <PassportTitle>Spring '25</PassportTitle>
            <PassportSubtitle>Loading your achievements...</PassportSubtitle>
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={handleRefresh}
                style={{
                  background: 'transparent',
                  border: '1px solid #FFB000',
                  color: '#FFB000',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </PassportHeader>
          <StampsGrid>
            {Array.from({ length: 9 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </StampsGrid>
        </PassportBook>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ScreenTitle>My Monarch Passport</ScreenTitle>
        <PassportBook>
          <PassportHeader>
            <PassportTitle>Spring '25</PassportTitle>
          </PassportHeader>
          <ErrorMessage>
            Failed to load stamps: {error}
            <div style={{ marginTop: '1rem' }}>
              <button 
                onClick={handleRefresh}
                style={{
                  background: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  marginRight: '0.5rem'
                }}
              >
                🔄 Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  background: 'transparent',
                  border: '1px solid #666',
                  color: '#666',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                ↻ Reload Page
              </button>
            </div>
          </ErrorMessage>
        </PassportBook>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <ScreenTitle>My Monarch Passport</ScreenTitle>
        <PassportBook>
          <PassportHeader>
            <PassportTitle>Spring '25</PassportTitle>
            <PassportSubtitle>Monarch Collector Passport</PassportSubtitle>
            
            <StatsContainer>
              <StatsText>
                {unlockedCount} of {totalCount} stamps collected
              </StatsText>
              <ProgressBar>
                <ProgressFill percentage={completionPercentage} />
              </ProgressBar>
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'rgba(255,176,0,0.8)', 
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                {completionPercentage}% Complete
              </div>
            </StatsContainer>
          </PassportHeader>

          <StampsSection>
            {stamps.length > 0 ? (
              <StampsGrid>
                {stamps.map((stamp) => (
                  <StampSlot
                    key={stamp.stamp_id}
                    unlocked={stamp.unlocked}
                    isMaster={stamp.stamp_id === 'master_collector'}
                    onClick={() => handleStampClick(stamp)}
                    title={stamp.unlocked ? `${stamp.name} - Click to view details` : `${stamp.name} - Not earned yet`}
                  >
                    <StampImage
                      src={stamp.image}
                      alt={stamp.name}
                      unlocked={stamp.unlocked}
                      onError={(e) => {
                        // Fallback to a default stamp image if the SVG doesn't load
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNEMxQzhDIi8+Cjx0ZXh0IHg9IjUwIiB5PSI2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZGQjAwMCIgZm9udC1zaXplPSIzMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIj7wn6aLPC90ZXh0Pgo8L3N2Zz4K';
                      }}
                    />
                    <StampBadge unlocked={stamp.unlocked}>
                      {stamp.unlocked ? '✓' : '🔒'}
                    </StampBadge>
                  </StampSlot>
                ))}
              </StampsGrid>
            ) : (
              <EmptyState>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏅</div>
                <div>No stamps available</div>
              </EmptyState>
            )}
          </StampsSection>
        </PassportBook>
      </Container>

      {/* Enhanced Modal using FlippableCard component */}
      {selectedStamp && (
        <FlippableCard
          isOpen={!!selectedStamp}
          onClose={handleCloseModal}
          frontContent={{
            title: selectedStamp.name,
            subtitle: selectedStamp.category.charAt(0).toUpperCase() + selectedStamp.category.slice(1),
            image: selectedStamp.image,
            imageAlt: selectedStamp.name
          }}
          backContent={{
            title: "Stamp Details",
            content: (
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#FFB000' }}>Description:</strong>
                  <div style={{ marginTop: '0.5rem' }}>{selectedStamp.description}</div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ color: '#FFB000' }}>Category:</strong>
                  <div style={{ marginTop: '0.5rem' }}>
                    {selectedStamp.category.charAt(0).toUpperCase() + selectedStamp.category.slice(1)}
                  </div>
                </div>
                {selectedStamp.earnedAt && (
                  <div>
                    <strong style={{ color: '#FFB000' }}>Earned:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      {new Date(selectedStamp.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            )
          }}
        />
      )}
    </>
  );
};

export default PassportScreen; 