import mongoose from 'mongoose';

const directSaleSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      default: 'Unknown Employee',
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
    },
    customerMobile: {
      type: String,
      default: '',
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, 'Amount paid cannot be negative'],
    },
    remainingAmount: {
      type: Number,
      default: function() {
        return this.totalAmount - this.amountPaid;
      },
    },
    paymentStatus: {
      type: String,
      enum: ['fully-paid', 'partially-paid', 'pending'],
      default: 'fully-paid',
    },
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled'],
      default: 'completed',
    },
    notes: {
      type: String,
      default: '',
    },
    paymentHistory: [
      {
        amount: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        paymentMethod: {
          type: String,
          enum: ['cash', 'card', 'bank-transfer', 'cheque', 'upi'],
          default: 'cash',
        },
        notes: {
          type: String,
          default: '',
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.DirectSale || mongoose.model('DirectSale', directSaleSchema);
