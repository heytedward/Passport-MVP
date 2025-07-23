import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background: #000000;
  padding: 1rem;
`;

const BackButton = styled.button`
  background: rgba(255, 176, 0, 0.1);
  border: 1px solid #FFB000;
  color: #FFB000;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
  font-family: 'Space Grotesk', sans-serif;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 176, 0, 0.2);
    transform: translateY(-1px);
  }
`;

const RoadmapContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const ScreenTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #FFFFFF;
  text-align: center;
  margin-bottom: 2rem;
`;

const SeasonSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  justify-content: center;
`;

const SeasonTab = styled.button`
  background: ${props => props.active 
    ? 'rgba(255, 176, 0, 0.2)' 
    : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active 
    ? '#FFB000' 
    : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.active 
    ? '#FFFFFF' 
    : 'rgba(255, 255, 255, 0.5)'};
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: ${props => props.locked ? 'not-allowed' : 'pointer'};
  backdrop-filter: blur(10px);
  white-space: nowrap;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? '600' : '400'};
  font-family: 'Space Grotesk', sans-serif;
  opacity: ${props => props.locked ? '0.4' : '1'};
  position: relative;

  &:hover {
    background: ${props => !props.locked && 'rgba(255, 176, 0, 0.15)'};
    transform: ${props => !props.locked ? 'translateY(-1px)' : 'none'};
  }

  ${props => props.locked && `
    &::after {
      content: '🔒';
      position: absolute;
      top: -5px;
      right: -5px;
      font-size: 0.8rem;
      opacity: 0.7;
    }
  `}
`;

const RoadmapCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border: 1px solid #FFB000;
  backdrop-filter: blur(20px);
`;

const SeasonHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #FFB000;
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

const Section = styled.div`
  margin-bottom: 2rem;
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const DropCard = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #FFB000;
  border: 1px solid rgba(255, 176, 0, 0.3);
  backdrop-filter: blur(10px);
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const QuestCard = styled.div`
  background: linear-gradient(135deg, #FFB000, #FF9F1C);
  border-radius: 12px;
  padding: 1.5rem;
  color: #000000;
  border: 1px solid #FFB000;
  box-shadow: 0 4px 12px rgba(255, 176, 0, 0.3);
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
              padding: '3rem 1rem',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <h3 style={{ marginBottom: '1rem', color: '#FFFFFF' }}>Season Locked</h3>
              <p>This season will be unlocked when Spring 2025 ends.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem', opacity: 0.7 }}>
                Stay tuned for updates!
              </p>
            </div>
          )}
        </RoadmapCard>
      </RoadmapContainer>
    </Container>
  );
};

export default SeasonRoadmapScreen; 