import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

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

const FilterTabs = styled.div`
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: 12px 20px;
  border: 3px solid ${({ $active, theme }) => 
    $active ? theme.colors.accent.gold : theme.colors.accent.gold};
  background: ${({ $active, theme }) => 
    $active ? theme.colors.accent.gold : 'transparent'};
  color: ${({ $active, theme }) => 
    $active ? theme.colors.background : theme.colors.text.primary};
  border-radius: 20px;
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.animation.duration.normal} ${({ theme }) => theme.animation.timing.smooth};

  &:hover {
    transform: translateY(-3px) scale(1.02);
    background: ${({ theme }) => theme.colors.accent.gold};
    color: ${({ theme }) => theme.colors.background};
    box-shadow: ${({ theme }) => theme.effects.neonGlow};
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px 32px 32px;
`;

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
      case 'quest': return theme.colors.accent.gold;
      case 'event': return theme.colors.accent.pink;
      case 'daily': return theme.colors.accent.green;
      case 'referral': return theme.colors.accent.cyan;
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

const WingsEarned = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.accent.gold};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.small};
`;

const ActivityDate = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 32px;
  font-family: ${({ theme }) => theme.typography.fontFamily.body};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.body};
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

const ACTIVITY_FILTERS = [
  { key: 'all', label: 'All', icon: '📋' },
  { key: 'scan', label: 'Scans', icon: '📱' },
  { key: 'quest', label: 'Quests', icon: '🗡️' },
  { key: 'event', label: 'Events', icon: '🎉' },
  { key: 'daily', label: 'Dailies', icon: '📅' },
  { key: 'referral', label: 'Referrals', icon: '👥' }
];

const RecentActivityModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [allActivities, setAllActivities] = useState([]);
  const isInitializedRef = useRef(false);
  const isProcessingRef = useRef(false);

  // Fetch all activities once when modal opens
  useEffect(() => {
    if (isOpen && user && !isInitializedRef.current) {
      fetchAllActivities();
    } else if (isOpen && user && isInitializedRef.current && allActivities.length === 0) {
      // If modal opens but no activities loaded, try again
      console.log('🔄 Modal opened but no activities, retrying...');
      isInitializedRef.current = false;
      fetchAllActivities();
    } else if (isOpen && !user) {
      // If no user, show empty state
      console.log('👤 No user, showing empty state');
      setAllActivities([]);
      setLoading(false);
    }
  }, [isOpen, user]);

  // Filter activities when filter changes (no re-fetch)
  useEffect(() => {
    if (allActivities.length > 0) {
      filterActivities();
    }
  }, [activeFilter, allActivities]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      isInitializedRef.current = false;
      isProcessingRef.current = false;
      setAllActivities([]);
      setActivities([]);
      setActiveFilter('all');
    }
  }, [isOpen]);

  const fetchAllActivities = useCallback(async () => {
    if (isProcessingRef.current) {
      console.log('🔄 Already processing activities, skipping');
      return;
    }

    console.log('🚀 Starting fetchAllActivities...');
    isProcessingRef.current = true;
    setLoading(true);
    
    try {
      console.log('🔍 Fetching all activities for user:', user.id);
      
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.log('⚠️ Supabase environment variables not configured, using mock data');
        throw new Error('Supabase not configured');
      }
      
      console.log('🔍 Supabase configured, attempting database query...');
      
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Set activities from database (empty array if no activities)
      console.log('✅ Database activities loaded:', data?.length || 0);
      setAllActivities(data || []);
      isInitializedRef.current = true;
    } catch (error) {
      console.error('❌ Error fetching activities:', error);
      console.log('🔄 Error loading activities, showing empty state');
      
      // On error, show empty state instead of mock data
      setAllActivities([]);
      isInitializedRef.current = true;
    } finally {
      console.log('✅ fetchAllActivities completed, setting loading to false');
      setLoading(false);
      isProcessingRef.current = false;
    }
  }, [user]);

  const filterActivities = useCallback(() => {
    if (allActivities.length === 0) return;
    
    console.log('🔍 Filtering activities for:', activeFilter);
    
    const filtered = activeFilter === 'all' 
      ? allActivities 
      : allActivities.filter(activity => activity.activity_type === activeFilter);
      
    setActivities(filtered);
  }, [activeFilter, allActivities]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getActivityIcon = (type) => {
    const filter = ACTIVITY_FILTERS.find(f => f.key === type);
    return filter?.icon || '📋';
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalCard onClick={e => e.stopPropagation()}>
        <CloseButton onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}>×</CloseButton>
        
        <ModalHeader>
          <ModalTitle>Recent Activity</ModalTitle>
          <FilterTabs>
            {ACTIVITY_FILTERS.map(filter => (
              <FilterTab
                key={filter.key}
                $active={activeFilter === filter.key}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.icon} {filter.label}
              </FilterTab>
            ))}
          </FilterTabs>
        </ModalHeader>

        <ModalBody>
          {loading ? (
            <EmptyState>Loading activities...</EmptyState>
          ) : activities.length === 0 ? (
            <EmptyState>
              {activeFilter === 'all' 
                ? "No activity yet. Start scanning QR codes to earn rewards!"
                : `No ${activeFilter} activities yet.`}
            </EmptyState>
          ) : (
            <ActivityList>
              {activities.map(activity => (
                <ActivityItem key={activity.id}>
                  <ActivityIcon $type={activity.activity_type}>
                    {getActivityIcon(activity.activity_type)}
                  </ActivityIcon>
                  <ActivityContent>
                    <ActivityTitle>{activity.activity_title}</ActivityTitle>
                    {activity.activity_description && (
                      <ActivityDescription>{activity.activity_description}</ActivityDescription>
                    )}
                  </ActivityContent>
                  <ActivityMeta>
                    {activity.wings_earned > 0 && (
                      <WingsEarned>+{activity.wings_earned} WNGS</WingsEarned>
                    )}
                    <ActivityDate>{formatDate(activity.activity_date)}</ActivityDate>
                  </ActivityMeta>
                </ActivityItem>
              ))}
            </ActivityList>
          )}
        </ModalBody>
      </ModalCard>
    </ModalOverlay>
  );
};

export default RecentActivityModal; 