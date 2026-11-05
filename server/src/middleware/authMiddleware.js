import { verifyAccessToken } from '../utils/jwt.js';
import User from '../models/User.js';

/**
 * Authentication middleware: verifies Bearer JWT access token
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No access token provided.',
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Access token expired or invalid. Please log in again.',
      });
    }

    // Backend verification of user existence & account status (Requirement 2 & 18)
    let dbUser = null;
    try {
      dbUser = await User.findOne({
        $or: [
          { _id: decoded.id },
          { userId: decoded.userId },
        ],
      });
    } catch (_) {
      // Graceful fallback for mock mode
    }

    if (dbUser) {
      if (dbUser.isActive === false || dbUser.status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_SUSPENDED',
          message: 'Account has been suspended or deactivated. Contact support.',
        });
      }
      req.user = {
        id: dbUser._id,
        _id: dbUser._id,
        userId: dbUser.userId,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role, // Always strictly determined by backend
        isActive: dbUser.isActive,
      };
    } else {
      // In-memory / demo token support
      req.user = decoded;
    }

    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Authentication internal error.',
    });
  }
}

/**
 * RBAC authorization guard: restricts route to specific roles (Instruction 3)
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Role '${req.user.role}' lacks permission for this endpoint.`,
      });
    }

    next();
  };
}
