// scripts/test-db-connection.cjs
// Usage: node scripts/test-db-connection.cjs

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testConnection() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ Missing MONGODB_URI in .env.local');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Successfully connected to MongoDB!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

testConnection();
