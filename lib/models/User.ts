import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';

interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone: string;
  shopName?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  role: 'customer' | 'employee' | 'admin';
  comparePassword(enteredPassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^\d{10}$/.test(v);
        },
        message: 'Phone number must be exactly 10 digits',
      },
    },
    shopName: {
      type: String,
      trim: true,
      default: null,
    },
    street: {
      type: String,
      required: [true, 'Please provide a street address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide a state'],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please provide a pincode'],
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^\d{6}$/.test(v);
        },
        message: 'Pincode must be exactly 6 digits',
      },
    },
    role: {
      type: String,
      enum: ['customer', 'employee', 'admin'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

// Add indexes for performance
userSchema.index({ role: 1 }); // Index for filtering by role
userSchema.index({ createdAt: -1 }); // Index for sorting by creation date

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
