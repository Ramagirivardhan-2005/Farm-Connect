import React from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  CheckCheck,
  UserCheck,
  Store,
  MapPin,
  Circle
} from 'lucide-react';

export const ORDER_STEPS = [
  { key: 'CREATED', label: 'Order Placed', desc: 'Customer placed order', icon: Clock },
  { key: 'PAID', label: 'Payment Confirmed', desc: 'Secure payment verified', icon: CheckCircle2 },
  { key: 'ACCEPTED', label: 'Farmer Accepted', desc: 'Farmer confirmed order', icon: Store },
  { key: 'PROCESSING', label: 'Harvesting & Prep', desc: 'Harvesting fresh produce', icon: Package },
  { key: 'PACKED', label: 'Produce Packed', desc: 'Eco-packaged & weighed', icon: Package },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', desc: 'Awaiting delivery partner', icon: UserCheck },
  { key: 'PICKED_UP', label: 'Picked Up', desc: 'Partner collected produce', icon: Truck },
  { key: 'IN_TRANSIT', label: 'In Transit', desc: 'Moving to delivery hub', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Partner on the way', icon: MapPin },
  { key: 'DELIVERED', label: 'Delivered Fresh', desc: 'Delivered to doorstep', icon: CheckCheck },
];

export default function DeliveryTimeline({ currentStatus = 'CREATED', history = [], className = '' }) {
  const statusIndexMap = {
    CREATED: 0,
    PAYMENT_PENDING: 0,
    PAID: 1,
    ACCEPTED: 2,
    PROCESSING: 3,
    PACKED: 4,
    READY_FOR_PICKUP: 5,
    PICKED_UP: 6,
    IN_TRANSIT: 7,
    OUT_FOR_DELIVERY: 8,
    DELIVERED: 9,
    CANCELLED: -1,
    REFUNDED: -1,
  };

  const activeIndex = statusIndexMap[currentStatus] ?? 0;
  const isCancelled = currentStatus === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className={`p-5 rounded-2xl bg-rose-50 border border-rose-200 text-center ${className}`}>
        <h4 className="text-rose-700 font-bold text-sm">Order Cancelled</h4>
        <p className="text-xs text-rose-600 mt-1">This order has been cancelled and any paid amount is refunded to your Secure Purse.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Desktop / Tablet Horizontal Timeline */}
      <div className="hidden lg:block relative pt-4 pb-2">
        <div className="overflow-x-auto pb-4">
          <div className="flex items-center min-w-[760px] justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-6 right-6 h-1 bg-slate-200 -z-0">
              <div
                className="h-full bg-farm-600 transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(0, Math.min(100, (activeIndex / (ORDER_STEPS.length - 1)) * 100))}%`,
                }}
              />
            </div>

            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const isPending = idx > activeIndex;

              const Icon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10 text-center w-20">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-farm-600 border-farm-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-white border-farm-600 text-farm-600 ring-4 ring-farm-100 font-bold animate-pulse-subtle'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`mt-2.5 text-[11px] leading-tight font-bold ${
                      isCurrent
                        ? 'text-farm-700'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400 font-normal'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile / Vertical Timeline */}
      <div className="lg:hidden space-y-4">
        {ORDER_STEPS.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isPending = idx > activeIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex items-start gap-3.5 relative">
              {/* Vertical connector */}
              {idx < ORDER_STEPS.length - 1 && (
                <div
                  className={`absolute left-4 top-8 w-0.5 bottom-0 -mb-4 ${
                    idx < activeIndex ? 'bg-farm-600' : 'bg-slate-200'
                  }`}
                />
              )}

              <div
                className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border-2 relative z-10 transition ${
                  isCompleted
                    ? 'bg-farm-600 border-farm-600 text-white'
                    : isCurrent
                    ? 'bg-white border-farm-600 text-farm-600 ring-4 ring-farm-100'
                    : 'bg-white border-slate-300 text-slate-300'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-baseline justify-between">
                  <h5
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-farm-700 font-extrabold'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h5>
                  {isCurrent && (
                    <span className="text-[10px] font-extrabold text-farm-700 bg-farm-100 px-2 py-0.5 rounded-md uppercase">
                      Current Stage
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
