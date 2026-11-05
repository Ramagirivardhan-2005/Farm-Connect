import mongoose from 'mongoose';

const deliveryChannelSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // Only farmers can create & own delivery channels (Requirement 3 & 20)
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
    description: {
      type: String,
      default: '',
    },
    // Many-to-many relationship: Delivery agents assigned to this channel
    deliveryAgents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPartner',
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    defaultDeliveryFee: {
      type: Number,
      default: 40,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 499,
    },
    maxDeliveryCharge: {
      type: Number,
      default: 100,
    },
    activeOrdersCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const DeliveryChannel = mongoose.model('DeliveryChannel', deliveryChannelSchema);
export default DeliveryChannel;
