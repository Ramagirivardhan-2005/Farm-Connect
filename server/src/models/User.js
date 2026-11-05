import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true, // Instruction 72
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Instruction 72
    },
    mobile: {
      type: String,
      trim: true,
    },
    altMobile: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      enum: ['CUSTOMER', 'FARMER', 'DELIVERY_PARTNER', 'SUPER_ADMIN'],
      default: 'CUSTOMER',
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    farmerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FarmerProfile',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
export default User;
