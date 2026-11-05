import { Router } from 'express';
import { validatePromo, getPromos } from '../controllers/promoController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authenticate);
router.get('/', getPromos);
router.post('/validate', validatePromo);
export default router;
