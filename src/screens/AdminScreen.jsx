import React, { useState, useEffect } from 'react';

const AdminScreen = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [stats, setStats] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Modal states
  const [showCreateRewardModal, setShowCreateRewardModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAwardWingsModal, setShowAwardWingsModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [newReward, setNewReward] = useState({
    name: '',
    category: '',
    rarity: 'common',
    wings_value: 0,
    season: 'Spring 2025'
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    tier: 'bronze',
    wings: 0,
    items: 0
  });
  const [wingsAmount, setWingsAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced Mock Data
  const mockCategories = [
    { name: 'jackets', enabled: true, itemCount: 45, scanCount: 234, revenue: 12500 },
    { name: 'tops', enabled: true, itemCount: 67, scanCount: 189, revenue: 8900 },
    { name: 'bottoms', enabled: false, itemCount: 23, scanCount: 45, revenue: 3200 },
    { name: 'accessories', enabled: true, itemCount: 89, scanCount: 456, revenue: 15600 },
    { name: 'headwear', enabled: true, itemCount: 34, scanCount: 123, revenue: 5400 },
    { name: 'badges', enabled: true, itemCount: 12, scanCount: 567, revenue: 2800 },
    { name: 'tokens', enabled: false, itemCount: 8, scanCount: 34, revenue: 1200 }
  ];

  const mockUsers = [
    { 
      id: 1, name: 'Alex Chen', email: 'alex@example.com', wings: 1250, items: 24, 
      status: 'active', joinDate: '2025-03-01', lastScan: '2025-03-20', totalScans: 47, tier: 'gold'
    },
    { 
      id: 2, name: 'Jordan Smith', email: 'jordan@example.com', wings: 890, items: 18, 
      status: 'active', joinDate: '2025-03-05', lastScan: '2025-03-19', totalScans: 32, tier: 'silver'
    },
    { 
      id: 3, name: 'Taylor Wilson', email: 'taylor@example.com', wings: 2340, items: 45, 
      status: 'active', joinDate: '2025-02-15', lastScan: '2025-03-20', totalScans: 78, tier: 'platinum'
    },
    { 
      id: 4, name: 'Morgan Davis', email: 'morgan@example.com', wings: 567, items: 12, 
      status: 'banned', joinDate: '2025-03-10', lastScan: '2025-03-15', totalScans: 15, tier: 'bronze'
    }
  ];

  const mockCampaigns = [
    { id: 1, name: 'QR Scanning System', type: 'system', active: true, description: 'Enable or disable all QR code scanning globally' },
    { id: 2, name: 'Spring 2025 Campaign', type: 'seasonal', active: true, description: 'Main seasonal campaign', endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { id: 3, name: 'Pop-up Event Rewards', type: 'event', active: false, description: 'Special rewards for in-person events' },
    { id: 4, name: 'Summer Preview', type: 'preview', active: true, description: 'Early access to summer collection' }
  ];

  const mockRecentActivity = [
    { id: 1, user: 'alex@papillon.com', action: 'QR Scan', reward: 'Spring Jacket #037', time: '2 min ago', status: 'success' },
    { id: 2, user: 'sarah@gmail.com', action: 'QR Scan', reward: 'Pop-up Stamp', time: '5 min ago', status: 'success' },
    { id: 3, user: 'mike@example.com', action: 'QR Scan', reward: 'Invalid Code', time: '8 min ago', status: 'failed' },
    { id: 4, user: 'emma@papillon.com', action: 'Manual Grant', reward: 'Gold Chain #003', time: '12 min ago', status: 'granted' },
    { id: 5, user: 'john@test.com', action: 'QR Scan', reward: 'Summer Preview', time: '15 min ago', status: 'success' }
  ];

  const mockStats = {
    totalScansToday: 247,
    rewardsClaimed: 89,
    activeUsers: 1234,
    successRate: 91,
    totalUsers: 1247,
    totalScans: 5643,
    totalWings: 234567,
    activeRewards: 89,
    dailyActiveUsers: 456,
    conversionRate: 73.2
  };

  useEffect(() => {
    setCategories(mockCategories);
    setUsers(mockUsers);
    setCampaigns(mockCampaigns);
    setRecentActivity(mockRecentActivity);
    setStats(mockStats);
  }, []);

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'campaigns', icon: '🎯', label: 'Campaigns' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'rewards', icon: '🎁', label: 'Rewards' },
    { id: 'categories', icon: '📱', label: 'Categories' },
    { id: 'analytics', icon: '📈', label: 'Analytics' }
  ];

  // Handlers
  const toggleCampaign = (campaignId) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, active: !campaign.active }
          : campaign
      )
    );
  };

  const toggleCategory = (categoryName) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.name === categoryName 
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
  };

  const createReward = () => {
    if (!newReward.name || !newReward.category) {
      alert('Please fill in all required fields');
      return;
    }
    
    const reward = { id: Date.now(), ...newReward, active: true };
    setRewards(prev => [...prev, reward]);
    setShowCreateRewardModal(false);
    setNewReward({ name: '', category: '', rarity: 'common', wings_value: 0, season: 'Spring 2025' });
    alert('Reward created successfully!');
  };

  const addUser = () => {
    if (!newUser.name || !newUser.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    const user = { 
      id: Date.now(), 
      ...newUser, 
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastScan: 'Never',
      totalScans: 0
    };
    setUsers(prev => [...prev, user]);
    setShowAddUserModal(false);
    setNewUser({ name: '', email: '', tier: 'bronze', wings: 0, items: 0 });
    alert('User added successfully!');
  };

  const awardWings = () => {
    if (!selectedUser || wingsAmount <= 0) return;
    
    setUsers(prev =>
      prev.map(user =>
        user.id === selectedUser.id
          ? { ...user, wings: user.wings + wingsAmount }
          : user
      )
    );
    
    setShowAwardWingsModal(false);
    setWingsAmount(0);
    alert(`Successfully awarded ${wingsAmount} WINGS to ${selectedUser.name}!`);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if we're on desktop
  const isDesktop = window.innerWidth >= 1024;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
      color: '#ffffff',
      fontFamily: 'Space Grotesk, sans-serif',
      position: 'relative'
    }}>
      {/* Mobile Menu Toggle */}
      {!isDesktop && (
        <button
          style={{
            display: 'block',
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 50,
            background: 'rgba(76, 28, 140, 0.8)',
            border: 'none',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '8px',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '280px',
        background: 'linear-gradient(180deg, rgba(76, 28, 140, 0.2) 0%, rgba(0, 0, 0, 0.5) 100%)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 176, 0, 0.3)',
        zIndex: 40,
        transform: sidebarOpen || isDesktop ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        
        {/* Logo */}
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 176, 0, 0.2)'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #FFB000 0%, #7F3FBF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>Monarch Admin</h1>
          <p style={{
            color: '#9E9E9E',
            fontSize: '0.9rem',
            marginTop: '0.5rem'
          }}>Dashboard v2.0</p>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '1rem' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (!isDesktop) setSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                width: '100%',
                background: activeTab === item.id ? 'rgba(255, 176, 0, 0.2)' : 'none',
                border: 'none',
                color: activeTab === item.id ? '#FFB000' : '#ffffff',
                textDecoration: 'none',
                borderRadius: '12px',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1rem',
                borderLeft: activeTab === item.id ? '4px solid #FFB000' : 'none'
              }}
            >
              <span style={{fontSize: '1.2rem'}}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          
          {/* Emergency Controls */}
          <div style={{marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <button style={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '0.5rem'
            }}>
              🚨 Emergency Stop
            </button>
            <button style={{
              background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%'
            }}>
              🔄 Restart Services
            </button>
          </div>
        </nav>

        {/* User Info */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #4C1C8C 0%, #FFB000 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700'
            }}>
              A
            </div>
            <div>
              <div style={{color: 'white', fontWeight: '600', fontSize: '0.9rem'}}>Admin User</div>
              <div style={{color: '#9E9E9E', fontSize: '0.8rem'}}>admin@monarch.com</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: isDesktop ? '280px' : '0',
        padding: '1.5rem'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#ffffff',
            margin: 0
          }}>
            {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{textAlign: 'right'}}>
              <div style={{color: 'white', fontWeight: '600'}}>Welcome, Admin</div>
              <div style={{color: '#9E9E9E', fontSize: '0.9rem'}}>Last login: 2 hours ago</div>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #4C1C8C 0%, #FFB000 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.2rem'
            }}>A</div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
                border: '1px solid rgba(255, 176, 0, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 32px 0 rgba(255,215,0,0.18)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    color: '#9E9E9E',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>Total Scans Today</span>
                  <span style={{fontSize: '1.5rem'}}>📱</span>
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#FFB000',
                  marginBottom: '0.5rem'
                }}>{stats.totalScansToday || 0}</div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#2ecc40'
                }}>+23% from yesterday</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
                border: '1px solid rgba(255, 176, 0, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 32px 0 rgba(255,215,0,0.18)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    color: '#9E9E9E',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>Rewards Claimed</span>
                  <span style={{fontSize: '1.5rem'}}>🎁</span>
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#FFB000',
                  marginBottom: '0.5rem'
                }}>{stats.rewardsClaimed || 0}</div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#2ecc40'
                }}>+15% from yesterday</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
                border: '1px solid rgba(255, 176, 0, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 32px 0 rgba(255,215,0,0.18)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    color: '#9E9E9E',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>Active Users</span>
                  <span style={{fontSize: '1.5rem'}}>👥</span>
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#FFB000',
                  marginBottom: '0.5rem'
                }}>{stats.activeUsers?.toLocaleString() || '0'}</div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#2ecc40'
                }}>+8% from last week</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
                border: '1px solid rgba(255, 176, 0, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 32px 0 rgba(255,215,0,0.18)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    color: '#9E9E9E',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>Success Rate</span>
                  <span style={{fontSize: '1.5rem'}}>✅</span>
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#FFB000',
                  marginBottom: '0.5rem'
                }}>{stats.successRate || 0}%</div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#2ecc40'
                }}>Success rate</div>
              </div>
            </div>

            {/* Campaign Controls */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(76,28,140,0.08) 100%)',
              border: '1px solid rgba(255, 176, 0, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '1.5rem'
              }}>Campaign Controls</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
                {campaigns.map((campaign) => (
                  <div key={campaign.id} style={{background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', padding: '1.5rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <h4 style={{color: 'white', margin: 0}}>{campaign.name}</h4>
                      <div 
                        style={{
                          position: 'relative',
                          width: '60px',
                          height: '30px',
                          borderRadius: '15px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: campaign.active ? '#FFB000' : '#333'
                        }}
                        onClick={() => toggleCampaign(campaign.id)}
                      >
                        <div 
                          style={{
                            position: 'absolute',
                            top: '3px',
                            left: '3px',
                            width: '24px',
                            height: '24px',
                            background: 'white',
                            borderRadius: '50%',
                            transition: 'all 0.3s ease',
                            transform: campaign.active ? 'translateX(30px)' : 'translateX(0)'
                          }}
                        />
                      </div>
                    </div>
                    <p style={{color: '#9E9E9E', fontSize: '0.9rem', marginBottom: '1rem'}}>{campaign.description}</p>
                    {campaign.endDate && (
                      <div style={{background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '1rem', textAlign: 'center', marginBottom: '1rem'}}>
                        <div style={{color: '#FFB000', fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: '700'}}>
                          02:14:37:22
                        </div>
                        <div style={{color: '#9E9E9E', fontSize: '0.8rem'}}>Days : Hours : Minutes : Seconds</div>
                      </div>
                    )}
                    <div style={{fontWeight: '600', color: campaign.active ? '#2ecc40' : '#e74c3c'}}>
                      {campaign.active ? '✅ ACTIVE' : '❌ INACTIVE'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(76,28,140,0.08) 100%)',
              border: '1px solid rgba(255, 176, 0, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '1.5rem'
              }}>Recent User Activity</h3>
              <div style={{overflowX: 'auto'}}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr>
                      <th style={{
                        background: 'rgba(76, 28, 140, 0.3)',
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#FFB000',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>User</th>
                      <th style={{
                        background: 'rgba(76, 28, 140, 0.3)',
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#FFB000',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Action</th>
                      <th style={{
                        background: 'rgba(76, 28, 140, 0.3)',
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#FFB000',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Reward</th>
                      <th style={{
                        background: 'rgba(76, 28, 140, 0.3)',
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#FFB000',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Time</th>
                      <th style={{
                        background: 'rgba(76, 28, 140, 0.3)',
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#FFB000',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                      }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((activity) => (
                      <tr key={activity.id} style={{
                        transition: 'background 0.2s ease'
                      }}>
                        <td style={{
                          padding: '1rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>{activity.user}</td>
                        <td style={{
                          padding: '1rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>{activity.action}</td>
                        <td style={{
                          padding: '1rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>{activity.reward}</td>
                        <td style={{
                          padding: '1rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          color: '#9E9E9E'
                        }}>{activity.time}</td>
                        <td style={{
                          padding: '1rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            background: activity.status === 'success' ? 'rgba(46, 204, 64, 0.2)' : 
                                        activity.status === 'failed' ? 'rgba(231, 76, 60, 0.2)' : 
                                        'rgba(52, 152, 219, 0.2)',
                            color: activity.status === 'success' ? '#2ecc40' : 
                                   activity.status === 'failed' ? '#e74c3c' : 
                                   '#3498db'
                          }}>
                            {activity.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(76,28,140,0.08) 100%)',
            border: '1px solid rgba(255, 176, 0, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '0'
              }}>User Management</h3>
              <button 
                style={{
                  background: 'linear-gradient(135deg, #4C1C8C 0%, #7F3FBF 100%)',
                  color: 'white',
                  border: '2px solid #FFB000',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem'
                }}
                onClick={() => setShowAddUserModal(true)}
              >
                Add User
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search users by name or email..."
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                marginBottom: '1.5rem'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {filteredUsers.map((user) => (
                <div key={user.id} style={{
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.15)', 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onClick={() => {
                  setSelectedUser(user);
                  setShowUserDetailsModal(true);
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flex: 1}}>
                    <div style={{
                      width: '48px', 
                      height: '48px', 
                      background: 'linear-gradient(135deg, #4C1C8C 0%, #FFB000 100%)', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'white', 
                      fontWeight: '700'
                    }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{color: 'white', fontWeight: '600'}}>{user.name}</div>
                      <div style={{color: '#9E9E9E', fontSize: '0.9rem'}}>{user.email}</div>
                      <div style={{fontSize: '0.8rem', color: '#6C6C6C', display: 'flex', gap: '1rem'}}>
                        <span>{user.wings} WINGS</span>
                        <span>{user.items} items</span>
                        <span style={{
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px',
                          background: user.tier === 'platinum' ? 'rgba(155, 89, 182, 0.2)' : 
                                     user.tier === 'gold' ? 'rgba(241, 196, 15, 0.2)' : 
                                     user.tier === 'silver' ? 'rgba(149, 165, 166, 0.2)' : 'rgba(230, 126, 34, 0.2)',
                          color: user.tier === 'platinum' ? '#9B59B6' : 
                                 user.tier === 'gold' ? '#F1C40F' : 
                                 user.tier === 'silver' ? '#95A5A6' : '#E67E22'
                        }}>
                          {user.tier.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button 
                      style={{
                        background: '#FFB000',
                        color: '#000',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(user);
                        setShowAwardWingsModal(true);
                      }}
                    >
                      Award WINGS
                    </button>
                    <button 
                      style={{
                        background: user.status === 'banned' ? '#2ecc40' : '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {user.status === 'banned' ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            {/* Physical Categories Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(76,28,140,0.08) 100%)',
              border: '1px solid rgba(255, 176, 0, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                👕 Physical Categories
              </h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
                {categories.filter(category => ['jackets', 'tops', 'bottoms', 'accessories', 'headwear'].includes(category.name)).map((category) => (
                  <div key={category.name} style={{
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.15)', 
                    borderRadius: '12px', 
                    padding: '1.5rem'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <h4 style={{color: 'white', margin: 0, textTransform: 'capitalize'}}>{category.name}</h4>
                      <div 
                        style={{
                          position: 'relative',
                          width: '60px',
                          height: '30px',
                          borderRadius: '15px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: category.enabled ? '#FFB000' : '#333'
                        }}
                        onClick={() => toggleCategory(category.name)}
                      >
                        <div 
                          style={{
                            position: 'absolute',
                            top: '3px',
                            left: '3px',
                            width: '24px',
                            height: '24px',
                            background: 'white',
                            borderRadius: '50%',
                            transition: 'all 0.3s ease',
                            transform: category.enabled ? 'translateX(30px)' : 'translateX(0)'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{color: '#9E9E9E'}}>Items:</span>
                        <span style={{color: '#FFB000', fontWeight: '600'}}>{category.itemCount}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{color: '#9E9E9E'}}>Scans:</span>
                        <span style={{color: '#FFB000', fontWeight: '600'}}>{category.scanCount}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{color: '#9E9E9E'}}>Revenue:</span>
                        <span style={{color: '#2ecc40', fontWeight: '600'}}>${category.revenue?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{
                      marginTop: '1rem', 
                      fontSize: '0.9rem', 
                      fontWeight: '600', 
                      color: category.enabled ? '#2ecc40' : '#e74c3c'
                    }}>
                      {category.enabled ? '✅ ENABLED' : '❌ DISABLED'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Categories Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(76,28,140,0.08) 100%)',
              border: '1px solid rgba(255, 176, 0, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                💎 Digital Categories
              </h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
                {categories.filter(category => ['badges', 'tokens'].includes(category.name)).map((category) => (
                  <div key={category.name} style={{
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255, 255, 255, 0.15)', 
                    borderRadius: '12px', 
                    padding: '1.5rem'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <h4 style={{color: 'white', margin: 0, textTransform: 'capitalize'}}>{category.name}</h4>
                      <div 
                        style={{
                          position: 'relative',
                          width: '60px',
                          height: '30px',
                          borderRadius: '15px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          background: category.enabled ? '#FFB000' : '#333'
                        }}
                        onClick={() => toggleCategory(category.name)}
                      >
                        <div 
                          style={{
                            position: 'absolute',
                            top: '3px',
                            left: '3px',
                            width: '24px',
                            height: '24px',
                            background: 'white',
                            borderRadius: '50%',
                            transition: 'all 0.3s ease',
                            transform: category.enabled ? 'translateX(30px)' : 'translateX(0)'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{color: '#9E9E9E'}}>Items:</span>
                        <span style={{color: '#FFB000', fontWeight: '600'}}>{category.itemCount}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{color: '#9E9E9E'}}>Scans:</span>
                        <span style={{color: '#FFB000', fontWeight: '600'}}>{category.scanCount}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{color: '#9E9E9E'}}>Revenue:</span>
                        <span style={{color: '#2ecc40', fontWeight: '600'}}>${category.revenue?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{
                      marginTop: '1rem', 
                      fontSize: '0.9rem', 
                      fontWeight: '600', 
                      color: category.enabled ? '#2ecc40' : '#e74c3c'
                    }}>
                      {category.enabled ? '✅ ENABLED' : '❌ DISABLED'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(76,28,140,0.08) 100%)',
            border: '1px solid rgba(255, 176, 0, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '0'
              }}>Reward Management</h3>
              <button 
                style={{
                  background: 'linear-gradient(135deg, #4C1C8C 0%, #7F3FBF 100%)',
                  color: 'white',
                  border: '2px solid #FFB000',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem'
                }}
                onClick={() => setShowCreateRewardModal(true)}
              >
                Create New Reward
              </button>
            </div>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {campaigns.map((reward) => (
                <div key={reward.id} style={{
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.15)', 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{color: 'white', fontWeight: '600'}}>{reward.name}</div>
                    <div style={{color: '#9E9E9E', fontSize: '0.9rem'}}>{reward.description}</div>
                    <div style={{fontSize: '0.8rem', color: '#6C6C6C', marginTop: '0.5rem'}}>
                      Type: {reward.type} • Created: March 15, 2025
                    </div>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: reward.active ? 'rgba(46, 204, 64, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                      color: reward.active ? '#2ecc40' : '#e74c3c'
                    }}>
                      {reward.active ? 'Active' : 'Inactive'}
                    </span>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: '#FFB000',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
                border: '1px solid rgba(255, 176, 0, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 32px 0 rgba(255,215,0,0.18)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#FFB000',
                  marginBottom: '0.5rem'
                }}>{stats.totalUsers?.toLocaleString() || '0'}</div>
                <div style={{
                  color: '#9E9E9E',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>Total Users</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
                border: '1px solid rgba(255, 176, 0, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 32px 0 rgba(255,215,0,0.18)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#FFB000',
                  marginBottom: '0.5rem'
                }}>{stats.totalScans?.toLocaleString() || '0'}</div>
                <div style={{
                  color: '#9E9E9E',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>Total Scans</div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
                border: '1px solid rgba(255, 176, 0, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 32px 0 rgba(255,215,0,0.18)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: '#FFB000',
                  marginBottom: '0.5rem'
                }}>{stats.totalWings?.toLocaleString() || '0'}</div>
                <div style={{
                  color: '#9E9E9E',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>Total WINGS</div>
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(76,28,140,0.08) 100%)',
              border: '1px solid rgba(255, 176, 0, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '1.5rem'
              }}>Revenue by Category</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {categories.map((category) => (
                  <div key={category.name} style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '1rem', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: '8px'
                  }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                      <div style={{width: '16px', height: '16px', background: '#FFB000', borderRadius: '4px'}}></div>
                      <span style={{color: 'white', textTransform: 'capitalize'}}>{category.name}</span>
                    </div>
                    <div style={{color: '#2ecc40', fontWeight: '600'}}>${category.revenue?.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(76,28,140,0.08) 100%)',
              border: '1px solid rgba(255, 176, 0, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '1.5rem'
              }}>User Engagement Metrics</h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2rem', fontWeight: '700', color: '#FFB000'}}>{stats.dailyActiveUsers || 0}</div>
                  <div style={{color: '#9E9E9E', fontSize: '0.9rem'}}>Daily Active Users</div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2rem', fontWeight: '700', color: '#FFB000'}}>{stats.conversionRate || 0}%</div>
                  <div style={{color: '#9E9E9E', fontSize: '0.9rem'}}>Conversion Rate</div>
                </div>
                <div style={{textAlign: 'center'}}>
                  <div style={{fontSize: '2rem', fontWeight: '700', color: '#FFB000'}}>{stats.activeRewards || 0}</div>
                  <div style={{color: '#9E9E9E', fontSize: '0.9rem'}}>Active Rewards</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(76,28,140,0.08) 100%)',
            border: '1px solid rgba(255, 176, 0, 0.3)',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '0'
              }}>Campaign Management</h3>
              <button style={{
                background: 'linear-gradient(135deg, #4C1C8C 0%, #7F3FBF 100%)',
                color: 'white',
                border: '2px solid #FFB000',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '1rem'
              }}>Create Campaign</button>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
              {campaigns.map((campaign) => (
                <div key={campaign.id} style={{
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  borderRadius: '12px', 
                  padding: '1.5rem'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h4 style={{color: 'white', margin: 0}}>{campaign.name}</h4>
                    <div 
                      style={{
                        position: 'relative',
                        width: '60px',
                        height: '30px',
                        borderRadius: '15px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: campaign.active ? '#FFB000' : '#333'
                      }}
                      onClick={() => toggleCampaign(campaign.id)}
                    >
                      <div 
                        style={{
                          position: 'absolute',
                          top: '3px',
                          left: '3px',
                          width: '24px',
                          height: '24px',
                          background: 'white',
                          borderRadius: '50%',
                          transition: 'all 0.3s ease',
                          transform: campaign.active ? 'translateX(30px)' : 'translateX(0)'
                        }}
                      />
                    </div>
                  </div>
                  <p style={{color: '#9E9E9E', fontSize: '0.9rem', marginBottom: '1rem'}}>{campaign.description}</p>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: campaign.active ? 'rgba(46, 204, 64, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                      color: campaign.active ? '#2ecc40' : '#e74c3c'
                    }}>
                      {campaign.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: '#FFB000',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}>
                      Edit Settings
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Reward Modal */}
      {showCreateRewardModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
            border: '1px solid rgba(255, 176, 0, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            backdropFilter: 'blur(20px)'
          }}>
            <h3 style={{color: 'white', marginBottom: '1.5rem'}}>Create New Reward</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <input
                type="text"
                placeholder="Reward Name"
                value={newReward.name}
                onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              <select
                value={newReward.category}
                onChange={(e) => setNewReward({...newReward, category: e.target.value})}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name} style={{background: '#333'}}>{cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="WINGS Value"
                value={newReward.wings_value}
                onChange={(e) => setNewReward({...newReward, wings_value: parseInt(e.target.value) || 0})}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
              <button
                onClick={createReward}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #4C1C8C 0%, #7F3FBF 100%)',
                  color: 'white',
                  border: '2px solid #FFB000',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Reward
              </button>
              <button
                onClick={() => setShowCreateRewardModal(false)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
            border: '1px solid rgba(255, 176, 0, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            width: '90%',
            maxWidth: '500px',
            backdropFilter: 'blur(20px)'
          }}>
            <h3 style={{color: 'white', marginBottom: '1.5rem'}}>Add New User</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
              <select
                value={newUser.tier}
                onChange={(e) => setNewUser({...newUser, tier: e.target.value})}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1rem'
                }}
              >
                <option value="bronze" style={{background: '#333'}}>Bronze Tier</option>
                <option value="silver" style={{background: '#333'}}>Silver Tier</option>
                <option value="gold" style={{background: '#333'}}>Gold Tier</option>
                <option value="platinum" style={{background: '#333'}}>Platinum Tier</option>
              </select>
              <div style={{display: 'flex', gap: '1rem'}}>
                <input
                  type="number"
                  placeholder="Starting WINGS"
                  value={newUser.wings}
                  onChange={(e) => setNewUser({...newUser, wings: parseInt(e.target.value) || 0})}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
                <input
                  type="number"
                  placeholder="Starting Items"
                  value={newUser.items}
                  onChange={(e) => setNewUser({...newUser, items: parseInt(e.target.value) || 0})}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
            <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
              <button
                onClick={addUser}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #4C1C8C 0%, #7F3FBF 100%)',
                  color: 'white',
                  border: '2px solid #FFB000',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Add User
              </button>
              <button
                onClick={() => setShowAddUserModal(false)}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Award WINGS Modal */}
      {showAwardWingsModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
            border: '1px solid rgba(255, 176, 0, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            width: '90%',
            maxWidth: '400px',
            backdropFilter: 'blur(20px)',
            textAlign: 'center'
          }}>
            <h3 style={{color: 'white', marginBottom: '1rem'}}>Award WINGS</h3>
            <p style={{color: '#9E9E9E', marginBottom: '1.5rem'}}>
              Award WINGS to {selectedUser.name}
            </p>
            <input
              type="number"
              placeholder="Amount of WINGS"
              value={wingsAmount}
              onChange={(e) => setWingsAmount(parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                marginBottom: '2rem',
                textAlign: 'center'
              }}
            />
            <div style={{display: 'flex', gap: '1rem'}}>
              <button
                onClick={awardWings}
                style={{
                  flex: 1,
                  background: '#FFB000',
                  color: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Award WINGS
              </button>
              <button
                onClick={() => {
                  setShowAwardWingsModal(false);
                  setWingsAmount(0);
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(76,28,140,0.2) 100%)',
            border: '1px solid rgba(255, 176, 0, 0.3)',
            borderRadius: '16px',
            padding: '2rem',
            width: '90%',
            maxWidth: '600px',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #4C1C8C 0%, #FFB000 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '1.5rem'
              }}>
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h3 style={{color: 'white', margin: 0}}>{selectedUser.name}</h3>
                <p style={{color: '#9E9E9E', margin: '0.5rem 0'}}>{selectedUser.email}</p>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  background: selectedUser.tier === 'platinum' ? 'rgba(155, 89, 182, 0.2)' : 
                             selectedUser.tier === 'gold' ? 'rgba(241, 196, 15, 0.2)' : 
                             selectedUser.tier === 'silver' ? 'rgba(149, 165, 166, 0.2)' : 'rgba(230, 126, 34, 0.2)',
                  color: selectedUser.tier === 'platinum' ? '#9B59B6' : 
                         selectedUser.tier === 'gold' ? '#F1C40F' : 
                         selectedUser.tier === 'silver' ? '#95A5A6' : '#E67E22'
                }}>
                  {selectedUser.tier.toUpperCase()} TIER
                </span>
              </div>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem'}}>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: '700', color: '#FFB000'}}>{selectedUser.wings}</div>
                <div style={{color: '#9E9E9E', fontSize: '0.9rem'}}>Total WINGS</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: '700', color: '#FFB000'}}>{selectedUser.items}</div>
                <div style={{color: '#9E9E9E', fontSize: '0.9rem'}}>Items Collected</div>
              </div>
              <div style={{textAlign: 'center'}}>
                <div style={{fontSize: '2rem', fontWeight: '700', color: '#FFB000'}}>{selectedUser.totalScans || 0}</div>
                <div style={{color: '#9E9E9E', fontSize: '0.9rem'}}>Total Scans</div>
              </div>
            </div>
            
            <div style={{marginBottom: '2rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                <span style={{color: '#9E9E9E'}}>Join Date:</span>
                <span style={{color: 'white'}}>{selectedUser.joinDate || 'N/A'}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                <span style={{color: '#9E9E9E'}}>Last Scan:</span>
                <span style={{color: 'white'}}>{selectedUser.lastScan || 'N/A'}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: '#9E9E9E'}}>Status:</span>
                <span style={{
                  color: selectedUser.status === 'active' ? '#2ecc40' : '#e74c3c',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>{selectedUser.status}</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowUserDetailsModal(false)}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && !isDesktop && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 30
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminScreen; 