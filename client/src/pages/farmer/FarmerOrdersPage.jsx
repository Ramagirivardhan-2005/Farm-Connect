import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Filter,
  Calendar,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { MOCK_ORDERS } from '../../services/mockData';
import { useToast } from '../../components/common/Toast';

export default function FarmerOrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters per Instruction 48
  const filters = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Pending & Paid', value: 'PAID' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Packed', value: 'PACKED' },
    { label: 'Ready for Pickup', value: 'READY_FOR_PICKUP' },
    { label: 'Delivered', value: 'DELIVERED' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'ALL') return true;
    return o.status === activeFilter;
  });

  // State Machine Action Handlers (Instruction 49)
  const handleTransition = (orderId, nextState) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId || ord.orderId === orderId ? { ...ord, status: nextState } : ord))
    );
    if (selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderId === orderId)) {
      setSelectedOrder((prev) => ({ ...prev, status: nextState }));
    }
    addToast({
      type: 'success',
      title: 'State Machine Transition Executed',
      message: `Order transitioned to ${nextState}. Notified customer & delivery network via WebSockets.`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-farm-600" />
            <span>Farm Dispatch & Order Workflow</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Accept incoming customer orders, report morning harvest progress, pack with eco-materials, and mark ready for delivery pickup.
          </p>
        </div>
      </div>

      {/* Filter Tabs (Instruction 48) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setActiveFilter(f.value)}
            className={`text-xs px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
              activeFilter === f.value
                ? 'bg-farm-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders Table & Action List (Instruction 49) */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {order.orderId}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-2">
                  {order.items?.map((item, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-farm-50 text-farm-800 border border-farm-200 px-2.5 py-1 rounded-lg"
                    >
                      {item.name} × {item.quantity} {item.unit || 'KG'}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Deliver to: <strong className="text-slate-800">{order.deliveryAddress?.fullName}</strong> ({order.deliveryAddress?.city}, {order.deliveryAddress?.pincode})
                </p>
              </div>

              {/* State Machine Action Transitions (Instruction 49) */}
              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {order.status === 'PAID' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleTransition(order.orderId, 'ACCEPTED')}
                  >
                    Accept Order
                  </Button>
                )}
                {order.status === 'ACCEPTED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleTransition(order.orderId, 'PROCESSING')}
                  >
                    Mark as Processing (Harvesting)
                  </Button>
                )}
                {order.status === 'PROCESSING' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleTransition(order.orderId, 'PACKED')}
                  >
                    Mark as Packed
                  </Button>
                )}
                {order.status === 'PACKED' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleTransition(order.orderId, 'READY_FOR_PICKUP')}
                  >
                    Ready for Pickup (Alert Drivers)
                  </Button>
                )}
                {order.status === 'READY_FOR_PICKUP' && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    Awaiting Delivery Partner Claim
                  </span>
                )}
                {order.status === 'IN_TRANSIT' && (
                  <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200">
                    Driver In Transit
                  </span>
                )}
                {order.status === 'DELIVERED' && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Delivered & Settled
                  </span>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedOrder(order)}
                >
                  Order Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details: ${selectedOrder.orderId}`}
          subtitle={`Placed on ${new Date(selectedOrder.createdAt).toLocaleString()}`}
        >
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">Customer Information</span>
              <p className="text-slate-600">{selectedOrder.deliveryAddress?.fullName}</p>
              <p className="text-slate-600">{selectedOrder.deliveryAddress?.mobile}</p>
              <p className="text-slate-500">
                {selectedOrder.deliveryAddress?.house}, {selectedOrder.deliveryAddress?.street}, {selectedOrder.deliveryAddress?.city}
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">Order Produce Breakdown</span>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between py-1 border-b border-slate-100">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between font-black text-sm pt-2 text-slate-900">
                <span>Total Settlement</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
