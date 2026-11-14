const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Flavour = require('../models/Flavour');
const log = require('../utils/activity');
const { protect, adminOnly } = require('../middleware/auth');
const SIZE_ADD = { small: 0, medium: 0.5, large: 1 };

router.post('/', protect, async (req, res) => {
  try {
    const { productId, flavourId, size = 'medium', milk = 'whole', sweetness = 2, notes = '' } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.available) return res.status(404).json({ message: 'That drink is not available.' });
    let flavour = null;
    if (flavourId) {
      flavour = await Flavour.findById(flavourId);
      if (!flavour || !flavour.available) return res.status(404).json({ message: 'That flavour is not available.' });
    }
    const flavourPrice = flavour ? flavour.extraPrice : 0;
    const total = +(product.price + (SIZE_ADD[size] ?? 0) + flavourPrice).toFixed(2);
    const order = await Order.create({
      user: req.user._id, product: product._id, productName: product.name,
      flavour: flavour ? flavour.name : '', flavourPrice, size, milk, sweetness, notes, total,
    });
    log(req.user, 'created', 'order', product.name, `$${total.toFixed(2)}${flavour ? ` · ${flavour.name}` : ''}`);
    res.status(201).json(order);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.get('/mine', protect, async (req, res) => res.json(await Order.find({ user: req.user._id }).sort('-createdAt')));
router.get('/', protect, adminOnly, async (req, res) => res.json(await Order.find().populate('user', 'name email').sort('-createdAt')));

router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!o) return res.status(404).json({ message: 'Order not found.' });
    log(req.user, 'status', 'order', o.productName, `Marked ${o.status}`);
    res.json(o);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;
