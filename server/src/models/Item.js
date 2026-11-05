import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // Instruction 72
    },
    category: {
      type: String,
      required: true,
      enum: ['Vegetables', 'Fruits', 'Leafy Greens', 'Root Vegetables', 'Gourds', 'Nightshades', 'Exotics & Herbs', 'Other'],
      index: true, // Instruction 72
    },
    type: {
      type: String,
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true, // Instruction 72
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: true,
    },
    farmingType: {
      type: String,
      enum: ['Organic', 'Natural / ZBNF', 'Hydroponic', 'Conventional'],
      default: 'Organic',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true, // Instruction 72
    },
    originalPrice: Number,
    unit: {
      type: String,
      default: 'KG',
    },
    qualityGrade: {
      type: String,
      default: 'A',
    },
    harvestDate: String,
    shelfLife: String,
    description: String,
    tasteProfile: String,
    cultivationMethod: String,
    soilType: String,
    images: [String],
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    purchaseCount: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Item = mongoose.model('Item', itemSchema);
export default Item;
