import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Navigation,
  DollarSign,
  Star,
  User,
  Power,
  SlidersHorizontal,
  RefreshCw,
  FileText,
  Calendar,
  Sparkles,
  Award,
  Radio,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Rating from '../../components/common/Rating';
import Modal from '../../components/common/Modal';
import OTPInput from '../../components/common/OTPInput';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { deliveryApi } from '../../services/api';

export default function DeliveryDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [historyData, setHistoryData] = useState({ data: [], stats: {} });
  const [profile, setProfile] = useState(null);
  const [channels, setChannels] = useState([]);

  // OTP delivery verification modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Filter state for available orders
  const [distanceFilter, setDistanceFilter] = useState('All');
  const [isOnline, setIsOnline] = useState(true);

  // Determine active view based on path
  const currentPath = location.pathname;
  const isDashboardView = currentPath === '/delivery/dashboard' || currentPath === '/delivery';
  const isAvailableView = currentPath === '/delivery/available';
  const isActiveView = currentPath === '/delivery/active';
  const isHistoryView = currentPath === '/delivery/history';
  const isProfileView = currentPath === '/delivery/profile';
  const isChannelsView = currentPath === '/delivery/channels';

  // Load data from API
  const loadData = async () => {
    setLoading(true);
    try {
      const [avail, active, hist, prof, chs] = await Promise.all([
        deliveryApi.getAvailable(),
        deliveryApi.getActive(),
        deliveryApi.getHistory(),
        deliveryApi.getProfile(),
        deliveryApi.getChannels ? deliveryApi.getChannels() : [],
      ]);
      setAvailableOrders(avail || []);
      setActiveDelivery(active || null);
      setHistoryData(hist || { data: [], stats: {} });
      setProfile(prof || {});
      setChannels(chs || []);
      setIsOnline(prof?.status !== 'OFFLINE');
    } catch (err) {
      console.error('Error fetching delivery data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Atomic pickup claim (Instruction 53)
  const handleAcceptDelivery = async (order) => {
    try {
      await deliveryApi.claim(order.orderId);
      setAvailableOrders((prev) => prev.filter((o) => o.id !== order.id && o.orderId !== order.orderId));
      setActiveDelivery({
        id: order.id,
        orderId: order.orderId,
        status: 'PICKED_UP',
        customerName: order.customerName || 'Ramagiri Vardhan',
        customerPhone: order.customerPhone || '+91 98765 43210',
        dropAddress: order.dropLocation || order.dropAddress,
        farmOrigin: order.pickupLocation || order.farmOrigin,
        items: order.items || ['Fresh Organic Harvest Produce (3 Bundles)'],
        expectedBy: order.expectedDelivery || 'Today by 5:30 PM',
        earning: order.payout || 180,
        distance: order.distance || '24 km',
        pickupTime: 'Just now',
      });
      addToast({
        type: 'success',
        title: 'Delivery Claimed Atomically',
        message: `Order ${order.orderId} assigned to you. Proceed to farm gate for pickup.`,
      });
      navigate('/delivery/active');
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Claim Failed',
        message: 'This delivery may have been claimed by another rider.',
      });
    }
  };

  // State Machine transition handler
  const handleUpdateStatus = async (nextState) => {
    if (!activeDelivery) return;

    if (nextState === 'DELIVERED') {
      setShowOtpModal(true);
      return;
    }

    try {
      await deliveryApi.updateStatus(activeDelivery.orderId, nextState);
      setActiveDelivery((prev) => ({ ...prev, status: nextState }));
      addToast({
        type: 'success',
        title: 'Delivery State Updated',
        message: `Order ${activeDelivery.orderId} updated to ${nextState}. Customer notified in real-time.`,
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Transition Failed',
        message: 'Could not update delivery state.',
      });
    }
  };

  // Confirm delivery with customer OTP
  const handleConfirmDeliveryWithOtp = async () => {
    if (deliveryOtp.length !== 6) {
      addToast({
        type: 'error',
        title: 'Invalid OTP',
        message: 'Please enter the 6-digit handover OTP provided by the customer (Use 123456 for demo).',
      });
      return;
    }

    setIsVerifyingOtp(true);
    setTimeout(async () => {
      setIsVerifyingOtp(false);
      setShowOtpModal(false);
      await deliveryApi.updateStatus(activeDelivery.orderId, 'DELIVERED');
      setActiveDelivery((prev) => ({ ...prev, status: 'DELIVERED' }));
      addToast({
        type: 'success',
        title: '🎉 Delivery Successfully Completed!',
        message: `Payout of ₹${activeDelivery.earning || 160} credited instantly to your partner wallet.`,
      });
      loadData();
    }, 800);
  };

  // Toggle Online/Offline
  const handleToggleOnline = async () => {
    const newStatus = isOnline ? 'OFFLINE' : 'AVAILABLE';
    setIsOnline(!isOnline);
    await deliveryApi.updateProfile({ status: newStatus });
    addToast({
      type: isOnline ? 'info' : 'success',
      title: isOnline ? 'You are now Offline' : 'You are now Online',
      message: isOnline
        ? 'You will not receive new pickup alerts until you go online.'
        : 'You are visible for nearby farm gate pickups.',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Fleet Hero Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sky-200 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Truck className="w-3.5 h-3.5 text-sky-300" />
            <span>FarmConnect Cold-Chain Fleet</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {currentUser?.username || profile?.fullName || 'Suresh Express Rider'}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${
                isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              {isOnline ? 'Active & Ready' : 'Offline'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-sky-100 max-w-lg">
            Vehicle: <strong>{profile?.vehicleType || 'Electric Cargo Scooter'} ({profile?.vehicleNumber || 'MH-14-EF-9201'})</strong> • {profile?.totalDeliveries || 342} completed trips • {profile?.rating || 4.9}★
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-left md:text-right bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block">Today's Payouts</span>
            <div className="text-2xl font-black text-white">₹{profile?.todayEarnings || 1480}</div>
            <span className="text-[10px] text-sky-200">{profile?.todayTrips || 8} Deliveries Completed</span>
          </div>

          <Button
            variant={isOnline ? 'outline' : 'primary'}
            size="md"
            icon={Power}
            onClick={handleToggleOnline}
            className={isOnline ? 'text-white border-white/30 hover:bg-white/10' : ''}
          >
            {isOnline ? 'Go Offline' : 'Go Online'}
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold scrollbar-none">
        <Link
          to="/delivery/dashboard"
          className={`px-4 py-2 rounded-xl transition ${
            isDashboardView
              ? 'bg-sky-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          Fleet Dashboard
        </Link>
        <Link
          to="/delivery/active"
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            isActiveView
              ? 'bg-sky-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Active Delivery</span>
          {activeDelivery && activeDelivery.status !== 'DELIVERED' && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          )}
        </Link>
        <Link
          to="/delivery/available"
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            isAvailableView
              ? 'bg-sky-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Available Pickups ({availableOrders.length})</span>
        </Link>
        <Link
          to="/delivery/history"
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            isHistoryView
              ? 'bg-sky-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Trip History</span>
        </Link>
        <Link
          to="/delivery/channels"
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            isChannelsView
              ? 'bg-sky-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>My Channels ({channels.length})</span>
        </Link>
        <Link
          to="/delivery/profile"
          className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition ${
            isProfileView
              ? 'bg-sky-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Partner Profile</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* MY CHANNELS VIEW (Requirement 6) */}
      {/* ========================================================================= */}
      {(isChannelsView || isDashboardView) && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-sky-700" />
                <span>My Channels</span>
              </h2>
              <p className="text-xs text-slate-500">
                Farmer networks you are currently assigned to. You receive active pickup alerts across all these channels.
              </p>
            </div>
            <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
              {channels.length} Channels
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {channels.map((ch) => (
              <div
                key={ch._id || ch.name}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3 hover:border-sky-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                    <Radio className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ACTIVE
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{ch.name}</h3>
                  <p className="text-xs text-slate-500">{ch.farmerName}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-sky-700">
                    {ch.activeOrdersCount || 0} Active Orders
                  </span>
                  <span className="text-slate-400">
                    ₹{ch.defaultDeliveryFee || 40} / trip
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ACTIVE DELIVERY VIEW */}
      {/* ========================================================================= */}
      {(isActiveView || (isDashboardView && activeDelivery && activeDelivery.status !== 'DELIVERED')) && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-sky-700" />
              <span>Current Assigned In-Progress Delivery</span>
            </h2>
            <StatusBadge status={activeDelivery?.status || 'IN_TRANSIT'} />
          </div>

          {activeDelivery ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sky-600 shadow-lg space-y-6">
              {/* Top Banner Status */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-mono text-xs font-black text-sky-900 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                    {activeDelivery.orderId}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Estimated Drop: <strong className="text-slate-900">{activeDelivery.expectedBy || 'Today, 4:30 PM'}</strong>
                  </span>
                </div>
                <div className="text-right font-bold text-slate-900">
                  <span className="text-xs text-slate-400 block">Trip Earning:</span>
                  <span className="text-lg text-emerald-700 font-black">₹{activeDelivery.earning || 160}</span>
                </div>
              </div>

              {/* Progress Milestones Bar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Cold-Chain Dispatch Milestones (State Machine)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className={`p-2.5 rounded-xl border ${['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(activeDelivery.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    ✓ 1. Picked from Farm
                  </div>
                  <div className={`p-2.5 rounded-xl border ${['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(activeDelivery.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(activeDelivery.status) ? '✓' : '○'} 2. Cold-Chain Transit
                  </div>
                  <div className={`p-2.5 rounded-xl border ${['OUT_FOR_DELIVERY', 'DELIVERED'].includes(activeDelivery.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {['OUT_FOR_DELIVERY', 'DELIVERED'].includes(activeDelivery.status) ? '✓' : '○'} 3. Out for Delivery
                  </div>
                  <div className={`p-2.5 rounded-xl border ${activeDelivery.status === 'DELIVERED' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {activeDelivery.status === 'DELIVERED' ? '✓' : '○'} 4. Delivered & OTP Verified
                  </div>
                </div>
              </div>

              {/* Route & Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Route Information */}
                <div className="space-y-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-sky-600" />
                    <span>Navigation & Route Steps</span>
                  </span>
                  <div className="p-4 bg-sky-50/60 border border-sky-100 rounded-2xl space-y-3">
                    <div>
                      <span className="text-sky-900 font-bold block">1. Origin Farm Gate:</span>
                      <p className="text-slate-700 font-semibold">{activeDelivery.farmOrigin}</p>
                    </div>
                    <div className="pt-2 border-t border-sky-200/60">
                      <span className="text-emerald-900 font-bold block">2. Customer Drop Address:</span>
                      <p className="text-slate-700 font-semibold">{activeDelivery.dropAddress}</p>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-slate-500 font-medium">
                      <span>Total Distance: <strong>{activeDelivery.distance || '24 km'}</strong></span>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(activeDelivery.dropAddress)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-700 font-bold underline hover:text-sky-900"
                      >
                        Open in Google Maps ↗
                      </a>
                    </div>
                  </div>
                </div>

                {/* Customer Contact & Items */}
                <div className="space-y-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-sky-600" />
                    <span>Customer & Harvest Items</span>
                  </span>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">{activeDelivery.customerName}</span>
                        <span className="text-slate-500">{activeDelivery.customerPhone}</span>
                      </div>
                      <a href={`tel:${activeDelivery.customerPhone}`}>
                        <Button variant="outline" size="sm" icon={Phone}>
                          Call Customer
                        </Button>
                      </a>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">Harvest Package Content:</span>
                      <p className="text-slate-600">{activeDelivery.items?.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for State Machine */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Update status as you progress. Customer receives live Socket.IO alerts.
                </span>

                <div className="flex items-center gap-3">
                  {activeDelivery.status === 'READY_FOR_PICKUP' && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleUpdateStatus('PICKED_UP')}
                    >
                      Confirm Pickup from Farm Gate
                    </Button>
                  )}
                  {activeDelivery.status === 'PICKED_UP' && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleUpdateStatus('IN_TRANSIT')}
                    >
                      Start Cold-Chain Transit
                    </Button>
                  )}
                  {activeDelivery.status === 'IN_TRANSIT' && (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleUpdateStatus('OUT_FOR_DELIVERY')}
                    >
                      Mark Out for Doorstep Delivery
                    </Button>
                  )}
                  {activeDelivery.status === 'OUT_FOR_DELIVERY' && (
                    <Button
                      variant="success"
                      size="md"
                      icon={ShieldCheck}
                      onClick={() => handleUpdateStatus('DELIVERED')}
                    >
                      Complete Handover (Verify OTP)
                    </Button>
                  )}
                  {activeDelivery.status === 'DELIVERED' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                        ✓ Trip Completed & ₹{activeDelivery.earning} Credited!
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/delivery/available')}
                      >
                        Find Next Pickup
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
              <Truck className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Active Delivery in Progress</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You currently do not have any assigned order. Browse available farm gate pickups to accept your next delivery run.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/delivery/available')}
              >
                Browse Available Deliveries
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. AVAILABLE PICKUPS POOL VIEW */}
      {/* ========================================================================= */}
      {(isAvailableView || isDashboardView) && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-sky-700" />
                <span>Available Farm Gate Pickups in Your Radius</span>
              </h2>
              <p className="text-xs text-slate-500">
                Harvest orders ready for cold-chain transport. Claim atomically to secure the run.
              </p>
            </div>

            {/* Radius Filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              {['All', '15 km', '30 km', '50 km'].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setDistanceFilter(dist)}
                  className={`px-3 py-1 rounded-lg transition ${
                    distanceFilter === dist
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>

          {availableOrders.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No Open Pickups Waiting</p>
              <p>New harvest packages will appear as soon as farmers finish packing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {availableOrders.map((order) => (
                <div
                  key={order.id || order.orderId}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-sky-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                        {order.orderId}
                      </span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        Payout: ₹{order.payout || 180}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {order.distance || '28 km'}
                      </span>
                      <span className="text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md font-bold">
                        {order.expectedDelivery || 'Expected today'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                      <p>
                        <strong className="text-slate-900">Pickup (Farm Gate):</strong> {order.pickupLocation}
                      </p>
                      <p>
                        <strong className="text-slate-900">Drop (Doorstep):</strong> {order.dropLocation}
                      </p>
                      <p className="text-slate-500 font-medium pt-1">
                        Package: {order.itemsCount || order.items?.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      variant="primary"
                      size="md"
                      icon={ArrowRight}
                      iconPosition="right"
                      onClick={() => handleAcceptDelivery(order)}
                    >
                      Accept & Claim Delivery
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TRIP HISTORY VIEW */}
      {/* ========================================================================= */}
      {isHistoryView && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-700" />
                <span>Completed Delivery Logs & Earnings</span>
              </h2>
              <p className="text-xs text-slate-500">
                Verified deliveries completed with customer OTP authentication.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
              Total {historyData.data?.length || 0} Records
            </span>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Lifetime Payout</span>
              <p className="text-xl font-black text-slate-900">₹{historyData.stats?.totalEarnings || 48650}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Trips</span>
              <p className="text-xl font-black text-slate-900">{historyData.stats?.completedTrips || 342}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Average Rating</span>
              <p className="text-xl font-black text-amber-500 flex items-center gap-1">
                <span>{historyData.stats?.averageRating || 4.9}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 uppercase">On-Time Handover</span>
              <p className="text-xl font-black text-emerald-700">99.2%</p>
            </div>
          </div>

          {/* History List */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {historyData.data?.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{item.orderId}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                      ✓ Delivered
                    </span>
                    <span className="text-slate-400">{item.completedAt}</span>
                  </div>
                  <p className="text-slate-700 font-medium">Customer: <strong>{item.customerName}</strong> • {item.dropAddress}</p>
                  <p className="text-slate-400">Origin: {item.farmOrigin} • {item.itemsCount}</p>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                  <div className="text-base font-black text-slate-900">₹{item.payout}</div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <span>{item.rating}★</span>
                    {item.tip > 0 && <span className="text-emerald-700 text-[10px]">(+₹{item.tip} tip)</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PARTNER PROFILE VIEW */}
      {/* ========================================================================= */}
      {isProfileView && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-700" />
              <span>Partner Profile & Fleet Credentials</span>
            </h2>
            <p className="text-xs text-slate-500">
              Registered cold-chain partner ID, vehicle details, bank account, and performance badges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Identity Card */}
            <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-sky-700 text-white text-2xl font-black flex items-center justify-center mx-auto shadow-md">
                S
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{profile?.fullName || 'Suresh Express Rider'}</h3>
                <p className="font-mono text-xs font-bold text-sky-800">{profile?.partnerId || 'DP88102'}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Cold-Chain Rider</span>
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-2 text-left">
                <p><strong>Phone:</strong> {profile?.phone || '+91 98765 00002'}</p>
                <p><strong>Email:</strong> {profile?.email || 'suresh.rider@farmconnect.internal'}</p>
                <p><strong>Joined:</strong> March 2023</p>
              </div>
            </div>

            {/* Vehicle & Settings */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 text-xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-700" />
                  <span>Vehicle & Service Area Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block font-bold">Vehicle Type</span>
                    <strong className="text-slate-900 text-sm">{profile?.vehicleType || 'Electric Cargo Scooter'}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block font-bold">Registration Number</span>
                    <strong className="text-slate-900 text-sm">{profile?.vehicleNumber || 'MH-14-EF-9201'}</strong>
                  </div>
                  <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block font-bold">Operating Service Area</span>
                    <strong className="text-slate-900 text-sm">{profile?.serviceArea || 'Pune West & PCMC (Radius: 35 km)'}</strong>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4 text-xs">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <span>Settlement Bank Account</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block font-bold">Bank Name</span>
                    <strong className="text-slate-900">{profile?.bankDetails?.bankName || 'HDFC Bank'}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block font-bold">Account</span>
                    <strong className="text-slate-900">{profile?.bankDetails?.accountNumber || '••••••••8912'}</strong>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block font-bold">IFSC Code</span>
                    <strong className="text-slate-900">{profile?.bankDetails?.ifscCode || 'HDFC0001824'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Handover OTP Verification Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Customer Delivery Handover Verification"
      >
        <div className="space-y-6 text-center py-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900">Enter Customer Handover OTP</h4>
            <p className="text-xs text-slate-500">
              Ask <strong>{activeDelivery?.customerName}</strong> for the 6-digit verification code to confirm fresh produce handover.
            </p>
          </div>

          <div className="flex justify-center py-2">
            <OTPInput
              length={6}
              value={deliveryOtp}
              onChange={setDeliveryOtp}
            />
          </div>

          <p className="text-[11px] text-slate-400">
            (Development Demo Master OTP: <strong className="text-slate-700">123456</strong>)
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowOtpModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              size="md"
              loading={isVerifyingOtp}
              onClick={handleConfirmDeliveryWithOtp}
            >
              Verify & Complete Delivery
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
