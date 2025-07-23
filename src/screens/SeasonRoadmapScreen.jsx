import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import LiveCountdown from '../components/LiveCountdown';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%);
  padding: 0.5rem 0.5rem 6rem 0.5rem;
  position: relative;
  overflow-x: hidden;
  
  @media (min-width: 768px) {
    padding: 1rem 1rem 6rem 1rem;
  }
  
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(255, 176, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(76, 28, 140, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const BackButton = styled.button`
  background: rgba(255, 176, 0, 0.1);
  border: 1px solid #FFB000;
  color: #FFB000;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  margin-bottom: 1.5rem;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  min-height: 44px;
  touch-action: manipulation;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
    padding: 0.5rem 1rem;
  }

  &:hover, &:active {
    background: rgba(255, 176, 0, 0.2);
    transform: translateY(-1px);
  }
`;

const RoadmapContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  padding: 0 0.5rem;
  
  @media (min-width: 768px) {
    padding: 0;
  }
`;

const ScreenTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #FFFFFF;
  text-align: center;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 20px rgba(255, 176, 0, 0.3);
  position: relative;
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, transparent, #FFB000, transparent);
    border-radius: 2px;
    
    @media (min-width: 768px) {
      width: 100px;
    }
  }
`;

const SeasonSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  justify-content: flex-start;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  
  @media (min-width: 768px) {
    gap: 0.75rem;
    margin-bottom: 2.5rem;
    padding: 1rem 0;
    justify-content: center;
  }
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SeasonTab = styled.button`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, rgba(255, 176, 0, 0.3), rgba(255, 176, 0, 0.1))' 
    : 'rgba(255, 255, 255, 0.05)'};
  border: 2px solid ${props => props.active 
    ? '#FFB000' 
    : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.active 
    ? '#FFFFFF' 
    : 'rgba(255, 255, 255, 0.6)'};
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  backdrop-filter: blur(15px);
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: ${props => props.active ? '700' : '500'};
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  opacity: ${props => props.locked ? '0.4' : '1'};
  position: relative;
  box-shadow: ${props => props.active 
    ? '0 8px 25px rgba(255, 176, 0, 0.3)' 
    : '0 4px 15px rgba(0, 0, 0, 0.2)'};
  min-height: 44px;
  touch-action: manipulation;

  @media (min-width: 768px) {
    padding: 1rem 2rem;
    border-radius: 25px;
    font-size: 1rem;
  }

  &:hover, &:active {
    background: ${props => !props.locked && 'linear-gradient(135deg, rgba(255, 176, 0, 0.2), rgba(255, 176, 0, 0.05))'};
    transform: ${props => !props.locked ? 'translateY(-2px) scale(1.02)' : 'none'};
    box-shadow: ${props => !props.locked && '0 12px 30px rgba(255, 176, 0, 0.2)'};
  }

  ${props => props.locked && `
    &::after {
      content: '🔒';
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 1rem;
      opacity: 0.8;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
  `}
`;

const RoadmapCard = styled.div`
  background: linear-gradient(135deg, rgba(30,30,40,0.95) 0%, rgba(76,28,140,0.15) 100%);
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 
    0 0 32px 0 rgba(255,176,0,0.25), 
    0 0 24px 0 rgba(255,176,0,0.15),
    0 20px 40px rgba(0,0,0,0.4);
  border: 2px solid #FFB000;
  backdrop-filter: blur(25px);
  position: relative;
  overflow: hidden;
  
  @media (min-width: 768px) {
    border-radius: 24px;
    padding: 2.5rem;
    margin-bottom: 1.5rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #FFB000, transparent);
  }
`;

const SeasonHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(255, 176, 0, 0.3);
  position: relative;
  
  @media (min-width: 768px) {
    margin-bottom: 3rem;
    padding-bottom: 2rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #FFB000, transparent);
    
    @media (min-width: 768px) {
      width: 150px;
    }
  }
`;

const SeasonTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #FFFFFF;
  margin: 0;
`;

const SeasonSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0.5rem 0 0 0;
  font-style: italic;
  font-family: 'Space Grotesk', sans-serif;
`;

const SeasonDates = styled.p`
  color: #FFB000;
  font-weight: 600;
  margin: 0.5rem 0 0 0;
  font-family: 'Space Grotesk', sans-serif;
`;

const CountdownSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(255, 176, 0, 0.1), rgba(76, 28, 140, 0.1));
  border-radius: 16px;
  border: 2px solid rgba(255, 176, 0, 0.3);
  margin: 1.5rem 0;
  box-shadow: 0 8px 25px rgba(255, 176, 0, 0.15);
  
  @media (min-width: 768px) {
    margin: 2rem 0;
  }
`;

const CountdownLabel = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  text-align: center;
`;

const CountdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DropGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
`;

const DropCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #FFB000;
  border: 1px solid rgba(255, 176, 0, 0.3);
  backdrop-filter: blur(15px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 2rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 176, 0, 0.05), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover, &:active {
    transform: translateY(-3px);
    box-shadow: 0 12px 30px rgba(255, 176, 0, 0.2);
    
    &::before {
      opacity: 1;
    }
  }
`;

const DropTitle = styled.h4`
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 0.5rem 0;
  font-family: 'Outfit', sans-serif;
`;

const DropList = styled.ul`
  margin: 0;
  padding-left: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  font-family: 'Space Grotesk', sans-serif;
`;

const DropItem = styled.li`
  margin-bottom: 0.3rem;
  line-height: 1.4;
`;

const QuestGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
`;

const QuestCard = styled.div`
  background: linear-gradient(135deg, #FFB000, #FF9F1C);
  border-radius: 12px;
  padding: 1.5rem;
  color: #000000;
  border: 2px solid #FFB000;
  box-shadow: 0 8px 25px rgba(255, 176, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  @media (min-width: 768px) {
    border-radius: 16px;
    padding: 2rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover, &:active {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 15px 35px rgba(255, 176, 0, 0.4);
    
    &::before {
      opacity: 1;
    }
  }
`;

const QuestTitle = styled.h4`
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  font-family: 'Outfit', sans-serif;
  color: #000000;
`;

const QuestReward = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
  font-family: 'Space Grotesk', sans-serif;
  color: #000000;
`;

const SeasonRoadmapScreen = () => {
  const navigate = useNavigate();
  const [activeSeason, setActiveSeason] = useState('spring');

  const seasons = {
    spring: {
      title: "Spring 2025",
      subtitle: "Digital Genesis",
      dates: "March - May 2025",
      emoji: "🌸",
      locked: false,
      physicalDrops: [
        {
          title: "Genesis Collection (Week 1-2)",
          items: [
            "Signature Hoodie (Rare) - 150 pieces",
            "Basic Tee (Common) - 200 pieces",
            "Cap (Common) - 100 pieces"
          ]
        },
        {
          title: "Accessories Drop (Week 6)",
          items: [
            "Phone Case (Rare) - 75 pieces",
            "Sticker Pack (Common) - 500 sets",
            "Tote Bag (Rare) - 100 pieces"
          ]
        },
        {
          title: "Limited Collab (Week 10)",
          items: [
            "Artist Collaboration Piece (Epic) - 50 pieces",
            "Digital Art NFT (Legendary) - 25 pieces"
          ]
        }
      ],
      digitalDrops: [
        "Welcome Passport Badge for app downloads",
        "First digital wallpaper collection - 3 exclusive designs",
        "Spring completion stamp for collecting 3+ items",
        "Early Summer preview content"
      ],
      communityEvents: [
        "Virtual styling session on Instagram Stories",
        "Community photo contest with prizes"
      ],
      quests: [
        { title: "Digital Collector", description: "Scan 5 QR codes", reward: "75 WNGS" },
        { title: "Social Amplifier", description: "Share 3 posts with brand hashtag", reward: "50 WNGS" },
        { title: "Early Adopter", description: "Be in first 100 app downloads", reward: "100 WNGS" },
        { title: "Genesis Supporter", description: "Purchase any item from launch collection", reward: "150 WNGS" }
      ]
    },
    summer: {
      title: "Summer 2025",
      subtitle: "Going Viral",
      dates: "June - August 2025", 
      emoji: "☀️",
      locked: true,
      physicalDrops: [],
      digitalDrops: [],
      communityEvents: [],
      quests: []
    },
    fall: {
      title: "Fall 2025",
      subtitle: "Metropolitan Metamorphosis",
      dates: "September - November 2025",
      emoji: "🍂",
      locked: true,
      physicalDrops: [],
      digitalDrops: [],
      communityEvents: [],
      quests: []
    },
    winter: {
      title: "Winter 2025",
      subtitle: "Crystalline Elegance", 
      dates: "December 2025 - February 2026",
      emoji: "❄️",
      locked: true,
      physicalDrops: [],
      digitalDrops: [],
      communityEvents: [],
      quests: []
    }
  };

  const currentSeason = seasons[activeSeason];

  const handleSeasonClick = (seasonKey) => {
    if (!seasons[seasonKey].locked) {
      setActiveSeason(seasonKey);
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        ← Back
      </BackButton>

      <RoadmapContainer>
        <ScreenTitle>Season Roadmap</ScreenTitle>

        <SeasonSelector>
          {Object.entries(seasons).map(([key, season]) => (
            <SeasonTab
              key={key}
              active={activeSeason === key}
              locked={season.locked}
              onClick={() => handleSeasonClick(key)}
            >
              {season.emoji} {season.title.split(' ')[0]}
            </SeasonTab>
          ))}
        </SeasonSelector>

        <RoadmapCard>
          <SeasonHeader>
            <SeasonTitle>{currentSeason.emoji} {currentSeason.title}</SeasonTitle>
            <SeasonSubtitle>"{currentSeason.subtitle}"</SeasonSubtitle>
            <SeasonDates>{currentSeason.dates}</SeasonDates>
          </SeasonHeader>

          <CountdownSection>
            <CountdownContainer>
              <CountdownLabel>Season ends in:</CountdownLabel>
              <LiveCountdown 
                targetDate={new Date('2025-09-07T12:00:00')} 
                size="1.5rem"
                showSeconds={true}
              />
            </CountdownContainer>
          </CountdownSection>

          {!currentSeason.locked ? (
            <>
              <Section>
                <SectionTitle>🛍️ Physical Drops</SectionTitle>
                <DropGrid>
                  {currentSeason.physicalDrops.map((drop, index) => (
                    <DropCard key={index}>
                      <DropTitle>{drop.title}</DropTitle>
                      <DropList>
                        {drop.items.map((item, itemIndex) => (
                          <DropItem key={itemIndex}>{item}</DropItem>
                        ))}
                      </DropList>
                    </DropCard>
                  ))}
                </DropGrid>
              </Section>

              <Section>
                <SectionTitle>💻 Digital Experiences</SectionTitle>
                <DropList>
                  {currentSeason.digitalDrops.map((drop, index) => (
                    <DropItem key={index}>{drop}</DropItem>
                  ))}
                </DropList>
              </Section>

              <Section>
                <SectionTitle>🎉 Community Events</SectionTitle>
                <DropList>
                  {currentSeason.communityEvents.map((event, index) => (
                    <DropItem key={index}>{event}</DropItem>
                  ))}
                </DropList>
              </Section>

              <Section>
                <SectionTitle>🎯 Quest Objectives</SectionTitle>
                <QuestGrid>
                  {currentSeason.quests.map((quest, index) => (
                    <QuestCard key={index}>
                      <QuestTitle>{quest.title}</QuestTitle>
                      <div style={{ color: '#000000' }}>{quest.description}</div>
                      <QuestReward>Reward: {quest.reward}</QuestReward>
                    </QuestCard>
                  ))}
                </QuestGrid>
              </Section>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'Space Grotesk, sans-serif',
              background: 'linear-gradient(135deg, rgba(255, 176, 0, 0.05), rgba(76, 28, 140, 0.05))',
              borderRadius: '20px',
              border: '1px solid rgba(255, 176, 0, 0.2)',
              margin: '2rem 0'
            }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
              }}>🔒</div>
              <h3 style={{ 
                marginBottom: '1rem', 
                color: '#FFFFFF',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>Season Locked</h3>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                This season will be unlocked when Spring 2025 ends.
              </p>
              <div style={{ 
                background: 'rgba(255, 176, 0, 0.1)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 176, 0, 0.3)',
                marginTop: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                  Unlocks in:
                </div>
                <LiveCountdown 
                  targetDate={new Date('2025-09-07T12:00:00')} 
                  size="1rem"
                  showSeconds={false}
                />
              </div>
              <div style={{ 
                background: 'rgba(255, 176, 0, 0.1)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 176, 0, 0.3)',
                marginTop: '1.5rem'
              }}>
                <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: 0 }}>
                  🎯 Complete Spring 2025 objectives to unlock early access!
                </p>
              </div>
            </div>
          )}
        </RoadmapCard>
        
        {/* End of content indicator */}
        <div style={{
          textAlign: 'center',
          padding: '2rem 0',
          marginTop: '1rem'
        }}>
          <div style={{
            width: '60px',
            height: '4px',
            background: 'linear-gradient(90deg, transparent, rgba(255, 176, 0, 0.5), transparent)',
            borderRadius: '2px',
            margin: '0 auto 1rem auto'
          }}></div>
          <div style={{
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.5)',
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
            End of Roadmap
          </div>
        </div>
      </RoadmapContainer>
    </Container>
  );
};

export default SeasonRoadmapScreen; 