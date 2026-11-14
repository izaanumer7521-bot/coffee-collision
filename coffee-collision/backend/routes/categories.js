const router = require('express').Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const slugify = require('../utils/slugify');
const log = require('../utils/activity');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => res.json(await Category.find().sort('position createdAt')));

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description = '' } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Category name is required.' });
    const slug = slugify(name);
    if (await Category.findOne({ slug })) return res.status(409).json({ message: 'That category already exists.' });
    const count = await Category.countDocuments();
    const c = await Category.create({ name: name.trim(), slug, description, position: count });
    log(req.user, 'created', 'category', c.name);
    res.status(201).json(c);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const patch = {};
    if (req.body.name) { patch.name = req.body.name.trim(); patch.slug = slugify(req.body.name); }
    if (req.body.description !== undefined) patch.description = req.body.description;
    const c = await Category.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!c) return res.status(404).json({ message: 'Category not found.' });
    log(req.user, 'updated', 'category', c.name);
    res.json(c);
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? 'That category already exists.' : e.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  const c = await Category.findByIdAndDelete(req.params.id);
  if (c) {
    await Product.updateMany({ category: c._id }, { $set: { category: null } });
    log(req.user, 'deleted', 'category', c.name);
  }
  res.json({ message: 'Category deleted.' });
});

module.exports = router;
