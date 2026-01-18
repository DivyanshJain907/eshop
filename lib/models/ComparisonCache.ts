import mongoose from 'mongoose';

const comparisonCacheSchema = new mongoose.Schema(
  {
    searchQuery: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    competitorName: {
      type: String,
      required: true,
      trim: true,
    },
    results: {
      type: [
        {
          name: String,
          price: Number,
          priceText: String,
          image: String,
          url: String,
          competitor: String,
        },
      ],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
comparisonCacheSchema.index({ searchQuery: 1, competitorName: 1 });

// Auto-delete expired cache entries
comparisonCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ComparisonCache =
  mongoose.models.ComparisonCache ||
  mongoose.model('ComparisonCache', comparisonCacheSchema);

export default ComparisonCache;
