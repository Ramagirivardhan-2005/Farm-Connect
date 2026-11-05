import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      unique: true,
      index: true,
    },
    availableStock: {
      type: Number,
      required: true,
      min: 0,
    },
    totalStock: {
      type: Number,
      required: true,
      min: 0,
    },
    soldStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    unitOfMeasure: {
      type: String,
      default: 'KG',
    },
    minimumSellingUnit: {
      type: Number,
      default: 1,
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

/**
 * Concurrency guard: Atomically decrements stock without allowing negative values (Instruction 77)
 */
inventorySchema.statics.atomicReserveStock = async function (itemId, quantity) {
  const result = await this.findOneAndUpdate(
    {
      itemId,
      availableStock: { $gte: quantity }, // Atomic condition
    },
    {
      $inc: {
        availableStock: -quantity,
        soldStock: quantity,
      },
    },
    { new: true }
  );

  if (!result) {
    throw new Error('Insufficient stock available for concurrent reservation.');
  }

  return result;
};

export const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
