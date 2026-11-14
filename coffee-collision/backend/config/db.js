const mongoose = require('mongoose');
// Fixes 'querySrv ECONNREFUSED' on networks whose DNS can't resolve MongoDB Atlas (mongodb+srv) addresses
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const { bootstrap } = require('../utils/bootstrap');

// Cached connection so serverless (Vercel) reuses it between requests.
let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null, boot: null };

module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set.');
  if (!cached.conn) {
    if (!cached.promise) cached.promise = mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });
    cached.conn = await cached.promise;
    console.log('MongoDB connected');
  }
  // create the admin account on a fresh database; no `npm run seed` needed
  if (!cached.boot) cached.boot = bootstrap().catch((e) => console.error('Setup failed:', e.message));
  await cached.boot;
  return cached.conn;
};
