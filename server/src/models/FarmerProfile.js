import mongoose from 'mongoose';
import { encryptSensitive, decryptSensitive } from '../utils/crypto.js';

const farmerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    altContact: String,
    farmLocation: {
      type: String,
      required: true,
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    farmingMethod: {
      type: String,
      enum: ['Organic', 'Natural / ZBNF', 'Hydroponic', 'Conventional'],
      default: 'Organic',
    },
    // Sensitive identity & bank fields encrypted via AES-256-GCM (Instruction 13)
    aadhaarEncrypted: {
      type: String,
      required: true,
    },
    bankDetailsEncrypted: {
      accountHolder: String,
      bankName: String,
      accountNumberEncrypted: String,
      ifscCode: String,
      upiId: String,
    },
    certifications: [
      {
        name: String,
        issuedBy: String,
        certificateNumber: String,
        issueDate: Date,
        expiryDate: Date,
        proofDocumentUrl: String,
      },
    ],
    achievements: [
      {
        title: String,
        description: String,
        year: Number,
        proofDocumentUrl: String,
      },
    ],
    isIdentityVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Helper methods to set and get decrypted sensitive data
farmerProfileSchema.methods.setAadhaar = function (plainAadhaar) {
  this.aadhaarEncrypted = encryptSensitive(plainAadhaar);
};

farmerProfileSchema.methods.getDecryptedAadhaar = function () {
  return decryptSensitive(this.aadhaarEncrypted);
};

export const FarmerProfile = mongoose.model('FarmerProfile', farmerProfileSchema);
export default FarmerProfile;
