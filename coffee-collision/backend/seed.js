require('dotenv').config();
// Fixes 'querySrv ECONNREFUSED' on networks whose DNS can't resolve MongoDB Atlas (mongodb+srv) addresses
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const { ensureAdmin, ensureStarterData } = require('./utils/bootstrap');

// OPTIONAL: the server already does this by itself on a fresh database.
// Running it only adds the admin / starter data when they are missing and never deletes anything.
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await ensureStarterData();
  await ensureAdmin();
  console.log('Seed finished.');
  process.exit(0);
})();
