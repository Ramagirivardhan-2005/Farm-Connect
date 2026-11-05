import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, isAuthenticated, role } = useAuth();
  const location = useLocation();

  // If not logged in, redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is not permitted for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-lg text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              403 Forbidden Access
            </span>
            <h2 className="text-xl font-black text-slate-900">
              Restricted Area
            </h2>
            <p className="text-xs text-slate-500">
              Your current role is <strong className="text-slate-800 uppercase">{role}</strong>. This section is strictly restricted to authorized <strong>{allowedRoles.join(' / ')}</strong> personnel only.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Button
              variant="primary"
              size="md"
              icon={ArrowLeft}
              onClick={() => {
                if (role === 'FARMER') window.location.href = '/farmer/dashboard';
                else if (role === 'DELIVERY_PARTNER') window.location.href = '/delivery/dashboard';
                else if (role === 'SUPER_ADMIN') window.location.href = '/admin/dashboard';
                else window.location.href = '/customer/dashboard';
              }}
            >
              Return to My {role === 'SUPER_ADMIN' ? 'Admin' : role === 'FARMER' ? 'Farmer' : role === 'DELIVERY_PARTNER' ? 'Delivery' : 'Customer'} Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
