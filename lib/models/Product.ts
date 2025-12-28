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
    stockThreshold: {
      type: Number,
      default: 0,
      min: [0, 'Stock threshold cannot be negative'],
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
    barcode: {
      type: String,
      trim: true,
      index: true,
      default: '',
    },
    productCode: {
      type: String,
      trim: true,
      default: '',
    },
    modelName: {
      type: String,
      trim: true,
      default: '',
    },
    brandName: {
      type: String,
      trim: true,
      default: '',
    },
    mrp: {
      type: Number,
      default: 0,
      min: [0, 'MRP cannot be negative'],
    },
    uom: {
      type: String,
      trim: true,
      default: '',
    },
    attributes: {
      type: Object,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Add indexes for performance
productSchema.index({ name: 1 }); // Index for searching by name
productSchema.index({ category: 1 }); // Index for filtering by category
productSchema.index({ createdAt: -1 }); // Index for sorting by creation date
productSchema.index({ price: 1 }); // Index for price range queries

export default mongoose.models.Product || mongoose.model('Product', productSchema);
