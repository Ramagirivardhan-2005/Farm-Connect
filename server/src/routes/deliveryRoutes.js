import { Router } from 'express';
import {
  getDeliveryDashboard,
  getDeliveryAgentChannels,
  getAvailablePickups,
  getActiveDelivery,
  getDeliveryHistory,
  getPartnerProfile,
  updatePartnerProfile,
  claimPickup,
  updateDeliveryStatus,
  requestDeliveryOtp,
  verifyDeliveryOtp,
} from '../controllers/deliveryController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDeliveryDashboard);
router.get('/channels', getDeliveryAgentChannels);
router.get('/available', getAvailablePickups);
router.get('/active', getActiveDelivery);
router.get('/history', getDeliveryHistory);
router.get('/profile', getPartnerProfile);
router.patch('/profile', updatePartnerProfile);
router.post('/claim/:orderId', claimPickup);
router.patch('/status/:orderId', updateDeliveryStatus);
router.post('/orders/:orderId/request-otp', requestDeliveryOtp);
router.post('/orders/:orderId/verify-otp', verifyDeliveryOtp);

export default router;
