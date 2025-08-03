#!/usr/bin/env node

// Admin Management Script - Butterfly Predator Theme
// PapillonLabs Monarch Passport MVP

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Butterfly Predator Role Constants
const ADMIN_ROLES = {
  CHRYSALIS: 'chrysalis',
  WASP: 'wasp',
  MANTIS: 'mantis',
  DRAGONFLY: 'dragonfly'
};

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
const adminManager = {
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
  }
};

// Main script execution
async function main() {
  const args = process.argv.slice(2);
  
  console.log('🦋 Monarch Passport MVP - Admin Management Script');
  console.log('🐝 Butterfly Predator Theme Admin System\n');

  // Check for environment variables
  if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.log('Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set');
    process.exit(1);
  }

  // Handle different commands
  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];

  switch (command) {
    case '--help':
    case '-h':
      showHelp();
      break;

    case '--list':
    case '-l':
      await listAdmins();
      break;

    case '--stats':
    case '-s':
      await showStats();
      break;

    case 'check':
      if (args.length < 2) {
        console.error('❌ Error: User ID required for check command');
        console.log('Usage: node scripts/make-admin.js check <userId>');
        return;
      }
      await checkStatus(args[1]);
      break;

    default:
      // Assume it's a role assignment command
      if (args.length < 2) {
        console.error('❌ Error: Role required');
        console.log('Usage: node scripts/make-admin.js <userId> <role>');
        return;
      }
      await assignRole(args[0], args[1]);
      break;
  }
}

// Helper functions
function showHelp() {
  console.log('🦋 Monarch Passport MVP - Admin Management Guide');
  console.log('🐝 Butterfly Predator Theme Commands\n');
  
  console.log('📋 Available Commands:');
  console.log('  node scripts/make-admin.js <userId> <role>     Transform user to role');
  console.log('  node scripts/make-admin.js check <userId>      Check user status');
  console.log('  node scripts/make-admin.js --list              List all admins');
  console.log('  node scripts/make-admin.js --stats             Show admin statistics');
  console.log('  node scripts/make-admin.js --help              Show this help\n');
  
  console.log('🦋 Available Roles (Butterfly Predator Theme):');
  console.log('  chrysalis  🦋 Regular User (transformation stage)');
  console.log('  wasp       🐝 Moderator (aggressive protector)');
  console.log('  mantis     🦗 Admin (skilled hunter)');
  console.log('  dragonfly  🐉 Super Admin (apex predator)\n');
  
  console.log('📝 Examples:');
  console.log('  node scripts/make-admin.js user-123 mantis');
  console.log('  node scripts/make-admin.js user-456 dragonfly');
  console.log('  node scripts/make-admin.js user-789 wasp');
  console.log('  node scripts/make-admin.js user-123 chrysalis');
  console.log('  node scripts/make-admin.js check user-123');
  console.log('  node scripts/make-admin.js --list');
  console.log('  node scripts/make-admin.js --stats\n');
  
  console.log('🔒 Security:');
  console.log('  - All admin actions are logged');
  console.log('  - User IDs must be UUID format or test format (test-*)');
  console.log('  - Role hierarchy: chrysalis → wasp → mantis → dragonfly');
}

async function assignRole(userId, role) {
  console.log(`🔄 Transforming user ${userId} to ${role}...`);
  
  const result = await adminManager.makeAdmin(userId, role);
  
  if (result.success) {
    const roleDisplay = result.roleDisplay;
    console.log(`✅ Success! User transformed into ${roleDisplay.emoji} ${roleDisplay.name}`);
    console.log(`📝 Description: ${roleDisplay.description}`);
  } else {
    console.error(`❌ Error: ${result.error}`);
  }
}

async function checkStatus(userId) {
  console.log(`🔍 Checking status for user ${userId}...`);
  
  const result = await adminManager.checkAdminStatus(userId);
  
  if (result.success) {
    const roleDisplay = result.roleDisplay;
    console.log(`\n📊 User Status:`);
    console.log(`  User ID: ${result.userId}`);
    console.log(`  Role: ${roleDisplay.emoji} ${roleDisplay.name} (${roleDisplay.description})`);
    console.log(`  Email: ${result.userInfo.email || 'N/A'}`);
    console.log(`  Name: ${result.userInfo.fullName || result.userInfo.username || 'N/A'}`);
    console.log(`  Is Admin: ${result.isAdmin ? 'Yes' : 'No'}`);
    console.log(`  Is Moderator: ${result.isModerator ? 'Yes' : 'No'}`);
    console.log(`  Is Super Admin: ${result.isSuperAdmin ? 'Yes' : 'No'}`);
  } else {
    console.error(`❌ Error: ${result.error}`);
  }
}

async function listAdmins() {
  console.log('📋 Fetching all admins...');
  
  const result = await adminManager.getAllAdmins();
  
  if (result.success) {
    if (result.admins.length === 0) {
      console.log('🦋 No admins found. All users are chrysalis (regular users).');
      return;
    }
    
    console.log(`\n📊 Found ${result.admins.length} admin(s):\n`);
    
    result.admins.forEach((admin, index) => {
      const roleDisplay = admin.roleDisplay;
      console.log(`${index + 1}. ${roleDisplay.emoji} ${roleDisplay.name} (${roleDisplay.description})`);
      console.log(`   User ID: ${admin.id}`);
      console.log(`   Email: ${admin.email || 'N/A'}`);
      console.log(`   Name: ${admin.fullName || admin.username || 'N/A'}`);
      console.log(`   Created: ${new Date(admin.created_at).toLocaleDateString()}`);
      console.log('');
    });
  } else {
    console.error(`❌ Error: ${result.error}`);
  }
}

async function showStats() {
  console.log('📊 Fetching admin statistics...');
  
  const result = await adminManager.getAdminStats();
  
  if (result.success) {
    const stats = result.stats;
    console.log('\n📈 Admin Statistics:\n');
    console.log(`🦋 Chrysalis (Regular Users): ${stats.chrysalis}`);
    console.log(`🐝 Wasp (Moderators): ${stats.wasp}`);
    console.log(`🦗 Mantis (Admins): ${stats.mantis}`);
    console.log(`🐉 Dragonfly (Super Admins): ${stats.dragonfly}`);
    console.log(`📊 Total Users: ${stats.total}`);
    console.log(`👑 Total Admins: ${stats.wasp + stats.mantis + stats.dragonfly}`);
  } else {
    console.error(`❌ Error: ${result.error}`);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script error:', error);
    process.exit(1);
  });
}

module.exports = { adminManager, ADMIN_ROLES, ROLE_DISPLAY }; 