const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Flavour = require('../models/Flavour');

// first admin account (only if there is no admin yet)
async function ensureAdmin() {
  if (await User.exists({ role: 'admin' })) return false;
  const email = (process.env.ADMIN_EMAIL || 'admin@coffeecollision.com').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) { existing.role = 'admin'; await existing.save(); return true; }
  await User.create({ name: 'Admin', email, password: process.env.ADMIN_PASSWORD || 'admin123', role: 'admin' });
  console.log('Created admin user:', email);
  return true;
}

// starter categories, flavours and drinks (only into empty collections)
async function ensureStarterData() {
  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany([
      { name: 'Hot', slug: 'hot', position: 0 },
      { name: 'Cold', slug: 'cold', position: 1 },
      { name: 'Signature', slug: 'signature', position: 2 },
    ]);
  }
  if ((await Flavour.countDocuments()) === 0) {
    await Flavour.insertMany([
      { name: 'Caramel', slug: 'caramel', color: '#b98a64', extraPrice: 0.5 },
      { name: 'Vanilla', slug: 'vanilla', color: '#e8d9b5', extraPrice: 0.5 },
      { name: 'Hazelnut', slug: 'hazelnut', color: '#8a5a3c', extraPrice: 0.5 },
      { name: 'Mocha', slug: 'mocha', color: '#5a3825', extraPrice: 0.75 },
    ]);
  }
  if ((await Product.countDocuments()) === 0) {
    const cat = Object.fromEntries((await Category.find()).map((c) => [c.slug, c._id]));
    const flavours = (await Flavour.find()).map((f) => f._id);
    await Product.insertMany([
      { name: 'The Espresso', slug: 'the-espresso', price: 3.5, image: '/products/espresso.png', description: 'Black, with a golden crema and a caramel drizzle.', category: cat.hot, flavours, featured: true },
      { name: 'The Collision', slug: 'the-collision', price: 5, image: '/products/collision.png', description: 'Espresso meets cold milk in one loud swirl.', category: cat.signature, flavours, featured: true },
      { name: 'The Iced Latte', slug: 'the-iced-latte', price: 4.5, image: '/products/iced-latte.png', description: 'Creamy, over big ice, with beans still in orbit.', category: cat.cold, flavours },
    ]);
  }
}

// Runs automatically after the database connects. A brand-new database (no admin yet) gets the
// admin account and starter data. A database that already has an admin is left completely alone.
async function bootstrap() {
  if (await User.exists({ role: 'admin' })) return;
  await ensureAdmin();
  await ensureStarterData();
}

module.exports = { bootstrap, ensureAdmin, ensureStarterData };
