import crypto from 'crypto';
import Razorpay from 'razorpay';
import Wallet, { WalletTransaction } from '../models/Wallet.js';

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function getBalance(req, res, next) {
  try {
    const userId = req.user.id;
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0 });

    const transactions = await WalletTransaction.find({ userId }).sort({ createdAt: -1 }).limit(50);
    return res.json({ success: true, balance: wallet.balance, transactions });
  } catch (err) {
    next(err);
  }
}

export async function getTransactions(req, res, next) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;
    const filter = { userId };
    if (type) filter.type = type;
    const transactions = await WalletTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await WalletTransaction.countDocuments(filter);
    return res.json({ success: true, transactions, total, page: Number(page) });
  } catch (err) {
    next(err);
  }
}

export async function createRazorpayOrder(req, res, next) {
  try {
    const { amount } = req.body;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 10) {
      return res.status(400).json({ success: false, message: 'Minimum recharge amount is ₹10.' });
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to server .env.' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(numAmount * 100), // paise
      currency: 'INR',
      receipt: `wallet_${req.user.id}_${Date.now()}`,
      notes: { userId: req.user.id, purpose: 'wallet_recharge' },
    });

    return res.json({
      success: true,
      razorpayOrderId: order.id,
      amount: numAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyRazorpayPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields.' });
    }

    // HMAC-SHA256 verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment signature verification failed. Possible fraud attempt.' });
    }

    // Check this payment hasn't been processed already
    const existing = await WalletTransaction.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This payment has already been processed.' });
    }

    const numAmount = parseFloat(amount);

    // Credit wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0 });
    wallet.balance += numAmount;
    await wallet.save();

    const tx = await WalletTransaction.create({
      txId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      walletId: wallet._id,
      userId,
      type: 'WALLET_RECHARGE',
      amount: numAmount,
      balanceAfter: wallet.balance,
      reference: `Razorpay recharge | Order: ${razorpay_order_id}`,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'SUCCESS',
    });

    return res.json({
      success: true,
      message: `₹${numAmount.toLocaleString()} credited to your wallet.`,
      balance: wallet.balance,
      transaction: tx,
    });
  } catch (err) {
    next(err);
  }
}

export async function addFunds(req, res, next) {
  // Legacy direct add (for demo/testing without Razorpay)
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid recharge amount is required.' });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) wallet = await Wallet.create({ userId, balance: 0 });
    wallet.balance += numAmount;
    await wallet.save();

    const tx = await WalletTransaction.create({
      txId: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      walletId: wallet._id,
      userId,
      type: 'WALLET_RECHARGE',
      amount: numAmount,
      balanceAfter: wallet.balance,
      reference: 'Manual top-up (demo)',
      status: 'SUCCESS',
    });

    return res.json({
      success: true,
      message: `₹${numAmount.toLocaleString()} credited to Secure Purse.`,
      balance: wallet.balance,
      transaction: tx,
    });
  } catch (err) {
    next(err);
  }
}

export default { getBalance, getTransactions, createRazorpayOrder, verifyRazorpayPayment, addFunds };
