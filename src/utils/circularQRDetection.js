// Circular QR Detection Utilities
// This module contains functions for detecting and decoding circular QR codes

// Helper function to get pixel brightness
const getPixelBrightness = (data, x, y, width) => {
  const index = (y * width + x) * 4;
  const r = data[index] || 0;
  const g = data[index + 1] || 0;
  const b = data[index + 2] || 0;
  return (r + g + b) / 3;
};

// Detect anchor points for circular QR
const detectCircularAnchors = (imageData) => {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  
  const darkSpots = [];
  const threshold = 120;
  const stepSize = Math.max(2, Math.floor(Math.min(width, height) / 150));
  
  // Scan for dark regions that could be anchor points
  for (let y = 15; y < height - 15; y += stepSize) {
    for (let x = 15; x < width - 15; x += stepSize) {
      const brightness = getPixelBrightness(data, x, y, width);
      
      if (brightness < threshold) {
        let darkCount = 0;
        let totalCount = 0;
        
        // Check surrounding area for anchor pattern
        for (let dy = -4; dy <= 4; dy += 1) {
          for (let dx = -4; dx <= 4; dx += 1) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const neighborBrightness = getPixelBrightness(data, nx, ny, width);
              totalCount++;
              if (neighborBrightness < threshold) darkCount++;
            }
          }
        }
        
        // If this looks like a solid dark spot (potential anchor)
        if (totalCount > 0 && (darkCount / totalCount) > 0.6) {
          darkSpots.push({
            x: x,
            y: y,
            brightness: brightness,
            confidence: darkCount / totalCount
          });
        }
      }
    }
  }
  
  // Filter and cluster dark spots to find actual anchors
  if (darkSpots.length < 4) return null;
  
  // Sort by confidence and take best candidates
  const sortedSpots = darkSpots.sort((a, b) => b.confidence - a.confidence);
  const topSpots = sortedSpots.slice(0, Math.min(12, sortedSpots.length));
  
  // Try to find circular pattern - look for spots that form a circle
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Group spots by distance from center
  const radiusGroups = {};
  
  topSpots.forEach(spot => {
    const distance = Math.sqrt(Math.pow(spot.x - centerX, 2) + Math.pow(spot.y - centerY, 2));
    const radiusKey = Math.round(distance / 10) * 10; // Group by ~10px radius
    
    if (!radiusGroups[radiusKey]) {
      radiusGroups[radiusKey] = [];
    }
    radiusGroups[radiusKey].push({ ...spot, distance });
  });
  
  // Find the radius group with most spots (likely the anchor ring)
  let bestRadius = 0;
  let maxSpots = 0;
  
  Object.keys(radiusGroups).forEach(radius => {
    if (radiusGroups[radius].length > maxSpots) {
      maxSpots = radiusGroups[radius].length;
      bestRadius = parseInt(radius);
    }
  });
  
  if (maxSpots < 4) return null;
  
  const anchorSpots = radiusGroups[bestRadius];
  const avgRadius = anchorSpots.reduce((sum, spot) => sum + spot.distance, 0) / anchorSpots.length;
  
  // Return anchor information
  return anchorSpots.slice(0, 8).map(spot => ({
    ...spot,
    centerX,
    centerY,
    radius: avgRadius
  }));
};

// Extract data from circular QR rings
const extractCircularData = (imageData, anchors) => {
  const centerX = anchors[0].centerX;
  const centerY = anchors[0].centerY;
  const anchorRadius = anchors[0].radius;
  
  // Calculate ring radii based on anchor radius
  const outerDataRadius = anchorRadius * 0.75;
  const middleDataRadius = anchorRadius * 0.58;
  const innerDataRadius = anchorRadius * 0.42;
  
  let binaryString = '';
  const threshold = 128;
  
  // Inner ring: 8 segments (bits 0-7)
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45) * (Math.PI / 180);
    let darkPixels = 0;
    let totalPixels = 0;
    
    // Sample multiple points in this segment
    for (let radiusOffset = -8; radiusOffset <= 8; radiusOffset += 3) {
      for (let angleOffset = -20; angleOffset <= 20; angleOffset += 5) {
        const sampleAngle = angle + (angleOffset * Math.PI / 180);
        const sampleRadius = innerDataRadius + radiusOffset;
        const x = Math.round(centerX + Math.cos(sampleAngle) * sampleRadius);
        const y = Math.round(centerY + Math.sin(sampleAngle) * sampleRadius);
        
        if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
          const brightness = getPixelBrightness(imageData.data, x, y, imageData.width);
          totalPixels++;
          if (brightness < threshold) darkPixels++;
        }
      }
    }
    
    const bit = (totalPixels > 0 && (darkPixels / totalPixels) > 0.4) ? '1' : '0';
    binaryString += bit;
  }
  
  // Middle ring: 16 segments (bits 8-23)
  for (let i = 0; i < 16; i++) {
    const angle = (i * 22.5) * (Math.PI / 180);
    let darkPixels = 0;
    let totalPixels = 0;
    
    for (let radiusOffset = -6; radiusOffset <= 6; radiusOffset += 2) {
      for (let angleOffset = -10; angleOffset <= 10; angleOffset += 3) {
        const sampleAngle = angle + (angleOffset * Math.PI / 180);
        const sampleRadius = middleDataRadius + radiusOffset;
        const x = Math.round(centerX + Math.cos(sampleAngle) * sampleRadius);
        const y = Math.round(centerY + Math.sin(sampleAngle) * sampleRadius);
        
        if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
          const brightness = getPixelBrightness(imageData.data, x, y, imageData.width);
          totalPixels++;
          if (brightness < threshold) darkPixels++;
        }
      }
    }
    
    const bit = (totalPixels > 0 && (darkPixels / totalPixels) > 0.4) ? '1' : '0';
    binaryString += bit;
  }
  
  // Outer ring: 24 segments (bits 24-47)
  for (let i = 0; i < 24; i++) {
    const angle = (i * 15) * (Math.PI / 180);
    let darkPixels = 0;
    let totalPixels = 0;
    
    for (let radiusOffset = -5; radiusOffset <= 5; radiusOffset += 2) {
      for (let angleOffset = -6; angleOffset <= 6; angleOffset += 2) {
        const sampleAngle = angle + (angleOffset * Math.PI / 180);
        const sampleRadius = outerDataRadius + radiusOffset;
        const x = Math.round(centerX + Math.cos(sampleAngle) * sampleRadius);
        const y = Math.round(centerY + Math.sin(sampleAngle) * sampleRadius);
        
        if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
          const brightness = getPixelBrightness(imageData.data, x, y, imageData.width);
          totalPixels++;
          if (brightness < threshold) darkPixels++;
        }
      }
    }
    
    const bit = (totalPixels > 0 && (darkPixels / totalPixels) > 0.4) ? '1' : '0';
    binaryString += bit;
  }
  
  return binaryString.length === 48 ? binaryString : null;
};

// Validate circular QR checksum
const validateCircularChecksum = (dataBits, checksumBits) => {
  let calculatedChecksum = 0;
  
  // Calculate XOR checksum of data bits
  for (let i = 0; i < dataBits.length; i += 8) {
    const byte = parseInt(dataBits.substr(i, 8), 2) || 0;
    calculatedChecksum ^= byte;
  }
  
  const providedChecksum = parseInt(checksumBits, 2);
  return calculatedChecksum === providedChecksum;
};

// Convert binary data to text
const binaryToText = (binaryString) => {
  let text = '';
  
  // Process in 8-bit chunks
  for (let i = 0; i < binaryString.length; i += 8) {
    const byte = binaryString.substr(i, 8);
    if (byte.length === 8) {
      const charCode = parseInt(byte, 2);
      if (charCode > 0) { // Skip null characters
        text += String.fromCharCode(charCode);
      }
    }
  }
  
  return text.trim();
};

// Main detection function
export const detectCircularQR = async (canvas, ctx) => {
  try {
    // Get image data from canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Step 1: Detect anchor points
    const anchors = detectCircularAnchors(imageData);
    if (!anchors || anchors.length < 4) {
      return null;
    }
    
    // Step 2: Extract binary data from rings
    const binaryData = extractCircularData(imageData, anchors);
    if (!binaryData || binaryData.length !== 48) {
      return null;
    }
    
    // Step 3: Validate checksum
    const dataBits = binaryData.substring(0, 40);
    const checksumBits = binaryData.substring(40, 48);
    
    if (!validateCircularChecksum(dataBits, checksumBits)) {
      return null;
    }
    
    // Step 4: Convert to text
    const decodedText = binaryToText(dataBits);
    
    if (!decodedText || decodedText.length === 0) {
      return null;
    }
    
    // Calculate confidence score
    const confidence = anchors.reduce((sum, anchor) => sum + anchor.confidence, 0) / anchors.length;
    
    return {
      text: decodedText,
      type: 'circular',
      confidence: confidence,
      anchors: anchors.length,
      binaryData: binaryData
    };
    
  } catch (error) {
    console.warn('Circular QR detection error:', error);
    return null;
  }
};

// Export additional utilities for testing
export {
  getPixelBrightness,
  detectCircularAnchors,
  extractCircularData,
  validateCircularChecksum,
  binaryToText
}; 