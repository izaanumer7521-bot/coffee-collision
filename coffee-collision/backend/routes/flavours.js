const router = require('express').Router();
const Flavour = require('../models/Flavour');
const Product = require('../models/Product');
const slugify = require('../utils/slugify');
const log = require('../utils/activity');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const filter = req.query.all === '1' ? {} : { available: true };
  res.json(await Flavour.find(filter).sort('createdAt'));
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, nameAr = '', description = '', extraPrice = 0, color = '#b98a64', available = true } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Flavour name is required.' });
    const slug = slugify(name);
    if (await Flavour.findOne({ slug })) return res.status(409).json({ message: 'That flavour already exists.' });
    const f = await Flavour.create({ name: name.trim(), nameAr: String(nameAr).trim(), slug, description, extraPrice: Number(extraPrice) || 0, color, available });
    log(req.user, 'created', 'flavour', f.name);
    res.status(201).json(f);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const patch = { ...req.body };
    if (patch.name) { patch.name = patch.name.trim(); patch.slug = slugify(patch.name); }
    if (patch.extraPrice !== undefined) patch.extraPrice = Number(patch.extraPrice) || 0;
    const f = await Flavour.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!f) return res.status(404).json({ message: 'Flavour not found.' });
    log(req.user, 'updated', 'flavour', f.name);
    res.json(f);
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? 'That flavour already exists.' : e.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  const f = await Flavour.findByIdAndDelete(req.params.id);
  if (f) {
    await Product.updateMany({ flavours: f._id }, { $pull: { flavours: f._id } });
    log(req.user, 'deleted', 'flavour', f.name);
  }
  res.json({ message: 'Flavour deleted.' });
});

module.exports = router;
