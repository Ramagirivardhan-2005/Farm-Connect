import { Router } from 'express';
import authRoutes from './authRoutes.js';
import channelRoutes from './channelRoutes.js';
import orderRoutes from './orderRoutes.js';
import deliveryRoutes from './deliveryRoutes.js';
import walletRoutes from './walletRoutes.js';
import aiRoutes from './aiRoutes.js';
import adminRoutes from './adminRoutes.js';
import farmerChannelRoutes from './farmerChannelRoutes.js';
import addressRoutes from './addressRoutes.js';
import promoRoutes from './promoRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/channels', channelRoutes);
router.use('/orders', orderRoutes);
router.use('/delivery', deliveryRoutes);
router.use('/wallet', walletRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/farmers', farmerChannelRoutes);
router.use('/addresses', addressRoutes);
router.use('/promos', promoRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FarmConnect Marketplace API',
  });
});

export default router;
