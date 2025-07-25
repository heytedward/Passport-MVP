import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStamps } from '../hooks/useStamps';
import FlippableCard from '../components/FlippableCard';

const Container = styled.div`
  height: 100vh;
  overflow: hidden;
  background: #000000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 1rem 100px 1rem;
  position: relative;
`;



const PassportBook = styled.div`
  background: linear-gradient(135deg, rgba(30,30,40,0.85) 0%, rgba(76,28,140,0.13) 100%), rgba(76, 28, 140, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 3px solid #FFB000;
  border-radius: 20px;
  padding: 2.5rem;
  margin: 0 auto;
  max-width: 500px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 0 20px 0 rgba(255,176,0,0.2),
    0 0 40px 0 rgba(255,176,0,0.1),
    inset 0 1px 0 rgba(255,176,0,0.15);
  position: relative;
  
  /* Book spine effect */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8px;
    background: linear-gradient(180deg, #FFB000 0%, #FF9F1C 100%);
    border-radius: 20px 0 0 20px;
    box-shadow: inset -2px 0 5px rgba(0,0,0,0.3);
  }
  
  @media (max-width: 767px) {
    padding: 1.5rem;
    max-height: 90vh;
  }
`;

const PassportHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 2px dashed rgba(255,176,0,0.3);
  position: relative;
`;

const SeasonTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: #FFB000;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const PassportTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255,176,0,0.3);
  
  @media (max-width: 767px) {
    font-size: 1.7rem;
    letter-spacing: 1px;
  }
`;

const PassportSubtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255,176,0,0.7);
  margin: 0.5rem 0 0 0;
  font-family: 'Space Grotesk', sans-serif;
  font-style: italic;
`;

const StampsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
`;

const StampSlot = styled.div`
  aspect-ratio: 1;
  border: 2px dashed ${props => props.hasStamp ? '#FFB000' : 'rgba(255, 176, 0, 0.3)'};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.hasStamp ? 'linear-gradient(135deg, #FFB000, #FF9F1C)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.hasStamp ? '#000000' : 'rgba(255, 255, 255, 0.4)'};
  font-size: 1.2rem;
  position: relative;
  transition: all 0.3s ease;
  cursor: ${props => props.hasStamp ? 'pointer' : 'default'};
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.hasStamp 
    ? 'inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(255,176,0,0.1)' 
    : 'inset 0 2px 4px rgba(0,0,0,0.1)'};

  /* Indented effect for earned stamps */
  ${props => props.hasStamp && `
    transform: translateY(1px);
    border-style: solid;
    border-width: 1px;
  `}

  &:hover {
    transform: ${props => props.hasStamp ? 'translateY(0px) scale(1.02)' : 'none'};
    box-shadow: ${props => props.hasStamp 
      ? 'inset 0 1px 2px rgba(0,0,0,0.1), 0 4px 8px rgba(255,176,0,0.2)' 
      : 'inset 0 2px 4px rgba(0,0,0,0.1)'};
    border-color: ${props => props.hasStamp ? '#FFB000' : 'rgba(255, 176, 0, 0.5)'};
  }
`;

const StampIcon = styled.div`
  font-size: 1.4rem;
  margin-bottom: 0.25rem;
`;

const StampName = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  text-align: center;
  padding: 0 0.2rem;
  font-family: 'Space Grotesk', sans-serif;
`;

const StampDate = styled.div`
  font-size: 0.5rem;
  opacity: 0.8;
  margin-top: 0.2rem;
  font-family: 'Space Grotesk', sans-serif;
`;

const ProgressSection = styled.div`
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #4C1C8C, #7F3FBF);
  border-radius: 12px;
  color: #FFFFFF;
  border: 1px solid #4C1C8C;
  box-shadow: 0 4px 12px rgba(76, 28, 140, 0.3);
`;

const ProgressText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #FFFFFF;
`;

const PassportScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stamps, loading } = useStamps();
  const [selectedStamp, setSelectedStamp] = useState(null);

  // Define all possible stamps for the 3x3 grid
  const allStamps = [
    { id: 'received_passport', name: 'Welcome', icon: '🎫', description: 'Joined Monarch', rarity: 'Common' },
    { id: 'morning_gm', name: 'GM', icon: '☀️', description: 'Said GM', rarity: 'Common' },
    { id: 'first_item', name: 'First Scan', icon: '👕', description: 'First Item', rarity: 'Common' },
    { id: 'qr_scanner', name: 'Scanner', icon: '📱', description: 'QR Expert', rarity: 'Rare' },
    { id: 'social_share', name: 'Social', icon: '📣', description: 'Shared Story', rarity: 'Rare' },
    { id: 'style_icon', name: 'Style Icon', icon: '✨', description: 'Multi-Category', rarity: 'Epic' },
    { id: 'streak_master', name: 'Streak', icon: '🔥', description: '7-Day Streak', rarity: 'Epic' },
    { id: 'quest_completed', name: 'Quest', icon: '🎯', description: 'Quest Master', rarity: 'Rare' },
    { id: 'master_collector', name: 'Master', icon: '👑', description: 'All Stamps', rarity: 'Legendary' }
  ];

  // TEMPORARY: Show no earned stamps for testing
  const earnedStamps = {};

  const completedCount = Object.keys(earnedStamps).length;

  const handleStampClick = (stamp) => {
    const earnedStamp = earnedStamps[stamp.id];
    if (earnedStamp) {
      setSelectedStamp({
        emoji: stamp.icon,
        date: new Date(earnedStamp.earned_at).toLocaleDateString(),
        season: 'Fall 2025',
        rarity: stamp.rarity,
        name: stamp.name,
        description: stamp.description
      });
    }
  };

  const handleCloseCard = () => {
    setSelectedStamp(null);
  };

  return (
    <Container>
      <PassportBook>
        <PassportHeader>
          <SeasonTitle>Fall 2025 - Digital Genesis</SeasonTitle>
          <PassportTitle>Find Your Wings</PassportTitle>
          <PassportSubtitle>
            {user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Collector'}
          </PassportSubtitle>
        </PassportHeader>

        <StampsGrid>
          {allStamps.map((stamp) => {
            const earnedStamp = earnedStamps[stamp.id];
            const hasStamp = !!earnedStamp;
            
            return (
              <StampSlot 
                key={stamp.id} 
                hasStamp={hasStamp}
                onClick={() => handleStampClick(stamp)}
              >
                {/* Empty state - no emoji or name */}
              </StampSlot>
            );
          })}
        </StampsGrid>

        <ProgressSection>
          <ProgressText>
            {completedCount}/9 Stamps Collected
          </ProgressText>
          <ProgressText style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {completedCount === 9 ? '🎉 Master Collector!' : 
             completedCount >= 6 ? '🔥 Almost there!' :
             completedCount >= 3 ? '⭐ Great progress!' :
             'Just getting started!'}
          </ProgressText>
        </ProgressSection>
      </PassportBook>

      {selectedStamp && (
        <FlippableCard
          emoji={selectedStamp.emoji}
          date={selectedStamp.date}
          season={selectedStamp.season}
          rarity={selectedStamp.rarity}
          onClose={handleCloseCard}
        />
      )}
    </Container>
  );
};

export default PassportScreen; 