# Admin Management Guide - Monarch Passport MVP

## Overview

This guide explains how to manage admin users in the Monarch Passport MVP using our butterfly predator theme. The admin roles are inspired by nature's most skilled hunters and protectors, perfectly matching the PapillonLabs butterfly branding.

## Admin Roles (Butterfly Predator Theme)

### 1. **🦋 Chrysalis** (`chrysalis`) - Regular User
- **Nature**: Transformation and growth stage
- **Role**: Regular user in development/transformation
- **Permissions**: Basic user permissions
- **Symbolism**: Potential for transformation into something greater

### 2. **🐝 Wasp** (`wasp`) - Moderator
- **Nature**: Aggressive protector and defender
- **Role**: Content moderator with defensive capabilities
- **Permissions**: 
  - View all profiles
  - Moderate content
  - View reports and analytics
  - Manage rewards
  - **Sting violations** (take action against violations)
- **Symbolism**: Aggressive protection and defense of the community

### 3. **🦗 Mantis** (`mantis`) - Admin
- **Nature**: Skilled hunter and manager
- **Role**: System administrator with hunting precision
- **Permissions**: 
  - All wasp permissions
  - Manage users and roles
  - View all data and security logs
  - Manage system settings
  - **Praying strike** (execute critical actions)
- **Symbolism**: Skilled hunting and precise management

### 4. **🐉 Dragonfly** (`dragonfly`) - Super Admin
- **Nature**: Apex predator, master of all domains
- **Role**: Ultimate authority with complete control
- **Permissions**: 
  - All mantis permissions
  - Manage other admins
  - System configuration
  - Security audits
  - Data export
  - **Apex command** (ultimate authority)
- **Symbolism**: Master of air, water, and land - complete dominion

## How to Make a User Admin

### Method 1: Command Line Script (Recommended)

Use the provided command-line script with butterfly-themed commands:

```bash
# Make a user a mantis (admin)
node scripts/make-admin.js <userId> mantis

# Make a user a dragonfly (super admin)
node scripts/make-admin.js <userId> dragonfly

# Make a user a wasp (moderator)
node scripts/make-admin.js <userId> wasp

# Make a user a chrysalis (regular user)
node scripts/make-admin.js <userId> chrysalis
```

#### Examples:
```bash
# Make user-123 a mantis (admin)
node scripts/make-admin.js user-123 mantis

# Make user-456 a dragonfly (super admin)
node scripts/make-admin.js user-456 dragonfly

# Make user-789 a wasp (moderator)
node scripts/make-admin.js user-789 wasp

# Transform user-123 back to chrysalis (regular user)
node scripts/make-admin.js user-123 chrysalis
```

### Method 2: JavaScript/React Code

Use the admin management utilities with butterfly-themed functions:

```javascript
import { adminManager, quickAdmin } from '../utils/adminManager';

// Make a user mantis (admin)
const result = await adminManager.makeAdmin('user-123', 'mantis');
if (result.success) {
  console.log('User is now a skilled mantis hunter!');
}

// Quick butterfly-themed functions
await quickAdmin.mantis('user-123');        // Make mantis (admin)
await quickAdmin.dragonfly('user-456');     // Make dragonfly (super admin)
await quickAdmin.wasp('user-789');          // Make wasp (moderator)
await quickAdmin.remove('user-123');        // Transform to chrysalis

// Check admin status
const status = quickAdmin.check('user-123');
console.log('Is Mantis:', status.isAdmin);
console.log('Is Dragonfly:', status.isSuperAdmin);
```

### Method 3: Admin Panel Component

Add the AdminUserManager component to your admin panel for visual management:

```javascript
import AdminUserManager from '../components/AdminUserManager';

// In your admin screen
{activeTab === 'admin-management' && <AdminUserManager />}
```

## Admin Management Functions

### Core Functions

```javascript
// Make a user mantis (admin)
adminManager.makeAdmin(userId, 'mantis')

// Make a user dragonfly (super admin)
adminManager.makeSuperAdmin(userId)

// Make a user wasp (moderator)
adminManager.makeModerator(userId)

// Transform to chrysalis (remove admin)
adminManager.removeAdmin(userId)

// Check admin status
adminManager.checkAdminStatus(userId)

// Get all admins
adminManager.getAllAdmins()

// Get admin statistics
adminManager.getAdminStats()
```

### Quick Functions

```javascript
// Quick butterfly-themed admin management
quickAdmin.mantis(userId)      // Make mantis (admin)
quickAdmin.dragonfly(userId)   // Make dragonfly (super admin)
quickAdmin.wasp(userId)        // Make wasp (moderator)
quickAdmin.remove(userId)      // Transform to chrysalis
quickAdmin.check(userId)       // Check status
quickAdmin.list()              // List all admins
```

## Admin Permissions by Role

### 🦋 Chrysalis (User) Permissions
- `chrysalis:profile:view` - View own profile
- `chrysalis:profile:edit` - Edit own profile
- `chrysalis:qr:scan` - Scan QR codes
- `chrysalis:rewards:view` - View own rewards
- `chrysalis:stamps:view` - View own stamps
- `chrysalis:avatar:upload` - Upload avatar
- `chrysalis:activity:view` - View own activity

### 🐝 Wasp (Moderator) Permissions
- `wasp:profiles:view` - View all profiles
- `wasp:content:moderate` - Moderate content
- `wasp:reports:view` - View reports
- `wasp:rewards:manage` - Manage rewards
- `wasp:analytics:view` - View analytics
- `wasp:violations:sting` - Take action against violations

### 🦗 Mantis (Admin) Permissions
- `mantis:users:manage` - Manage users
- `mantis:roles:manage` - Manage roles
- `mantis:data:view` - View all data
- `mantis:system:manage` - Manage system
- `mantis:security:view` - View security logs
- `mantis:rewards:manage` - Manage rewards
- `mantis:content:manage` - Manage content
- `mantis:panel:view` - Access admin panel
- `mantis:strike:execute` - Execute critical actions

### 🐉 Dragonfly (Super Admin) Permissions
- `dragonfly:all` - All permissions
- `dragonfly:admins:manage` - Manage other admins
- `dragonfly:config:manage` - System configuration
- `dragonfly:security:audit` - Security audits
- `dragonfly:data:export` - Data export
- `dragonfly:command:apex` - Ultimate authority

## Role Hierarchy

The admin roles follow a natural predator hierarchy:

```
🐉 Dragonfly (Super Admin)
    ↓ inherits from
🦗 Mantis (Admin)
    ↓ inherits from
🐝 Wasp (Moderator)
    ↓ inherits from
🦋 Chrysalis (User)
```

Each higher role inherits all permissions from lower roles, plus their own specialized abilities.

## Security Features

### Admin Action Logging
All admin actions are automatically logged with butterfly-themed tracking:

```javascript
// Admin actions are tracked with predator themes
enhancedSecurity.trackSuspiciousActivity('system', 'mantis_strike_executed', {
  targetUserId: userId,
  action: 'critical_system_change',
  executedBy: 'mantis_admin'
});
```

### Input Validation
All user IDs are validated before processing:

```javascript
// User ID validation
const userIdValidation = validateUserId(userId);
if (!userIdValidation.success) {
  return { success: false, error: userIdValidation.error };
}
```

## Admin Dashboard Integration

### Adding Admin User Manager to Admin Panel

1. Import the component:
```javascript
import AdminUserManager from '../components/AdminUserManager';
```

2. Add to your admin navigation:
```javascript
const navItems = [
  // ... existing items
  { id: 'admin-management', icon: '🦋', label: 'Admin Management' }
];
```

3. Add to your tab content:
```javascript
{activeTab === 'admin-management' && <AdminUserManager />}
```

## Best Practices

### 1. **Use Dragonfly Sparingly**
- Only grant dragonfly status to trusted team members
- Dragonflies can manage other admins
- Use mantis for most administrative tasks

### 2. **Regular Role Reviews**
- Periodically review admin roles
- Transform inactive admins back to chrysalis
- Monitor admin activity through security logs

### 3. **Secure Admin Creation**
- Always validate user IDs
- Log all admin role transformations
- Use the provided utilities for consistency

### 4. **Environment-Specific Admin Setup**
```javascript
// Development environment
if (process.env.NODE_ENV === 'development') {
  // Auto-create test dragonfly
  await adminManager.makeAdmin('test-dragonfly', 'dragonfly');
}
```

## Troubleshooting

### Common Issues

1. **"Invalid user ID" Error**
   - Ensure user ID format is correct
   - Use UUID format or test format (test-user-123)

2. **"Permission denied" Error**
   - Check if current user has mantis or higher privileges
   - Ensure proper role hierarchy

3. **Admin not showing in list**
   - Refresh the admin list
   - Check if user exists in the system
   - Verify role transformation was successful

### Debug Commands

```bash
# Check admin status
node scripts/make-admin.js <userId> check

# List all admins
node scripts/make-admin.js --list

# Show admin statistics
node scripts/make-admin.js --stats
```

## Security Considerations

### 1. **Admin Access Control**
- Limit dragonfly access to necessary personnel
- Use role-based permissions
- Regular access reviews

### 2. **Audit Logging**
- All admin actions are logged
- Monitor for suspicious activity
- Regular security audits

### 3. **Session Management**
- Admin sessions have enhanced security
- Automatic session cleanup
- Secure session validation

### 4. **Input Validation**
- All inputs are validated and sanitized
- Protection against injection attacks
- Secure role assignment

## Examples

### Complete Admin Setup Example

```javascript
import { adminManager } from '../utils/adminManager';

async function setupInitialAdmins() {
  try {
    // Make primary user dragonfly (super admin)
    await adminManager.makeSuperAdmin('primary-user-id');
    
    // Make secondary user mantis (admin)
    await adminManager.makeAdmin('secondary-user-id', 'mantis');
    
    // Make content wasp (moderator)
    await adminManager.makeModerator('moderator-user-id');
    
    console.log('✅ Initial admin setup complete');
    
    // Show admin statistics
    const stats = adminManager.getAdminStats();
    console.log('📊 Admin Stats:', stats);
    
  } catch (error) {
    console.error('❌ Admin setup failed:', error);
  }
}
```

### Admin Management in React Component

```javascript
import React, { useState } from 'react';
import { adminManager } from '../utils/adminManager';

function AdminManagement() {
  const [userId, setUserId] = useState('');
  const [adminType, setAdminType] = useState('mantis');
  const [message, setMessage] = useState('');

  const handleMakeAdmin = async () => {
    const result = await adminManager.makeAdmin(userId, adminType);
    setMessage(result.success ? '✅ Success!' : `❌ Error: ${result.error}`);
  };

  return (
    <div>
      <input 
        value={userId} 
        onChange={(e) => setUserId(e.target.value)}
        placeholder="User ID"
      />
      <select value={adminType} onChange={(e) => setAdminType(e.target.value)}>
        <option value="mantis">🦗 Mantis (Admin)</option>
        <option value="dragonfly">🐉 Dragonfly (Super Admin)</option>
        <option value="wasp">🐝 Wasp (Moderator)</option>
      </select>
      <button onClick={handleMakeAdmin}>Transform User</button>
      {message && <div>{message}</div>}
    </div>
  );
}
```

## Conclusion

The butterfly predator-themed admin management system provides secure, flexible, and thematically consistent tools for managing user roles in the Monarch Passport MVP. The natural hierarchy of chrysalis → wasp → mantis → dragonfly creates an intuitive and memorable system that perfectly matches the PapillonLabs butterfly branding.

Use the command-line script for quick admin management, or integrate the admin management utilities into your application for programmatic control. The system includes comprehensive security features to protect against unauthorized access and maintain audit trails.

Remember: Just as in nature, each predator has its role - use them wisely to protect and nurture your Monarch Passport community! 🦋 