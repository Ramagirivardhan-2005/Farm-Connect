import React, { useState } from 'react';
import { ShoppingBag, Search, Filter } from 'lucide-react';
import OrderCard from '../../components/common/OrderCard';
import EmptyState from '../../components/common/EmptyState';
import { MOCK_ORDERS } from '../../services/mockData';

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filterTabs = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Active & In Transit', value: 'ACTIVE' },
    { label: 'Completed', value: 'DELIVERED' },
  ];

  const filteredOrders = MOCK_ORDERS.filter((order) => {
    if (activeFilter === 'ACTIVE' && (order.status === 'DELIVERED' || order.status === 'CANCELLED')) {
      return false;
    }
    if (activeFilter === 'DELIVERED' && order.status !== 'DELIVERED') {
      return false;
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        order.orderId.toLowerCase().includes(q) ||
        order.items?.some((i) => i.name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-farm-600" />
            <span>My Farm Harvest Orders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track live dispatch updates and download farm invoices for all your fresh purchases.
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveFilter(tab.value)}
              className={`text-xs px-3.5 py-2 rounded-xl font-bold transition ${
                activeFilter === tab.value
                  ? 'bg-farm-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID or produce..."
            className="w-full text-xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-farm-600/20"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="You have not placed any orders matching this status filter."
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} role="CUSTOMER" />
          ))}
        </div>
      )}
    </div>
  );
}
