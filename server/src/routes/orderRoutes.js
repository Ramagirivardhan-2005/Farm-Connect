import { Router } from 'express';
import { createOrder, updateOrderStatus, getMyOrders } from '../controllers/orderController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.patch('/:orderId/status', updateOrderStatus);

export default router;
