import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Menu,
  Search,
  Wallet
} from 'lucide-react';
import FarmConnectLogo from '../common/FarmConnectLogo';
import SearchBar from '../common/SearchBar';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header({ onToggleSidebar }) {
  const { currentUser, role, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: 'Your order ORD-2026-9182 is now PACKED & ready for pickup!', time: '10m ago', unread: true },
    { id: 2, text: 'Sahyadri Organic Orchards published a new harvest post.', time: '1h ago', unread: true },
    { id: 3, text: '₹600 credited to your Secure Purse from farm discount.', time: '1d ago', unread: false },
  ];

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/customer/channels?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <FarmConnectLogo size="small" showTagline={false} />
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Right: Notifications, Cart, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Secure Purse Quick Link - Customer only */}
          {role === 'CUSTOMER' && (
            <Link
              to="/customer/wallet"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
              title="Secure Purse Wallet"
            >
              <Wallet className="w-3.5 h-3.5 text-farm-600" />
              <span>₹{currentUser?.walletBalance?.toLocaleString() || 0}</span>
            </Link>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {currentUser?.unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  <span className="text-[11px] font-semibold text-farm-600 cursor-pointer">Mark all as read</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 text-left">
                      <p className={`text-xs ${n.unread ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                        {n.text}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon (Customer only) */}
          {role === 'CUSTOMER' && (
            <Link
              to="/customer/cart"
              className="relative p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition focus:outline-none"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-farm-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 sm:px-2 rounded-xl hover:bg-slate-100 transition focus:outline-none"
            >
              <div className="w-8 h-8 rounded-xl bg-farm-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]">
                  {currentUser?.username || 'User'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentUser?.userId || 'ID'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900 text-sm">{currentUser?.username}</p>
                  <p className="text-[11px] font-mono text-farm-600 font-semibold">{currentUser?.userId}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                </div>

                <Link
                  to={role === 'FARMER' ? '/farmer/settings' : role === 'DELIVERY_PARTNER' ? '/delivery/profile' : '/customer/settings'}
                  onClick={() => setShowUserMenu(false)}
                  className="w-full px-3 py-2 rounded-xl flex items-center gap-2 font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Account Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar onSearch={handleSearch} placeholder="Search vegetables, fruits, farmers..." />
      </div>
    </header>
  );
}
