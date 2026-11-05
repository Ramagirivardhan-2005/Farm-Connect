import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Hashes plaintext password securely using bcrypt with 12 salt rounds
 */
export async function hashPassword(plainPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Password must be a valid non-empty string');
  }
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compares plaintext password against stored cryptographic hash
 */
export async function verifyPassword(plainPassword, passwordHash) {
  if (!plainPassword || !passwordHash) return false;
  return await bcrypt.compare(plainPassword, passwordHash);
}
