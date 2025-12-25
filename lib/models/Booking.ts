import mongoose, { Document } from 'mongoose';

interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  items: Array<{
    productId: string | mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user ID'],
    },
    items: [
      {
        productId: {
          type: String,
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Please provide total amount'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index for auto-deletion
    },
  },
  { timestamps: true }
);

// Add indexes for performance
bookingSchema.index({ userId: 1 }); // Index for user bookings
bookingSchema.index({ userId: 1, createdAt: -1 }); // Compound index for user bookings sorted by date
bookingSchema.index({ status: 1 }); // Index for filtering by status
bookingSchema.index({ expiresAt: 1 }); // Already used for TTL, but explicit

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);
