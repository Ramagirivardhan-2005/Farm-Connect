import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Instruction 72
      trim: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // Instruction 72
    },
    farmerName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    state: String,
    district: String,
    bio: String,
    description: String,
    bannerImage: String,
    profileImage: String,
    rating: {
      type: Number,
      default: 5.0,
      index: true, // Instruction 72
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    subscribersCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'DEACTIVATED'],
      default: 'PENDING_VERIFICATION',
      index: true, // Instruction 72
    },
    featuredProducts: [String],
    externalLinks: {
      website: String,
      instagram: String,
      youtube: String,
      other: String,
    },
  },
  { timestamps: true }
);

export const Channel = mongoose.model('Channel', channelSchema);
export default Channel;
