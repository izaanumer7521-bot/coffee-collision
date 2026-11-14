const router = require('express').Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('../utils/slugify');
const log = require('../utils/activity');
const { protect, adminOnly } = require('../middleware/auth');

const populate = (q) => q.populate('category', 'name slug').populate('flavours', 'name color extraPrice available');
const isId = (v) => mongoose.Types.ObjectId.isValid(v);

// body -> clean update fields
function fields(b) {
  const f = {};
  if (b.name !== undefined) f.name = String(b.name).trim();
  if (b.description !== undefined) f.description = b.description;
  if (b.price !== undefined) f.price = Number(b.price);
  if (b.featured !== undefined) f.featured = !!b.featured;
  if (b.available !== undefined) f.available = !!b.available;
  if (b.category !== undefined) f.category = b.category && isId(b.category) ? b.category : null;
  if (Array.isArray(b.flavours)) f.flavours = b.flavours.filter(isId);
  return f;
}
// apply an uploaded picture (data URL) or a plain image link
function applyImage(f, b, id) {
  if (b.imageData && /^data:image\/(png|jpe?g|webp|gif);base64,/.test(b.imageData)) {
    f.imageData = b.imageData;
    f.image = `/api/products/${id}/image?v=${Date.now()}`;
  } else if (b.removeImage) {
    f.imageData = undefined; f.image = '';
  } else if (typeof b.image === 'string' && b.image && !b.image.startsWith('/api/products/')) {
    f.image = b.image;
  }
}

router.get('/', async (req, res) => {
  const filter = req.query.all === '1' ? {} : { available: true };
  if (req.query.category) {
    const c = await Category.findOne({ slug: req.query.category });
    filter.category = c ? c._id : null;
  }
  res.json(await populate(Product.find(filter).sort('-createdAt')));
});

// the uploaded picture, cached hard (the ?v= in the link changes when a new picture is uploaded)
router.get('/:id/image', async (req, res) => {
  if (!isId(req.params.id)) return res.status(404).end();
  const p = await Product.findById(req.params.id).select('+imageData');
  const m = p?.imageData && p.imageData.match(/^data:(image\/[a-z+.-]+);base64,(.+)$/);
  if (!m) return res.status(404).end();
  res.set('Content-Type', m[1]);
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(Buffer.from(m[2], 'base64'));
});

router.get('/:slug', async (req, res) => {
  const p = await populate(Product.findOne({ slug: req.params.slug }));
  p ? res.json(p) : res.status(404).json({ message: 'Product not found.' });
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const f = fields(req.body);
    if (!f.name) return res.status(400).json({ message: 'Product name is required.' });
    if (!(f.price >= 0)) return res.status(400).json({ message: 'Enter a valid price.' });
    let slug = slugify(f.name);
    if (await Product.findOne({ slug })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    const _id = new mongoose.Types.ObjectId();
    applyImage(f, req.body, _id);
    const p = await Product.create({ ...f, _id, slug });
    log(req.user, 'created', 'product', p.name, `$${p.price.toFixed(2)}`);
    res.status(201).json(await populate(Product.findById(p._id)));
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const f = fields(req.body);
    if (f.name) f.slug = slugify(f.name);
    applyImage(f, req.body, req.params.id);
    const p = await Product.findByIdAndUpdate(req.params.id, f, { new: true, runValidators: true });
    if (!p) return res.status(404).json({ message: 'Product not found.' });
    log(req.user, 'updated', 'product', p.name);
    res.json(await populate(Product.findById(p._id)));
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? 'A product with that name already exists.' : e.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (p) log(req.user, 'deleted', 'product', p.name);
  res.json({ message: 'Product deleted.' });
});

module.exports = router;
