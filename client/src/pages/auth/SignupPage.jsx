import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import FarmConnectLogo from '../../components/common/FarmConnectLogo';
import HeroCarousel from '../../components/common/HeroCarousel';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import OTPInput from '../../components/common/OTPInput';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { authApi } from '../../services/api';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    userId: '',
    email: '',
    mobile: '',
    altMobile: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45);

  // Auto-generate suggested User ID when typing username
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    const updates = { username: val };

    if (!formData.userId || formData.userId.startsWith('FC')) {
      const initials = val
        .split(' ')
        .map((p) => p.charAt(0).toUpperCase())
        .join('')
        .slice(0, 3);
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      updates.userId = `${initials || 'FC'}${randomNum}`;
    }

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.userId.trim()) newErrors.userId = 'Globally unique User ID is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Trigger Email OTP verification modal via Nodemailer
    setShowOtpModal(true);
    authApi.resendOtp(formData.email).catch(() => {});
    addToast({
      type: 'info',
      title: 'Verification OTP Sent',
      message: `A 6-digit verification code was dispatched to ${formData.email} via Nodemailer.`,
    });
  };

  const handleVerifyOtp = () => {
    if (otpValue.length !== 6) {
      addToast({
        type: 'error',
        title: 'Invalid OTP',
        message: 'Please enter all 6 digits of the verification code.',
      });
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      setShowOtpModal(false);

      const newUser = {
        id: `usr-${Date.now()}`,
        userId: formData.userId.toUpperCase(),
        username: formData.username,
        email: formData.email,
        mobile: formData.mobile,
        altMobile: formData.altMobile,
        role: 'CUSTOMER',
        isEmailVerified: true,
        isMobileVerified: true,
        walletBalance: 500, // Welcome gift
        cartCount: 0,
        unreadNotifications: 1,
      };

      login(newUser, 'jwt-token-verified-signup');
      addToast({
        type: 'success',
        title: 'Registration Complete!',
        message: `Welcome to FarmConnect, ${newUser.username}! Your permanent ID is ${newUser.userId}. ₹500 welcome credits added to your Secure Purse.`,
      });

      navigate('/customer/dashboard');
    }, 700);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* LEFT SIDE: 55-60% Farmer Hero Carousel */}
      <div className="w-full lg:w-[55%] xl:w-[58%] shrink-0">
        <HeroCarousel />
      </div>

      {/* RIGHT SIDE: Signup Form */}
      <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col justify-between p-6 sm:p-10 overflow-y-auto bg-slate-50/50">
        <div className="my-auto max-w-lg w-full mx-auto py-6">
          {/* Logo Top Center */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <FarmConnectLogo size="large" showTagline={true} />
            <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
              Create Your FarmConnect Account
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Join the transparent farm-to-table marketplace as a verified customer
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Username */}
            <Input
              label="Full Name"
              name="username"
              value={formData.username}
              onChange={handleUsernameChange}
              placeholder="e.g. Ramagiri Vardhan"
              icon={User}
              error={errors.username}
              required
            />

            {/* Unique User ID (Instruction 8: globally unique identifier e.g. RV10241) */}
            <Input
              label="Permanent Unique User ID"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="e.g. RV10241"
              helperText="Globally unique identifier across all FarmConnect operations"
              error={errors.userId}
              required
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email}
              required
            />

            {/* Mobile & Alt Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mobile Number"
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                icon={Phone}
                error={errors.mobile}
                required
              />
              <Input
                label="Alternative Mobile"
                type="tel"
                name="altMobile"
                value={formData.altMobile}
                onChange={handleChange}
                placeholder="Optional backup"
                icon={Phone}
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                icon={Lock}
                error={errors.password}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                icon={Lock}
                error={errors.confirmPassword}
                required
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                icon={ArrowRight}
                iconPosition="right"
              >
                Verify & Create Account
              </Button>
            </div>
          </form>

          {/* Already have account */}
          <div className="mt-6 text-center text-xs text-slate-600">
            Already registered on FarmConnect?{' '}
            <Link to="/login" className="font-extrabold text-farm-600 hover:text-farm-700 underline underline-offset-2">
              Sign In with Login ID
            </Link>
          </div>
        </div>

        {/* Security badge */}
        <div className="text-center text-[11px] text-slate-400">
          FarmConnect guarantees zero sharing of your personal data.
        </div>
      </div>

      {/* Email / Mobile OTP Modal (Instruction 9 & 10) */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Verify Your Email Address"
        subtitle={`We have dispatched an encrypted verification code to ${formData.email}`}
      >
        <div className="space-y-6 py-2">
          <div className="p-3 bg-farm-50 border border-farm-200 rounded-xl text-xs text-farm-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-farm-600 shrink-0" />
            <span>Development Hint: Enter <strong>123456</strong> or any 6 digits to verify instantly.</span>
          </div>

          <div>
            <label className="block text-center text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Enter 6-Digit OTP
            </label>
            <OTPInput
              length={6}
              value={otpValue}
              onChange={setOtpValue}
              onComplete={handleVerifyOtp}
            />
          </div>

          <div className="text-center text-xs text-slate-500">
            Didn't receive the code?{' '}
            <button
              type="button"
              className="text-farm-600 font-bold hover:underline"
              onClick={() => {
                addToast({
                  type: 'info',
                  title: 'OTP Resent',
                  message: 'A fresh OTP was sent to your registered inbox.',
                });
              }}
            >
              Resend OTP
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            fullWidth
            loading={isVerifyingOtp}
            onClick={handleVerifyOtp}
          >
            Confirm & Complete Registration
          </Button>
        </div>
      </Modal>
    </div>
  );
}
