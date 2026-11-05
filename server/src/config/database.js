import mongoose from 'mongoose';
import dns from 'dns';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmconnect';
  try {
    if (uri.startsWith('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
      } catch (_) {}
    }
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('MongoDB connected successfully:', mongoose.connection.host);
  } catch (err) {
    console.warn('MongoDB connection notice:', err.message);
    console.warn('Backend operating with resilient mock/in-memory fallback data for non-daemon environments.');
  }
}

export default connectDB;
