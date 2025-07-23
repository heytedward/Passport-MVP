import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  height: 100vh;
  overflow: hidden;
  background: ${({ theme }) => theme.colors?.background || '#000000'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 1rem 100px 1rem; /* Added 100px bottom padding */
  position: relative;
`;

const ScreenTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#fff'};
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const BackButton = styled.button`
  position: absolute;
  top: 2rem;
  left: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 176, 0, 0.3);
  border-radius: 12px;
  color: #FFB000;
  font-size: 1.2rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10;
  
  &:hover {
    background: rgba(255, 176, 0, 0.1);
    border-color: #FFB000;
    transform: translateY(-2px);
  }
`;

const QuestJournal = styled.div`
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

const JournalHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 2px dashed rgba(255,176,0,0.3);
  position: relative;
`;

const JournalTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  color: #FFB000;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(255,176,0,0.3);
  
  @media (max-width: 767px) {
    font-size: 1.7rem;
    letter-spacing: 1px;
  }
`;

const JournalSubtitle = styled.div`
  color: rgba(255,176,0,0.7);
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  font-style: italic;
`;

const QuestStats = styled.div`
  background: rgba(255,176,0,0.1);
  border: 1px solid rgba(255,176,0,0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  text-align: center;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatNumber = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #FFB000;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: rgba(255,176,0,0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const QuestPages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  padding-right: 1rem;
  margin-right: -1rem;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,176,0,0.4);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255,176,0,0.6);
  }
`;

const QuestPage = styled.div`
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,176,0,0.02) 100%);
  border: 2px solid rgba(255,176,0,0.2);
  border-radius: 15px;
  padding: 1rem; /* Adjusted from 1.5rem */
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  
  /* Paper texture effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 25% 25%, rgba(255,176,0,0.02) 1px, transparent 1px),
      radial-gradient(circle at 75% 75%, rgba(255,176,0,0.02) 1px, transparent 1px);
    background-size: 20px 20px;
    border-radius: 15px;
    pointer-events: none;
  }
  
  /* Margin line */
  &::after {
    content: '';
    position: absolute;
    left: 30px; /* Adjusted from 40px */
    top: 0;
    bottom: 0;
    width: 1px;
    background: rgba(255,176,0,0.1);
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.01);
    border-color: rgba(255,176,0,0.4);
    box-shadow: 
      0 0 15px 0 rgba(255,176,0,0.2),
      0 0 30px 0 rgba(255,176,0,0.1);
  }
  
  ${({ completed }) => completed && css`
    border-color: rgba(16, 185, 129, 0.4);
    background: linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(255,176,0,0.02) 100%);
    
    &::after {
      background: rgba(16,185,129,0.2);
    }
  `}
`;

const QuestHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem; /* Adjusted from 1rem */
  margin-bottom: 0.75rem; /* Adjusted from 1rem */
  margin-left: 45px; /* Adjusted from 60px */
`;

const QuestIcon = styled.div`
  font-size: 1.5rem; /* Adjusted from 2rem */
  min-width: 40px; /* Adjusted from 48px */
  height: 40px; /* Adjusted from 48px */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,176,0,0.1);
  border: 2px solid rgba(255,176,0,0.3);
  border-radius: 12px;
  margin-top: 4px;
`;

const QuestContent = styled.div`
  flex: 1;
`;

const QuestTitle = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem; /* Adjusted from 1.2rem */
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`;

const QuestDescription = styled.p`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.9rem; /* Adjusted from 0.95rem */
  color: rgba(255,255,255,0.7);
  margin: 0 0 0.75rem 0; /* Adjusted from 1rem */
  line-height: 1.5;
`;

const QuestMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 45px; /* Adjusted from 60px */
`;

const QuestProgress = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const ProgressText = styled.span`
  color: rgba(255,255,255,0.8);
  font-weight: 500;
`;

const ProgressNumbers = styled.span`
  color: #FFB000;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #FFB000 0%, #FFD700 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
  width: ${({ value }) => value}%;
  box-shadow: 0 0 8px rgba(255,176,0,0.4);
  
  ${({ completed }) => completed && css`
    background: linear-gradient(90deg, #10B981 0%, #34D399 100%);
    box-shadow: 0 0 8px rgba(16,185,129,0.4);
  `}
`;

const QuestReward = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255,176,0,0.1);
  border: 1px solid rgba(255,176,0,0.3);
  border-radius: 8px;
  padding: 0.5rem; /* Adjusted from 0.75rem */
  min-width: 70px; /* Adjusted from 80px */
`;

const RewardAmount = styled.div`
  font-size: 1rem; /* Adjusted from 1.1rem */
  font-weight: 700;
  color: #FFB000;
  font-family: 'Outfit', sans-serif;
`;

const RewardLabel = styled.div`
  font-size: 0.7rem;
  color: rgba(255,176,0,0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255,255,255,0.6);
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .message {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  
  .submessage {
    font-size: 1rem;
    color: rgba(255,255,255,0.4);
  }
`;

const QuestsScreen = () => {
  const navigate = useNavigate();
  const [selectedQuest, setSelectedQuest] = useState(null);
  
  // Enhanced quest data with descriptions and rewards
  const questProgress = [
    {
      id: 1,
      icon: '📱',
      title: 'Digital Collector',
      description: 'Scan QR codes on Papillon items to build your digital collection and unlock exclusive rewards.',
      progress: 7,
      total: 10,
      reward: 100,
      percent: 70,
      category: 'Collection',
      completed: false
    },
    {
      id: 2,
      icon: '🏪',
      title: 'Store Explorer',
      description: 'Visit different Papillon store locations and experience the brand in person across multiple cities.',
      progress: 1,
      total: 3,
      reward: 75,
      percent: 33,
      category: 'Exploration',
      completed: false
    },
    {
      id: 3,
      icon: '👥',
      title: 'Social Butterfly',
      description: 'Share your Monarch Passport journey on social media to inspire others and grow the community.',
      progress: 5,
      total: 5,
      reward: 50,
      percent: 100,
      category: 'Social',
      completed: true
    },
    {
      id: 4,
      icon: '🎯',
      title: 'Daily Dedication',
      description: 'Complete daily challenges consistently to prove your dedication to the Monarch lifestyle.',
      progress: 12,
      total: 15,
      reward: 125,
      percent: 80,
      category: 'Daily',
      completed: false
    }
  ];

  const totalQuests = questProgress.length;
  const completedQuests = questProgress.filter(q => q.completed).length;
  const activeQuests = totalQuests - completedQuests;
  const totalRewards = questProgress.filter(q => q.completed).reduce((sum, q) => sum + q.reward, 0);

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        ← Back
      </BackButton>
      
      <QuestJournal>
        <JournalHeader>
          <JournalTitle>Spring '25 Quests</JournalTitle>
          <JournalSubtitle>Your journey to becoming a Monarch</JournalSubtitle>
          
          <QuestStats>
            <StatItem>
              <StatNumber>{activeQuests}</StatNumber>
              <StatLabel>Active</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{completedQuests}</StatNumber>
              <StatLabel>Completed</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{totalRewards}</StatNumber>
              <StatLabel>WINGS Earned</StatLabel>
            </StatItem>
          </QuestStats>
        </JournalHeader>

        <QuestPages>
          {questProgress.length > 0 ? (
            questProgress.map((quest) => (
              <QuestPage 
                key={quest.id} 
                completed={quest.completed}
                onClick={() => setSelectedQuest(quest)}
              >
                <QuestHeader>
                  <QuestIcon>{quest.icon}</QuestIcon>
                  <QuestContent>
                    <QuestTitle>{quest.title}</QuestTitle>
                    <QuestDescription>{quest.description}</QuestDescription>
                  </QuestContent>
                </QuestHeader>
                
                <QuestMeta>
                  <QuestProgress>
                    <ProgressLabel>
                      <ProgressText>Progress</ProgressText>
                      <ProgressNumbers>{quest.progress}/{quest.total}</ProgressNumbers>
                    </ProgressLabel>
                    <ProgressBar>
                      <ProgressFill value={quest.percent} completed={quest.completed} />
                    </ProgressBar>
                  </QuestProgress>
                  
                  <QuestReward>
                    <RewardAmount>{quest.reward}</RewardAmount>
                    <RewardLabel>WINGS</RewardLabel>
                  </QuestReward>
                </QuestMeta>
              </QuestPage>
            ))
          ) : (
            <EmptyState>
              <div className="icon">📖</div>
              <div className="message">No quests available</div>
              <div className="submessage">Check back later for new adventures</div>
            </EmptyState>
          )}
        </QuestPages>
      </QuestJournal>
    </Container>
  );
};

export default QuestsScreen; 