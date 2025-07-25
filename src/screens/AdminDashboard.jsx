import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AdminDashboard loaded!');
    console.log('User:', user);
    console.log('IsAdmin:', isAdmin);
    
    if (!user) {
      console.log('No user found, redirecting...');
      navigate('/');
      return;
    }
    
    if (!isAdmin) {
      console.log('User is not admin, redirecting...');
      navigate('/');
      return;
    }
    
    console.log('Admin access granted!');
  }, [user, isAdmin, navigate]);

  // Show loading while checking auth
  if (!user || !isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#00ff00',
        fontFamily: 'Courier New, monospace',
        padding: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <h1 style={{ color: '#00ff00', textShadow: '0 0 10px #00ff00' }}>
            > CHECKING_ACCESS...
          </h1>
          <p>Verifying admin privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      color: '#00ff00',
      fontFamily: 'Courier New, monospace',
      padding: '2rem'
    }}>
      <h1 style={{ color: '#00ff00', textShadow: '0 0 10px #00ff00' }}>
        > MATRIX ADMIN INTERFACE
      </h1>
      <p>If you can see this, the component is loading!</p>
      <div style={{ marginTop: '2rem' }}>
        <h2 style={{ color: '#00ff00' }}>> SYSTEM_STATUS</h2>
        <ul style={{ color: '#00ff00' }}>
          <li>Component loaded successfully</li>
          <li>Matrix theme applied</li>
          <li>Green text working</li>
          <li>Black background working</li>
          <li>User authenticated: {user?.email}</li>
          <li>Admin access: {isAdmin ? 'GRANTED' : 'DENIED'}</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard; 