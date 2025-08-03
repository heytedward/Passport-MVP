import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import GlassCard from '../components/GlassCard';
import RecentActivityModal from '../components/RecentActivityModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useReferrals } from '../hooks/useReferrals';
import { createClient } from '@supabase/supabase-js';
import NavBar from '../components/NavBar';

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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent.gold};
    background: rgba(255, 215, 0, 0.1);
  }
`;

const EditIcon = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.accent.gold};
  opacity: 0.7;
  transition: opacity 0.2s ease;
  
  ${ProfileName}:hover & {
    opacity: 1;
  }
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

const Button = styled.button`
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
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
  text-align: center;
  letter-spacing: 1px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;



const TransactionStatus = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.accent.green};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const TransactionDate = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
`;

const ProgressSection = styled(SectionCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0;
`;

const ProgressBarContainer = styled.div`
  background: ${({ theme }) => theme.colors.glass.background};
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  border-radius: 20px;
  height: 24px;
  margin-bottom: 24px;
  overflow: hidden;
  width: 100%;
  max-width: 700px;
`;

const ProgressBar = styled.div`
  height: 100%;
  border-radius: 20px;
  background: ${({ color, theme }) => color || theme.colors.accent.gold};
  width: ${({ value }) => value}%;
  transition: width ${({ theme }) => theme.animation.duration.slow};
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
  border: 3px solid ${({ theme }) => theme.colors.accent.gold};
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 2.2rem;
  box-shadow: ${({ theme }) => theme.effects.neonGlow};
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
  }
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
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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
    color: #000000;
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
  color: #000000;
  box-shadow: 0 2px 12px 0 rgba(255,215,0,0.10);
`;

const ReferralList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ReferralItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ReferralIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background: ${({ theme }) => theme.colors.accent.purple};
`;

const ReferralContent = styled.div`
  flex: 1;
`;

const ReferralTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ReferralDescription = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const ReferralMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
`;

const ReferralStatus = styled.div`
  color: ${({ theme }) => theme.colors.accent.green};
  font-weight: 600;
  font-size: 0.875rem;
`;

const ReferralReward = styled.div`
  color: ${({ theme }) => theme.colors.accent.gold};
  font-weight: 600;
  font-size: 0.875rem;
`;

const ShareReferralButton = styled.button`
  background: linear-gradient(135deg, #FFB000 0%, #FF9F1C 100%);
  border: 3px solid #FFB000;
  border-radius: 20px;
  color: #000;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  padding: 16px 32px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  margin-top: 24px;
  width: 100%;
  max-width: 200px;
  align-self: center;
  box-shadow: 
    0 0 20px 0 rgba(255,176,0,0.2),
    0 0 40px 0 rgba(255,176,0,0.1);
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 0 30px 0 rgba(255,176,0,0.4),
      0 0 60px 0 rgba(255,176,0,0.2);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.01);
  }
`;

// Activity item components that match the referral pattern
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const ActivityItem = styled.div`
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

const ActivityIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: ${({ $type, theme }) => {
    switch ($type) {
      case 'scan': return theme.colors.accent.purple;
      case 'purchase': return theme.colors.accent.pink;
      case 'daily': return theme.colors.accent.green;
      default: return theme.colors.accent.purple;
    }
  }};
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
  margin-bottom: 8px;
`;

const ActivityDescription = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const ActivityMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const ActivityStatus = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.accent.green};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const ActivityAmount = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ $positive, theme }) => 
    $positive ? theme.colors.accent.gold : theme.colors.accent.pink};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const ActivityDate = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
`;

const ShareButton = styled(ModalButton)`
  margin-top: 0.5rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

const AdminButton = styled(ModalButton)`
  background: ${({ theme }) => theme.colors.accent.gold};
  color: #000;
  margin-top: 1rem;

  &:hover {
    background: #FFC72C;
  }
`;

const ActionButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 0 15px ${({ theme }) => theme.colors.primary};
  }
`;

function ReferralModal({ open, onClose, user }) {
  const { referralCode, generateReferralLink, shareReferral, isBirthdayLaunch } = useReferrals();
  const [copied, setCopied] = useState(false);
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  
  const handleCopyLink = async () => {
    if (!referralCode) return;
    
    const result = await shareReferral(referralCode);
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (referralCode) {
      await shareReferral(referralCode);
    }
  };
  
  return open ? (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalCard>
        <ModalClose aria-label="Close" onClick={onClose}>×</ModalClose>
        <ModalTitle>Share Your Referral</ModalTitle>
        
        {referralCode ? (
          <div style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>
            <div style={{
              background: 'rgba(255, 176, 0, 0.1)',
              border: '1px solid rgba(255, 176, 0, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Your Referral Code
              </div>
              <div style={{ 
                fontSize: '1.8rem', 
                fontWeight: 'bold', 
                color: '#FFD700',
                fontFamily: 'monospace',
                letterSpacing: '3px',
                marginBottom: '0.5rem'
              }}>
                {referralCode}
              </div>
              <div style={{ color: '#aaa', fontSize: '0.8rem' }}>
                Each friend earns you {isBirthdayLaunch ? '100' : '50'} WINGS
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <ModalButton onClick={handleNativeShare}>
                📱 Share with Friends
              </ModalButton>
              
              <ModalButton onClick={handleCopyLink}>
                {copied ? '✅ Copied!' : '📋 Copy Referral Link'}
              </ModalButton>
              
              <ModalButton 
                onClick={() => window.open(`https://www.instagram.com/`, '_blank')}
                style={{ background: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)' }}
              >
                📸 Share to Instagram Story
              </ModalButton>
            </div>

            {isBirthdayLaunch && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem',
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#FFD700'
              }}>
                🎂 Birthday Launch Special: DOUBLE REWARDS until Sept 14th!
              </div>
            )}

            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#10B981'
            }}>
              💡 Friends get {isBirthdayLaunch ? '50' : '25'} WINGS for joining + {isBirthdayLaunch ? '50' : '25'} more for their first scan!
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#aaa' }}>
            Loading your referral code...
          </div>
        )}
      </ModalCard>
    </ModalOverlay>
  ) : null;
}

function ProfileScreen() {
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAdmin, profile: authProfile } = useAuth();
  const { 
    referralCode, 
    referralStats, 
    referralHistory, 
    loading: referralLoading, 
    shareReferral,
    generateReferralLink 
  } = useReferrals();

  // Debug referral code
  useEffect(() => {
    console.log('🎯 ProfileScreen: referralCode updated:', referralCode);
    console.log('🎯 ProfileScreen: referralLoading:', referralLoading);
    console.log('🎯 ProfileScreen: user:', user?.id);
  }, [referralCode, referralLoading, user]);
  const theme = useTheme();

  useEffect(() => {
    if (user && authProfile) {
      setProfile({
        name: authProfile.username || user.user_metadata?.username || user.email?.split('@')[0],
        email: user.email,
        avatar: authProfile.avatar_url || null,
        joinDate: new Date(user.created_at).toLocaleDateString(),
        totalWings: authProfile.wings_balance || 0,
        level: Math.floor((authProfile.wings_balance || 0) / 100) + 1,
        achievements: 0,
        items: 0
      });
      setLoading(false);
    } else if (user) {
      // Fallback if no profile found
      setProfile({
        name: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
        email: user.email,
        avatar: null,
        joinDate: new Date(user.created_at).toLocaleDateString(),
        totalWings: 0,
        level: 1,
        achievements: 0,
        items: 0
      });
      setLoading(false);
    }
  }, [user, authProfile]);

  const balance = 0;
  const transactions = [
    { type: 'Scan Quest Earn', amount: '+75 WNGS', positive: true, status: 'Completed', date: 'Mar 18, 2025' },
    { type: 'Shop Purchase', amount: '-50 WNGS', positive: false, status: 'Completed', date: 'Mar 15, 2025' },
    { type: 'Daily Reward', amount: '+35 WNGS', positive: true, status: 'Completed', date: 'Mar 14, 2025' },
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
          <Avatar
  style={profile?.avatar ? {
    backgroundImage: `url(${profile.avatar})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: 'transparent'
  } : {}}>
  {!profile?.avatar && (
    user?.user_metadata?.username ? user.user_metadata.username.charAt(0).toUpperCase() : 
    user?.email ? user.email.charAt(0).toUpperCase() : 'U'
  )}
</Avatar>
          <ProfileName>
            {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
          </ProfileName>
        </ProfileHeader>
        <BalanceCard>
          <BalanceLabel>WNGS Balance</BalanceLabel>
          <BalanceValue>{profile?.totalWings?.toLocaleString() || '0'}</BalanceValue>
        </BalanceCard>
      </TopRow>

      <SectionCard style={{ display: 'flex', flexDirection: 'column' }}>
        <SectionTitle>Referral Program</SectionTitle>
        
        {/* Referral Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '1rem', 
          marginBottom: '1.5rem' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFD700' }}>
              {referralStats.totalReferrals}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Total Referrals</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>
              {referralStats.completedReferrals}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>Completed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFB000' }}>
              {referralStats.totalWingsEarned}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#aaa' }}>WINGS Earned</div>
          </div>
        </div>

        {/* Referral Code Display */}
        <div style={{
          background: 'rgba(255, 176, 0, 0.1)',
          border: '1px solid rgba(255, 176, 0, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '0.5rem' }}>
            Your Referral Code
          </div>
          {referralLoading ? (
            <div style={{ 
              fontSize: '1.2rem', 
              color: '#aaa',
              padding: '1rem'
            }}>
              Generating your code...
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#666',
                marginTop: '0.5rem'
              }}>
                This may take a few seconds...
              </div>
            </div>
          ) : referralCode ? (
            <>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#FFD700',
                fontFamily: 'monospace',
                letterSpacing: '2px'
              }}>
                {referralCode}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.5rem' }}>
                Share this code to earn 50 WINGS per completed referral
              </div>
            </>
          ) : (
            <div style={{ 
              fontSize: '1rem', 
              color: '#e74c3c',
              padding: '1rem'
            }}>
              Failed to generate referral code. Please refresh the page.
            </div>
          )}
        </div>

        {/* Recent Referrals */}
        {referralHistory.length > 0 ? (
          <ReferralList>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff' }}>
              Recent Referrals
            </div>
            {referralHistory.slice(0, 3).map((referral) => (
              <ReferralItem key={referral.id}>
                <ReferralIcon>👥</ReferralIcon>
                <ReferralContent>
                  <ReferralTitle>{referral.refereeName}</ReferralTitle>
                  <ReferralDescription>
                    Joined {new Date(referral.createdAt).toLocaleDateString()}
                  </ReferralDescription>
                </ReferralContent>
                <ReferralMeta>
                  <ReferralStatus style={{
                    color: referral.status === 'completed' ? '#10B981' : '#FFB000'
                  }}>
                    {referral.status === 'completed' ? 'Completed' : 'Pending'}
                  </ReferralStatus>
                  {referral.rewardGiven && referral.wingsEarned > 0 && (
                    <ReferralReward>+{referral.wingsEarned} WINGS</ReferralReward>
                  )}
                </ReferralMeta>
              </ReferralItem>
            ))}
            {referralHistory.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: '1rem', color: '#aaa', fontSize: '0.9rem' }}>
                +{referralHistory.length - 3} more referrals
              </div>
            )}
          </ReferralList>
        ) : (
          <div style={{ textAlign: 'center', color: '#aaa', marginBottom: '1rem' }}>
            No referrals yet. Share your code to start earning!
          </div>
        )}

        <ShareReferralButton 
          onClick={() => {
            if (referralCode) {
              shareReferral(referralCode);
            } else {
              console.log('❌ No referral code available to share');
              alert('Referral code not ready yet. Please wait a moment and try again.');
            }
          }}
          disabled={!referralCode}
          style={{ 
            opacity: referralCode ? 1 : 0.6,
            cursor: referralCode ? 'pointer' : 'not-allowed'
          }}
        >
          {referralLoading ? 'Loading...' : 'Share Referral Code'}
        </ShareReferralButton>
      </SectionCard>

      <SectionCard as="button" onClick={() => setShowActivityModal(true)} style={{ cursor: 'pointer' }}>
        <SectionTitle>Recent Activity</SectionTitle>
        <ActivityList>
          {transactions.map((tx, i) => {
            const getActivityType = (type) => {
              if (type.includes('Scan')) return 'scan';
              if (type.includes('Purchase')) return 'purchase';
              if (type.includes('Daily')) return 'daily';
              return 'scan';
            };
            
            const getActivityIcon = (type) => {
              if (type.includes('Scan')) return '📱';
              if (type.includes('Purchase')) return '🛒';
              if (type.includes('Daily')) return '🎁';
              return '📱';
            };
            
            return (
              <ActivityItem key={i}>
                <ActivityIcon $type={getActivityType(tx.type)}>
                  {getActivityIcon(tx.type)}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{tx.type}</ActivityTitle>
                  <ActivityDescription>Transaction completed successfully</ActivityDescription>
                </ActivityContent>
                <ActivityMeta>
                  <ActivityStatus>{tx.status}</ActivityStatus>
                  <ActivityAmount $positive={tx.positive}>{tx.amount}</ActivityAmount>
                  <ActivityDate>{tx.date}</ActivityDate>
                </ActivityMeta>
              </ActivityItem>
            );
          })}
        </ActivityList>
        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px', 
          color: '#FFD700', 
          fontSize: '0.9rem',
          fontWeight: '500'
        }}>
          Click to view all activity →
        </div>
      </SectionCard>

      <ReferralModal 
        open={showReferralModal} 
        onClose={() => setShowReferralModal(false)} 
        user={user}
      />

      <RecentActivityModal 
        isOpen={showActivityModal} 
        onClose={() => setShowActivityModal(false)} 
      />

      {isAdmin && (
        <AdminButton onClick={() => navigate('/admin')}>
          Admin Dashboard
        </AdminButton>
      )}
      
      {/* Navigation Bar */}
      <NavBar />
    </Container>
  );
}

export default ProfileScreen; 