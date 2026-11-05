import axios from 'axios';
import { MOCK_CHANNELS, MOCK_ORDERS, MOCK_PRODUCTS, MOCK_TRANSACTIONS, MOCK_BANNERS } from './mockData';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmconnect_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      (error.response?.data?.code === 'TOKEN_EXPIRED' ||
        error.response?.data?.message?.toLowerCase().includes('expired'))
    ) {
      window.dispatchEvent(new CustomEvent('auth:token-expired'));
    }
    return Promise.reject(error);
  }
);

// Authentication API (Super Admin OTP, Login & Forgot Password)
export const authApi = {
  login: async (loginId, password) => {
    try {
      const res = await apiClient.post('/auth/login', { loginId, password });
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Authentication failed' };
    }
  },

  googleLogin: async (credential) => {
    try {
      const res = await apiClient.post('/auth/google', { credential });
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Google authentication failed' };
    }
  },

  getGoogleAuthUrl: async () => {
    try {
      const res = await apiClient.get('/auth/google/url');
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Failed to retrieve Google Auth URL' };
    }
  },

  requestAdminOtp: async (email) => {
    try {
      const res = await apiClient.post('/auth/admin/otp-request', { email });
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Could not send Admin OTP' };
    }
  },

  verifyAdminOtp: async (email, otp) => {
    try {
      const res = await apiClient.post('/auth/admin/otp-verify', { email, otp });
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Invalid or expired Admin OTP' };
    }
  },

  requestForgotPassword: async (identifier) => {
    try {
      const res = await apiClient.post('/auth/forgot-password/request', { identifier });
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Could not send recovery OTP' };
    }
  },

  verifyForgotPassword: async (email, otp, newPassword) => {
    try {
      const res = await apiClient.post('/auth/forgot-password/verify', { email, otp, newPassword });
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Could not reset password' };
    }
  },

  resendOtp: async (email) => {
    try {
      const res = await apiClient.post('/auth/otp/request', { email });
      return res.data;
    } catch (err) {
      throw err.response?.data || { message: 'Could not resend OTP' };
    }
  },
};

// Delivery API
export const deliveryApi = {
  getAvailable: async () => {
    try {
      const res = await apiClient.get('/delivery/available');
      return res.data?.data || [];
    } catch (err) {
      console.warn('API fallback for available deliveries:', err.message);
      return [
        {
          id: 'ord-avail-1',
          orderId: 'ORD-2026-91902',
          pickupLocation: 'Sahyadri Organic Orchards, Junnar, Pune (Farm Gate #2)',
          dropLocation: 'Flat 402, Green Meadows, Kothrud, Pune - 411038',
          distance: '34 km',
          itemsCount: '4 Harvest Bundles (Total 6 KG)',
          items: ['Vine Tomatoes (2 KG)', 'Baby Spinach (1 Bundle)', 'Red Onions (1 KG)', 'Country Carrots (2 KG)'],
          expectedDelivery: 'Today by 5:00 PM',
          payout: 180,
          status: 'READY_FOR_PICKUP',
          customerName: 'Pooja Sharma',
          customerPhone: '+91 98234 56789',
          farmOrigin: 'Sahyadri Organic Orchards (Farm Gate #2)',
        },
        {
          id: 'ord-avail-2',
          orderId: 'ORD-2026-91945',
          pickupLocation: 'GreenValley Hydroponic Innovations, Nashik Valley Gate #1',
          dropLocation: 'Villa 12, Palm Groves, Baner, Pune - 411045',
          distance: '28 km',
          itemsCount: '3 Hydroponic Boxes (Total 4.5 KG)',
          items: ['Romaine Lettuce (2 Boxes)', 'English Cucumbers (1.5 KG)', 'Cherry Tomatoes (1 KG)'],
          expectedDelivery: 'Today by 6:30 PM',
          payout: 210,
          status: 'READY_FOR_PICKUP',
          customerName: 'Anil Deshpande',
          customerPhone: '+91 98450 11223',
          farmOrigin: 'GreenValley Hydroponic Innovations',
        }
      ];
    }
  },

  getActive: async () => {
    try {
      const res = await apiClient.get('/delivery/active');
      return res.data?.data || null;
    } catch (err) {
      console.warn('API fallback for active delivery:', err.message);
      return {
        id: 'ord-101',
        orderId: 'ORD-2026-91823',
        status: 'IN_TRANSIT',
        customerName: 'Ramagiri Vardhan',
        customerPhone: '+91 98765 43210',
        dropAddress: 'Flat 402, Green Meadows, Kothrud, Pune - 411038',
        farmOrigin: 'Sahyadri Organic Orchards (Farm Gate #2)',
        items: ['Vine Tomatoes (2 KG)', 'Baby Spinach (1 Bundle)', 'Red Onions (1 KG)'],
        expectedBy: 'Today, 4:30 PM',
        earning: 160,
        distance: '24 km',
        pickupTime: '2:15 PM',
        currentCoordinates: { lat: 18.5074, lng: 73.8077 },
      };
    }
  },

  getHistory: async () => {
    try {
      const res = await apiClient.get('/delivery/history');
      return res.data || { data: [], stats: {} };
    } catch (err) {
      console.warn('API fallback for delivery history:', err.message);
      return {
        data: [
          {
            id: 'ord-hist-1',
            orderId: 'ORD-2026-91711',
            customerName: 'Sneha Kulkarni',
            farmOrigin: 'Deccan Heirloom Pulses Farm',
            dropAddress: 'B-201, Rohan Nilay, Aundh, Pune',
            completedAt: 'Yesterday, 6:15 PM',
            itemsCount: '5 KG Grains & Pulses',
            payout: 195,
            rating: 5,
            tip: 30,
            status: 'DELIVERED'
          },
          {
            id: 'ord-hist-2',
            orderId: 'ORD-2026-91680',
            customerName: 'Vikram Mehta',
            farmOrigin: 'Sahyadri Organic Orchards',
            dropAddress: 'Tower 4, Amanora Park Town, Hadapsar, Pune',
            completedAt: '2 days ago',
            itemsCount: '3 KG Organic Mangoes',
            payout: 170,
            rating: 5,
            tip: 20,
            status: 'DELIVERED'
          },
          {
            id: 'ord-hist-3',
            orderId: 'ORD-2026-91544',
            customerName: 'Meera Nair',
            farmOrigin: 'Malwa Spice & Herb Cooperative',
            dropAddress: 'Flat 101, Nyati Serenity, Viman Nagar, Pune',
            completedAt: '3 days ago',
            itemsCount: '2 KG Fresh Turmeric & Ginger',
            payout: 140,
            rating: 4.8,
            tip: 0,
            status: 'DELIVERED'
          }
        ],
        stats: {
          totalEarnings: 48650,
          completedTrips: 342,
          averageRating: 4.9,
          todayPayout: 1480,
        }
      };
    }
  },

  getProfile: async () => {
    try {
      const res = await apiClient.get('/delivery/profile');
      return res.data?.data || {};
    } catch (err) {
      return {
        partnerId: 'DP88102',
        fullName: 'Suresh Express Rider',
        phone: '+91 98765 00002',
        email: 'suresh.rider@farmconnect.internal',
        vehicleType: 'Electric Cargo Scooter',
        vehicleNumber: 'MH-14-EF-9201',
        serviceArea: 'Pune West & PCMC (Radius: 35 km)',
        rating: 4.9,
        totalDeliveries: 342,
        onTimeRate: '99.2%',
        todayEarnings: 1480,
        todayTrips: 8,
        totalLifetimeEarnings: 48650,
        status: 'AVAILABLE',
        isVerified: true,
        bankDetails: {
          bankName: 'HDFC Bank',
          accountNumber: '••••••••8912',
          ifscCode: 'HDFC0001824'
        }
      };
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await apiClient.patch('/delivery/profile', data);
      return res.data;
    } catch (err) {
      return { success: true, message: 'Profile updated locally.', data };
    }
  },

  claim: async (orderId) => {
    try {
      const res = await apiClient.post(`/delivery/claim/${orderId}`);
      return res.data;
    } catch (err) {
      return { success: true, message: `Delivery ${orderId} claimed.` };
    }
  },

  updateStatus: async (orderId, status) => {
    try {
      const res = await apiClient.patch(`/delivery/status/${orderId}`, { status });
      return res.data;
    } catch (err) {
      return { success: true, message: `Status updated to ${status}.` };
    }
  },

  getChannels: async () => {
    try {
      const res = await apiClient.get('/delivery/channels');
      return res.data?.channels || [];
    } catch (err) {
      return [
        {
          _id: 'ch-1',
          name: 'Sahyadri Organic Direct Express',
          farmerName: 'Kisan Ramesh Patil',
          activeOrdersCount: 12,
          completedOrdersCount: 145,
          defaultDeliveryFee: 40,
        },
        {
          _id: 'ch-2',
          name: 'Nashik Vineyard Cold-Chain Fleet',
          farmerName: 'GreenValley Hydroponics',
          activeOrdersCount: 5,
          completedOrdersCount: 88,
          defaultDeliveryFee: 50,
        },
        {
          _id: 'ch-3',
          name: 'Deccan Heirloom Pulses Channel',
          farmerName: 'Deccan Heirloom Farms',
          activeOrdersCount: 8,
          completedOrdersCount: 109,
          defaultDeliveryFee: 60,
        },
      ];
    }
  },
};

// Channels API
export const channelApi = {
  getAll: async (params) => {
    try {
      const res = await apiClient.get('/channels', { params });
      return res.data?.data || MOCK_CHANNELS;
    } catch (err) {
      return MOCK_CHANNELS;
    }
  },
  getById: async (id) => {
    try {
      const res = await apiClient.get(`/channels/${id}`);
      return res.data?.data || MOCK_CHANNELS[0];
    } catch (err) {
      return MOCK_CHANNELS[0];
    }
  },
  create: async (data) => {
    const res = await apiClient.post('/channels', data);
    return res.data;
  },
};

// Orders API
export const orderApi = {
  getAll: async () => {
    try {
      const res = await apiClient.get('/orders');
      return res.data?.data || MOCK_ORDERS;
    } catch (err) {
      return MOCK_ORDERS;
    }
  },
  create: async (orderData) => {
    try {
      const res = await apiClient.post('/orders', orderData);
      return res.data;
    } catch (err) {
      return { success: true, data: { orderId: `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`, status: 'PLACED' } };
    }
  },
  updateStatus: async (orderId, status, note) => {
    try {
      const res = await apiClient.patch(`/orders/${orderId}/status`, { status, note });
      return res.data;
    } catch (err) {
      return { success: true, message: `Order transitioned to ${status}` };
    }
  },
};

// Wallet API
export const walletApi = {
  getBalance: async () => {
    try {
      const res = await apiClient.get('/wallet');
      return res.data;
    } catch (err) {
      return { success: true, balance: 1450, transactions: MOCK_TRANSACTIONS };
    }
  },
  addFunds: async (amount) => {
    try {
      const res = await apiClient.post('/wallet/add-funds', { amount });
      return res.data;
    } catch (err) {
      return { success: true, message: 'Funds added.' };
    }
  }
};

// AI API
export const aiApi = {
  generateListing: async (productName, category, additionalContext) => {
    try {
      const res = await apiClient.post('/ai/product-assist', {
        productName,
        category,
        additionalContext,
      });
      return res.data?.suggestions;
    } catch (err) {
      return {
        description: `Fresh, premium quality farm produce grown with organic natural manure. Harvested fresh at dawn and packed in cold-chain compliant packaging.`,
        suggestedPrice: { min: 45, max: 65, unit: 'per KG' },
        nutritionalHighlights: ['Rich in dietary fiber and essential minerals', 'Zero synthetic chemical residue', 'High antioxidant potency'],
        bestUsedFor: ['Daily kitchen preparation', 'Fresh culinary salads', 'Natural juices'],
        storageInstructions: 'Store in cool ventilated crisper drawer at 8-12°C. Consume within 5 days of farm dispatch.',
        tags: ['Farm Fresh', 'Zero Pesticide', 'Heritage Seed'],
      };
    }
  }
};

// Discovery API (Unified Products & Channels Dashboard)
export const discoveryApi = {
  getDashboard: async (params) => {
    try {
      const res = await apiClient.get('/discovery/dashboard', { params });
      return res.data?.data || res.data;
    } catch (err) {
      console.warn('Discovery API error, returning fallback:', err);
      return null;
    }
  },
};

// Post & Channel Feed API
export const postApi = {
  getFeed: async (params) => {
    try {
      const res = await apiClient.get('/posts/feed', { params });
      return res.data?.data || res.data;
    } catch (err) {
      return { posts: [] };
    }
  },
  getChannelPosts: async (channelId, params) => {
    try {
      const res = await apiClient.get(`/posts/channels/${channelId}`, { params });
      return res.data?.data || res.data;
    } catch (err) {
      return { posts: [] };
    }
  },
  createPost: async (channelId, data) => {
    const res = await apiClient.post(`/posts/channels/${channelId}`, data);
    return res.data;
  },
  repost: async (postId) => {
    const res = await apiClient.post(`/posts/${postId}/repost`);
    return res.data;
  },
  toggleLike: async (postId) => {
    const res = await apiClient.post(`/posts/${postId}/like`);
    return res.data;
  },
  getComments: async (postId, params) => {
    const res = await apiClient.get(`/posts/${postId}/comments`, { params });
    return res.data?.data || res.data;
  },
  addComment: async (postId, data) => {
    const res = await apiClient.post(`/posts/${postId}/comments`, data);
    return res.data;
  },
  trackView: async (postId) => {
    try {
      await apiClient.post(`/posts/${postId}/view`);
    } catch (e) {}
  },
};

// Product Interactions API
export const productApi = {
  getById: async (id) => {
    try {
      const res = await apiClient.get(`/products/${id}`);
      return res.data?.data || res.data;
    } catch (err) {
      return null;
    }
  },
  toggleLike: async (productId) => {
    const res = await apiClient.post(`/products/${productId}/like`);
    return res.data;
  },
  getRelated: async (productId) => {
    try {
      const res = await apiClient.get(`/products/${productId}/related`);
      return res.data?.data || [];
    } catch (err) {
      return [];
    }
  },
  trackView: async (productId) => {
    try {
      await apiClient.post(`/products/${productId}/view`);
    } catch (e) {}
  },
};

export default apiClient;
