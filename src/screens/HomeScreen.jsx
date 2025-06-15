import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import DailiesModal from '../components/DailiesModal';

const gold = '#FFD700';
const purple = '#7F3FBF';
const background = '#121212';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors?.background || background};
  padding: 0 0 80px 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Header = styled.div`
  padding: 2.2rem 1.2rem 1.2rem 1.2rem;
  text-align: left;
`;

const Welcome = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
  margin: 0 0 0.3rem 0;
`;

const Subtext = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.05rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#FFD700'};
  font-weight: 500;
`;

const CardRow = styled.div`
  padding: 0 1.2rem;
  margin-bottom: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  @media (max-width: 700px) {
    gap: 1rem;
  }
`;

const CardRowInner = styled.div`
  display: flex;
  gap: 1.2rem;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const GlassCard = styled.button`
  flex: 1;
  background: linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(127,63,191,0.10) 100%);
  border: 2.5px solid ${gold};
  border-radius: 20px;
  box-shadow: 0 2px 16px 0 rgba(255,215,0,0.05), 0 0 16px 0 rgba(127,63,191,0.05);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  padding: 18px 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  cursor: pointer;
  transition: transform 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s;
  outline: none;
  position: relative;
  min-width: 0;
  min-height: 140px;
  &:hover, &:focus {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 16px 0 rgba(255,215,0,0.09), 0 0 24px 0 rgba(127,63,191,0.09);
  }
`;

const CardTitle = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
  margin-bottom: 0.5rem;
`;

const CardSub = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#FFD700'};
  font-weight: 500;
`;

const CardIcon = styled.div`
  font-size: 2.1rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
`;

const FullCard = styled(GlassCard)`
  width: 100%;
  min-height: 100px;
  align-items: flex-start;
  flex-direction: column;
  justify-content: flex-start;
  @media (max-width: 700px) {
    flex-direction: column;
    align-items: flex-start;
    min-height: 0;
  }
`;

const BottomRow = styled.div`
  display: flex;
  gap: 1.2rem;
  padding: 0 1.2rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  @media (max-width: 700px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HalfCard = styled(GlassCard).attrs({ as: 'div' })`
  min-height: 100px;
  padding: 18px 18px;
  flex: 1;
  cursor: default;
  &:hover, &:focus {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 16px 0 rgba(255,215,0,0.09), 0 0 24px 0 rgba(127,63,191,0.09);
  }
`;

const HalfCardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
`;

const ProgressText = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
`;

const ProgressSub = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.98rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#FFD700'};
`;

const CountdownNumber = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 2.1rem;
  font-weight: 700;
  color: ${gold};
  margin: 0.1rem 0 0.2rem 0;
`;

const CountdownIcon = styled.span`
  margin-right: 0.5rem;
`;

const QuestsSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const QuestItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const QuestItemInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const QuestItemIcon = styled.div`
  font-size: 1.5rem;
`;

const QuestItemTitle = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
`;

const ProgressTextRight = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#FFD700'};
  margin-left: auto;
`;

const ProgressBar = styled.div`
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  width: 100%;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${gold};
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
  width: ${({ value }) => value}%;
`;

function HomeScreen() {
  const [showDailiesModal, setShowDailiesModal] = useState(false);
  const navigate = useNavigate();

  // Example quest progress data
  const questProgress = [
    {
      icon: '📸',
      title: 'Scan 10 Papillon Items',
      progress: 4,
      total: 10,
      percent: 40,
    },
    {
      icon: '🏪',
      title: 'Visit 3 Store Locations',
      progress: 1,
      total: 3,
      percent: 33,
    },
    {
      icon: '👥',
      title: 'Share on Social Media',
      progress: 2,
      total: 5,
      percent: 40,
    },
  ];

  return (
    <Container>
      <Header>
        <Welcome>Welcome back, Alex</Welcome>
        <Subtext>You've earned 0 $WNGS this week</Subtext>
      </Header>

      <CardRow>
        <CardRowInner>
          <GlassCard onClick={() => setShowDailiesModal(true)} aria-label="Go to Dailies">
            <CardIcon>🦋</CardIcon>
            <CardTitle>Dailies</CardTitle>
            <CardSub>Complete daily quests</CardSub>
          </GlassCard>
          <GlassCard onClick={() => window.open('https://papillonbrand.us', '_blank')} aria-label="Go to Newest Collection">
            <CardIcon>👕</CardIcon>
            <CardTitle>Newest Collection</CardTitle>
            <CardSub>See your latest items</CardSub>
          </GlassCard>
        </CardRowInner>
      </CardRow>

      <CardRow>
        <FullCard onClick={() => navigate('/quests')} aria-label="Go to Active Quests">
          <HalfCardContent style={{ flex: 1, width: '100%' }}>
            <ProgressText>Active Quests</ProgressText>
            <ProgressSub>2 Active • Complete to earn rewards</ProgressSub>
            <QuestsSection>
              {questProgress.map((q, i) => (
                <QuestItem key={i}>
                  <QuestItemInfo>
                    <QuestItemIcon>{q.icon}</QuestItemIcon>
                    <QuestItemTitle>{q.title}</QuestItemTitle>
                  </QuestItemInfo>
                  <ProgressTextRight>
                    {q.progress}/{q.total}
                  </ProgressTextRight>
                  <ProgressBar>
                    <ProgressFill value={q.percent} />
                  </ProgressBar>
                </QuestItem>
              ))}
            </QuestsSection>
          </HalfCardContent>
        </FullCard>
      </CardRow>

      <CardRow>
        <CardRowInner>
          <HalfCard>
            <HalfCardContent>
              <ProgressText>Stamp Progress</ProgressText>
              <ProgressSub>2/10 Stamps for Spring '25</ProgressSub>
            </HalfCardContent>
          </HalfCard>
          <HalfCard>
            <HalfCardContent>
              <ProgressText>Season Countdown</ProgressText>
              <ProgressSub>Spring '25 ends in:</ProgressSub>
              <CountdownNumber><CountdownIcon>🌸</CountdownIcon>23 Days</CountdownNumber>
              <CardSub>Until Summer '25</CardSub>
            </HalfCardContent>
          </HalfCard>
        </CardRowInner>
      </CardRow>

      <DailiesModal 
        open={showDailiesModal} 
        onClose={() => setShowDailiesModal(false)} 
      />
    </Container>
  );
}

export default HomeScreen; 