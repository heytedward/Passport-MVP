#!/usr/bin/env node

/**
 * Secret Backup Script for Monarch Passport MVP
 * 
 * This script provides secure backup capabilities:
 * - Backup environment variables
 * - Encrypt backup files
 * - Generate backup reports
 * - Validate backup integrity
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Backup configuration
const BACKUP_CONFIG = {
  encryptionAlgorithm: 'aes-256-gcm',
  backupDir: 'backups',
  maxBackups: 10,
  backupPrefix: 'monarch-backup'
};

/**
 * Generate backup encryption key
 */
function generateBackupKey() {
  return crypto.randomBytes(32);
}

/**
 * Encrypt backup data
 */
function encryptBackup(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(BACKUP_CONFIG.encryptionAlgorithm, key);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    algorithm: BACKUP_CONFIG.encryptionAlgorithm
  };
}

/**
 * Decrypt backup data
 */
function decryptBackup(encryptedData, key) {
  const decipher = crypto.createDecipher(BACKUP_CONFIG.encryptionAlgorithm, key);
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}

/**
 * Read environment file
 */
function readEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Environment file not found: ${filePath}`);
      return {};
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const envVars = {};
    
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error(`❌ Error reading environment file: ${error.message}`);
    return {};
  }
}

/**
 * Create backup directory
 */
function createBackupDir() {
  const backupPath = path.join(process.cwd(), BACKUP_CONFIG.backupDir);
  
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath, { recursive: true });
    console.log(`📁 Created backup directory: ${backupPath}`);
  }
  
  return backupPath;
}

/**
 * Clean old backups
 */
function cleanOldBackups(backupDir) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith(BACKUP_CONFIG.backupPrefix))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        stats: fs.statSync(path.join(backupDir, file))
      }))
      .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
    
    if (files.length > BACKUP_CONFIG.maxBackups) {
      const toDelete = files.slice(BACKUP_CONFIG.maxBackups);
      
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Deleted old backup: ${file.name}`);
      });
    }
  } catch (error) {
    console.error(`❌ Error cleaning old backups: ${error.message}`);
  }
}

/**
 * Create backup
 */
function createBackup(envVars, backupDir) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupKey = generateBackupKey();
    
    // Prepare backup data
    const backupData = {
      timestamp,
      version: '1.0',
      environment: process.env.NODE_ENV || 'development',
      secrets: {},
      configuration: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
    // Extract secrets (only sensitive data)
    const secretKeys = [
      'REACT_APP_SECRET_KEY',
      'REACT_APP_ENCRYPTION_KEY',
      'REACT_APP_JWT_SECRET',
      'REACT_APP_BETA_PASSWORD',
      'REACT_APP_SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    secretKeys.forEach(key => {
      if (envVars[key]) {
        backupData.secrets[key] = envVars[key];
      }
    });
    
    // Encrypt backup data
    const encryptedData = encryptBackup(backupData, backupKey);
    
    // Create backup file
    const backupFileName = `${BACKUP_CONFIG.backupPrefix}-${timestamp}.json`;
    const backupFilePath = path.join(backupDir, backupFileName);
    
    const backupFile = {
      metadata: {
        timestamp,
        algorithm: encryptedData.algorithm,
        version: '1.0'
      },
      data: encryptedData
    };
    
    fs.writeFileSync(backupFilePath, JSON.stringify(backupFile, null, 2), 'utf8');
    
    // Create key file (separate from backup)
    const keyFileName = `${BACKUP_CONFIG.backupPrefix}-${timestamp}.key`;
    const keyFilePath = path.join(backupDir, keyFileName);
    
    fs.writeFileSync(keyFilePath, backupKey.toString('hex'), 'utf8');
    
    console.log(`✅ Backup created: ${backupFileName}`);
    console.log(`🔑 Backup key: ${keyFileName}`);
    
    return {
      backupFile: backupFilePath,
      keyFile: keyFilePath,
      timestamp,
      key: backupKey.toString('hex')
    };
    
  } catch (error) {
    console.error(`❌ Error creating backup: ${error.message}`);
    return null;
  }
}

/**
 * Restore backup
 */
function restoreBackup(backupFile, keyFile) {
  try {
    // Read backup file
    const backupContent = fs.readFileSync(backupFile, 'utf8');
    const backupData = JSON.parse(backupContent);
    
    // Read key file
    const keyContent = fs.readFileSync(keyFile, 'utf8');
    const key = Buffer.from(keyContent, 'hex');
    
    // Decrypt backup data
    const decryptedData = decryptBackup(backupData.data, key);
    
    console.log(`📋 Backup information:`);
    console.log(`   Timestamp: ${decryptedData.timestamp}`);
    console.log(`   Environment: ${decryptedData.environment}`);
    console.log(`   Secrets: ${Object.keys(decryptedData.secrets).length}`);
    
    return decryptedData;
    
  } catch (error) {
    console.error(`❌ Error restoring backup: ${error.message}`);
    return null;
  }
}

/**
 * List available backups
 */
function listBackups(backupDir) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith(BACKUP_CONFIG.backupPrefix) && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.mtime
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime());
    
    if (files.length === 0) {
      console.log('📋 No backups found');
      return [];
    }
    
    console.log('📋 Available backups:');
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name}`);
      console.log(`      Size: ${(file.size / 1024).toFixed(2)} KB`);
      console.log(`      Created: ${file.created.toISOString()}`);
      console.log('');
    });
    
    return files;
    
  } catch (error) {
    console.error(`❌ Error listing backups: ${error.message}`);
    return [];
  }
}

/**
 * Validate backup integrity
 */
function validateBackup(backupFile, keyFile) {
  try {
    const restoredData = restoreBackup(backupFile, keyFile);
    
    if (!restoredData) {
      return false;
    }
    
    // Validate backup structure
    const requiredFields = ['timestamp', 'version', 'secrets'];
    const missingFields = requiredFields.filter(field => !restoredData[field]);
    
    if (missingFields.length > 0) {
      console.log(`❌ Backup validation failed: Missing fields: ${missingFields.join(', ')}`);
      return false;
    }
    
    // Validate secrets
    const secretCount = Object.keys(restoredData.secrets).length;
    if (secretCount === 0) {
      console.log('⚠️  Backup contains no secrets');
    } else {
      console.log(`✅ Backup contains ${secretCount} secrets`);
    }
    
    console.log('✅ Backup validation passed');
    return true;
    
  } catch (error) {
    console.error(`❌ Backup validation failed: ${error.message}`);
    return false;
  }
}

/**
 * Main backup function
 */
function main() {
  console.log('🔐 Monarch Passport MVP - Secret Backup\n');
  
  const envPath = path.join(process.cwd(), '.env');
  const envVars = readEnvFile(envPath);
  const backupDir = createBackupDir();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  const backupFile = args[1];
  const keyFile = args[2];
  
  switch (command) {
    case 'create':
      // Clean old backups
      cleanOldBackups(backupDir);
      
      // Create new backup
      const backup = createBackup(envVars, backupDir);
      
      if (backup) {
        console.log('\n✅ Backup completed successfully!');
        console.log(`📁 Backup location: ${backup.backupFile}`);
        console.log(`🔑 Key location: ${backup.keyFile}`);
        console.log('\n⚠️  IMPORTANT: Keep the key file secure!');
        console.log('   The backup is encrypted and cannot be restored without the key.');
      } else {
        console.log('\n❌ Backup failed');
        process.exit(1);
      }
      break;
      
    case 'list':
      listBackups(backupDir);
      break;
      
    case 'validate':
      if (!backupFile || !keyFile) {
        console.log('❌ Please specify backup file and key file');
        console.log('Usage: npm run security:backup validate <backup-file> <key-file>');
        process.exit(1);
      }
      
      const backupPath = path.join(backupDir, backupFile);
      const keyPath = path.join(backupDir, keyFile);
      
      if (!fs.existsSync(backupPath)) {
        console.log(`❌ Backup file not found: ${backupPath}`);
        process.exit(1);
      }
      
      if (!fs.existsSync(keyPath)) {
        console.log(`❌ Key file not found: ${keyPath}`);
        process.exit(1);
      }
      
      validateBackup(backupPath, keyPath);
      break;
      
    case 'restore':
      if (!backupFile || !keyFile) {
        console.log('❌ Please specify backup file and key file');
        console.log('Usage: npm run security:backup restore <backup-file> <key-file>');
        process.exit(1);
      }
      
      const restoreBackupPath = path.join(backupDir, backupFile);
      const restoreKeyPath = path.join(backupDir, keyFile);
      
      if (!fs.existsSync(restoreBackupPath)) {
        console.log(`❌ Backup file not found: ${restoreBackupPath}`);
        process.exit(1);
      }
      
      if (!fs.existsSync(restoreKeyPath)) {
        console.log(`❌ Key file not found: ${restoreKeyPath}`);
        process.exit(1);
      }
      
      const restoredData = restoreBackup(restoreBackupPath, restoreKeyPath);
      
      if (restoredData) {
        console.log('\n✅ Backup restored successfully!');
        console.log('📋 Restored data:');
        Object.entries(restoredData.secrets).forEach(([key, value]) => {
          console.log(`   ${key}: ***${value.slice(-4)}`);
        });
      } else {
        console.log('\n❌ Backup restoration failed');
        process.exit(1);
      }
      break;
      
    default:
      console.log('Usage: npm run security:backup <command> [options]\n');
      console.log('Commands:');
      console.log('  create                    Create a new encrypted backup');
      console.log('  list                      List available backups');
      console.log('  validate <backup> <key>   Validate backup integrity');
      console.log('  restore <backup> <key>    Restore backup data\n');
      console.log('Examples:');
      console.log('  npm run security:backup create');
      console.log('  npm run security:backup list');
      console.log('  npm run security:backup validate monarch-backup-2024-01-01.json monarch-backup-2024-01-01.key');
      console.log('  npm run security:backup restore monarch-backup-2024-01-01.json monarch-backup-2024-01-01.key');
      break;
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  validateBackup,
  encryptBackup,
  decryptBackup
}; 