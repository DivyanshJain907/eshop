import mongoose from 'mongoose';

let isConnected = false;
let connectionPromise: Promise<any> | null = null;

export async function connectDB() {
  // If already connected, return the connection
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri || mongoUri.includes('<db_password>')) {
    console.warn('⚠️  MONGODB_URI not properly configured. Please update .env.local with your actual MongoDB credentials.');
    console.warn('📖 See MONGODB_SETUP.md for instructions.');
    return null;
  }

  // Create connection promise
  connectionPromise = (async () => {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        bufferCommands: true,
        connectTimeoutMS: 15000,
        maxPoolSize: 10,
        minPoolSize: 5,
      });
      isConnected = true;
      console.log('✅ MongoDB connected successfully');
      return mongoose.connection;
    } catch (error: any) {
      console.error('❌ Error connecting to MongoDB:', error.message);
      console.error('💡 Tip: Check MONGODB_SETUP.md for help');
      isConnected = false;
      connectionPromise = null;
      return null;
    }
  })();

  return connectionPromise;
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    connectionPromise = null;
  }
}
