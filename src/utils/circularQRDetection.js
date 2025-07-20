// Helper function to get pixel brightness
export const getPixelBrightness = (data, x, y, width) => {
  const index = (y * width + x) * 4;
  const r = data[index] || 0;
  const g = data[index + 1] || 0;
  const b = data[index + 2] || 0;
  return (r + g + b) / 3;
};

// Binary encoding functions
export const stringToBinary = (str) => {
  return str.split('').map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
};

export const calculateChecksum = (bits) => {
  let checksum = 0;
  for (let i = 0; i < bits.length; i += 8) {
    const byte = parseInt(bits.substr(i, 8), 2) || 0;
    checksum ^= byte;
  }
  return checksum.toString(2).padStart(8, '0');
};

export const binaryToText = (binary) => {
  if (!binary || binary.length === 0) return '';
  
  const chunks = binary.match(/.{8}/g) || [];
  let result = '';
  
  for (const chunk of chunks) {
    if (chunk.length === 8) {
      const charCode = parseInt(chunk, 2);
      if (charCode >= 32 && charCode <= 126) {
        result += String.fromCharCode(charCode);
      }
    }
  }
  
  return result.trim();
};

// Detect anchor points in circular QR
export const detectCircularAnchors = (imageData) => {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  
  const darkSpots = [];
  const threshold = 120;
  const stepSize = Math.max(2, Math.floor(Math.min(width, height) / 150));
  
  for (let y = 15; y < height - 15; y += stepSize) {
    for (let x = 15; x < width - 15; x += stepSize) {
      const brightness = getPixelBrightness(data, x, y, width);
      
      if (brightness < threshold) {
        let darkCount = 0;
        let totalCount = 0;
        
        for (let dy = -4; dy <= 4; dy += 1) {
          for (let dx = -4; dx <= 4; dx += 1) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nBrightness = getPixelBrightness(data, nx, ny, width);
              totalCount++;
              if (nBrightness < threshold) darkCount++;
            }
          }
        }
        
        const darkRatio = darkCount / totalCount;
        if (darkRatio > 0.5) {
          darkSpots.push({ x, y, confidence: darkRatio });
        }
      }
    }
  }
  
  if (darkSpots.length < 4) return null;
  
  const centerX = darkSpots.reduce((sum, spot) => sum + spot.x, 0) / darkSpots.length;
  const centerY = darkSpots.reduce((sum, spot) => sum + spot.y, 0) / darkSpots.length;
  
  const radiusGroups = {};
  darkSpots.forEach(spot => {
    const distance = Math.sqrt((spot.x - centerX) ** 2 + (spot.y - centerY) ** 2);
    const radiusKey = Math.round(distance / 20) * 20;
    
    if (!radiusGroups[radiusKey]) radiusGroups[radiusKey] = [];
    radiusGroups[radiusKey].push({ ...spot, distance });
  });
  
  let bestGroup = null;
  let bestScore = 0;
  
  for (const radius in radiusGroups) {
    const spots = radiusGroups[radius];
    
    if (spots.length >= 4 && spots.length <= 12) {
      const angles = spots.map(spot => 
        Math.atan2(spot.y - centerY, spot.x - centerX) * 180 / Math.PI
      ).sort((a, b) => a - b);
      
      let totalAngleDiff = 0;
      for (let i = 1; i < angles.length; i++) {
        totalAngleDiff += angles[i] - angles[i-1];
      }
      const avgAngleDiff = totalAngleDiff / (angles.length - 1);
      const expectedAngleDiff = 360 / spots.length;
      
      const angleDiffScore = 1 - Math.abs(avgAngleDiff - expectedAngleDiff) / expectedAngleDiff;
      const confidenceScore = spots.reduce((sum, s) => sum + s.confidence, 0) / spots.length;
      const score = angleDiffScore * confidenceScore;
      
      if (score > bestScore) {
        bestScore = score;
        bestGroup = spots;
      }
    }
  }
  
  if (!bestGroup) return null;
  
  const sortedSpots = bestGroup.sort((a, b) => {
    const angleA = Math.atan2(a.y - centerY, a.x - centerX);
    const angleB = Math.atan2(b.y - centerY, b.x - centerX);
    return angleA - angleB;
  });
  
  let finalSpots = sortedSpots.slice(0, 7);
  if (finalSpots.length < 4) return null;
  
  const avgRadius = finalSpots.reduce((sum, spot) => 
    sum + Math.sqrt((spot.x - centerX) ** 2 + (spot.y - centerY) ** 2), 0
  ) / finalSpots.length;
  
  return finalSpots.map(spot => ({
    ...spot,
    centerX,
    centerY,
    radius: avgRadius
  }));
};

// Extract data from circular QR rings
export const extractCircularData = (imageData, anchors) => {
  const centerX = anchors[0].centerX;
  const centerY = anchors[0].centerY;
  const anchorRadius = anchors[0].radius;
  
  const outerDataRadius = anchorRadius * 0.75;
  const middleDataRadius = anchorRadius * 0.58;
  const innerDataRadius = anchorRadius * 0.42;
  
  let binaryString = '';
  const threshold = 128;
  
  // Inner ring: 8 arc segments
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45) * (Math.PI / 180);
    let darkPixels = 0;
    let totalPixels = 0;
    
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
  
  // Middle ring: 16 arc segments
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
  
  // Outer ring: 24 arc segments
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

// Validate checksum
export const validateCircularChecksum = (dataBits, checksumBits) => {
  if (!dataBits || !checksumBits || dataBits.length !== 40 || checksumBits.length !== 8) {
    return false;
  }
  
  let calculatedChecksum = 0;
  for (let i = 0; i < dataBits.length; i += 8) {
    const byte = parseInt(dataBits.substr(i, 8), 2) || 0;
    calculatedChecksum ^= byte;
  }
  
  const expectedChecksum = parseInt(checksumBits, 2);
  return calculatedChecksum === expectedChecksum;
};

// Main circular QR detection function
export const detectCircularQR = async (canvas, ctx) => {
  try {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    const anchors = detectCircularAnchors(imageData);
    if (!anchors || anchors.length < 4) {
      return null;
    }
    
    const binaryData = extractCircularData(imageData, anchors);
    if (!binaryData) {
      return null;
    }
    
    const dataBits = binaryData.substring(0, 40);
    const checksumBits = binaryData.substring(40, 48);
    
    if (!validateCircularChecksum(dataBits, checksumBits)) {
      return null;
    }
    
    const decodedText = binaryToText(dataBits);
    
    return {
      text: decodedText,
      type: 'circular',
      confidence: anchors.reduce((sum, a) => sum + a.confidence, 0) / anchors.length
    };
    
  } catch (error) {
    console.warn('Circular QR detection error:', error);
    return null;
  }
};