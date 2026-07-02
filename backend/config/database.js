const { MongoClient } = require('mongodb');

let dbInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  console.log('Connecting to MONGO_URI:', uri ? uri.substring(0, 30) + '...' : 'undefined');
  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
    dbInstance = client.db('llm-chat');
    console.log('Native MongoDB Driver Connected successfully!');
  } catch (error) {
    console.error(`Native MongoDB Connection Warning: ${error.message}`);
    console.error('Make sure local MongoDB is running if you need database features!');
  }
};

const getDb = () => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return dbInstance;
};

module.exports = { connectDB, getDb };