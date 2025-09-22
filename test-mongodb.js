const { MongoClient } = require('mongodb');

// Your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://mini_adMin_PrJect:<password>@miniprojectcluster.ussrnq5.mongodb.net/lawyerconnect?retryWrites=true&w=majority&appName=MiniProjectCluster';
const DB_NAME = 'lawyerconnect';

async function testConnection() {
  let client;
  
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Database:', DB_NAME);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db(DB_NAME);
    
    // Test the connection
    await db.admin().ping();
    console.log('✅ Database ping successful');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Existing collections:', collections.map(c => c.name));
    
    // Test creating a collection if it doesn't exist
    const testCollection = db.collection('lega_complaint');
    const count = await testCollection.countDocuments();
    console.log(`📊 Documents in lega_complaint: ${count}`);
    
    console.log('🎉 MongoDB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

testConnection();








