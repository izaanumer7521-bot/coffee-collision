const router = require('express').Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

router.get('/', async (req, res) => {
  const filter = req.query.all === '1' ? {} : { available: true };
  res.json(await Product.find(filter).sort('createdAt'));
});
router.get('/:slug', async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug });
  p ? res.json(p) : res.status(404).json({ message: 'Product not found.' });
});
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, price, image, available } = req.body;
    res.status(201).json(await Product.create({ name, slug: slugify(name || ''), description, price, image, available }));
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    if (req.body.name) req.body.slug = slugify(req.body.name);
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    p ? res.json(p) : res.status(404).json({ message: 'Product not found.' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.delete('/:id', protect, adminOnly, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'Product deleted.' });
});
module.exports = router;
