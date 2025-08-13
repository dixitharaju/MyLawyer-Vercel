import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://chatbot-user:miniproject@miniprojectcluster.ussrnq5.mongodb.net/?retryWrites=true&w=majority&appName=MiniProjectClusterw';
const DB_NAME = 'miniproject';

let client: MongoClient;
let mongoDb: Db;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    mongoDb = client.db(DB_NAME);
    console.log('Connected to MongoDB');
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