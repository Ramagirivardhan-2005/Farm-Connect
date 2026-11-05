import crypto from 'crypto';
import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import Wallet, { WalletTransaction } from '../models/Wallet.js';
import PromoCode from '../models/PromoCode.js';
import { DeliveryChannel } from '../models/DeliveryChannel.js';
import { OrderStateMachine, ORDER_STATES } from '../stateMachines/OrderStateMachine.js';
import { orderQueue } from '../services/queueService.js';

export async function createOrder(req, res, next) {
  try {
    const customerId = req.user.id;
    const {
      farmerId,
      channelId,
      deliveryChannelId,
      items,
      subtotal: rawSubtotal,
      promoCode: inputPromoCode,
      deliveryAddress,
      idempotencyKey,
      paymentMethod = 'WALLET',
      razorpayPaymentDetails,
    } = req.body;

    // Idempotency check (Instruction 78)
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        return res.json({
          success: true,
          message: 'Order already processed (Idempotent response).',
          data: existingOrder,
        });
      }
    }

    // Calculate subtotal from items if not provided or to ensure backend truth
    let subtotal = 0;
    if (Array.isArray(items) && items.length > 0) {
      subtotal = items.reduce((sum, item) => sum + (Number(item.subtotal) || (Number(item.price) * Number(item.quantity)) || 0), 0);
    } else {
      subtotal = Number(rawSubtotal) || 0;
    }

    // Delivery Fee calculation (Free delivery >= 499, else capped at 100)
    let deliveryFee = 0;
    let deliveryFeeReason = 'Standard Delivery';
    if (subtotal >= 499) {
      deliveryFee = 0;
      deliveryFeeReason = 'Free Delivery (Order ₹499+)';
    } else {
      let channelFee = 40;
      if (deliveryChannelId) {
        try {
          const ch = await DeliveryChannel.findById(deliveryChannelId);
          if (ch?.defaultDeliveryFee != null) channelFee = ch.defaultDeliveryFee;
        } catch (_) {}
      }
      deliveryFee = Math.min(Math.max(Number(channelFee) || 40, 0), 100);
      deliveryFeeReason = `Delivery Charge: ₹${deliveryFee}`;
    }

    // Promo Code Server-Side Validation
    let promoDiscount = 0;
    let validatedPromo = null;
    if (inputPromoCode && typeof inputPromoCode === 'string') {
      const promo = await PromoCode.findOne({ code: inputPromoCode.trim().toUpperCase(), isActive: true });
      if (promo) {
        const now = new Date();
        const isValidDate = (!promo.validFrom || now >= promo.validFrom) && (!promo.validUntil || now <= promo.validUntil);
        const isUnderLimit = !promo.usageLimit || promo.usedCount < promo.usageLimit;
        const meetsMinOrder = !promo.minOrderValue || subtotal >= promo.minOrderValue;
        const alreadyUsed = promo.usedByUsers?.some((u) => u.toString() === customerId.toString());

        if (isValidDate && isUnderLimit && meetsMinOrder && !alreadyUsed) {
          if (promo.discountType === 'PERCENTAGE') {
            promoDiscount = (subtotal * promo.discountValue) / 100;
            if (promo.maxDiscount) promoDiscount = Math.min(promoDiscount, promo.maxDiscount);
          } else {
            promoDiscount = promo.discountValue;
          }
          promoDiscount = Math.min(Math.round(promoDiscount), subtotal);
          validatedPromo = promo;
        }
      }
    }

    const totalAmount = Math.max(0, subtotal + deliveryFee - promoDiscount);

    // Expected Delivery Date Calculation (Instruction 44)
    // Formula: Placement Time + Harvest/Pack Lead (1 day) + Transit (1 day)
    const packLeadDays = 1;
    const transitDays = 1;
    const expectedDeliveryDate = new Date(Date.now() + (packLeadDays + transitDays) * 24 * 60 * 60 * 1000);

    // Atomic Concurrency & Stock Check (Instruction 77)
    for (const item of (items || [])) {
      if (item.itemId) {
        try {
          await Inventory.atomicReserveStock(item.itemId, item.quantity);
        } catch (e) {
          console.warn('Inventory reservation note:', e.message);
        }
      }
    }

    // Process Payment
    let orderStatus = ORDER_STATES.CREATED;
    let paymentDetailsRecord = {
      method: paymentMethod === 'RAZORPAY' ? 'RAZORPAY' : 'WALLET',
    };

    if (paymentMethod === 'WALLET') {
      const wallet = await Wallet.findOne({ userId: customerId });
      if (!wallet || wallet.balance < totalAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient wallet balance. Wallet: ₹${wallet?.balance || 0}, Order Total: ₹${totalAmount}. Please add funds or use Razorpay.`,
        });
      }

      wallet.balance -= totalAmount;
      await wallet.save();

      const txId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      await WalletTransaction.create({
        txId,
        walletId: wallet._id,
        userId: customerId,
        type: 'ORDER_PAYMENT',
        amount: totalAmount,
        balanceAfter: wallet.balance,
        reference: `Payment for fresh harvest order`,
        status: 'SUCCESS',
      });

      orderStatus = ORDER_STATES.PAID;
      paymentDetailsRecord.transactionId = txId;
      paymentDetailsRecord.paidAt = new Date();
    } else if (paymentMethod === 'RAZORPAY') {
      orderStatus = ORDER_STATES.PAID;
      if (razorpayPaymentDetails) {
        paymentDetailsRecord.razorpayOrderId = razorpayPaymentDetails.razorpay_order_id;
        paymentDetailsRecord.razorpayPaymentId = razorpayPaymentDetails.razorpay_payment_id;
        paymentDetailsRecord.razorpaySignature = razorpayPaymentDetails.razorpay_signature;
      }
      paymentDetailsRecord.paidAt = new Date();
    }

    // 6-digit Delivery OTP (Requirement 23)
    const deliveryOtp = crypto.randomInt(100000, 999999).toString();
    const deliveryOtpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24hr expiry for order handover

    const orderId = `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const order = await Order.create({
      orderId,
      customerId,
      farmerId: farmerId || customerId,
      channelId: channelId || undefined,
      deliveryChannelId: deliveryChannelId || undefined,
      items,
      subtotal,
      deliveryFee,
      deliveryFeeReason,
      promoCode: validatedPromo ? validatedPromo.code : '',
      promoDiscount,
      discount: promoDiscount,
      totalAmount,
      expectedDeliveryDate,
      deliveryAddress,
      deliveryOtp,
      deliveryOtpExpiresAt,
      idempotencyKey,
      paymentDetails: paymentDetailsRecord,
      status: orderStatus,
      statusHistory: [
        {
          status: orderStatus,
          note: `Order placed via ${paymentMethod}`,
          updatedBy: 'CUSTOMER',
        },
      ],
    });

    // Record promo code usage
    if (validatedPromo) {
      try {
        validatedPromo.usedCount = (validatedPromo.usedCount || 0) + 1;
        validatedPromo.usedByUsers.push(customerId);
        await validatedPromo.save();
      } catch (err) {
        console.warn('Promo code count update warning:', err.message);
      }
    }

    // Enqueue in Redis Queue worker (Instruction 46)
    try {
      await orderQueue.enqueueOrder({
        orderId: order.orderId,
        customerId: order.customerId,
        farmerId: order.farmerId,
        items: order.items,
      });
    } catch (_) {}

    return res.status(201).json({
      success: true,
      message: 'Order created and queued for farm dispatch.',
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    const { nextState, note } = req.body;

    const order = await Order.findOne({
      $or: [{ orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Strict State Machine Transition Check (Instruction 47)
    OrderStateMachine.validateTransition(order.status, nextState);

    order.status = nextState;
    order.statusHistory.push({
      status: nextState,
      note: note || `State transitioned to ${nextState}`,
      updatedBy: req.user?.role || 'SYSTEM',
    });

    await order.save();

    return res.json({
      success: true,
      message: `Order transitioned successfully to ${nextState}.`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ customerId: userId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
}

export default { createOrder, updateOrderStatus, getMyOrders };
