require('dotenv').config();
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const { loadMenu } = require('./utils/loadMenu');

// Usage:  npm run seed:menu            add the full menu (never deletes or overwrites anything)
//         npm run seed:menu -- --overwrite   also reset names / prices of items that already exist
//         npm run seed:menu -- --hide-demo   hide the 3 starter demo drinks
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const r = await loadMenu({ overwrite: process.argv.includes('--overwrite'), hideDemo: process.argv.includes('--hide-demo') });
  console.log('Menu loaded:', r);
  if (r.noPrice.length) console.log('No price on the printed menu for:', r.noPrice.join(', '), '-> set them in Admin -> Products.');
  process.exit(0);
})();
