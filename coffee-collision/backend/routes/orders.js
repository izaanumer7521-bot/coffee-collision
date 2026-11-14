const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Flavour = require('../models/Flavour');
const sizeOptions = require('../utils/sizes');
const log = require('../utils/activity');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { productId, flavourId, size, milk = 'whole', sweetness = 2, notes = '' } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.available) return res.status(404).json({ message: 'That drink is not available.' });

    if (!(product.price > 0)) return res.status(400).json({ message: 'This item has no price yet and cannot be ordered online.' });

    // size: match by name (case-insensitive); default to the middle size
    const options = sizeOptions(product);
    const chosen = options.find((s) => s.name.toLowerCase() === String(size || '').toLowerCase()) || options[Math.floor((options.length - 1) / 2)];

    let flavour = null;
    if (flavourId) {
      flavour = await Flavour.findById(flavourId);
      if (!flavour || !flavour.available) return res.status(404).json({ message: 'That flavour is not available.' });
    }
    const flavourPrice = flavour ? flavour.extraPrice : 0;
    const total = +(chosen.price + flavourPrice).toFixed(2);
    const order = await Order.create({
      user: req.user._id, product: product._id, productName: product.name,
      flavour: flavour ? flavour.name : '', flavourPrice, size: chosen.name, sizePrice: chosen.price,
      milk, sweetness, notes, total,
    });
    log(req.user, 'created', 'order', product.name, `${total} SAR · ${chosen.name}${flavour ? ` · ${flavour.name}` : ''}`);
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
