import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const gold = '#FFD700';
const background = '#121212';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors?.background || background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 1.2rem 1.2rem 0.8rem 1.2rem;
  background: transparent;
  min-height: 56px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
  font-size: 1.6rem;
  cursor: pointer;
  margin-right: 0.6rem;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.18s;
  &:hover, &:focus {
    color: ${gold};
    outline: none;
  }
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
  margin: 0;
`;

const QuestsSection = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 2rem auto 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const QuestItem = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(127,63,191,0.08) 100%);
  border: 2px solid ${gold};
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(255,215,0,0.04), 0 0 16px 0 rgba(127,63,191,0.04);
  padding: 1.2rem 1.1rem 1.1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
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
  font-size: 1.08rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
`;

const ProgressTextRight = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.98rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#FFD700'};
  margin-left: auto;
`;

const ProgressBar = styled.div`
  height: 7px;
  background: rgba(255, 255, 255, 0.13);
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${gold};
  border-radius: 4px;
  transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
  width: ${({ value }) => value}%;
`;

const QuestsScreen = () => {
  const navigate = useNavigate();
  // Example quest progress data (copied from HomeScreen)
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
        <BackButton aria-label="Back" onClick={() => navigate(-1)}>
          &#8592;
        </BackButton>
        <Title>Quests</Title>
      </Header>
      <QuestsSection>
        {questProgress.map((q, i) => (
          <QuestItem key={i}>
            <QuestItemInfo>
              <QuestItemIcon>{q.icon}</QuestItemIcon>
              <QuestItemTitle>{q.title}</QuestItemTitle>
              <ProgressTextRight>
                {q.progress}/{q.total}
              </ProgressTextRight>
            </QuestItemInfo>
            <ProgressBar>
              <ProgressFill value={q.percent} />
            </ProgressBar>
          </QuestItem>
        ))}
      </QuestsSection>
    </Container>
  );
};

export default QuestsScreen; 