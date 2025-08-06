import React, { useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

const Container = styled.div`
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

const StatusCard = styled(GlassCard)`
  margin-bottom: 1rem;
  padding: 1rem;
`;

const SuccessMessage = styled.div`
  color: #10B981;
  font-weight: 600;
  margin: 0.5rem 0;
`;

const ErrorMessage = styled.div`
  color: #EF4444;
  font-weight: 600;
  margin: 0.5rem 0;
`;

const UserList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const UserItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin: 0.25rem 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const BetaThemeUnlocker = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // All available themes
  const ALL_THEMES = [
    'frequencyPulse',
    'solarShine', 
    'echoGlass',
    'retroFrame',
    'nightScan'
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, owned_themes, created_at')
        .order('created_at', { ascending: false })
        .limit(50); // Limit to prevent overwhelming

      if (error) {
        setError(`Failed to fetch users: ${error.message}`);
        return;
      }

      setUsers(data || []);
      setMessage(`Found ${data?.length || 0} users`);
      
    } catch (err) {
      setError(`Error fetching users: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const unlockAllThemesForUser = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ 
          owned_themes: ALL_THEMES,
          equipped_theme: 'frequencyPulse'
        })
        .eq('id', userId)
        .select();

      if (error) {
        throw error;
      }

      return { success: true, data };
      
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const unlockAllThemesForAllUsers = async () => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      if (!users.length) {
        setError('No users found. Please fetch users first.');
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        const result = await unlockAllThemesForUser(user.id);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Failed to unlock themes for ${user.email}:`, result.error);
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setMessage(`✅ Successfully unlocked themes for ${successCount} users. ${errorCount} failed.`);
      
      // Refresh user list
      await fetchUsers();
      
    } catch (err) {
      setError(`Error unlocking themes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const unlockThemesForSpecificUser = async (userId, email) => {
    try {
      setLoading(true);
      setMessage('');
      setError('');

      const result = await unlockAllThemesForUser(userId);
      
      if (result.success) {
        setMessage(`✅ Successfully unlocked all themes for ${email}`);
        // Refresh user list
        await fetchUsers();
      } else {
        setError(`❌ Failed to unlock themes for ${email}: ${result.error}`);
      }
      
    } catch (err) {
      setError(`Error unlocking themes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is admin (you can customize this logic)
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('papillon') || user?.email?.includes('ted');

  if (!isAdmin) {
    return (
      <Container>
        <GlassCard>
          <h2>Access Denied</h2>
          <p>This feature is only available to administrators.</p>
        </GlassCard>
      </Container>
    );
  }

  return (
    <Container>
      <GlassCard>
        <h2>🎨 Beta Theme Unlocker</h2>
        <p>Unlock all themes for beta testers</p>
        
        <div style={{ marginBottom: '1rem' }}>
          <GlowButton 
            onClick={fetchUsers}
            disabled={loading}
            style={{ marginRight: '1rem' }}
          >
            {loading ? 'Loading...' : '📋 Fetch Users'}
          </GlowButton>
          
          <GlowButton 
            onClick={unlockAllThemesForAllUsers}
            disabled={loading || !users.length}
            style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderColor: '#10B981'
            }}
          >
            {loading ? 'Unlocking...' : '🔓 Unlock All Themes'}
          </GlowButton>
        </div>

        {message && <SuccessMessage>{message}</SuccessMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {users.length > 0 && (
          <StatusCard>
            <h3>Users ({users.length})</h3>
            <UserList>
              {users.map(user => (
                <UserItem key={user.id}>
                  <div>
                    <strong>{user.email || user.id}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                      Themes: {user.owned_themes?.length || 0}/5
                    </div>
                  </div>
                  <GlowButton
                    onClick={() => unlockThemesForSpecificUser(user.id, user.email)}
                    disabled={loading}
                    style={{ 
                      fontSize: '0.8rem',
                      padding: '0.25rem 0.5rem',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      borderColor: '#3B82F6'
                    }}
                  >
                    Unlock
                  </GlowButton>
                </UserItem>
              ))}
            </UserList>
          </StatusCard>
        )}

        <StatusCard>
          <h3>Available Themes</h3>
          <ul>
            <li><strong>frequencyPulse</strong> - Frequency Pulse (Default)</li>
            <li><strong>solarShine</strong> - Solar Shine</li>
            <li><strong>echoGlass</strong> - Echo Glass</li>
            <li><strong>retroFrame</strong> - Retro Frame</li>
            <li><strong>nightScan</strong> - Night Scan</li>
          </ul>
        </StatusCard>

        <StatusCard>
          <h3>Instructions</h3>
          <ol>
            <li>Click "Fetch Users" to load the user list</li>
            <li>Click "Unlock All Themes" to unlock themes for all users</li>
            <li>Or click individual "Unlock" buttons for specific users</li>
            <li>Users will see all themes available in their Passport screen</li>
          </ol>
        </StatusCard>
      </GlassCard>
    </Container>
  );
};

export default BetaThemeUnlocker; 