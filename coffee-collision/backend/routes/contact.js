const router = require('express').Router();
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/auth');
router.post('/', async (req, res) => {
  try { await Message.create(req.body); res.status(201).json({ message: 'Message sent. We will reply by email.' }); }
  catch (e) { res.status(400).json({ message: 'Name, email and message are required.' }); }
});
router.get('/', protect, adminOnly, async (req, res) => res.json(await Message.find().sort('-createdAt')));
module.exports = router;
