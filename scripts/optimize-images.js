#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🖼️  Image Optimization Script for Monarch Passport MVP');

const PUBLIC_DIR = path.join(__dirname, '../public');
const STAMPS_DIR = path.join(PUBLIC_DIR, 'Stamps');

// Check if ImageMagick is installed
function checkImageMagick() {
  try {
    execSync('convert --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.log('⚠️  ImageMagick not found. Install it for image optimization:');
    console.log('   macOS: brew install imagemagick');
    console.log('   Ubuntu: sudo apt-get install imagemagick');
    console.log('   Windows: Download from https://imagemagick.org/');
    return false;
  }
}

// Optimize a single image
function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath, ext);
  const dir = path.dirname(filePath);
  
  if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
    return;
  }

  try {
    const outputPath = path.join(dir, `${fileName}_optimized${ext}`);
    
    // Use ImageMagick to optimize
    const command = `convert "${filePath}" -strip -quality 85 -resize 512x512> "${outputPath}"`;
    execSync(command, { stdio: 'ignore' });
    
    // Compare file sizes
    const originalSize = fs.statSync(filePath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    if (optimizedSize < originalSize) {
      // Replace original with optimized
      fs.unlinkSync(filePath);
      fs.renameSync(outputPath, filePath);
      console.log(`✅ Optimized: ${path.basename(filePath)} (${savings}% smaller)`);
    } else {
      // Remove optimized file if it's larger
      fs.unlinkSync(outputPath);
      console.log(`ℹ️  Skipped: ${path.basename(filePath)} (already optimized)`);
    }
  } catch (error) {
    console.log(`❌ Error optimizing ${path.basename(filePath)}:`, error.message);
  }
}

// Process all images in a directory recursively
function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (stat.isFile()) {
      optimizeImage(itemPath);
    }
  });
}

// Generate WebP versions of images
function generateWebP(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    return;
  }

  try {
    const fileName = path.basename(filePath, ext);
    const dir = path.dirname(filePath);
    const webpPath = path.join(dir, `${fileName}.webp`);
    
    // Convert to WebP
    const command = `convert "${filePath}" -quality 85 "${webpPath}"`;
    execSync(command, { stdio: 'ignore' });
    
    console.log(`✅ Generated WebP: ${path.basename(webpPath)}`);
  } catch (error) {
    console.log(`❌ Error generating WebP for ${path.basename(filePath)}:`, error.message);
  }
}

// Main optimization process
function main() {
  console.log('🔍 Starting image optimization...\n');
  
  if (!checkImageMagick()) {
    console.log('📋 Manual optimization steps:');
    console.log('1. Compress all images to 85% quality');
    console.log('2. Resize large images to max 512px');
    console.log('3. Convert to WebP format where possible');
    console.log('4. Remove EXIF data');
    return;
  }

  // Optimize stamps directory
  console.log('📁 Processing Stamps directory...');
  processDirectory(STAMPS_DIR);
  
  // Generate WebP versions
  console.log('\n🔄 Generating WebP versions...');
  if (fs.existsSync(STAMPS_DIR)) {
    const items = fs.readdirSync(STAMPS_DIR);
    items.forEach(item => {
      const itemPath = path.join(STAMPS_DIR, item);
      if (fs.statSync(itemPath).isFile()) {
        generateWebP(itemPath);
      }
    });
  }

  console.log('\n✅ Image optimization completed!');
  console.log('💡 Consider implementing lazy loading for images in your React components.');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { optimizeImage, processDirectory, generateWebP }; 