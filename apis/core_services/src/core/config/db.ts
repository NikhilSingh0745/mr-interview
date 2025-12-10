import mongoose from "mongoose";
import { config } from "./config";

interface MongoDBConfig {
  uri: string;
  options: mongoose.ConnectOptions;
  maxRetries?: number;
  retryDelay?: number;
}

const getMongoDBConfig = (): MongoDBConfig => ({
  uri: config.get('mongooseConnection'),
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    retryReads: true
  },
  maxRetries: 3,
  retryDelay: 1000
});

let mongoClient: typeof mongoose | null = null;

const connectWithRetry = async (config: MongoDBConfig, retries = 0): Promise<void> => {
  try {
    mongoClient = await mongoose.connect(config.uri, config.options);
  } catch (error) {
    if (retries < (config.maxRetries || 3)) {
      console.warn(`MongoDB connection failed, retrying (${retries + 1}/${config.maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, config.retryDelay || 1000));
      return connectWithRetry(config, retries + 1);
    }
    throw error;
  }
};

export const connectDB = async (): Promise<void> => {
  if (mongoClient) {
    console.warn('MongoDB client already exists, reusing existing connection');
    return;
  }
  const startTime = new Date();
  const mongoConfig = getMongoDBConfig();

  mongoose.connection.on('connected', () => {
    const endTime = new Date();
    console.log(`MongoDB connected in ${Number(
      (endTime.getTime() - startTime.getTime()) / 1000
    ).toFixed(2)}s`);
  });

  mongoose.connection.on('error', (error: Error) => {
    console.error('MongoDB connection error:', error.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });

  try {
    console.log('Connecting to MongoDB...');
    await connectWithRetry(mongoConfig);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', (error as Error).message);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!mongoClient) {
    console.log("No Mongo Client for disconnect");
    return
  };
  try {
    await mongoClient.connection.close();
    mongoClient = null;
    console.log('MongoDB connection closed successfully');
  } catch (error) {
    console.error('Error closing MongoDB connection:', (error as Error).message);
    throw error;
  }
};

export const getMongoClient = (): typeof mongoose => {
  if (!mongoClient) {
    throw new Error('MongoDB client not initialized');
  }
  return mongoClient;
};

export const dbHelpers = {
  async healthCheck(): Promise<boolean> {
    try {
      const client = getMongoClient();
      if (!client || !client.connection || !client.connection.readyState || !client.connection?.db) {
        return false;
      }
      await client.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB health check failed:', error);
      return false;
    }
  }
};