import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Fallback 32-byte key for local development if environment variable is not configured
const RAW_KEY = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const KEY = crypto.scryptSync(RAW_KEY, 'farmconnect_salt', 32);

/**
 * Encrypts sensitive string using AES-256-GCM authenticated encryption
 * Returns string format: iv:authTag:encryptedData (hex encoded)
 */
export function encryptSensitive(plaintext) {
  if (!plaintext) return plaintext;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(String(plaintext), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted string
 */
export function decryptSensitive(ciphertext) {
  if (!ciphertext || typeof ciphertext !== 'string' || !ciphertext.includes(':')) {
    return ciphertext;
  }
  
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) return ciphertext;
    
    const [ivHex, authTagHex, encryptedDataHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    // Decryption failure (tampered data or wrong key)
    console.error('Decryption failed:', err.message);
    return null;
  }
}

/**
 * Masks sensitive numbers for display (e.g. Aadhaar: XXXX-XXXX-1234)
 */
export function maskSensitive(str, visibleTrailing = 4) {
  if (!str) return '';
  const clean = String(str).replace(/\D/g, '');
  if (clean.length <= visibleTrailing) return str;
  const maskedSection = 'X'.repeat(clean.length - visibleTrailing);
  const visibleSection = clean.slice(-visibleTrailing);
  return `${maskedSection}${visibleSection}`;
}
