const router = require('express').Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const filter = req.query.entity ? { entity: req.query.entity } : {};
  const [items, total] = await Promise.all([
    ActivityLog.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    ActivityLog.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

module.exports = router;
