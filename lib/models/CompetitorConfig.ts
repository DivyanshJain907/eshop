import mongoose from 'mongoose';

const competitorConfigSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Competitor name is required'],
      unique: true,
      trim: true,
    },
    baseUrl: {
      type: String,
      required: [true, 'Base URL is required'],
      trim: true,
    },
    searchUrl: {
      type: String,
      required: [true, 'Search URL pattern is required'],
      trim: true,
    },
    selectors: {
      productContainer: {
        type: String,
        required: true,
        default: '.product-item',
      },
      productName: {
        type: String,
        required: true,
        default: '.product-name',
      },
      productBrand: {
        type: String,
        required: true,
        default: '.brand',
      },
      productPrice: {
        type: String,
        required: true,
        default: '.product-price',
      },
      productImage: {
        type: String,
        required: true,
        default: '.product-image img',
      },
      productUrl: {
        type: String,
        required: true,
        default: '.product-link',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxResults: {
      type: Number,
      default: 10,
    },
    timeout: {
      type: Number,
      default: 30000, // 30 seconds
    },
  },
  {
    timestamps: true,
  }
);

const CompetitorConfig =
  mongoose.models.CompetitorConfig ||
  mongoose.model('CompetitorConfig', competitorConfigSchema);

export default CompetitorConfig;
