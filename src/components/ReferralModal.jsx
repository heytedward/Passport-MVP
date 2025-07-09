import React from 'react';
import styled from 'styled-components';
import GlassCard from './GlassCard';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 18, 18, 0.8);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  
  /* Ensure the overlay is clickable */
  pointer-events: auto;
`;

const ModalCard = styled(GlassCard)`
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  pointer-events: auto;
`;

const ModalHeader = styled.div`
  padding: 32px 32px 24px 32px;
  border-bottom: 3px solid ${({ theme }) => theme.colors.accent.gold};
`;

const ModalTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 24px 0;
  font-size: ${({ theme }) => theme.typography.fontSize.h2};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px 32px 32px;
`;

const ReferralList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const ReferralItem = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: ${({ theme }) => theme.effects.neonGlow};
  }
`;

const ReferralIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: ${({ theme }) => theme.colors.accent.purple};
`;

const ReferralContent = styled.div`
  flex: 1;
`;

const ReferralTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
  margin-bottom: 8px;
`;

const ReferralDescription = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const ReferralMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const ReferralStatus = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ $completed, theme }) => 
    $completed ? theme.colors.accent.green : theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const ReferralDate = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
`;

const ReferralReward = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.accent.gold};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 32px;
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
`;

const ShareButton = styled.button`
  width: 100%;
  padding: 16px 24px;
  border-radius: 20px;
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  background: ${({ theme }) => theme.colors.accent.gold};
  color: ${({ theme }) => theme.colors.background};
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};
  margin-top: 32px;

  &:hover {
    transform: translateY(-3px) scale(1.02);
    background: transparent;
    color: ${({ theme }) => theme.colors.accent.gold};
    box-shadow: ${({ theme }) => theme.effects.neonGlow};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: transparent;
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  cursor: pointer;
  width: 48px;
  height: 48px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};
  z-index: 10;

  &:hover {
    transform: translateY(-3px) scale(1.02);
    background: ${({ theme }) => theme.colors.accent.gold};
    color: ${({ theme }) => theme.colors.background};
    box-shadow: ${({ theme }) => theme.effects.neonGlow};
  }
  
  &:focus {
    outline: none;
    transform: translateY(-3px) scale(1.02);
    background: ${({ theme }) => theme.colors.accent.gold};
    color: ${({ theme }) => theme.colors.background};
  }
`;

function ReferralModal({ open, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  const referralData = [
    {
      id: 1,
      title: 'Referral Shared',
      description: 'Shared referral code via social media',
      status: 'Completed',
      reward: '+50 WINGS',
      date: 'Mar 18, 2025'
    },
    {
      id: 2,
      title: 'Friend Joined',
      description: 'New user joined via your referral link',
      status: 'Completed', 
      reward: '+25 WINGS',
      date: 'Mar 17, 2025'
    },
    {
      id: 3,
      title: 'Share Referral',
      description: 'Invite more friends to earn bonus rewards',
      status: 'Available',
      reward: '+50 WINGS',
      date: ''
    }
  ];

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <CloseButton onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>×</CloseButton>
        
        <ModalHeader>
          <ModalTitle>Referral Tracker</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <ReferralList>
            {referralData.map(item => (
              <ReferralItem 
                key={item.id}
                onClick={item.status === 'Available' ? () => window.open('https://www.instagram.com/', '_blank') : undefined}
                style={{ cursor: item.status === 'Available' ? 'pointer' : 'default' }}
              >
                <ReferralIcon>👥</ReferralIcon>
                <ReferralContent>
                  <ReferralTitle>{item.title}</ReferralTitle>
                  <ReferralDescription>{item.description}</ReferralDescription>
                </ReferralContent>
                <ReferralMeta>
                  <ReferralStatus $completed={item.status === 'Completed'}>
                    {item.status}
                  </ReferralStatus>
                  {item.date && <ReferralDate>{item.date}</ReferralDate>}
                  {item.status === 'Completed' && (
                    <ReferralReward>{item.reward}</ReferralReward>
                  )}
                </ReferralMeta>
              </ReferralItem>
            ))}
          </ReferralList>
        </ModalBody>
      </ModalCard>
    </ModalOverlay>
  );
}

export default ReferralModal; 