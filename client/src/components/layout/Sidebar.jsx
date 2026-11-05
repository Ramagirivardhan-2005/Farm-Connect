import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  UserCheck,
  ShoppingBag,
  Clock,
  MessageSquare,
  Wallet,
  Settings,
  LogOut,
  Users,
  Package,
  Layers,
  Truck,
  Image as ImageIcon,
  DollarSign,
  Shield,
  FileCheck,
  Activity,
  X,
  TrendingUp,
  MapPin,
  Receipt,
  Home,
  Tag,
  Radio,
} from 'lucide-react';
import FarmConnectLogo from '../common/FarmConnectLogo';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const customerNav = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/customer/dashboard' },
    { label: 'Subscribed Channels', icon: Users, path: '/customer/channels' },
    { label: 'My Orders', icon: ShoppingBag, path: '/customer/orders' },
    { label: 'Secure Purse', icon: Wallet, path: '/customer/wallet' },
    { label: 'Transactions', icon: Receipt, path: '/customer/transactions' },
    { label: 'My Addresses', icon: Home, path: '/customer/addresses' },
    { label: 'Promo Codes', icon: Tag, path: '/customer/promos' },
    { label: 'My Comments', icon: MessageSquare, path: '/customer/comments' },
    { label: 'Order History', icon: Clock, path: '/customer/history' },
    { label: 'Account Settings', icon: Settings, path: '/customer/settings' },
  ];

  const farmerNav = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/farmer/dashboard' },
    { label: 'My Channel', icon: Sprout, path: '/farmer/channel' },
    { label: 'Items & Products', icon: Package, path: '/farmer/items' },
    { label: 'Inventory', icon: Layers, path: '/farmer/inventory' },
    { label: 'Orders Management', icon: ShoppingBag, path: '/farmer/orders' },
    { label: 'Delivery Channels', icon: Radio, path: '/farmer/delivery-channels', badge: 'New' },
    { label: 'Delivery Agents', icon: Truck, path: '/farmer/agents' },
    { label: 'Transactions', icon: Receipt, path: '/farmer/transactions' },
    { label: 'Subscribers', icon: Users, path: '/farmer/subscribers' },
    { label: 'Customer Comments', icon: MessageSquare, path: '/farmer/comments' },
    { label: 'Harvest Posts', icon: Activity, path: '/farmer/posts' },
    { label: 'Promotional Banners', icon: ImageIcon, path: '/farmer/banners' },
    { label: 'Revenue & Payouts', icon: DollarSign, path: '/farmer/revenue' },
    { label: 'Account Settings', icon: Settings, path: '/farmer/settings' },
  ];

  const deliveryNav = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/delivery/dashboard' },
    { label: 'My Channels', icon: Radio, path: '/delivery/channels' },
    { label: 'Available Orders', icon: Package, path: '/delivery/available' },
    { label: 'Active Delivery', icon: Truck, path: '/delivery/active' },
    { label: 'My Orders', icon: ShoppingBag, path: '/delivery/orders' },
    { label: 'Earnings', icon: DollarSign, path: '/delivery/earnings' },
    { label: 'Delivery History', icon: Clock, path: '/delivery/history' },
    { label: 'Partner Profile', icon: Settings, path: '/delivery/profile' },
  ];

  const adminNav = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Farmer Verifications', icon: FileCheck, path: '/admin/verifications' },
    { label: 'Hero Content CMS', icon: ImageIcon, path: '/admin/hero-content' },
    { label: 'Promotional Banners', icon: Layers, path: '/admin/banners' },
    { label: 'Channel Oversight', icon: Sprout, path: '/admin/channels' },
    { label: 'User Directory', icon: Users, path: '/admin/users' },
    { label: 'Global Orders', icon: ShoppingBag, path: '/admin/orders' },
    { label: 'Security Audit Logs', icon: Activity, path: '/admin/audit-logs' },
  ];

  const navItems = {
    CUSTOMER: customerNav,
    FARMER: farmerNav,
    DELIVERY_PARTNER: deliveryNav,
    SUPER_ADMIN: adminNav,
  }[role] || customerNav;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white border-r border-slate-200/80 p-4">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between pb-6 px-2 border-b border-slate-100">
          <FarmConnectLogo size="default" showTagline={true} />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Card Tag */}
        <div className="my-4 p-3 rounded-2xl bg-farm-50/70 border border-farm-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-farm-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentUser?.username || 'User Profile'}
            </p>
            <p className="text-[11px] font-mono text-farm-700 font-semibold truncate">
              {currentUser?.userId || 'ID'}
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-farm-600 text-white shadow-sm shadow-farm-600/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-farm-100 text-farm-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 h-screen sticky top-0 overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="relative w-72 max-w-xs h-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
