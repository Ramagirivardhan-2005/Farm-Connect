import React from 'react';
import { Calendar, Package, ArrowRight, Truck, MapPin, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import Button from './Button';

export default function OrderCard({ order, role = 'CUSTOMER', onAction, className = '' }) {
  if (!order) return null;

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recent Order';

  const expectedDate = order.expectedDeliveryDate
    ? new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Estimated in 2 days';

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition duration-200 overflow-hidden ${className}`}>
      {/* Top Header */}
      <div className="bg-slate-50/70 px-5 py-3.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
            {order.orderId || order._id}
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Items Summary */}
        <div className="space-y-2 flex-1">
          {order.farmerChannel && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-farm-700">
              <Store className="w-3.5 h-3.5 text-farm-600" />
              <span>{order.farmerChannel.name || 'Verified Farm'}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center">
            {order.items?.map((item, idx) => (
              <span
                key={idx}
                className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl font-medium flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-farm-500" />
                {item.name} × {item.quantity} {item.unit || 'KG'}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              Expected: <strong className="text-slate-700 font-semibold">{expectedDate}</strong>
            </span>
            {order.deliveryAddress && (
              <span className="flex items-center gap-1 truncate max-w-xs">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {order.deliveryAddress.city || order.deliveryAddress.district}, {order.deliveryAddress.pincode}
              </span>
            )}
          </div>
        </div>

        {/* Amount & Actions */}
        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-left md:text-right">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Total Amount</span>
            <div className="text-xl font-black text-slate-900">
              ₹{order.totalAmount?.toLocaleString() || 0}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {role === 'CUSTOMER' ? (
              <>
                <Link to={`/order/${order.orderId || order._id}/track`}>
                  <Button variant="outline" size="sm" icon={Truck}>
                    Track Live
                  </Button>
                </Link>
                <Link to={`/order/${order.orderId || order._id}`}>
                  <Button variant="secondary" size="sm">
                    Details
                  </Button>
                </Link>
              </>
            ) : role === 'FARMER' ? (
              <Link to={`/farmer/orders/${order.orderId || order._id}`}>
                <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                  Manage Order
                </Button>
              </Link>
            ) : (
              <Link to={`/delivery/active`}>
                <Button variant="primary" size="sm">
                  View Delivery
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
