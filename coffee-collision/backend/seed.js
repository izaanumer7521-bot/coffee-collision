require('dotenv').config();
// Fixes 'querySrv ECONNREFUSED' on networks whose DNS can't resolve MongoDB Atlas (mongodb+srv) addresses
require('dns').setServers(['8.8.8.8', '1.1.1.1']);
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const products = [
  { name: 'The Espresso', slug: 'the-espresso', price: 3.5, image: '/products/espresso.png', description: 'Black, with a golden crema and a caramel drizzle.' },
  { name: 'The Collision', slug: 'the-collision', price: 5, image: '/products/collision.png', description: 'Espresso meets cold milk in one loud swirl.' },
  { name: 'The Iced Latte', slug: 'the-iced-latte', price: 4.5, image: '/products/iced-latte.png', description: 'Creamy, over big ice, with beans still in orbit.' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany();
  await Product.insertMany(products);
  const email = process.env.ADMIN_EMAIL || 'admin@coffeecollision.com';
  if (!(await User.findOne({ email }))) {
    await User.create({ name: 'Admin', email, password: process.env.ADMIN_PASSWORD || 'admin123', role: 'admin' });
  }
  console.log('Seeded products and admin user:', email);
  process.exit(0);
})();
