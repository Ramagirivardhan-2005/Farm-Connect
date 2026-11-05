import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmerName: {
      type: String,
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
    type: {
      type: String,
      enum: ['BANNER', 'POSTER', 'VIDEO', 'SPECIAL_OFFER'],
      default: 'BANNER',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    cta: {
      type: String,
      default: 'Shop Now',
    },
    targetProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    targetProductName: {
      type: String,
      default: '',
    },
    specialPrice: {
      type: Number,
    },
    originalPrice: {
      type: Number,
    },
    offerCode: {
      type: String,
    },
    category: {
      type: String,
      default: 'Organic Produce',
    },
    location: {
      city: String,
      district: String,
      state: String,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'EXPIRED'],
      default: 'ACTIVE',
      index: true,
    },
    analytics: {
      impressions: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      productViews: { type: Number, default: 0 },
      addToCartEvents: { type: Number, default: 0 },
      ordersGenerated: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
