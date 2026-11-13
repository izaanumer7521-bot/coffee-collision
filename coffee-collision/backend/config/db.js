const mongoose = require('mongoose');
// Fixes 'querySrv ECONNREFUSED' on networks whose DNS can't resolve MongoDB Atlas (mongodb+srv) addresses
require('dns').setServers(['8.8.8.8', '1.1.1.1']);

// Cached connection so serverless (Vercel) reuses it between requests.
let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

module.exports = async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set.');
  if (!cached.promise) cached.promise = mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });
  cached.conn = await cached.promise;
  console.log('MongoDB connected');
  return cached.conn;
};
