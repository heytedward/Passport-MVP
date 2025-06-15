import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import GlassCard from '../components/GlassCard';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 8px 100px 8px;
  @media (min-width: 900px) {
    padding: 48px 0 120px 0;
  }
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto 32px auto;
`;

const gold = '#FFD700';

const ProfileHeader = styled(GlassCard)`
  flex: 1;
  width: 50%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0 24px 0;
  border: 2.5px solid ${gold};
  box-shadow: 0 0 8px 0 rgba(255,215,0,0.10);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover, &:focus {
    box-shadow: 0 0 16px 0 rgba(255,215,0,0.25);
    transform: translateY(-2px) scale(1.02);
    outline: none;
  }
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  color: #fff;
  box-shadow: 0 0 16px 0 #7F3FBF88;
  margin-bottom: 16px;
  border: 2.5px solid ${({ theme }) => theme.colors.accent};
`;

const ProfileName = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const ProfileEmail = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  margin-bottom: 8px;
`;

const BalanceCard = styled(GlassCard)`
  flex: 1;
  width: 50%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2.5px solid ${gold};
  box-shadow: 0 0 8px 0 rgba(255,215,0,0.10);
  padding: 32px 0 24px 0;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover, &:focus {
    box-shadow: 0 0 16px 0 rgba(255,215,0,0.25);
    transform: translateY(-2px) scale(1.02);
    outline: none;
  }
`;

const BalanceLabel = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.accent};
  font-size: 1.3rem;
  margin-bottom: 8px;
`;

const BalanceValue = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 2.5rem;
  font-weight: bold;
  letter-spacing: 2px;
`;

const SectionCard = styled(GlassCard)`
  width: 100%;
  max-width: 900px;
  margin: 0 auto 32px auto;
  padding: 32px 32px 24px 32px;
  border: 2.5px solid ${gold};
  box-shadow: 0 0 8px 0 rgba(255,215,0,0.10);
  transition: box-shadow 0.2s, transform 0.2s;
  @media (max-width: 600px) {
    padding: 20px 8px 16px 8px;
  }
  &:hover, &:focus {
    box-shadow: 0 0 16px 0 rgba(255,215,0,0.25);
    transform: translateY(-2px) scale(1.02);
    outline: none;
  }
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  margin-bottom: 24px;
  text-align: left;
  letter-spacing: 1px;
`;

const TransactionList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Transaction = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.glass};
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
`;

const TransactionType = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  font-size: 1.1rem;
`;

const TransactionAmount = styled.div`
  color: ${({ positive, theme }) => (positive ? theme.colors.secondary : theme.colors.accent)};
  font-weight: bold;
  font-size: 1.1rem;
`;

const TransactionStatus = styled.div`
  color: #2ecc40;
  font-size: 1.05rem;
  font-weight: 600;
`;

const TransactionDate = styled.div`
  color: #9ca3af;
  font-size: 1rem;
`;

const ProgressSection = styled(SectionCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;
`;

const ProgressBarContainer = styled.div`
  background: #232323;
  border-radius: 12px;
  height: 18px;
  margin-bottom: 18px;
  overflow: hidden;
  width: 100%;
  max-width: 700px;
`;

const ProgressBar = styled.div`
  height: 100%;
  border-radius: 12px;
  background: ${({ color }) => color};
  width: ${({ value }) => value}%;
  transition: width 0.5s;
`;

const AchievementsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 24px;
`;

const AchievementIcon = styled.div`
  width: 64px;
  height: 64px;
  background: ${({ theme }) => theme.gradients.primary};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 2.2rem;
  box-shadow: 0 0 16px 0 #7F3FBF55;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(18, 18, 18, 0.75);
  backdrop-filter: blur(16px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalCard = styled.div`
  background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(127,63,191,0.13) 100%);
  border: 2.5px solid ${gold};
  border-radius: 22px;
  box-shadow: 0 8px 40px 0 rgba(255,215,0,0.10), 0 0 32px 0 rgba(127,63,191,0.10);
  padding: 2.2rem 1.5rem 1.5rem 1.5rem;
  min-width: 320px;
  max-width: 95vw;
  width: 100%;
  max-width: 400px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 500px) {
    min-width: 0;
    padding: 1.2rem 0.7rem 1.2rem 0.7rem;
  }
`;

const ModalTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.7rem;
  text-align: center;
`;

const ModalButton = styled.button`
  width: 100%;
  max-width: 320px;
  margin-bottom: 1rem;
  padding: 0.85rem 0;
  border-radius: 12px;
  border: 2px solid ${gold};
  background: transparent;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  font-size: 1.08rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover, &:focus {
    background: ${gold};
    color: #121212;
    outline: none;
  }
`;

const ModalClose = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  &:hover {
    background: rgba(255,255,255,0.08);
  }
`;

const QRContainer = styled.div`
  width: 120px;
  height: 120px;
  background: #fff;
  border-radius: 16px;
  margin: 0 auto 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #121212;
  box-shadow: 0 2px 12px 0 rgba(255,215,0,0.10);
`;

function ReferralModal({ open, onClose }) {
  const [showQR, setShowQR] = useState(true);
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  return open ? (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalCard>
        <ModalClose aria-label="Close" onClick={onClose}>×</ModalClose>
        <ModalTitle>Share Referral</ModalTitle>
        {showQR && (
          <div style={{ width: '100%', textAlign: 'center', marginTop: '0.2rem' }}>
            <QRContainer>
              {/* Mock QR code placeholder */}
              <span role="img" aria-label="QR">#️⃣</span>
            </QRContainer>
            <div style={{ color: '#FFD700', fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.05rem', marginBottom: 8 }}>
              Join me on Monarch Passport!
            </div>
            <ModalButton
              style={{ marginBottom: 0 }}
              onClick={() => window.open('https://www.instagram.com/', '_blank')}
            >
              Share to Instagram Story
            </ModalButton>
          </div>
        )}
      </ModalCard>
    </ModalOverlay>
  ) : null;
}

const ReferralStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
`;

const ReferralStat = styled.div`
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.02rem;
  color: #FFD700;
  font-weight: 500;
`;

const ReferralProgressBar = styled.div`
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 1.1rem;
  width: 100%;
  max-width: 400px;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${({ progress }) => progress}%;
  background: linear-gradient(90deg, #FFD700 0%, #FFB000 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
`;

const ShareButton = styled(ModalButton)`
  margin-top: 0.5rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

function ProfileScreen() {
  const [showReferralModal, setShowReferralModal] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  // Mock data
  const profile = {
    name: 'Ava Papillon',
    email: 'ava@papillonos.com',
    avatar: '🦋',
  };
  const balance = 0;
  const transactions = [
    { type: 'Scan Quest Earn', amount: '+15 WNGS', positive: true, status: 'Completed', date: 'Mar 18, 2025' },
    { type: 'Shop Purchase', amount: '-25 WNGS', positive: false, status: 'Completed', date: 'Mar 15, 2025' },
    { type: 'Daily Reward', amount: '+5 WNGS', positive: true, status: 'Completed', date: 'Mar 14, 2025' },
  ];
  const progress = [
    { color: theme.colors.secondary, value: 60 },
    { color: theme.colors.accent, value: 80 },
  ];
  const invited = 3, pending = 2, joined = 1, rewards = 50;
  const referralPercent = Math.min((invited / 5) * 100, 100);

  return (
    <Container>
      <TopRow>
        <ProfileHeader onClick={() => navigate('/settings')}>
          <Avatar>AC</Avatar>
          <ProfileName>Alex Chen</ProfileName>
          <ProfileEmail>alex@example.com</ProfileEmail>
        </ProfileHeader>
        <BalanceCard>
          <BalanceLabel>WNGS Balance</BalanceLabel>
          <BalanceValue>1,250</BalanceValue>
        </BalanceCard>
      </TopRow>

      <SectionCard>
        <SectionTitle>Referral Tracker</SectionTitle>
        <ReferralProgressBar>
          <ProgressFill progress={33} />
        </ReferralProgressBar>
        <ReferralStats>
          <ReferralStat>3 Friends Invited</ReferralStat>
          <ReferralStat>Pending: 2 invites</ReferralStat>
          <ReferralStat>Joined: 1 friend</ReferralStat>
          <ReferralStat>Rewards Earned: 50 WNGS</ReferralStat>
        </ReferralStats>
        <ShareButton onClick={() => setShowReferralModal(true)}>
          Share Referral
        </ShareButton>
      </SectionCard>

      <SectionCard>
        <SectionTitle>Recent Activity</SectionTitle>
        <TransactionList>
          {transactions.map((tx, i) => (
            <Transaction key={i}>
              <div>
                <TransactionType>{tx.type}</TransactionType>
                <TransactionAmount positive={tx.positive}>{tx.amount}</TransactionAmount>
              </div>
              <div style={{ textAlign: 'right' }}>
                <TransactionStatus>{tx.status}</TransactionStatus>
                <TransactionDate>{tx.date}</TransactionDate>
              </div>
            </Transaction>
          ))}
        </TransactionList>
      </SectionCard>

      <ReferralModal 
        open={showReferralModal} 
        onClose={() => setShowReferralModal(false)} 
      />
    </Container>
  );
}

export default ProfileScreen; 