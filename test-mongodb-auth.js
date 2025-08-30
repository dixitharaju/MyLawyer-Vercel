import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get MongoDB connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://lawyerconnect:Password123@miniprojectcluster.ussrnq5.mongodb.net/lawyerconnect?retryWrites=true&w=majority&appName=MiniProjectCluster';
const DB_NAME = process.env.DB_NAME || 'lawyerconnect';

async function testMongoDBAuth() {
  let client;
  
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📊 Database:', DB_NAME);
    
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
    
    // Check for users collection
    const usersCollection = db.collection('lega_users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Users in database: ${userCount}`);
    
    // Test user creation
    const testUser = {
      id: `test_user_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      password: 'password123', // In production, this would be hashed
      role: 'user',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('🔄 Creating test user...');
    const result = await usersCollection.insertOne(testUser);
    console.log('✅ Test user created:', result.insertedId ? 'Success' : 'Failed');
    
    // Test user retrieval
    console.log('🔄 Retrieving test user...');
    const foundUser = await usersCollection.findOne({ email: testUser.email });
    console.log('✅ User retrieved:', foundUser ? 'Success' : 'Failed');
    
    if (foundUser) {
      console.log('📝 User details:', {
        id: foundUser.id,
        email: foundUser.email,
        name: `${foundUser.firstName} ${foundUser.lastName}`,
        role: foundUser.role
      });
      
      // Clean up - delete test user
      console.log('🔄 Cleaning up - deleting test user...');
      const deleteResult = await usersCollection.deleteOne({ email: testUser.email });
      console.log('✅ Test user deleted:', deleteResult.deletedCount === 1 ? 'Success' : 'Failed');
    }
    
    console.log('🎉 MongoDB authentication test completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

testMongoDBAuth();