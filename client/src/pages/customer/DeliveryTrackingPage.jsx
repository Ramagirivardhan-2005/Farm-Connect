import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Truck,
  Phone,
  CheckCircle2,
  Calendar,
  Store,
  MapPin,
  ShieldCheck,
  Package,
  Clock,
  Radio,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import DeliveryTimeline, { ORDER_STEPS } from '../../components/common/DeliveryTimeline';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Rating from '../../components/common/Rating';
import { MOCK_ORDERS } from '../../services/mockData';
import { useToast } from '../../components/common/Toast';

export default function DeliveryTrackingPage() {
  const { orderId } = useParams();
  const { addToast } = useToast();

  const foundOrder = MOCK_ORDERS.find((o) => o.orderId === orderId || o.id === orderId) || MOCK_ORDERS[0];
  const [currentStatus, setCurrentStatus] = useState(foundOrder.status || 'IN_TRANSIT');

  // Real-time State Machine step simulator (Instruction 56: Real-time Socket.IO updates)
  const advanceStateSimulation = () => {
    const statusOrder = [
      'CREATED',
      'PAID',
      'ACCEPTED',
      'PROCESSING',
      'PACKED',
      'READY_FOR_PICKUP',
      'PICKED_UP',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      setCurrentStatus(nextStatus);
      addToast({
        type: 'info',
        title: 'Real-time WebSocket Event',
        message: `Event [order.status_updated]: Order transitioned to ${nextStatus}`,
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-farm-700 bg-farm-50 px-2.5 py-0.5 rounded-lg border border-farm-200">
              {foundOrder.orderId}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse text-emerald-600" />
              Live Socket.IO Stream
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>Direct Farm Delivery Tracking</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={currentStatus} />
          {/* Interactive simulator button to demonstrate real-time socket progression */}
          <button
            type="button"
            onClick={advanceStateSimulation}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center gap-1.5 transition"
            title="Advance the order state to simulate Socket.IO event"
          >
            <span>Simulate Next Event</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Timeline Card (Instruction 55) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Harvest & Dispatch Lifecycle</h3>
            <p className="text-xs text-slate-500">Real-time status updates broadcasted via WebSockets</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Expected Delivery: <strong>20 Sep 2026, 5:00 PM</strong>
          </span>
        </div>

        {/* Timeline Visualization */}
        <DeliveryTimeline currentStatus={currentStatus} />
      </div>

      {/* Grid: Delivery Partner Details & Farmer Origin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Partner Card (Instruction 55) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-farm-700 font-bold text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4 text-farm-600" />
            <span>Assigned Delivery Partner</span>
          </div>

          <div className="flex items-start gap-4">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
              alt="Partner"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-farm-200 shadow-2xs"
            />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900">
                  {foundOrder.deliveryPartner?.name || 'Suresh Express Rider'}
                </h4>
                <Rating value={foundOrder.deliveryPartner?.rating || 4.9} size="xs" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {foundOrder.deliveryPartner?.vehicle || 'Electric Cargo Scooter (MH-14-EF-9201)'}
              </p>
              <span className="text-[11px] font-bold text-farm-700 bg-farm-50 px-2 py-0.5 rounded-md inline-block">
                {foundOrder.deliveryPartner?.completedDeliveries || 340}+ Verified Doorstep Deliveries
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need delivery assistance?</span>
            <a href={`tel:${foundOrder.deliveryPartner?.phone || '+919822011988'}`}>
              <Button variant="outline" size="sm" icon={Phone}>
                Call Partner
              </Button>
            </a>
          </div>
        </div>

        {/* Farm Origin & Destination */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-farm-700 font-bold text-xs uppercase tracking-wider">
            <Store className="w-4 h-4 text-farm-600" />
            <span>Farm Origin & Doorstep Routing</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-farm-100 text-farm-700 flex items-center justify-center shrink-0 mt-0.5">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">
                  {foundOrder.farmerChannel?.name || 'Sahyadri Organic Orchards'}
                </span>
                <span className="text-slate-500">
                  {foundOrder.farmerChannel?.location || 'Junnar, Pune District'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Destination Doorstep</span>
                <span className="text-slate-500">
                  {foundOrder.deliveryAddress?.house}, {foundOrder.deliveryAddress?.street}, {foundOrder.deliveryAddress?.city} - {foundOrder.deliveryAddress?.pincode}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-farm-600" />
            <span>Cold-chain transit verified: Produce kept at 12–15°C optimum freshness.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
