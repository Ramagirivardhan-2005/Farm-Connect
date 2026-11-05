import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, Store, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/common/Toast';

export default function CartPage() {
  const { items, groupedByFarmer, updateQuantity, removeFromCart, subtotal, deliveryFee, grandTotal } = useCart();
  const navigate = useNavigate();
  const { addToast } = useToast();

  if (items.length === 0) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <EmptyState
          icon={ShoppingBag}
          title="Your Farm Basket is Empty"
          description="Explore verified farmer channels and add nutritious, fresh produce harvested directly for you."
          actionLabel="Discover Farm Fresh Products"
          onAction={() => navigate('/customer/dashboard')}
        />
      </div>
    );
  }

  const farmerKeys = Object.keys(groupedByFarmer);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-6xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-farm-600" />
            <span>Farm Basket & Order Fulfillment</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organized by individual farm harvest batches for transparent cold-chain dispatch.
          </p>
        </div>
        <span className="text-xs font-bold text-farm-700 bg-farm-50 px-3 py-1 rounded-xl border border-farm-200">
          {items.length} Unique Harvests
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Grouped by Farmer Channel (Instruction 41) */}
        <div className="lg:col-span-8 space-y-6">
          {farmerKeys.map((channelKey) => {
            const group = groupedByFarmer[channelKey];
            return (
              <div
                key={channelKey}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Farmer Group Header */}
                <div className="bg-farm-50/70 px-5 py-3.5 border-b border-farm-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-farm-600" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        {group.farmer?.channelName || 'Verified Farm Harvest'}
                      </h3>
                      <span className="text-[11px] text-slate-500">
                        Dispatched directly from {group.farmer?.location || 'Maharashtra'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-farm-700 bg-white px-2 py-0.5 rounded-md border border-farm-200">
                    {group.farmer?.channelId || 'DIRECT'}
                  </span>
                </div>

                {/* Items in this farm batch */}
                <div className="divide-y divide-slate-100 p-5 space-y-4">
                  {group.items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span>₹{item.price} / {item.unit}</span>
                          <span>•</span>
                          <span className="text-farm-600 font-semibold">
                            {item.availableStock} {item.unit} in stock
                          </span>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-slate-600 hover:text-slate-900 rounded-l-md"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-900 min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-slate-600 hover:text-slate-900 rounded-r-md"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              removeFromCart(item.id);
                              addToast({
                                type: 'info',
                                title: 'Removed',
                                message: `${item.name} removed from your basket.`,
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition rounded-md"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 block">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">Direct price</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Fulfillment Summary
            </h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Produce Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-farm-600" />
                  Direct Delivery ({farmerKeys.length} Farm{farmerKeys.length > 1 ? 's' : ''})
                </span>
                <span className="font-bold text-slate-900">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-farm-700">
                <span>Farmer Direct Savings</span>
                <span className="font-bold">Zero Middleman Markup</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Grand Total</span>
              <span className="text-2xl font-black text-slate-900">₹{grandTotal.toLocaleString()}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/customer/checkout')}
            >
              Proceed to Checkout
            </Button>

            <div className="p-3 bg-farm-50 rounded-2xl border border-farm-100 flex items-start gap-2 text-[11px] text-farm-800">
              <ShieldCheck className="w-4 h-4 text-farm-600 shrink-0 mt-0.5" />
              <span>
                100% Escrow Protection: Funds released to farmer only after successful doorstep delivery.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
