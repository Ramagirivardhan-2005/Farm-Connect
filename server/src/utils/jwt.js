import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super_secure_access_token_secret_min_32_chars_long_1234';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secure_refresh_token_secret_min_32_chars_long_5678';

const ACCESS_EXPIRES_IN = '15m'; // 15 minutes per Instruction 11
const REFRESH_EXPIRES_IN = '7d';

/**
 * Signs 15-minute access token containing user payload
 */
export function signAccessToken(payload) {
  return jwt.sign(
    {
      id: payload.id || payload._id,
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

/**
 * Signs longer-lived refresh token
 */
export function signRefreshToken(payload) {
  return jwt.sign(
    {
      id: payload.id || payload._id,
      userId: payload.userId,
      tokenVersion: payload.tokenVersion || 0,
    },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

/**
 * Verifies access token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Verifies refresh token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    return null;
  }
}
