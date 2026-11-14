const router = require('express').Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Flavour = require('../models/Flavour');
const slugify = require('../utils/slugify');
const log = require('../utils/activity');
const { parseMenu } = require('../utils/menuParser');
const { loadMenu } = require('../utils/loadMenu');
const { protect, adminOnly } = require('../middleware/auth');

const PALETTE = ['#b98a64', '#e8d9b5', '#8a5a3c', '#5a3825', '#c97b84', '#7a9e7e', '#d4a23a', '#6b8fb3'];

// what the import would do, without changing anything
router.post('/preview', protect, adminOnly, async (req, res) => {
  const parsed = parseMenu(req.body.text);
  const [prods, cats, fls] = await Promise.all([Product.find().select('slug'), Category.find().select('slug'), Flavour.find().select('slug')]);
  const pS = new Set(prods.map((p) => p.slug)), cS = new Set(cats.map((c) => c.slug)), fS = new Set(fls.map((f) => f.slug));
  parsed.categories = parsed.categories.map((c) => ({
    ...c, exists: !c.name || cS.has(slugify(c.name)),
    products: c.products.map((p) => ({
      ...p, exists: pS.has(slugify(p.name)),
      flavours: (p.flavours || []).map((f) => ({ ...f, exists: fS.has(slugify(f.name)) })),
    })),
  }));
  res.json(parsed);
});

router.post('/import', protect, adminOnly, async (req, res) => {
  try {
    const parsed = parseMenu(req.body.text);
    if (!parsed.totals.products) return res.status(400).json({ message: 'No drinks found. Check the format and try again.' });
    const update = req.body.mode === 'update';
    const result = { categories: 0, flavours: 0, created: 0, updated: 0, skipped: 0 };

    // flavours first (a flavour keeps the price it was first created with)
    const flavourId = {};
    let colourIndex = await Flavour.countDocuments();
    for (const c of parsed.categories) for (const p of c.products) for (const f of p.flavours || []) {
      const slug = slugify(f.name);
      if (flavourId[slug]) continue;
      let doc = await Flavour.findOne({ slug });
      if (!doc) {
        doc = await Flavour.create({ name: f.name, slug, extraPrice: f.extraPrice || 0, color: PALETTE[colourIndex++ % PALETTE.length] });
        result.flavours++;
      }
      flavourId[slug] = doc._id;
    }

    let position = await Category.countDocuments();
    for (const c of parsed.categories) {
      let catId = null;
      if (c.name) {
        const slug = slugify(c.name);
        let doc = await Category.findOne({ slug });
        if (!doc) { doc = await Category.create({ name: c.name, slug, position: position++ }); result.categories++; }
        catId = doc._id;
      }
      for (const p of c.products) {
        const slug = slugify(p.name);
        const data = {
          name: p.name, price: p.price, sizes: p.sizes || [], category: catId,
          flavours: (p.flavours || []).map((f) => flavourId[slugify(f.name)]),
        };
        if (p.description) data.description = p.description;
        const existing = await Product.findOne({ slug });
        if (!existing) { await Product.create({ ...data, slug }); result.created++; }
        else if (update) { await Product.findByIdAndUpdate(existing._id, data); result.updated++; }
        else result.skipped++;
      }
    }

    log(req.user, 'import', 'product', 'Menu import', `${result.created} added, ${result.updated} updated, ${result.skipped} skipped`);
    res.json({ ...result, warnings: parsed.warnings });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// one click: add the complete bilingual (English + Arabic) Evara menu
router.post('/load-full', protect, adminOnly, async (req, res) => {
  try {
    const r = await loadMenu({ overwrite: !!req.body?.overwrite, hideDemo: !!req.body?.hideDemo });
    log(req.user, 'import', 'product', 'Full menu', `${r.created} added, ${r.updated} updated, ${r.kept} already there`);
    res.json(r);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
