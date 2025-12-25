/**
 * Seed script to create a demo user and products in MongoDB
 * Run with: npx ts-node scripts/seed.ts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'employee', 'admin'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

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
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.includes('<db_password>')) {
      console.error(
        '❌ Error: MONGODB_URI not properly configured in .env.local'
      );
      console.error('Please update your MongoDB credentials first.');
      process.exit(1);
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional)
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create demo users
    const salt = await bcrypt.genSalt(10);
    
    const demoUser = await User.create({
      email: 'demo@example.com',
      password: await bcrypt.hash('demo123', salt),
      name: 'Demo Customer',
      role: 'customer',
    });

    const employeeUser = await User.create({
      email: 'employee@example.com',
      password: await bcrypt.hash('emp123', salt),
      name: 'Employee User',
      role: 'employee',
    });

    const adminUser = await User.create({
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', salt),
      name: 'Admin User',
      role: 'admin',
    });

    console.log('\n✅ Users created successfully!');
    console.log('👤 Customer: demo@example.com / demo123');
    console.log('👔 Employee: employee@example.com / emp123');
    console.log('👨‍💼 Admin: admin@example.com / admin123');

    // Create sample products
    const sampleProducts = [
      {
        name: 'Laptop',
        description: 'High-performance laptop for work and gaming',
        price: 999.99,
        quantity: 15,
        stockThreshold: 5,
        image: '💻',
        category: 'Electronics',
      },
      {
        name: 'Smartphone',
        description: 'Latest smartphone with advanced features',
        price: 699.99,
        quantity: 25,
        stockThreshold: 10,
        image: '📱',
        category: 'Electronics',
      },
      {
        name: 'Tablet',
        description: 'Portable tablet for entertainment and work',
        price: 499.99,
        quantity: 20,
        stockThreshold: 8,
        image: '📱',
        category: 'Electronics',
      },
      {
        name: 'Headphones',
        description: 'Wireless noise-cancelling headphones',
        price: 199.99,
        quantity: 40,
        stockThreshold: 15,
        image: '🎧',
        category: 'Audio',
      },
      {
        name: 'Smart Watch',
        description: 'Wearable smartwatch with health tracking',
        price: 299.99,
        quantity: 30,
        stockThreshold: 12,
        image: '⌚',
        category: 'Wearables',
      },
      {
        name: 'Camera',
        description: 'Professional DSLR camera',
        price: 1299.99,
        quantity: 10,
        stockThreshold: 3,
        image: '📷',
        category: 'Photography',
      },
    ];

    const products = await Product.insertMany(sampleProducts);
    console.log(`\n✅ ${products.length} products created successfully!`);
    products.forEach((p: any) => {
      console.log(`   - ${p.name}: Rs. ${p.price}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Database seeded successfully!');
  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
