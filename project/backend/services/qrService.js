const qrCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generate QR code for booking
 * @param {Object} bookingData Booking data to encode in QR
 * @returns {Promise<String>} Data URL of QR code
 */
exports.generateQRCode = async (bookingData) => {
  try {
    // Add timestamp to prevent QR code reuse
    const timestamp = new Date().toISOString();
    
    // Create data object to encode
    const qrData = {
      ...bookingData,
      timestamp
    };
    
    // Add a digital signature for security
    const signature = generateSignature(qrData);
    qrData.signature = signature;
    
    // Generate QR code as data URL
    const dataUrl = await qrCode.toDataURL(JSON.stringify(qrData));
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Verify QR code data integrity
 * @param {Object} qrData Data extracted from QR code
 * @returns {Boolean} True if valid, false otherwise
 */
exports.verifyQRCode = (qrData) => {
  try {
    // Extract signature from data
    const { signature, ...dataWithoutSignature } = qrData;
    
    // Generate new signature from data
    const generatedSignature = generateSignature(dataWithoutSignature);
    
    // Compare signatures
    return signature === generatedSignature;
  } catch (error) {
    console.error('Error verifying QR code:', error);
    return false;
  }
};

/**
 * Generate digital signature for QR data
 * @param {Object} data Data to sign
 * @returns {String} Signature
 */
const generateSignature = (data) => {
  // Convert data to string
  const dataString = JSON.stringify(data);
  
  // Create HMAC using secret key
  const hmac = crypto.createHmac('sha256', process.env.QR_SECRET || 'qr-secret-key');
  
  // Update with data string
  hmac.update(dataString);
  
  // Return digest as hex string
  return hmac.digest('hex');
};

/**
 * Parse QR code content
 * @param {String} qrContent QR code content
 * @returns {Object|null} Parsed data or null if invalid
 */
exports.parseQRCode = (qrContent) => {
  try {
    // Parse QR content
    const data = JSON.parse(qrContent);
    
    // Verify signature
    if (!exports.verifyQRCode(data)) {
      console.error('QR code signature verification failed');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
};

/**
 * Check if QR code is expired
 * @param {Object} qrData Parsed QR data
 * @param {Number} expiryMinutes Minutes until expiry (default: 1440 = 24 hours)
 * @returns {Boolean} True if expired, false otherwise
 */
exports.isQRCodeExpired = (qrData, expiryMinutes = 1440) => {
  try {
    const timestamp = new Date(qrData.timestamp).getTime();
    const now = new Date().getTime();
    const diffMinutes = (now - timestamp) / (1000 * 60);
    
    return diffMinutes > expiryMinutes;
  } catch (error) {
    console.error('Error checking QR code expiry:', error);
    return true; // Treat as expired if there's an error
  }
};