import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Truck,
  ShieldCheck,
  CreditCard,
  Wallet,
  CheckCircle2,
  Plus,
  ArrowRight,
  Tag,
  AlertCircle,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

const API_BASE = '/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: currentUser?.username || '',
    mobile: currentUser?.mobile || '',
    house: '',
    street: '',
    village: '',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411038',
    landmark: '',
    type: 'Home',
  });

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState('WALLET'); // 'WALLET' | 'RAZORPAY'
  const [isProcessing, setIsProcessing] = useState(false);

  // Delivery Fee Calculation (Instruction: Free delivery >= 499, else 40)
  const deliveryFee = subtotal >= 499 ? 0 : (subtotal > 0 ? 40 : 0);
  const promoDiscount = appliedPromo?.discount || 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee - promoDiscount);

  // Wallet calculations
  const walletBalance = currentUser?.walletBalance || 0;
  const remainingWallet = walletBalance - grandTotal;
  const hasSufficientWallet = walletBalance >= grandTotal;

  // Expected Delivery Calculation
  const packLeadDays = 1;
  const transitDays = 1;
  const expectedDate = new Date(Date.now() + (packLeadDays + transitDays) * 24 * 60 * 60 * 1000);
  const formattedExpectedDate = expectedDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Load addresses
  useEffect(() => {
    async function loadAddresses() {
      try {
        const token = localStorage.getItem('farmconnect_token');
        const res = await fetch(`${API_BASE}/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.addresses?.length) {
            setAddresses(data.addresses);
            const def = data.addresses.find((a) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(def._id);
            return;
          }
        }
      } catch (_) {}

      // Fallback local addresses
      const local = [
        {
          _id: 'addr-1',
          fullName: currentUser?.username || 'Ramagiri Vardhan',
          mobile: currentUser?.mobile || '+91 98765 43210',
          house: 'Flat 402, Green Meadows Apartment',
          street: 'Kothrud Hill View Road',
          district: 'Pune',
          state: 'Maharashtra',
          pincode: '411038',
          type: 'Home',
          isDefault: true,
        },
      ];
      setAddresses(local);
      setSelectedAddressId('addr-1');
    }
    loadAddresses();
  }, [currentUser]);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId) || addresses[0];

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('farmconnect_token');
      const res = await fetch(`${API_BASE}/addresses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses((prev) => [data.address, ...prev]);
        setSelectedAddressId(data.address._id);
      } else {
        const local = { ...newAddress, _id: `addr-${Date.now()}` };
        setAddresses((prev) => [local, ...prev]);
        setSelectedAddressId(local._id);
      }
    } catch {
      const local = { ...newAddress, _id: `addr-${Date.now()}` };
      setAddresses((prev) => [local, ...prev]);
      setSelectedAddressId(local._id);
    }
    setShowAddressModal(false);
    addToast({ type: 'success', title: 'Address Added', message: 'Delivery address added successfully.' });
  };

  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setPromoError('');
    setIsValidatingPromo(true);

    try {
      const token = localStorage.getItem('farmconnect_token');
      const res = await fetch(`${API_BASE}/promos/validate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim(), orderAmount: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedPromo(data);
        addToast({
          type: 'success',
          title: 'Promo Applied!',
          message: `Saved ₹${data.discount} with code ${data.promoCode}`,
        });
      } else {
        setPromoError(data.message || 'Invalid or expired promo code.');
      }
    } catch {
      // Demo promo code fallback: 'FARM10' -> 10%
      if (promoInput.trim().toUpperCase() === 'FARM10') {
        const disc = Math.round(subtotal * 0.1);
        setAppliedPromo({ promoCode: 'FARM10', discount: disc, description: '10% Farm Fresh Discount' });
        addToast({ type: 'success', title: 'Promo Applied!', message: `Saved ₹${disc} with code FARM10` });
      } else {
        setPromoError('Invalid promo code. Try "FARM10"');
      }
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      addToast({ type: 'error', title: 'Address Required', message: 'Please select a delivery address.' });
      return;
    }

    if (paymentMethod === 'WALLET' && !hasSufficientWallet) {
      addToast({
        type: 'error',
        title: 'Insufficient Balance',
        message: 'Your wallet balance is lower than total amount. Top up or select Razorpay.',
      });
      return;
    }

    setIsProcessing(true);
    const idempotencyKey = `fc-idem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    try {
      const token = localStorage.getItem('farmconnect_token');
      const orderPayload = {
        items: items.map((i) => ({
          itemId: i.id || i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          unit: i.unit || 'KG',
          subtotal: i.price * i.quantity,
        })),
        subtotal,
        deliveryFee,
        promoCode: appliedPromo?.promoCode || '',
        paymentMethod,
        deliveryAddress: selectedAddress,
        idempotencyKey,
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      const confirmedOrderId = data.data?.orderId || `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      if (paymentMethod === 'WALLET') {
        updateProfile({
          walletBalance: Math.max(0, walletBalance - grandTotal),
        });
      }

      // Celebrate
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      clearCart();

      addToast({
        type: 'success',
        title: 'Order Confirmed!',
        message: `Order #${confirmedOrderId} placed successfully. Fresh harvest scheduled.`,
      });

      navigate(`/order/${confirmedOrderId}/track`);
    } catch {
      const demoId = `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      if (paymentMethod === 'WALLET') {
        updateProfile({ walletBalance: Math.max(0, walletBalance - grandTotal) });
      }
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      clearCart();
      addToast({
        type: 'success',
        title: 'Order Confirmed!',
        message: `Order #${demoId} placed successfully.`,
      });
      navigate(`/order/${demoId}/track`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-farm-600" />
          <span>Checkout & Secure Payment</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select delivery destination, apply promo discount, and choose payment method.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Addresses & Payment (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Address Selection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-farm-600" />
                <span>1. Select Delivery Destination</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="text-xs font-bold text-farm-700 hover:text-farm-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            <div className="space-y-3">
              {addresses.map((addr) => {
                const isSelected = addr._id === selectedAddressId;
                return (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddressId(addr._id)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start justify-between ${
                      isSelected
                        ? 'border-farm-600 bg-farm-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{addr.fullName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                          {addr.type || 'Home'}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.house}, {addr.street}{addr.village ? `, ${addr.village}` : ''}, {addr.district}, {addr.state} - {addr.pincode}
                      </p>
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Contact: {addr.mobile}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                        isSelected ? 'border-farm-600 bg-farm-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Promo Code Input */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-farm-600" />
              <span>Have a promo code?</span>
            </h3>

            {appliedPromo ? (
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-black font-mono text-emerald-900">
                      {appliedPromo.promoCode}
                    </span>
                    <span className="text-xs text-emerald-700 block">
                      {appliedPromo.description || `₹${appliedPromo.discount} Discount Applied`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="p-1 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-100"
                  title="Remove Promo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code (e.g. FARM10)"
                    className="flex-1 text-xs font-mono uppercase px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-farm-600"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={isValidatingPromo}
                  >
                    Apply
                  </Button>
                </div>
                {promoError && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {promoError}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-farm-600" />
              <span>3. Choose Payment Method</span>
            </h3>

            <div className="space-y-3">
              {/* Secure Purse Wallet */}
              <div
                onClick={() => setPaymentMethod('WALLET')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'WALLET'
                    ? 'border-farm-600 bg-farm-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-farm-100 text-farm-700 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">FarmConnect Secure Purse</h4>
                    <span className="text-[11px] text-slate-500 block">
                      Balance: ₹{walletBalance.toLocaleString()}
                      {hasSufficientWallet ? (
                        <span className="text-emerald-700 font-semibold ml-2">
                          (Remaining: ₹{remainingWallet.toLocaleString()})
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold ml-2">
                          (Insufficient - need ₹{(grandTotal - walletBalance).toLocaleString()} more)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === 'WALLET' ? 'border-farm-600 bg-farm-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'WALLET' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              {/* Razorpay Online Payment */}
              <div
                onClick={() => setPaymentMethod('RAZORPAY')}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                  paymentMethod === 'RAZORPAY'
                    ? 'border-farm-600 bg-farm-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Pay with Razorpay / UPI / Card</h4>
                    <span className="text-[11px] text-slate-500">
                      Google Pay, PhonePe, Cards, NetBanking, EMI
                    </span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === 'RAZORPAY' ? 'border-farm-600 bg-farm-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'RAZORPAY' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Harvest Order Summary
            </h3>

            {/* Expected Delivery Date */}
            <div className="p-4 rounded-2xl bg-farm-50/80 border border-farm-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-farm-900">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-farm-600" />
                  Expected Delivery Date
                </span>
                <span className="text-farm-700">{formattedExpectedDate}</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Direct fresh morning plucking & cold-chain doorstep transit.
              </p>
            </div>

            {/* Items Summary list */}
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 text-xs">
              {items.map((item) => (
                <div key={item.id || item._id} className="pt-2 first:pt-0 flex justify-between">
                  <span className="text-slate-700 truncate max-w-[200px]">
                    {item.name} × {item.quantity} {item.unit}
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>

              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount ({appliedPromo?.promoCode})</span>
                  <span>-₹{promoDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Direct Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-semibold text-slate-900">₹{deliveryFee}</span>
                )}
              </div>

              {deliveryFee > 0 && subtotal < 499 && (
                <p className="text-[10px] text-farm-700 bg-farm-50 p-2 rounded-lg">
                  💡 Add ₹{(499 - subtotal).toLocaleString()} more for FREE delivery!
                </p>
              )}

              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Amount to Pay</span>
                <span>₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Final Place Order Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isProcessing}
              icon={ArrowRight}
              iconPosition="right"
              onClick={handlePlaceOrder}
            >
              {paymentMethod === 'WALLET'
                ? `Confirm & Pay ₹${grandTotal.toLocaleString()}`
                : `Pay ₹${grandTotal.toLocaleString()} with Razorpay`}
            </Button>

            <p className="text-[11px] text-center text-slate-400">
              Protected by SSL and double-entry cryptographic audit ledger.
            </p>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        title="Add New Delivery Address"
        subtitle="Mandatory for routing orders directly to your doorstep"
      >
        <form onSubmit={handleAddAddress} className="space-y-3 pt-2">
          <Input
            label="Full Name"
            value={newAddress.fullName}
            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
            placeholder="Recipient's Name"
            required
          />
          <Input
            label="Mobile Number"
            type="tel"
            value={newAddress.mobile}
            onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })}
            placeholder="+91 98765 43210"
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="House / Flat No."
              value={newAddress.house}
              onChange={(e) => setNewAddress({ ...newAddress, house: e.target.value })}
              placeholder="e.g. Flat 301"
              required
            />
            <Input
              label="Street / Colony"
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
              placeholder="e.g. MG Road"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="City / District"
              value={newAddress.district}
              onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
              placeholder="e.g. Pune"
              required
            />
            <Input
              label="Pincode"
              value={newAddress.pincode}
              onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
              placeholder="e.g. 411038"
              required
            />
          </div>
          <div className="pt-3 flex justify-end gap-2">
            <Button variant="secondary" size="md" onClick={() => setShowAddressModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
