import { Router } from 'express';
import { getBalance, getTransactions, createRazorpayOrder, verifyRazorpayPayment, addFunds } from '../controllers/walletController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();
router.use(authenticate);

router.get('/balance', getBalance);
router.get('/transactions', getTransactions);
router.post('/add-funds', addFunds);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

export default router;
