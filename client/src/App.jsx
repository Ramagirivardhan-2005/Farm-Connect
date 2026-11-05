import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/common/Toast';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ChannelsPage from './pages/customer/ChannelsPage';
import ChannelDetailPage from './pages/customer/ChannelDetailPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import DeliveryTrackingPage from './pages/customer/DeliveryTrackingPage';
import SecurePursePage from './pages/customer/SecurePursePage';
import CreateChannelPage from './pages/customer/CreateChannelPage';
import AddressesPage from './pages/customer/AddressesPage';
import TransactionsPage from './pages/customer/TransactionsPage';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerItemForm from './pages/farmer/FarmerItemForm';
import FarmerOrdersPage from './pages/farmer/FarmerOrdersPage';
import FarmerBannersPage from './pages/farmer/FarmerBannersPage';
import DeliveryChannelsPage from './pages/farmer/DeliveryChannelsPage';
import AgentsPage from './pages/farmer/AgentsPage';
import FarmerPostsPage from './pages/farmer/FarmerPostsPage';

// Delivery Pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminHeroContentPage from './pages/admin/AdminHeroContentPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="/explore" element={<Navigate to="/customer/dashboard" replace />} />

              {/* Public Authentication Pages (Split-Screen Farmer Hero) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Main Authenticated Platform */}
              <Route element={<DashboardLayout />}>
                {/* Customer Routes */}
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/customer/channels" element={<ChannelsPage />} />
                <Route path="/customer/subscribers" element={<ChannelsPage />} />
                <Route path="/customer/cart" element={<CartPage />} />
                <Route path="/customer/checkout" element={<CheckoutPage />} />
                <Route path="/customer/orders" element={<OrdersPage />} />
                <Route path="/customer/orders/:orderId" element={<DeliveryTrackingPage />} />
                <Route path="/customer/orders/:orderId/track" element={<DeliveryTrackingPage />} />
                <Route path="/customer/wallet" element={<SecurePursePage />} />
                <Route path="/customer/addresses" element={<AddressesPage />} />
                <Route path="/customer/transactions" element={<TransactionsPage />} />
                <Route path="/customer/promos" element={<ChannelsPage />} />
                <Route path="/customer/comments" element={<ChannelDetailPage />} />
                <Route path="/customer/history" element={<OrdersPage />} />
                <Route path="/customer/settings" element={<SecurePursePage />} />
                <Route path="/customer/create-channel" element={<CreateChannelPage />} />

                {/* Shared Detail Routes */}
                <Route path="/channel/:channelId" element={<ChannelDetailPage />} />
                <Route path="/item/:itemId" element={<ProductDetailPage />} />
                <Route path="/order/:orderId" element={<DeliveryTrackingPage />} />
                <Route path="/order/:orderId/track" element={<DeliveryTrackingPage />} />

                {/* Farmer Routes (Protected: FARMER & SUPER_ADMIN) */}
                <Route
                  path="/farmer/*"
                  element={
                    <ProtectedRoute allowedRoles={['FARMER', 'SUPER_ADMIN']}>
                      <Routes>
                        <Route path="dashboard" element={<FarmerDashboard />} />
                        <Route path="channel" element={<ChannelDetailPage />} />
                        <Route path="items" element={<CustomerDashboard />} />
                        <Route path="items/new" element={<FarmerItemForm />} />
                        <Route path="inventory" element={<FarmerDashboard />} />
                        <Route path="orders" element={<FarmerOrdersPage />} />
                        <Route path="orders/:orderId" element={<FarmerOrdersPage />} />
                        <Route path="delivery-channels" element={<DeliveryChannelsPage />} />
                        <Route path="agents" element={<AgentsPage />} />
                        <Route path="delivery-partners" element={<DeliveryChannelsPage />} />
                        <Route path="delivery" element={<DeliveryDashboard />} />
                        <Route path="transactions" element={<TransactionsPage />} />
                        <Route path="subscribers" element={<ChannelsPage />} />
                        <Route path="comments" element={<ChannelDetailPage />} />
                        <Route path="posts" element={<FarmerPostsPage />} />
                        <Route path="banners" element={<FarmerBannersPage />} />
                        <Route path="revenue" element={<SecurePursePage />} />
                        <Route path="settings" element={<CreateChannelPage />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />

                {/* Delivery Routes (Protected: DELIVERY_PARTNER & SUPER_ADMIN) */}
                <Route
                  path="/delivery/*"
                  element={
                    <ProtectedRoute allowedRoles={['DELIVERY_PARTNER', 'SUPER_ADMIN']}>
                      <Routes>
                        <Route path="dashboard" element={<DeliveryDashboard />} />
                        <Route path="channels" element={<DeliveryDashboard />} />
                        <Route path="available" element={<DeliveryDashboard />} />
                        <Route path="active" element={<DeliveryDashboard />} />
                        <Route path="orders" element={<DeliveryDashboard />} />
                        <Route path="earnings" element={<DeliveryDashboard />} />
                        <Route path="history" element={<DeliveryDashboard />} />
                        <Route path="profile" element={<DeliveryDashboard />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />

                {/* Super Admin Routes (Protected: SUPER_ADMIN ONLY) */}
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="verifications" element={<AdminVerificationsPage />} />
                        <Route path="hero-content" element={<AdminHeroContentPage />} />
                        <Route path="banners" element={<AdminBannersPage />} />
                        <Route path="channels" element={<ChannelsPage />} />
                        <Route path="users" element={<AdminDashboard />} />
                        <Route path="orders" element={<FarmerOrdersPage />} />
                        <Route path="audit-logs" element={<AdminDashboard />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
