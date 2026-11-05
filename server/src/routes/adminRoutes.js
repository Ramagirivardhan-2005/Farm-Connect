import { Router } from 'express';
import {
  getDashboardMetrics,
  getPendingVerifications,
  reviewChannel,
  getHeroSlides,
  createHeroSlide,
} from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Publicly readable hero slides for login screen carousel
router.get('/hero-content/public', getHeroSlides);

// Protected Super Admin routes
router.use(authenticate, authorizeRoles('SUPER_ADMIN'));

router.get('/metrics', getDashboardMetrics);
router.get('/verifications', getPendingVerifications);
router.patch('/verifications/:channelId', reviewChannel);
router.get('/hero-content', getHeroSlides);
router.post('/hero-content', createHeroSlide);

export default router;
