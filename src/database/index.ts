import mongoose from 'mongoose';
import { logger } from '../utils/Logger';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/harval-mc';

export const initDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error as Error);
    throw error;
  }
};

export { MongoModel } from './MongoModel';
