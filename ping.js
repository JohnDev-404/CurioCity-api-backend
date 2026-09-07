const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
client.connect()
  .then(() => { console.log('✅ Connected'); process.exit(0); })
  .catch(err => { console.error('❌', err.message); process.exit(1); });