import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const options = {};

if (!uri) {
  throw new Error('Please add your Mongo URI to .env');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

/**
 * Helper to get the database and collection
 */
export async function getCollection(collectionName = 'jobs') {
  const conn = await clientPromise;
  // Use a dedicated database for this app
  const db = conn.db('job_scrapper_db');
  return db.collection(collectionName);
}
