/**
 * Seed script to create a demo user in MongoDB
 * Run with: npx ts-node scripts/seed.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import path from 'path';

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
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

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

    // Clear existing users (optional)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    const demoUser = await User.create({
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    });

    console.log('✅ Demo user created successfully!');
    console.log('📧 Email: demo@example.com');
    console.log('🔑 Password: demo123');
    console.log('\nYou can now login with these credentials.');

    // Create additional test user
    const testUser = await User.create({
      email: 'test@example.com',
      password: await bcrypt.hash('test123', salt),
      name: 'Test User',
    });

    console.log('\n✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: test123');

    await mongoose.disconnect();
    console.log('\n✅ Database seeded successfully!');
  } catch (error: any) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
