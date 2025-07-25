import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStamps } from '../hooks/useStamps';
import { useThemes } from '../hooks/useThemes';
import { gradientThemes } from '../styles/theme';
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

// Dynamic PassportBook that changes based on equipped theme
const PassportBook = styled.div`
  background: ${({ themeGradient, themeKey }) => {
    // Base glass effect
    const baseGlass = 'rgba(30,30,40,0.85)';
    
    // Theme-specific backgrounds
    switch (themeKey) {
      case 'solarShine':
        return `linear-gradient(135deg, ${baseGlass} 0%, rgba(255,176,0,0.15) 100%), rgba(255, 176, 0, 0.1)`;
      case 'echoGlass':
        return `linear-gradient(135deg, ${baseGlass} 0%, rgba(108,108,108,0.2) 100%), rgba(0, 0, 0, 0.3)`;
      case 'retroFrame':
        return `linear-gradient(135deg, ${baseGlass} 0%, rgba(108,108,108,0.15) 100%), rgba(250, 250, 250, 0.05)`;
      case 'nightScan':
        return `linear-gradient(135deg, ${baseGlass} 0%, rgba(76,28,140,0.2) 100%), rgba(0, 0, 0, 0.4)`;
      default: // frequencyPulse
        return `linear-gradient(135deg, ${baseGlass} 0%, rgba(76,28,140,0.13) 100%), rgba(76, 28, 140, 0.15)`;
    }
  }};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 3px solid ${({ themeKey }) => {
    switch (themeKey) {
      case 'solarShine':
        return '#FFB000';
      case 'echoGlass':
        return '#6C6C6C';
      case 'retroFrame':
        return '#FAFAFA';
      case 'nightScan':
        return '#4C1C8C';
      default: // frequencyPulse
        return '#FFB000';
    }
  }};
  border-radius: 20px;
  padding: 2.5rem;
  margin: 0 auto;
  max-width: 500px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: ${({ themeKey }) => {
    const baseShadow = '0 0 20px 0';
    const insetShadow = 'inset 0 1px 0';
    
    switch (themeKey) {
      case 'solarShine':
        return `
          ${baseShadow} rgba(255,176,0,0.3),
          0 0 40px 0 rgba(255,176,0,0.15),
          ${insetShadow} rgba(255,176,0,0.2)
        `;
      case 'echoGlass':
        return `
          ${baseShadow} rgba(108,108,108,0.3),
          0 0 40px 0 rgba(108,108,108,0.15),
          ${insetShadow} rgba(108,108,108,0.2)
        `;
      case 'retroFrame':
        return `
          ${baseShadow} rgba(250,250,250,0.2),
          0 0 40px 0 rgba(250,250,250,0.1),
          ${insetShadow} rgba(250,250,250,0.15)
        `;
      case 'nightScan':
        return `
          ${baseShadow} rgba(76,28,140,0.4),
          0 0 40px 0 rgba(76,28,140,0.2),
          ${insetShadow} rgba(76,28,140,0.25)
        `;
      default: // frequencyPulse
        return `
          ${baseShadow} rgba(255,176,0,0.2),
          0 0 40px 0 rgba(255,176,0,0.1),
          ${insetShadow} rgba(255,176,0,0.15)
        `;
    }
  }};
  position: relative;
  transition: all 0.3s ease;
  
  /* Book spine effect */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8px;
    background: ${({ themeKey }) => {
      switch (themeKey) {
        case 'solarShine':
          return 'linear-gradient(180deg, #FFB000 0%, #FF9F1C 100%)';
        case 'echoGlass':
          return 'linear-gradient(180deg, #6C6C6C 0%, #4A4A4A 100%)';
        case 'retroFrame':
          return 'linear-gradient(180deg, #FAFAFA 0%, #E0E0E0 100%)';
        case 'nightScan':
          return 'linear-gradient(180deg, #4C1C8C 0%, #2D1B69 100%)';
        default: // frequencyPulse
          return 'linear-gradient(180deg, #FFB000 0%, #FF9F1C 100%)';
      }
    }};
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
  border-bottom: 2px dashed ${({ themeKey }) => {
    switch (themeKey) {
      case 'solarShine':
        return 'rgba(255,176,0,0.4)';
      case 'echoGlass':
        return 'rgba(108,108,108,0.4)';
      case 'retroFrame':
        return 'rgba(250,250,250,0.4)';
      case 'nightScan':
        return 'rgba(76,28,140,0.4)';
      default: // frequencyPulse
        return 'rgba(255,176,0,0.3)';
    }
  }};
  position: relative;
`;

const SeasonTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ themeKey }) => {
    switch (themeKey) {
      case 'solarShine':
        return '#FFB000';
      case 'echoGlass':
        return '#6C6C6C';
      case 'retroFrame':
        return '#FAFAFA';
      case 'nightScan':
        return '#4C1C8C';
      default: // frequencyPulse
        return '#FFB000';
    }
  }};
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
  text-shadow: ${({ themeKey }) => {
    switch (themeKey) {
      case 'solarShine':
        return '0 0 10px rgba(255,176,0,0.4)';
      case 'echoGlass':
        return '0 0 10px rgba(108,108,108,0.4)';
      case 'retroFrame':
        return '0 0 10px rgba(250,250,250,0.4)';
      case 'nightScan':
        return '0 0 10px rgba(76,28,140,0.4)';
      default: // frequencyPulse
        return '0 0 10px rgba(255,176,0,0.3)';
    }
  }};
  
  @media (max-width: 767px) {
    font-size: 1.7rem;
    letter-spacing: 1px;
  }
`;

const PassportSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ themeKey }) => {
    switch (themeKey) {
      case 'solarShine':
        return 'rgba(255,176,0,0.8)';
      case 'echoGlass':
        return 'rgba(108,108,108,0.8)';
      case 'retroFrame':
        return 'rgba(250,250,250,0.8)';
      case 'nightScan':
        return 'rgba(76,28,140,0.8)';
      default: // frequencyPulse
        return 'rgba(255,176,0,0.7)';
    }
  }};
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
  border: 2px dashed ${props => {
    const { hasStamp, themeKey } = props;
    const borderColor = hasStamp ? {
      solarShine: '#FFB000',
      echoGlass: '#6C6C6C',
      retroFrame: '#FAFAFA',
      nightScan: '#4C1C8C',
      frequencyPulse: '#FFB000'
    }[themeKey] || '#FFB000' : {
      solarShine: 'rgba(255, 176, 0, 0.4)',
      echoGlass: 'rgba(108, 108, 108, 0.4)',
      retroFrame: 'rgba(250, 250, 250, 0.4)',
      nightScan: 'rgba(76, 28, 140, 0.4)',
      frequencyPulse: 'rgba(255, 176, 0, 0.3)'
    }[themeKey] || 'rgba(255, 176, 0, 0.3)';
    
    return borderColor;
  }};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => {
    const { hasStamp, themeKey } = props;
    if (!hasStamp) return 'rgba(255, 255, 255, 0.05)';
    
    switch (themeKey) {
      case 'solarShine':
        return 'linear-gradient(135deg, #FFB000, #FF9F1C)';
      case 'echoGlass':
        return 'linear-gradient(135deg, #6C6C6C, #4A4A4A)';
      case 'retroFrame':
        return 'linear-gradient(135deg, #FAFAFA, #E0E0E0)';
      case 'nightScan':
        return 'linear-gradient(135deg, #4C1C8C, #2D1B69)';
      default: // frequencyPulse
        return 'linear-gradient(135deg, #FFB000, #FF9F1C)';
    }
  }};
  color: ${props => props.hasStamp ? '#000000' : 'rgba(255, 255, 255, 0.4)'};
  font-size: 1.2rem;
  position: relative;
  transition: all 0.3s ease;
  cursor: ${props => props.hasStamp ? 'pointer' : 'default'};
  backdrop-filter: blur(10px);
  box-shadow: ${props => {
    const { hasStamp, themeKey } = props;
    if (!hasStamp) return 'inset 0 2px 4px rgba(0,0,0,0.1)';
    
    const glowColor = {
      solarShine: 'rgba(255,176,0,0.2)',
      echoGlass: 'rgba(108,108,108,0.2)',
      retroFrame: 'rgba(250,250,250,0.2)',
      nightScan: 'rgba(76,28,140,0.2)',
      frequencyPulse: 'rgba(255,176,0,0.1)'
    }[themeKey] || 'rgba(255,176,0,0.1)';
    
    return `inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 2px ${glowColor}`;
  }};

  /* Indented effect for earned stamps */
  ${props => props.hasStamp && `
    transform: translateY(1px);
    border-style: solid;
    border-width: 1px;
  `}

  &:hover {
    transform: ${props => props.hasStamp ? 'translateY(0px) scale(1.02)' : 'none'};
    box-shadow: ${props => {
      const { hasStamp, themeKey } = props;
      if (!hasStamp) return 'inset 0 2px 4px rgba(0,0,0,0.1)';
      
      const glowColor = {
        solarShine: 'rgba(255,176,0,0.3)',
        echoGlass: 'rgba(108,108,108,0.3)',
        retroFrame: 'rgba(250,250,250,0.3)',
        nightScan: 'rgba(76,28,140,0.3)',
        frequencyPulse: 'rgba(255,176,0,0.2)'
      }[themeKey] || 'rgba(255,176,0,0.2)';
      
      return `inset 0 1px 2px rgba(0,0,0,0.1), 0 4px 8px ${glowColor}`;
    }};
    border-color: ${props => {
      const { hasStamp, themeKey } = props;
      if (!hasStamp) {
        const borderColor = {
          solarShine: 'rgba(255, 176, 0, 0.6)',
          echoGlass: 'rgba(108, 108, 108, 0.6)',
          retroFrame: 'rgba(250, 250, 250, 0.6)',
          nightScan: 'rgba(76, 28, 140, 0.6)',
          frequencyPulse: 'rgba(255, 176, 0, 0.5)'
        }[themeKey] || 'rgba(255, 176, 0, 0.5)';
        return borderColor;
      }
      
      return {
        solarShine: '#FFB000',
        echoGlass: '#6C6C6C',
        retroFrame: '#FAFAFA',
        nightScan: '#4C1C8C',
        frequencyPulse: '#FFB000'
      }[themeKey] || '#FFB000';
    }};
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
  background: ${({ themeKey }) => {
    switch (themeKey) {
      case 'solarShine':
        return 'linear-gradient(135deg, #FFB000, #FF9F1C)';
      case 'echoGlass':
        return 'linear-gradient(135deg, #6C6C6C, #4A4A4A)';
      case 'retroFrame':
        return 'linear-gradient(135deg, #FAFAFA, #E0E0E0)';
      case 'nightScan':
        return 'linear-gradient(135deg, #4C1C8C, #2D1B69)';
      default: // frequencyPulse
        return 'linear-gradient(135deg, #4C1C8C, #7F3FBF)';
    }
  }};
  border-radius: 12px;
  color: ${({ themeKey }) => {
    switch (themeKey) {
      case 'solarShine':
      case 'retroFrame':
        return '#000000';
      default:
        return '#FFFFFF';
    }
  }};
  border: 1px solid ${({ themeKey }) => {
    switch (themeKey) {
      case 'solarShine':
        return '#FFB000';
      case 'echoGlass':
        return '#6C6C6C';
      case 'retroFrame':
        return '#FAFAFA';
      case 'nightScan':
        return '#4C1C8C';
      default: // frequencyPulse
        return '#4C1C8C';
    }
  }};
  box-shadow: ${({ themeKey }) => {
    const glowColor = {
      solarShine: 'rgba(255,176,0,0.4)',
      echoGlass: 'rgba(108,108,108,0.4)',
      retroFrame: 'rgba(250,250,250,0.4)',
      nightScan: 'rgba(76,28,140,0.4)',
      frequencyPulse: 'rgba(76, 28, 140, 0.3)'
    }[themeKey] || 'rgba(76, 28, 140, 0.3)';
    
    return `0 4px 12px ${glowColor}`;
  }};
`;

const ProgressText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: inherit;
`;

const ThemeIndicator = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  color: ${({ themeKey }) => {
    switch (themeKey) {
      case 'solarShine':
        return '#FFB000';
      case 'echoGlass':
        return '#6C6C6C';
      case 'retroFrame':
        return '#FAFAFA';
      case 'nightScan':
        return '#4C1C8C';
      default: // frequencyPulse
        return '#FFB000';
    }
  }};
  border-radius: 20px;
  font-size: 0.9rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  backdrop-filter: blur(10px);
  border: 1px solid ${({ themeKey }) => {
    switch (themeKey) {
      case 'solarShine':
        return 'rgba(255,176,0,0.3)';
      case 'echoGlass':
        return 'rgba(108,108,108,0.3)';
      case 'retroFrame':
        return 'rgba(250,250,250,0.3)';
      case 'nightScan':
        return 'rgba(76,28,140,0.3)';
      default: // frequencyPulse
        return 'rgba(255,176,0,0.3)';
    }
  }};
  display: inline-block;
`;

const PassportScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stamps, loading } = useStamps();
  const { equippedTheme } = useThemes();
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

  // Get theme name for display
  const getThemeName = (themeKey) => {
    const themeNames = {
      frequencyPulse: 'Frequency Pulse',
      solarShine: 'Solar Shine',
      echoGlass: 'Echo Glass',
      retroFrame: 'Retro Frame',
      nightScan: 'Night Scan'
    };
    return themeNames[themeKey] || 'Frequency Pulse';
  };

  return (
    <Container>
      <PassportBook 
        themeKey={equippedTheme}
        themeGradient={gradientThemes[equippedTheme]?.gradient}
      >
        
        <PassportHeader themeKey={equippedTheme}>
          <SeasonTitle themeKey={equippedTheme}>Fall 2025 - Digital Genesis</SeasonTitle>
          <PassportTitle themeKey={equippedTheme}>Find Your Wings</PassportTitle>
          <PassportSubtitle themeKey={equippedTheme}>
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
                themeKey={equippedTheme}
                onClick={() => handleStampClick(stamp)}
              >
                {/* Empty state - no emoji or name */}
              </StampSlot>
            );
          })}
        </StampsGrid>

        <ProgressSection themeKey={equippedTheme}>
          <ProgressText>
            {completedCount}/9 Stamps Collected
          </ProgressText>
          <ProgressText style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {completedCount === 9 ? '🎉 Master Collector!' : 
             completedCount >= 6 ? '🔥 Almost there!' :
             completedCount >= 3 ? '⭐ Great progress!' :
             'Just getting started!'}
          </ProgressText>
          <ThemeIndicator themeKey={equippedTheme}>
            Theme: {getThemeName(equippedTheme)}
          </ThemeIndicator>
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