const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/curiocity';

async function test() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB locally');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.close();
  }
}
test();