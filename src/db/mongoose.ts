import mongoose from 'mongoose';
import { env } from '../configs/env';

export async function connectDB() {
  if (!env.MONGODB_URI) throw new Error('MONGO_URI is missing');
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  console.log('[Mongo] connected');
}
