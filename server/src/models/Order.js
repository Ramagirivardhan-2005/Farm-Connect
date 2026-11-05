import mongoose from 'mongoose';
import { ORDER_STATES } from '../stateMachines/OrderStateMachine.js';

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 0.1 },
  unit: { type: String, default: 'KG' },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Instruction 72
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Instruction 72
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: true,
      index: true, // Instruction 72
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: false,
    },
    deliveryChannelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryChannel',
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DeliveryPartner',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATES),
      default: ORDER_STATES.CREATED,
      index: true, // Instruction 72
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 40 },
    deliveryFeeReason: { type: String, default: 'Standard Delivery' },
    promoCode: { type: String, default: '' },
    promoDiscount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    expectedDeliveryDate: {
      type: Date,
      required: true,
    },
    deliveryAddress: {
      fullName: String,
      mobile: String,
      house: String,
      street: String,
      village: String,
      district: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
      type: String,
    },
    // Customer Delivery OTP confirmation (Requirement 23)
    deliveryOtp: {
      type: String,
      default: null,
    },
    deliveryOtpExpiresAt: {
      type: Date,
      default: null,
    },
    deliveryOtpAttempts: {
      type: Number,
      default: 0,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true, // Instruction 78
    },
    paymentDetails: {
      method: { type: String, enum: ['WALLET', 'RAZORPAY'], default: 'WALLET' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      transactionId: String,
      paidAt: Date,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: String,
      },
    ],
  },
  {
    timestamps: true, // creates createdAt index per Instruction 72
  }
);

// Indexes
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
export default Order;
