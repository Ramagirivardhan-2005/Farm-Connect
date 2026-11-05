import mongoose from 'mongoose';

const heroContentSchema = new mongoose.Schema(
  {
    tag: {
      type: String,
      default: 'Direct Farmer Connection',
    },
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    cta: {
      type: String,
      default: 'Explore FarmConnect',
    },
    image: {
      type: String,
      required: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const HeroContent = mongoose.model('HeroContent', heroContentSchema);

const bannerSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    offerCode: String,
    image: {
      type: String,
      required: true,
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'EXPIRED'],
      default: 'PENDING_APPROVAL',
      index: true,
    },
  },
  { timestamps: true }
);

export const Banner = mongoose.model('Banner', bannerSchema);
export default HeroContent;
