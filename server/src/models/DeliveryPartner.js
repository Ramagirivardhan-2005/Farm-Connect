import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    deliveryAgentId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    altPhone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    address: {
      house: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    vehicleType: {
      type: String,
      enum: ['Electric Scooter', 'Cargo Van', 'Motorcycle', 'Bicycle'],
      default: 'Electric Scooter',
    },
    vehicleNumber: String,
    serviceArea: String,
    rating: {
      type: Number,
      default: 5.0,
    },
    completedDeliveries: {
      type: Number,
      default: 0,
    },
    activeDeliveries: {
      type: Number,
      default: 0,
    },
    cancelledDeliveries: {
      type: Number,
      default: 0,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    // Many-to-many relationship: One delivery agent can belong to multiple farmer channels
    assignedChannels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryChannel',
      },
    ],
    status: {
      type: String,
      enum: ['AVAILABLE', 'ON_TRIP', 'OFFLINE', 'PENDING_VERIFICATION', 'SUSPENDED'],
      default: 'AVAILABLE',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
export default DeliveryPartner;
