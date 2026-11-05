import { Router } from 'express';
import {
  register,
  login,
  adminOtpLoginRequest,
  adminOtpLoginVerify,
  forgotPasswordRequest,
  forgotPasswordVerify,
  requestOtp,
  verifyOtp,
  googleAuth,
  getGoogleAuthUrl,
} from '../controllers/authController.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Google OAuth 2.0 endpoints
router.post('/google', authLimiter, googleAuth);
router.get('/google/url', getGoogleAuthUrl);

// Super Admin Email & OTP Login
router.post('/admin/otp-request', otpLimiter, adminOtpLoginRequest);
router.post('/admin/otp-verify', authLimiter, adminOtpLoginVerify);

// Forgot Password / OTP Recovery
router.post('/forgot-password/request', otpLimiter, forgotPasswordRequest);
router.post('/forgot-password/verify', authLimiter, forgotPasswordVerify);

// General OTP verification
router.post('/otp/request', otpLimiter, requestOtp);
router.post('/otp/verify', otpLimiter, verifyOtp);

export default router;
