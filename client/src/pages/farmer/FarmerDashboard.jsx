import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  Users,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  Store,
  ExternalLink
} from 'lucide-react';
import Button from '../../components/common/Button';
import OrderCard from '../../components/common/OrderCard';
import { MOCK_ORDERS, MOCK_PRODUCTS } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';

export default function FarmerDashboard() {
  const { currentUser } = useAuth();

  // Instruction 30: Analytics cards format
  const stats = [
    { label: 'Total Revenue', value: '₹1,24,500', icon: DollarSign, trend: '+14% this week', color: 'text-farm-700 bg-farm-100' },
    { label: 'Total Orders', value: '245', icon: ShoppingBag, trend: 'Lifetime', color: 'text-emerald-700 bg-emerald-100' },
    { label: 'Pending Arrival', value: '18', icon: Clock, trend: 'Action Needed', color: 'text-amber-700 bg-amber-100' },
    { label: 'Accepted Orders', value: '42', icon: CheckCircle2, trend: 'In Queue', color: 'text-sky-700 bg-sky-100' },
    { label: 'In Harvest / Process', value: '13', icon: Package, trend: 'Harvesting', color: 'text-purple-700 bg-purple-100' },
    { label: 'Delivered Fresh', value: '172', icon: Truck, trend: 'Completed', color: 'text-farm-700 bg-farm-100' },
    { label: 'Active Products', value: '14', icon: Layers, trend: 'In Stock', color: 'text-teal-700 bg-teal-100' },
    { label: 'Subscribers', value: '3,120', icon: Users, trend: '+85 new', color: 'text-indigo-700 bg-indigo-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Top Banner with Channel Identity */}
      <div className="bg-gradient-to-r from-farm-900 via-farm-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-farm-300 text-xs font-bold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5" />
            <span>Channel: {currentUser?.farmerChannel?.channelId || 'FC-CH-00001245'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {currentUser?.farmerChannel?.name || 'Sahyadri Organic Orchards & Greens'}
          </h1>
          <p className="text-xs sm:text-sm text-farm-100 max-w-xl">
            Manage your daily morning harvests, process customer dispatch queues, assign delivery partners, and review direct payouts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/farmer/items/new">
            <Button
              variant="secondary"
              size="md"
              icon={Plus}
              className="bg-white text-farm-900 hover:bg-farm-50 border-0 font-bold shadow-md"
            >
              Add New Harvest Item
            </Button>
          </Link>
          <Link to={`/channel/${currentUser?.farmerChannel?.channelId || 'FC-CH-00001245'}`}>
            <Button
              variant="outline"
              size="md"
              icon={ExternalLink}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Public Channel View
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Cards Grid (Instruction 30 & 85) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-xl ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <span className="text-[11px] font-semibold text-farm-700 bg-farm-50 px-2 py-0.5 rounded-md inline-block">
                {stat.trend}
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Action Section (Instruction 48 & 49) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-farm-600" />
              <span>Incoming Orders Requiring Action</span>
            </h2>
            <p className="text-xs text-slate-500">Step through the 13-state Order State Machine</p>
          </div>
          <Link
            to="/farmer/orders"
            className="text-xs font-bold text-farm-700 hover:text-farm-800 flex items-center gap-1"
          >
            <span>All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-4">
          {MOCK_ORDERS.slice(0, 2).map((order) => (
            <OrderCard key={order.id} order={order} role="FARMER" />
          ))}
        </div>
      </div>
    </div>
  );
}
