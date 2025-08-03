import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminManager, quickAdmin, ADMIN_ROLES, ROLE_DISPLAY } from '../utils/adminManager';
import { useAuth } from '../hooks/useAuth';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

const Container = styled.div`
  padding: 1rem;
`;

const Section = styled(GlassCard)`
  margin-bottom: 2rem;
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid rgba(255, 176, 0, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #FFB000;
    box-shadow: 0 0 0 3px rgba(255, 176, 0, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid rgba(255, 176, 0, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.9rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #FFB000;
    box-shadow: 0 0 0 3px rgba(255, 176, 0, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const QuickButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const MantisButton = styled(QuickButton)`
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
  }
`;

const DragonflyButton = styled(QuickButton)`
  background: linear-gradient(135deg, #7F3FBF 0%, #6B21A8 100%);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #6B21A8 0%, #581C87 100%);
  }
`;

const WaspButton = styled(QuickButton)`
  background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
  }
`;

const ChrysalisButton = styled(QuickButton)`
  background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #4B5563 0%, #374151 100%);
  }
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-weight: 500;
  
  ${({ type }) => type === 'success' && `
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #10B981;
  `}
  
  ${({ type }) => type === 'error' && `
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #EF4444;
  `}
  
  ${({ type }) => type === 'info' && `
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.3);
    color: #3B82F6;
  `}
`;

const AdminList = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
`;

const AdminCard = styled(GlassCard)`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const AdminInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const RoleBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ role }) => {
    switch (role) {
      case 'dragonfly': return 'linear-gradient(135deg, #7F3FBF 0%, #6B21A8 100%)';
      case 'mantis': return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
      case 'wasp': return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
      default: return 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)';
    }
  }};
  color: white;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StatCard = styled.div`
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 176, 0, 0.2);
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #FFB000;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #FFB000;
`;

const AdminUserManager = () => {
  const { user } = useAuth();
  const [userId, setUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('mantis');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [stats, setStats] = useState(null);
  const [checkUserId, setCheckUserId] = useState('');
  const [userStatus, setUserStatus] = useState(null);

  // Check if current user has admin permissions
  const currentUserRole = user?.role || 'chrysalis';
  const canManageAdmins = adminManager.hasPermission(currentUserRole, 'mantis:users:manage') || 
                         adminManager.hasPermission(currentUserRole, 'dragonfly:admins:manage');

  useEffect(() => {
    if (canManageAdmins) {
      loadAdmins();
      loadStats();
    }
  }, [canManageAdmins]);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const result = await adminManager.getAllAdmins();
      if (result.success) {
        setAdmins(result.admins);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load admins' });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await adminManager.getAdminStats();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleMakeAdmin = async (e) => {
    e.preventDefault();
    if (!userId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a user ID' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await adminManager.makeAdmin(userId, selectedRole);
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ User transformed into ${result.roleDisplay.emoji} ${result.roleDisplay.name}` 
        });
        setUserId('');
        loadAdmins();
        loadStats();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to transform user' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTransform = async (targetRole) => {
    if (!userId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a user ID' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let result;
      switch (targetRole) {
        case 'mantis':
          result = await quickAdmin.mantis(userId);
          break;
        case 'dragonfly':
          result = await quickAdmin.dragonfly(userId);
          break;
        case 'wasp':
          result = await quickAdmin.wasp(userId);
          break;
        case 'chrysalis':
          result = await quickAdmin.remove(userId);
          break;
        default:
          result = { success: false, error: 'Invalid role' };
      }

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ User transformed into ${result.roleDisplay.emoji} ${result.roleDisplay.name}` 
        });
        setUserId('');
        loadAdmins();
        loadStats();
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to transform user' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!checkUserId.trim()) {
      setMessage({ type: 'error', text: 'Please enter a user ID to check' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await adminManager.checkAdminStatus(checkUserId);
      
      if (result.success) {
        setUserStatus(result);
        setMessage({ type: 'info', text: 'User status retrieved successfully' });
      } else {
        setMessage({ type: 'error', text: result.error });
        setUserStatus(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to check user status' });
      setUserStatus(null);
    } finally {
      setLoading(false);
    }
  };

  if (!canManageAdmins) {
    return (
      <Container>
        <Section>
          <SectionTitle>🚫 Access Denied</SectionTitle>
          <Message type="error">
            You need mantis (admin) or dragonfly (super admin) permissions to manage users.
            Current role: {ROLE_DISPLAY[currentUserRole]?.emoji} {ROLE_DISPLAY[currentUserRole]?.name}
          </Message>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      {/* Transform User Section */}
      <Section>
        <SectionTitle>🔄 Transform User</SectionTitle>
        
        <Form onSubmit={handleMakeAdmin}>
          <FormGroup>
            <Label>User ID</Label>
            <Input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID (UUID or test-*)"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Target Role</Label>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="mantis">🦗 Mantis (Admin)</option>
              <option value="dragonfly">🐉 Dragonfly (Super Admin)</option>
              <option value="wasp">🐝 Wasp (Moderator)</option>
              <option value="chrysalis">🦋 Chrysalis (Regular User)</option>
            </Select>
          </FormGroup>
          
          <GlowButton type="submit" disabled={loading}>
            {loading ? 'Transforming...' : 'Transform User'}
          </GlowButton>
        </Form>

        <ButtonGroup>
          <MantisButton 
            onClick={() => handleQuickTransform('mantis')}
            disabled={loading || !userId.trim()}
          >
            🦗 Make Mantis
          </MantisButton>
          
          <DragonflyButton 
            onClick={() => handleQuickTransform('dragonfly')}
            disabled={loading || !userId.trim()}
          >
            🐉 Make Dragonfly
          </DragonflyButton>
          
          <WaspButton 
            onClick={() => handleQuickTransform('wasp')}
            disabled={loading || !userId.trim()}
          >
            🐝 Make Wasp
          </WaspButton>
          
          <ChrysalisButton 
            onClick={() => handleQuickTransform('chrysalis')}
            disabled={loading || !userId.trim()}
          >
            🦋 Make Chrysalis
          </ChrysalisButton>
        </ButtonGroup>

        {message && (
          <Message type={message.type}>
            {message.text}
          </Message>
        )}
      </Section>

      {/* Check User Status Section */}
      <Section>
        <SectionTitle>🔍 Check User Status</SectionTitle>
        
        <Form onSubmit={(e) => { e.preventDefault(); handleCheckStatus(); }}>
          <FormGroup>
            <Label>User ID</Label>
            <Input
              type="text"
              value={checkUserId}
              onChange={(e) => setCheckUserId(e.target.value)}
              placeholder="Enter user ID to check"
            />
          </FormGroup>
          
          <GlowButton type="submit" disabled={loading}>
            {loading ? 'Checking...' : 'Check Status'}
          </GlowButton>
        </Form>

        {userStatus && (
          <div style={{ marginTop: '1rem' }}>
            <h4>User Status:</h4>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div><strong>User ID:</strong> {userStatus.userId}</div>
              <div><strong>Role:</strong> {userStatus.roleDisplay.emoji} {userStatus.roleDisplay.name} ({userStatus.roleDisplay.description})</div>
              <div><strong>Email:</strong> {userStatus.userInfo.email || 'N/A'}</div>
              <div><strong>Name:</strong> {userStatus.userInfo.fullName || userStatus.userInfo.username || 'N/A'}</div>
              <div><strong>Is Admin:</strong> {userStatus.isAdmin ? 'Yes' : 'No'}</div>
              <div><strong>Is Moderator:</strong> {userStatus.isModerator ? 'Yes' : 'No'}</div>
              <div><strong>Is Super Admin:</strong> {userStatus.isSuperAdmin ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </Section>

      {/* Admin Statistics */}
      {stats && (
        <Section>
          <SectionTitle>📊 Admin Statistics</SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatNumber>{stats.chrysalis}</StatNumber>
              <StatLabel>🦋 Chrysalis</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.wasp}</StatNumber>
              <StatLabel>🐝 Wasp</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.mantis}</StatNumber>
              <StatLabel>🦗 Mantis</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.dragonfly}</StatNumber>
              <StatLabel>🐉 Dragonfly</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.total}</StatNumber>
              <StatLabel>📊 Total Users</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{stats.wasp + stats.mantis + stats.dragonfly}</StatNumber>
              <StatLabel>👑 Total Admins</StatLabel>
            </StatCard>
          </StatsGrid>
        </Section>
      )}

      {/* Admin List */}
      <Section>
        <SectionTitle>📋 Admin List</SectionTitle>
        
        {loading ? (
          <LoadingSpinner>Loading admins...</LoadingSpinner>
        ) : admins.length === 0 ? (
          <Message type="info">
            🦋 No admins found. All users are chrysalis (regular users).
          </Message>
        ) : (
          <AdminList>
            {admins.map((admin) => (
              <AdminCard key={admin.id}>
                <AdminInfo>
                  <RoleBadge role={admin.role}>
                    {admin.roleDisplay.emoji} {admin.roleDisplay.name}
                  </RoleBadge>
                  <UserDetails>
                    <UserName>{admin.fullName || admin.username || 'Unknown User'}</UserName>
                    <UserEmail>{admin.email || 'No email'}</UserEmail>
                  </UserDetails>
                </AdminInfo>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  {new Date(admin.created_at).toLocaleDateString()}
                </div>
              </AdminCard>
            ))}
          </AdminList>
        )}
      </Section>
    </Container>
  );
};

export default AdminUserManager; 