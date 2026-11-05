import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Upload,
  Award,
  CreditCard,
  User,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import OTPInput from '../../components/common/OTPInput';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

export default function CreateChannelPage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, switchRole } = useAuth();
  const { addToast } = useToast();

  // Step state: 1: OTP Verify -> 2: Farmer & Identity -> 3: Channel Info -> 4: Bank & Certifications
  const [step, setStep] = useState(1);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [generatedChannelId] = useState(`FC-CH-0000${Math.floor(1000 + Math.random() * 9000)}`);

  // Form fields (Instruction 27)
  const [formData, setFormData] = useState({
    farmerName: currentUser?.username || '',
    contact: currentUser?.mobile || '',
    altContact: '',
    farmLocation: '',
    aadhaarNumber: '',
    channelName: '',
    channelBio: '',
    description: '',
    bankAccountHolder: currentUser?.username || '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    certName: 'NPOP Organic India Certification',
    certIssuer: 'APEDA Aditi Organic Certifications',
    certNumber: 'ORG-2026-9021',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerifyOtp = () => {
    if (otpValue.length !== 6) {
      addToast({
        type: 'error',
        title: 'Invalid OTP',
        message: 'Please enter a valid 6-digit verification code.',
      });
      return;
    }
    setIsOtpVerified(true);
    setStep(2);
    addToast({
      type: 'success',
      title: 'Farmer Identity Verified',
      message: `Channel ID assigned: ${generatedChannelId}. Proceed to fill farm information.`,
    });
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const channelObj = {
        channelId: generatedChannelId,
        name: formData.channelName || `${formData.farmerName}'s Organic Farms`,
        status: 'PENDING_VERIFICATION', // Instruction 28
        subscribersCount: 0,
        rating: 5.0,
      };

      updateProfile({
        role: 'FARMER',
        farmerChannel: channelObj,
      });

      addToast({
        type: 'success',
        title: 'Channel Application Submitted!',
        message: `Your channel ${generatedChannelId} is now under review by Super Admin. Switching to Farmer Dashboard.`,
      });

      switchRole('FARMER');
      navigate('/farmer/dashboard');
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[11px] font-mono font-bold text-farm-700 bg-farm-50 px-2.5 py-0.5 rounded-md border border-farm-200">
          CHANNEL ID: {generatedChannelId}
        </span>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2 mt-1">
          <Sprout className="w-6 h-6 text-farm-600" />
          <span>Apply For FarmConnect Channel</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Sell directly to thousands of urban families. Zero middlemen, fair prices, direct bank payouts.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between relative max-w-xl mx-auto pb-4">
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-slate-200 -z-0" />
        {[
          { num: 1, label: 'Identity OTP' },
          { num: 2, label: 'Farmer & Farm' },
          { num: 3, label: 'Channel Profile' },
          { num: 4, label: 'Bank & Certs' },
        ].map((s) => (
          <div key={s.num} className="flex flex-col items-center relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                step === s.num
                  ? 'bg-farm-600 text-white ring-4 ring-farm-100'
                  : step > s.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-400'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className="text-[11px] font-semibold text-slate-600 mt-1.5">{s.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: OTP Verification (Instruction 25) */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-md mx-auto text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-farm-50 text-farm-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Farmer Mobile & Identity Verification</h3>
          <p className="text-xs text-slate-500">
            To prevent counterfeit listings, FarmConnect requires OTP authentication prior to issuing channel ID {generatedChannelId}.
          </p>

          <div className="p-3 bg-farm-50 rounded-xl text-xs text-farm-800">
            Enter <strong>123456</strong> to verify your registered mobile ({currentUser?.mobile}).
          </div>

          <OTPInput length={6} value={otpValue} onChange={setOtpValue} onComplete={handleVerifyOtp} />

          <Button variant="primary" size="md" fullWidth onClick={handleVerifyOtp}>
            Verify OTP & Initialize Channel
          </Button>
        </div>
      )}

      {/* STEP 2: Farmer & Farm Info */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Step 2: Farmer Identity & Agricultural Land Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Farmer Full Legal Name"
              value={formData.farmerName}
              onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
              placeholder="e.g. Ramesh Patil"
              required
            />
            <Input
              label="Contact Number"
              type="tel"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="+91 94231 77654"
              required
            />
            <Input
              label="Farm Location / Village / Tehsil"
              value={formData.farmLocation}
              onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
              placeholder="e.g. Junnar, Pune District, Maharashtra"
              required
            />
            <Input
              label="Aadhaar Number (AES-256 Encrypted)"
              value={formData.aadhaarNumber}
              onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
              placeholder="XXXX-XXXX-XXXX"
              helperText="Encrypted via authenticated AES-256-GCM. Never shown publicly."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="primary" size="md" onClick={() => setStep(3)}>
              Continue to Channel Details
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Channel Branding */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Step 3: FarmConnect Channel Branding
          </h3>

          <div className="space-y-4">
            <Input
              label="Public Channel Name"
              value={formData.channelName}
              onChange={(e) => setFormData({ ...formData, channelName: e.target.value })}
              placeholder="e.g. Sahyadri Organic Orchards & Greens"
              required
            />
            <Input
              label="Short Bio / Catchphrase"
              value={formData.channelBio}
              onChange={(e) => setFormData({ ...formData, channelBio: e.target.value })}
              placeholder="e.g. Family-owned biodynamic farm since 1994. 100% Zero Pesticides."
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Farm Heritage & Cultivation Method
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your soil, water source, composting methods, and heritage crop varieties..."
                className="w-full text-sm rounded-xl border border-slate-300 p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button variant="secondary" size="md" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={() => setStep(4)}>
              Continue to Bank & Verification
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Bank & Certifications */}
      {step === 4 && (
        <form onSubmit={handleFinalSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Step 4: Encrypted Bank Settlement & Agricultural Certifications
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Bank Account Holder Name"
              value={formData.bankAccountHolder}
              onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
              required
            />
            <Input
              label="Bank Name"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="e.g. State Bank of India"
              required
            />
            <Input
              label="Account Number (Encrypted)"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="Settlement Account"
              required
            />
            <Input
              label="IFSC Code"
              value={formData.ifscCode}
              onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
              placeholder="SBIN0001240"
              required
            />
          </div>

          <div className="p-4 rounded-2xl bg-farm-50/70 border border-farm-200 space-y-3">
            <span className="text-xs font-bold text-farm-900 uppercase tracking-wider block">
              Organic / Quality Certification (Optional for Verified Badge)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Certificate Name"
                value={formData.certName}
                onChange={(e) => setFormData({ ...formData, certName: e.target.value })}
              />
              <Input
                label="Issued By Authority"
                value={formData.certIssuer}
                onChange={(e) => setFormData({ ...formData, certIssuer: e.target.value })}
              />
              <Input
                label="Certificate Registration No."
                value={formData.certNumber}
                onChange={(e) => setFormData({ ...formData, certNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button variant="secondary" size="md" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button type="submit" variant="primary" size="lg" loading={isSubmitting}>
              Submit Application to Super Admin
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
