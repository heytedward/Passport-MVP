// Admin Management System - Butterfly Predator Theme
// PapillonLabs Monarch Passport MVP

import { supabase } from './supabaseClient';
import { enhancedSecurity } from './enhancedSecurity';

// Butterfly Predator Role Hierarchy
const ADMIN_ROLES = {
  CHRYSALIS: 'chrysalis',    // Regular user - transformation stage
  WASP: 'wasp',             // Moderator - aggressive protector
  MANTIS: 'mantis',         // Admin - skilled hunter
  DRAGONFLY: 'dragonfly'    // Super Admin - apex predator
};

// Role hierarchy (each inherits from lower roles)
const ROLE_HIERARCHY = {
  [ADMIN_ROLES.CHRYSALIS]: [],
  [ADMIN_ROLES.WASP]: [ADMIN_ROLES.CHRYSALIS],
  [ADMIN_ROLES.MANTIS]: [ADMIN_ROLES.WASP, ADMIN_ROLES.CHRYSALIS],
  [ADMIN_ROLES.DRAGONFLY]: [ADMIN_ROLES.MANTIS, ADMIN_ROLES.WASP, ADMIN_ROLES.CHRYSALIS]
};

// Permissions by role
const ROLE_PERMISSIONS = {
  [ADMIN_ROLES.CHRYSALIS]: [
    'chrysalis:profile:view',
    'chrysalis:profile:edit',
    'chrysalis:qr:scan',
    'chrysalis:rewards:view',
    'chrysalis:stamps:view',
    'chrysalis:avatar:upload',
    'chrysalis:activity:view'
  ],
  [ADMIN_ROLES.WASP]: [
    'wasp:profiles:view',
    'wasp:content:moderate',
    'wasp:reports:view',
    'wasp:rewards:manage',
    'wasp:analytics:view',
    'wasp:violations:sting'
  ],
  [ADMIN_ROLES.MANTIS]: [
    'mantis:users:manage',
    'mantis:roles:manage',
    'mantis:data:view',
    'mantis:system:manage',
    'mantis:security:view',
    'mantis:rewards:manage',
    'mantis:content:manage',
    'mantis:panel:view',
    'mantis:strike:execute'
  ],
  [ADMIN_ROLES.DRAGONFLY]: [
    'dragonfly:all',
    'dragonfly:admins:manage',
    'dragonfly:config:manage',
    'dragonfly:security:audit',
    'dragonfly:data:export',
    'dragonfly:command:apex'
  ]
};

// Role display names and emojis
const ROLE_DISPLAY = {
  [ADMIN_ROLES.CHRYSALIS]: { name: 'Chrysalis', emoji: '🦋', description: 'Regular User' },
  [ADMIN_ROLES.WASP]: { name: 'Wasp', emoji: '🐝', description: 'Moderator' },
  [ADMIN_ROLES.MANTIS]: { name: 'Mantis', emoji: '🦗', description: 'Admin' },
  [ADMIN_ROLES.DRAGONFLY]: { name: 'Dragonfly', emoji: '🐉', description: 'Super Admin' }
};

// Input validation
const validateUserId = (userId) => {
  if (!userId || typeof userId !== 'string') {
    return { success: false, error: 'Invalid user ID format' };
  }
  
  // Allow UUID format or test format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const testRegex = /^test-.*$/;
  
  if (!uuidRegex.test(userId) && !testRegex.test(userId)) {
    return { success: false, error: 'User ID must be UUID format or test format (test-*)' };
  }
  
  return { success: true };
};

const validateRole = (role) => {
  if (!Object.values(ADMIN_ROLES).includes(role)) {
    return { success: false, error: `Invalid role. Must be one of: ${Object.values(ADMIN_ROLES).join(', ')}` };
  }
  return { success: true };
};

// Core admin management functions
export const adminManager = {
  // Make a user an admin with specified role
  async makeAdmin(userId, role) {
    try {
      // Validate inputs
      const userIdValidation = validateUserId(userId);
      if (!userIdValidation.success) {
        return { success: false, error: userIdValidation.error };
      }

      const roleValidation = validateRole(role);
      if (!roleValidation.success) {
        return { success: false, error: roleValidation.error };
      }

      // Update user role in database
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        console.error('Database error:', error);
        return { success: false, error: 'Failed to update user role' };
      }

      // Log admin action
      enhancedSecurity.trackSuspiciousActivity('system', `${role}_transformation`, {
        targetUserId: userId,
        newRole: role,
        action: 'role_assignment'
      });

      const roleDisplay = ROLE_DISPLAY[role];
      console.log(`✅ User ${userId} transformed into ${roleDisplay.emoji} ${roleDisplay.name} (${roleDisplay.description})`);

      return { 
        success: true, 
        message: `User successfully transformed into ${roleDisplay.emoji} ${roleDisplay.name}`,
        role,
        roleDisplay
      };

    } catch (error) {
      console.error('Admin assignment error:', error);
      return { success: false, error: error.message };
    }
  },

  // Make a user super admin (dragonfly)
  async makeSuperAdmin(userId) {
    return this.makeAdmin(userId, ADMIN_ROLES.DRAGONFLY);
  },

  // Make a user moderator (wasp)
  async makeModerator(userId) {
    return this.makeAdmin(userId, ADMIN_ROLES.WASP);
  },

  // Remove admin status (transform to chrysalis)
  async removeAdmin(userId) {
    return this.makeAdmin(userId, ADMIN_ROLES.CHRYSALIS);
  },

  // Check admin status
  async checkAdminStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, email, full_name, username')
        .eq('id', userId)
        .single();

      if (error) {
        return { success: false, error: 'Failed to fetch user status' };
      }

      const role = data.role || ADMIN_ROLES.CHRYSALIS;
      const roleDisplay = ROLE_DISPLAY[role];

      return {
        success: true,
        userId,
        role,
        roleDisplay,
        isAdmin: role !== ADMIN_ROLES.CHRYSALIS,
        isModerator: role === ADMIN_ROLES.WASP,
        isSuperAdmin: role === ADMIN_ROLES.DRAGONFLY,
        userInfo: {
          email: data.email,
          fullName: data.full_name,
          username: data.username
        }
      };

    } catch (error) {
      console.error('Status check error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all admins
  async getAllAdmins() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, role, email, full_name, username, created_at')
        .neq('role', ADMIN_ROLES.CHRYSALIS)
        .order('role', { ascending: false });

      if (error) {
        return { success: false, error: 'Failed to fetch admins' };
      }

      const admins = data.map(user => ({
        ...user,
        roleDisplay: ROLE_DISPLAY[user.role || ADMIN_ROLES.CHRYSALIS]
      }));

      return { success: true, admins };

    } catch (error) {
      console.error('Get admins error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get admin statistics
  async getAdminStats() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role');

      if (error) {
        return { success: false, error: 'Failed to fetch admin stats' };
      }

      const stats = {
        total: data.length,
        chrysalis: 0,
        wasp: 0,
        mantis: 0,
        dragonfly: 0
      };

      data.forEach(user => {
        const role = user.role || ADMIN_ROLES.CHRYSALIS;
        stats[role]++;
      });

      return { success: true, stats };

    } catch (error) {
      console.error('Admin stats error:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if user has permission
  hasPermission(userRole, permission) {
    const userPermissions = this.getUserPermissions(userRole);
    return userPermissions.includes(permission) || userPermissions.includes('dragonfly:all');
  },

  // Get all permissions for a role (including inherited)
  getUserPermissions(role) {
    const permissions = new Set();
    
    // Add direct permissions
    const directPermissions = ROLE_PERMISSIONS[role] || [];
    directPermissions.forEach(perm => permissions.add(perm));
    
    // Add inherited permissions
    const inheritedRoles = ROLE_HIERARCHY[role] || [];
    inheritedRoles.forEach(inheritedRole => {
      const inheritedPermissions = ROLE_PERMISSIONS[inheritedRole] || [];
      inheritedPermissions.forEach(perm => permissions.add(perm));
    });
    
    return Array.from(permissions);
  },

  // Get role hierarchy
  getRoleHierarchy() {
    return ROLE_HIERARCHY;
  },

  // Get role display info
  getRoleDisplay(role) {
    return ROLE_DISPLAY[role] || ROLE_DISPLAY[ADMIN_ROLES.CHRYSALIS];
  },

  // Get all roles
  getRoles() {
    return ADMIN_ROLES;
  }
};

// Quick admin functions with butterfly theme
export const quickAdmin = {
  // Transform to mantis (admin)
  async mantis(userId) {
    return adminManager.makeAdmin(userId, ADMIN_ROLES.MANTIS);
  },

  // Transform to dragonfly (super admin)
  async dragonfly(userId) {
    return adminManager.makeAdmin(userId, ADMIN_ROLES.DRAGONFLY);
  },

  // Transform to wasp (moderator)
  async wasp(userId) {
    return adminManager.makeAdmin(userId, ADMIN_ROLES.WASP);
  },

  // Transform to chrysalis (remove admin)
  async remove(userId) {
    return adminManager.makeAdmin(userId, ADMIN_ROLES.CHRYSALIS);
  },

  // Check status
  async check(userId) {
    return adminManager.checkAdminStatus(userId);
  },

  // List all admins
  async list() {
    return adminManager.getAllAdmins();
  },

  // Get stats
  async stats() {
    return adminManager.getAdminStats();
  }
};

// Permission checking utilities
export const hasPermission = (userRole, permission) => {
  return adminManager.hasPermission(userRole, permission);
};

export const getUserPermissions = (userRole) => {
  return adminManager.getUserPermissions(userRole);
};

// Role checking utilities
export const isAdmin = (role) => role && role !== ADMIN_ROLES.CHRYSALIS;
export const isModerator = (role) => role === ADMIN_ROLES.WASP || isAdmin(role);
export const isSuperAdmin = (role) => role === ADMIN_ROLES.DRAGONFLY;

// Export constants
export { ADMIN_ROLES, ROLE_PERMISSIONS, ROLE_DISPLAY };

export default adminManager; 