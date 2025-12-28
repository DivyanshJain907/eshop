import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    // Support both old format (single product) and new format (multiple items)
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    productName: {
      type: String,
    },
    quantity: {
      type: Number,
      min: [1, 'Quantity must be at least 1'],
    },
    // New format - array of items
    items: [
      {
        productId: {
          type: String,
        },
        productName: {
          type: String,
        },
        quantity: {
          type: Number,
          min: 1,
        },
        price: {
          type: Number,
        },
      },
    ],
    totalAmount: {
      type: Number,
    },
    customerName: {
      type: String,
    },
    customerPhone: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Sale || mongoose.model('Sale', saleSchema);
