import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const DEMO_USERS = {
  CUSTOMER: {
    id: 'usr-cust-1',
    userId: 'RV10241',
    username: 'Ramagiri Vardhan',
    email: 'vardhan@farmconnect.org',
    mobile: '+91 98765 43210',
    role: 'CUSTOMER',
    isEmailVerified: true,
    isMobileVerified: true,
    walletBalance: 2450,
    cartCount: 2,
    unreadNotifications: 3,
  },
  FARMER: {
    id: 'usr-farm-1',
    userId: 'KS99201',
    username: 'Kisan Ramesh Patil',
    email: 'ramesh.patil@greenfarms.org',
    mobile: '+91 94231 77654',
    role: 'FARMER',
    isEmailVerified: true,
    isMobileVerified: true,
    walletBalance: 84500,
    cartCount: 0,
    unreadNotifications: 5,
    farmerChannel: {
      channelId: 'FC-CH-00001245',
      name: 'Sahyadri Organic Orchards & Greens',
      status: 'ACTIVE',
      subscribersCount: 2840,
      rating: 4.9,
    },
  },
  DELIVERY_PARTNER: {
    id: 'usr-deliv-1',
    userId: 'DP88102',
    username: 'Suresh Express Rider',
    email: 'suresh.deliveries@farmconnect.org',
    mobile: '+91 98220 11988',
    role: 'DELIVERY_PARTNER',
    isEmailVerified: true,
    isMobileVerified: true,
    walletBalance: 4200,
    cartCount: 0,
    unreadNotifications: 2,
    vehicle: 'Electric Cargo Scooter (MH-14-EF-9201)',
  },
  SUPER_ADMIN: {
    id: 'usr-admin-1',
    userId: 'FCADMIN01',
    username: 'Super Admin Administrator',
    email: 'admin@farmconnect.org',
    mobile: '+91 99000 00001',
    role: 'SUPER_ADMIN',
    isEmailVerified: true,
    isMobileVerified: true,
    walletBalance: 0,
    cartCount: 0,
    unreadNotifications: 8,
  },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('farmconnect_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_USERS.CUSTOMER;
      }
    }
    return DEMO_USERS.CUSTOMER;
  });

  const [token, setToken] = useState(() => localStorage.getItem('farmconnect_token') || 'demo-jwt-token');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('farmconnect_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('farmconnect_user');
    }
  }, [currentUser]);

  const login = (user, jwtToken = 'demo-jwt-token') => {
    setCurrentUser(user);
    setToken(jwtToken);
    if (jwtToken) localStorage.setItem('farmconnect_token', jwtToken);
  };

  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('farmconnect_user');
    localStorage.removeItem('farmconnect_token');
  }, []);

  const updateProfile = (updates) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  // Auto-redirect on token expiry
  useEffect(() => {
    const handleExpiry = () => {
      logout();
      window.location.href = '/login';
    };
    window.addEventListener('auth:token-expired', handleExpiry);
    return () => window.removeEventListener('auth:token-expired', handleExpiry);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!currentUser,
        role: currentUser?.role || 'GUEST',
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
