const Category = require('../models/Category');
const Product = require('../models/Product');
const Flavour = require('../models/Flavour');
const menu = require('../data/menu');
const slugify = require('./slugify');

const SIZE = { name: 'Regular', nameAr: 'عادي' };
// Arabic names for the starter flavours (only filled in when they are still empty)
const FLAVOUR_AR = { caramel: 'كراميل', vanilla: 'فانيلا', hazelnut: 'بندق', mocha: 'موكا' };
const DEMO = ['the-espresso', 'the-collision', 'the-iced-latte'];

// Adds the full menu. Safe to run again and again: items are matched by slug, so nothing is duplicated,
// and your pictures, descriptions and featured flags are never overwritten.
// Prices / names are only written for items that do not exist yet, unless { overwrite: true }.
async function loadMenu({ overwrite = false, hideDemo = false } = {}) {
  const out = { categories: 0, created: 0, updated: 0, kept: 0, noPrice: [], demoHidden: 0 };
  let position = await Category.countDocuments();

  for (const c of menu) {
    let cat = await Category.findOne({ slug: c.slug });
    if (!cat) { cat = await Category.create({ name: c.name, nameAr: c.nameAr, slug: c.slug, position: position++ }); out.categories++; }
    else if (!cat.nameAr) { cat.nameAr = c.nameAr; await cat.save(); }

    for (const [name, nameAr, price] of c.items) {
      const slug = `${c.slug}-${slugify(name)}`;
      const data = {
        name, nameAr, category: cat._id, price: price ?? 0,
        sizes: price == null ? [] : [{ ...SIZE, price }],
      };
      const existing = await Product.findOne({ slug });
      if (!existing) { await Product.create({ ...data, slug }); out.created++; }
      else if (overwrite) { await Product.findByIdAndUpdate(existing._id, data); out.updated++; }
      else {
        if (!existing.nameAr) { existing.nameAr = nameAr; await existing.save(); }
        out.kept++;
      }
      if (price == null) out.noPrice.push(name);
    }
  }

  for (const [slug, ar] of Object.entries(FLAVOUR_AR)) await Flavour.updateOne({ slug, nameAr: '' }, { nameAr: ar });
  if (hideDemo) out.demoHidden = (await Product.updateMany({ slug: { $in: DEMO } }, { available: false })).modifiedCount;
  return out;
}

module.exports = { loadMenu };
