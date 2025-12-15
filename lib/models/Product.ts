import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide quantity'],
      min: [0, 'Quantity cannot be negative'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    image: {
      type: String,
      default: '📦',
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: '',
      trim: true,
    },
    // Retail tier pricing
    minRetailQuantity: {
      type: Number,
      default: 1,
      min: [1, 'Minimum retail quantity must be at least 1'],
    },
    retailDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Retail discount cannot be negative'],
      max: [100, 'Retail discount cannot exceed 100%'],
    },
    retailPrice: {
      type: Number,
      default: 0,
      min: [0, 'Retail price cannot be negative'],
    },
    // Wholesale tier pricing
    minWholesaleQuantity: {
      type: Number,
      default: 10,
      min: [1, 'Minimum wholesale quantity must be at least 1'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Wholesale discount cannot be negative'],
      max: [100, 'Wholesale discount cannot exceed 100%'],
    },
    wholesalePrice: {
      type: Number,
      default: 0,
      min: [0, 'Wholesale price cannot be negative'],
    },
    // Super wholesale tier pricing
    minSuperWholesaleQuantity: {
      type: Number,
      default: 50,
      min: [1, 'Minimum super wholesale quantity must be at least 1'],
    },
    superDiscount: {
      type: Number,
      default: 0,
      min: [0, 'Super wholesale discount cannot be negative'],
      max: [100, 'Super wholesale discount cannot exceed 100%'],
    },
    superWholesalePrice: {
      type: Number,
      default: 0,
      min: [0, 'Super wholesale price cannot be negative'],
    },
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', productSchema);
