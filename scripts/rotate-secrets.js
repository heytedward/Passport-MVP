#!/usr/bin/env node

/**
 * Secret Rotation Script for Monarch Passport MVP
 * 
 * This script provides secure secret rotation capabilities:
 * - Generate new secure secrets
 * - Rotate encryption keys
 * - Update environment variables
 * - Backup old secrets
 * - Validate new secrets
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configuration
const SECRET_TYPES = {
  APP_SECRET: {
    name: 'REACT_APP_SECRET_KEY',
    length: 32,
    description: 'Application secret key'
  },
  ENCRYPTION_KEY: {
    name: 'REACT_APP_ENCRYPTION_KEY',
    length: 32,
    description: 'Encryption key for QR codes and sensitive data'
  },
  JWT_SECRET: {
    name: 'REACT_APP_JWT_SECRET',
    length: 64,
    description: 'JWT secret for token signing'
  },
  BETA_PASSWORD: {
    name: 'REACT_APP_BETA_PASSWORD',
    length: 16,
    description: 'Beta access password'
  }
};

/**
 * Generate a secure random string
 */
function generateSecureSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
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
 * Write environment file
 */
function writeEnvFile(filePath, envVars) {
  try {
    const content = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Environment file updated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error writing environment file: ${error.message}`);
    return false;
  }
}

/**
 * Backup current secrets
 */
function backupSecrets(envVars) {
  try {
    const backup = {};
    
    Object.entries(SECRET_TYPES).forEach(([type, config]) => {
      if (envVars[config.name]) {
        backup[config.name] = envVars[config.name];
      }
    });
    
    if (Object.keys(backup).length > 0) {
      const backupPath = path.join(process.cwd(), 'secrets-backup.json');
      const backupData = {
        timestamp: new Date().toISOString(),
        secrets: backup
      };
      
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');
      console.log(`✅ Secrets backed up to: ${backupPath}`);
      return backupPath;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ Error backing up secrets: ${error.message}`);
    return null;
  }
}

/**
 * Rotate a specific secret
 */
function rotateSecret(envVars, secretType) {
  const config = SECRET_TYPES[secretType];
  if (!config) {
    console.error(`❌ Unknown secret type: ${secretType}`);
    return false;
  }
  
  const oldValue = envVars[config.name];
  const newValue = generateSecureSecret(config.length);
  
  console.log(`🔄 Rotating ${config.description}...`);
  console.log(`   Old: ${oldValue ? '***' + oldValue.slice(-4) : 'Not set'}`);
  console.log(`   New: ***${newValue.slice(-4)}`);
  
  envVars[config.name] = newValue;
  
  return true;
}

/**
 * Rotate all secrets
 */
function rotateAllSecrets(envVars) {
  console.log('🔄 Rotating all secrets...\n');
  
  let rotated = 0;
  
  Object.keys(SECRET_TYPES).forEach(secretType => {
    if (rotateSecret(envVars, secretType)) {
      rotated++;
    }
    console.log('');
  });
  
  console.log(`✅ Rotated ${rotated} secrets`);
  return rotated;
}

/**
 * Validate secrets
 */
function validateSecrets(envVars) {
  console.log('🔍 Validating secrets...\n');
  
  const issues = [];
  
  Object.entries(SECRET_TYPES).forEach(([type, config]) => {
    const value = envVars[config.name];
    
    if (!value) {
      issues.push(`Missing ${config.description} (${config.name})`);
    } else if (value.length < config.length) {
      issues.push(`${config.description} too short (${value.length}/${config.length})`);
    } else if (!/^[a-f0-9]+$/i.test(value)) {
      issues.push(`${config.description} contains invalid characters`);
    }
  });
  
  if (issues.length > 0) {
    console.log('❌ Secret validation issues:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    return false;
  }
  
  console.log('✅ All secrets validated successfully');
  return true;
}

/**
 * Main rotation function
 */
function main() {
  console.log('🔐 Monarch Passport MVP - Secret Rotation\n');
  
  const envPath = path.join(process.cwd(), '.env');
  const envVars = readEnvFile(envPath);
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0];
  const secretType = args[1];
  
  switch (command) {
    case 'all':
      // Backup current secrets
      const backupPath = backupSecrets(envVars);
      
      // Rotate all secrets
      const rotated = rotateAllSecrets(envVars);
      
      if (rotated > 0) {
        // Validate new secrets
        if (validateSecrets(envVars)) {
          // Write updated environment file
          if (writeEnvFile(envPath, envVars)) {
            console.log('\n✅ Secret rotation completed successfully!');
            if (backupPath) {
              console.log(`📁 Old secrets backed up to: ${backupPath}`);
            }
          } else {
            console.log('\n❌ Failed to write environment file');
            process.exit(1);
          }
        } else {
          console.log('\n❌ Secret validation failed');
          process.exit(1);
        }
      }
      break;
      
    case 'single':
      if (!secretType || !SECRET_TYPES[secretType.toUpperCase()]) {
        console.log('❌ Please specify a valid secret type:');
        Object.keys(SECRET_TYPES).forEach(type => {
          console.log(`   - ${type.toLowerCase()}`);
        });
        process.exit(1);
      }
      
      // Backup current secrets
      backupSecrets(envVars);
      
      // Rotate specific secret
      if (rotateSecret(envVars, secretType.toUpperCase())) {
        // Validate secrets
        if (validateSecrets(envVars)) {
          // Write updated environment file
          if (writeEnvFile(envPath, envVars)) {
            console.log('\n✅ Secret rotation completed successfully!');
          } else {
            console.log('\n❌ Failed to write environment file');
            process.exit(1);
          }
        } else {
          console.log('\n❌ Secret validation failed');
          process.exit(1);
        }
      }
      break;
      
    case 'validate':
      validateSecrets(envVars);
      break;
      
    case 'backup':
      const backup = backupSecrets(envVars);
      if (backup) {
        console.log('✅ Backup completed successfully');
      } else {
        console.log('❌ Backup failed');
        process.exit(1);
      }
      break;
      
    default:
      console.log('Usage: npm run security:rotate <command> [secret-type]\n');
      console.log('Commands:');
      console.log('  all                    Rotate all secrets');
      console.log('  single <secret-type>   Rotate a specific secret');
      console.log('  validate               Validate current secrets');
      console.log('  backup                 Backup current secrets\n');
      console.log('Secret types:');
      Object.keys(SECRET_TYPES).forEach(type => {
        const config = SECRET_TYPES[type];
        console.log(`  ${type.toLowerCase()}     ${config.description}`);
      });
      console.log('\nExamples:');
      console.log('  npm run security:rotate all');
      console.log('  npm run security:rotate single app_secret');
      console.log('  npm run security:rotate validate');
      console.log('  npm run security:rotate backup');
      break;
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  generateSecureSecret,
  rotateSecret,
  rotateAllSecrets,
  validateSecrets,
  backupSecrets
}; 