import { Router } from 'express';
import { productAssist } from '../controllers/aiController.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/product-assist', authenticate, aiLimiter, productAssist);

export default router;
