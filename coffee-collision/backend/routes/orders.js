const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const SIZE_ADD = { small: 0, medium: 0.5, large: 1 };

router.post('/', protect, async (req, res) => {
  try {
    const { productId, size = 'medium', milk = 'whole', sweetness = 2, notes = '' } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.available) return res.status(404).json({ message: 'That drink is not available.' });
    const total = +(product.price + (SIZE_ADD[size] ?? 0)).toFixed(2);
    const order = await Order.create({ user: req.user._id, product: product._id, productName: product.name, size, milk, sweetness, notes, total });
    res.status(201).json(order);
  } catch (e) { res.status(400).json({ message: e.message }); }
});
router.get('/mine', protect, async (req, res) => res.json(await Order.find({ user: req.user._id }).sort('-createdAt')));
router.get('/', protect, adminOnly, async (req, res) => res.json(await Order.find().populate('user', 'name email').sort('-createdAt')));
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const o = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    o ? res.json(o) : res.status(404).json({ message: 'Order not found.' });
  } catch (e) { res.status(400).json({ message: e.message }); }
});
module.exports = router;
