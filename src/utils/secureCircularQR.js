// Secure Circular QR Utilities
export const PAPILLON_SECRET = 'PAPILLON_SECRET_2025'; // Move to env in production

// Cryptographic functions
export const generateSecureNonce = () => {
  return Math.random().toString(36).substring(2, 8);
};

export const simpleHash = (data) => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 4);
};

export const xorEncrypt = (text, key) => {
  return text.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
};

export const xorDecrypt = (encrypted, key) => {
  return xorEncrypt(encrypted, key); // XOR is symmetric
};

// Validate secure circular QR on backend
export const validateSecureCircularQR = async (scannedData, userId, userToken) => {
  try {
    console.log('🔒 Validating secure circular QR:', scannedData);
    
    const response = await fetch('/api/validate-secure-qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        qrData: scannedData,
        userId: userId,
        timestamp: Date.now()
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'QR validation failed');
    }
    
    console.log('✅ Secure QR validated successfully:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Secure QR validation error:', error);
    throw error;
  }
};

// Decrypt and validate QR locally (for testing)
export const decryptCircularQR = (encryptedData) => {
  try {
    const decrypted = xorDecrypt(encryptedData, PAPILLON_SECRET);
    
    // Extract components
    const productCode = decrypted.substring(0, 5);
    const timeCode = decrypted.substring(5, 9);
    const nonce = decrypted.substring(9);
    
    // Check expiration
    const expiryTime = parseInt(timeCode, 36);
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (currentTime > expiryTime) {
      throw new Error('QR code expired');
    }
    
    return {
      productCode: productCode.replace(/\0/g, ''), // Remove null chars
      timeCode,
      nonce,
      expiryTime,
      isValid: true
    };
    
  } catch (error) {
    console.error('❌ QR decryption failed:', error);
    return { isValid: false, error: error.message };
  }
}; 