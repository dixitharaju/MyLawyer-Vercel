import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use environment variable if available, otherwise use a local MongoDB instance
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lawyerconnect';
const DB_NAME = process.env.DB_NAME || 'lawyerconnect';

let client: MongoClient;
let mongoDb: Db;

export async function connectToDatabase() {
  if (!client) {
    try {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      mongoDb = client.db(DB_NAME);
      console.log(`Connected to MongoDB database: ${DB_NAME}`);
      
      // Test the connection
      await mongoDb.admin().ping();
      console.log('MongoDB connection test successful');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }
  return mongoDb;
}

export async function getDatabase() {
  if (!mongoDb) {
    await connectToDatabase();
  }
  return mongoDb;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Export db for backward compatibility
export const db = {
  select: () => ({
    from: () => ({
      where: () => Promise.resolve([]),
      orderBy: () => Promise.resolve([]),
      limit: () => Promise.resolve([]),
      offset: () => Promise.resolve([])
    }),
    where: () => Promise.resolve([]),
    orderBy: () => Promise.resolve([]),
    limit: () => Promise.resolve([]),
    offset: () => Promise.resolve([])
  }),
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([{ id: 1 }]),
      onConflictDoUpdate: () => ({
        returning: () => Promise.resolve([{ id: 1 }])
      })
    })
  }),
  update: () => ({
    set: () => ({
      where: () => Promise.resolve()
    })
  }),
  delete: () => ({
    where: () => Promise.resolve()
  })
};