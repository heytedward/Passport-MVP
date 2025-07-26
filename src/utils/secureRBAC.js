/**
 * Secure Role-Based Access Control (RBAC) System for Monarch Passport MVP
 * 
 * This module provides secure role management and access control:
 * - User role management
 * - Permission-based routing
 * - Admin panel security
 * - Role hierarchy
 * - Access logging
 */

import { secureConfig } from './secureConfig.js';
import { validateUserId } from './inputValidation.js';

// Role definitions
const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Permission definitions
const PERMISSIONS = {
  // User permissions
  USER: {
    VIEW_OWN_PROFILE: 'user:profile:view',
    EDIT_OWN_PROFILE: 'user:profile:edit',
    SCAN_QR: 'user:qr:scan',
    VIEW_OWN_REWARDS: 'user:rewards:view',
    VIEW_OWN_STAMPS: 'user:stamps:view',
    UPLOAD_AVATAR: 'user:avatar:upload',
    VIEW_OWN_ACTIVITY: 'user:activity:view'
  },
  
  // Moderator permissions
  MODERATOR: {
    VIEW_ALL_PROFILES: 'moderator:profiles:view',
    MODERATE_CONTENT: 'moderator:content:moderate',
    VIEW_REPORTS: 'moderator:reports:view',
    MANAGE_REWARDS: 'moderator:rewards:manage',
    VIEW_ANALYTICS: 'moderator:analytics:view'
  },
  
  // Admin permissions
  ADMIN: {
    MANAGE_USERS: 'admin:users:manage',
    MANAGE_ROLES: 'admin:roles:manage',
    VIEW_ALL_DATA: 'admin:data:view',
    MANAGE_SYSTEM: 'admin:system:manage',
    VIEW_SECURITY_LOGS: 'admin:security:view',
    MANAGE_REWARDS: 'admin:rewards:manage',
    MANAGE_CONTENT: 'admin:content:manage',
    VIEW_ADMIN_PANEL: 'admin:panel:view'
  },
  
  // Super Admin permissions
  SUPER_ADMIN: {
    ALL_PERMISSIONS: 'super_admin:all',
    MANAGE_ADMINS: 'super_admin:admins:manage',
    SYSTEM_CONFIG: 'super_admin:config:manage',
    SECURITY_AUDIT: 'super_admin:security:audit',
    DATA_EXPORT: 'super_admin:data:export'
  }
};

// Role hierarchy (higher roles inherit lower role permissions)
const ROLE_HIERARCHY = {
  [ROLES.USER]: [],
  [ROLES.MODERATOR]: [ROLES.USER],
  [ROLES.ADMIN]: [ROLES.MODERATOR, ROLES.USER],
  [ROLES.SUPER_ADMIN]: [ROLES.ADMIN, ROLES.MODERATOR, ROLES.USER]
};

// Route permissions
const ROUTE_PERMISSIONS = {
  // Public routes (no authentication required)
  '/': [],
  '/login': [],
  '/register': [],
  '/forgot-password': [],
  
  // User routes
  '/home': [PERMISSIONS.USER.VIEW_OWN_PROFILE],
  '/passport': [PERMISSIONS.USER.VIEW_OWN_STAMPS],
  '/closet': [PERMISSIONS.USER.VIEW_OWN_REWARDS],
  '/profile': [PERMISSIONS.USER.VIEW_OWN_PROFILE],
  '/scan': [PERMISSIONS.USER.SCAN_QR],
  '/settings': [PERMISSIONS.USER.EDIT_OWN_PROFILE],
  
  // Moderator routes
  '/moderator': [PERMISSIONS.MODERATOR.VIEW_REPORTS],
  '/moderator/profiles': [PERMISSIONS.MODERATOR.VIEW_ALL_PROFILES],
  '/moderator/content': [PERMISSIONS.MODERATOR.MODERATE_CONTENT],
  '/moderator/analytics': [PERMISSIONS.MODERATOR.VIEW_ANALYTICS],
  
  // Admin routes
  '/admin': [PERMISSIONS.ADMIN.VIEW_ADMIN_PANEL],
  '/admin/users': [PERMISSIONS.ADMIN.MANAGE_USERS],
  '/admin/roles': [PERMISSIONS.ADMIN.MANAGE_ROLES],
  '/admin/security': [PERMISSIONS.ADMIN.VIEW_SECURITY_LOGS],
  '/admin/system': [PERMISSIONS.ADMIN.MANAGE_SYSTEM],
  '/admin/rewards': [PERMISSIONS.ADMIN.MANAGE_REWARDS],
  '/admin/content': [PERMISSIONS.ADMIN.MANAGE_CONTENT],
  
  // Super Admin routes
  '/super-admin': [PERMISSIONS.SUPER_ADMIN.ALL_PERMISSIONS],
  '/super-admin/admins': [PERMISSIONS.SUPER_ADMIN.MANAGE_ADMINS],
  '/super-admin/config': [PERMISSIONS.SUPER_ADMIN.SYSTEM_CONFIG],
  '/super-admin/audit': [PERMISSIONS.SUPER_ADMIN.SECURITY_AUDIT],
  '/super-admin/export': [PERMISSIONS.SUPER_ADMIN.DATA_EXPORT]
};

// User role cache
const userRoleCache = new Map();

// Access logging
const accessLog = [];

/**
 * Get all permissions for a role (including inherited permissions)
 */
function getRolePermissions(role) {
  if (!ROLES[role.toUpperCase()]) {
    throw new Error(`Invalid role: ${role}`);
  }
  
  const permissions = new Set();
  
  // Add direct role permissions
  if (PERMISSIONS[role.toUpperCase()]) {
    Object.values(PERMISSIONS[role.toUpperCase()]).forEach(permission => {
      permissions.add(permission);
    });
  }
  
  // Add inherited permissions
  const inheritedRoles = ROLE_HIERARCHY[role] || [];
  inheritedRoles.forEach(inheritedRole => {
    if (PERMISSIONS[inheritedRole.toUpperCase()]) {
      Object.values(PERMISSIONS[inheritedRole.toUpperCase()]).forEach(permission => {
        permissions.add(permission);
      });
    }
  });
  
  return Array.from(permissions);
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userId, permission) {
  try {
    // Validate user ID
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.success) {
      throw new Error(`Invalid user ID: ${userIdValidation.error}`);
    }
    
    // Get user role from cache or database
    const userRole = getUserRole(userId);
    if (!userRole) {
      return false;
    }
    
    // Get all permissions for the user's role
    const userPermissions = getRolePermissions(userRole);
    
    // Check if user has the required permission
    const hasAccess = userPermissions.includes(permission) || 
                     userPermissions.includes(PERMISSIONS.SUPER_ADMIN.ALL_PERMISSIONS);
    
    // Log access attempt
    logAccess(userId, permission, hasAccess);
    
    return hasAccess;
    
  } catch (error) {
    console.error('Permission check failed:', error.message);
    logAccess(userId, permission, false, error.message);
    return false;
  }
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(userId, permissions) {
  if (!Array.isArray(permissions)) {
    permissions = [permissions];
  }
  
  return permissions.some(permission => hasPermission(userId, permission));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(userId, permissions) {
  if (!Array.isArray(permissions)) {
    permissions = [permissions];
  }
  
  return permissions.every(permission => hasPermission(userId, permission));
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(userId, route) {
  try {
    // Public routes don't require authentication
    if (ROUTE_PERMISSIONS[route] && ROUTE_PERMISSIONS[route].length === 0) {
      return true;
    }
    
    // Check if route requires permissions
    const requiredPermissions = ROUTE_PERMISSIONS[route];
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Route doesn't require specific permissions
    }
    
    return hasAnyPermission(userId, requiredPermissions);
    
  } catch (error) {
    console.error('Route access check failed:', error.message);
    return false;
  }
}

/**
 * Get user role (from cache or database)
 */
function getUserRole(userId) {
  // Check cache first
  if (userRoleCache.has(userId)) {
    return userRoleCache.get(userId);
  }
  
  // In a real application, this would fetch from database
  // For now, we'll use a simple mapping
  const userRoles = {
    // Add specific user roles here
    // 'user-id-1': ROLES.ADMIN,
    // 'user-id-2': ROLES.MODERATOR,
  };
  
  const role = userRoles[userId] || ROLES.USER;
  
  // Cache the result
  userRoleCache.set(userId, role);
  
  return role;
}

/**
 * Set user role (for admin management)
 */
export function setUserRole(userId, role) {
  try {
    // Validate user ID
    const userIdValidation = validateUserId(userId);
    if (!userIdValidation.success) {
      throw new Error(`Invalid user ID: ${userIdValidation.error}`);
    }
    
    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    
    // Update cache
    userRoleCache.set(userId, role);
    
    // In a real application, this would update the database
    // await updateUserRoleInDatabase(userId, role);
    
    // Log role change
    logRoleChange(userId, role);
    
    return {
      success: true,
      message: `User role updated to ${role}`
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to update user role'
    };
  }
}

/**
 * Get all users with a specific role
 */
export function getUsersByRole(role) {
  try {
    // Validate role
    if (!Object.values(ROLES).includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }
    
    // In a real application, this would query the database
    // For now, return cached users with the specified role
    const users = [];
    
    for (const [userId, userRole] of userRoleCache.entries()) {
      if (userRole === role) {
        users.push(userId);
      }
    }
    
    return {
      success: true,
      data: users,
      message: `Found ${users.length} users with role ${role}`
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: 'Failed to get users by role'
    };
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(userId) {
  const role = getUserRole(userId);
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userId) {
  const role = getUserRole(userId);
  return role === ROLES.SUPER_ADMIN;
}

/**
 * Check if user is moderator or higher
 */
export function isModerator(userId) {
  const role = getUserRole(userId);
  return role === ROLES.MODERATOR || role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
}

/**
 * Log access attempts
 */
function logAccess(userId, permission, granted, error = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    permission,
    granted,
    error,
    ip: 'client-ip', // In real app, get from request
    userAgent: 'client-user-agent' // In real app, get from request
  };
  
  accessLog.push(logEntry);
  
  // Keep only last 1000 entries
  if (accessLog.length > 1000) {
    accessLog.splice(0, accessLog.length - 1000);
  }
  
  // Log to console in development
  if (secureConfig.get('DEBUG_MODE')) {
    console.log(`🔐 Access Log: ${granted ? '✅' : '❌'} ${userId} -> ${permission}`);
  }
}

/**
 * Log role changes
 */
function logRoleChange(userId, newRole) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    userId,
    action: 'role_change',
    newRole,
    ip: 'client-ip', // In real app, get from request
    userAgent: 'client-user-agent' // In real app, get from request
  };
  
  accessLog.push(logEntry);
  
  // Log to console in development
  if (secureConfig.get('DEBUG_MODE')) {
    console.log(`👤 Role Change: ${userId} -> ${newRole}`);
  }
}

/**
 * Get access log
 */
export function getAccessLog(limit = 100) {
  return accessLog.slice(-limit);
}

/**
 * Clear access log (for admin purposes)
 */
export function clearAccessLog() {
  accessLog.length = 0;
  return { success: true, message: 'Access log cleared' };
}

/**
 * Security audit for RBAC system
 */
export function auditRBAC() {
  const audit = {
    timestamp: new Date().toISOString(),
    totalUsers: userRoleCache.size,
    roles: Object.values(ROLES).reduce((acc, role) => {
      acc[role] = getUsersByRole(role).data.length;
      return acc;
    }, {}),
    accessLogEntries: accessLog.length,
    permissions: Object.keys(PERMISSIONS).length,
    routes: Object.keys(ROUTE_PERMISSIONS).length
  };
  
  return audit;
}

/**
 * Clear user role cache (for testing/admin purposes)
 */
export function clearRoleCache() {
  userRoleCache.clear();
  return { success: true, message: 'Role cache cleared' };
}

// Export constants for external use
export const RBAC_CONFIG = {
  ROLES,
  PERMISSIONS,
  ROLE_HIERARCHY,
  ROUTE_PERMISSIONS
};

export default {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRoute,
  setUserRole,
  getUsersByRole,
  isAdmin,
  isSuperAdmin,
  isModerator,
  getAccessLog,
  clearAccessLog,
  auditRBAC,
  clearRoleCache,
  RBAC_CONFIG
}; 