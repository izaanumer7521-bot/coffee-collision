const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, async (req, res) => {
  const day = 86400000;
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const since = new Date(start.getTime() - 13 * day); // last 14 days

  const [orders, revenueAgg, customers, products, byStatus, daily, top, recentOrders, recentActivity] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'cancelled' } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: '$productName', orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { orders: -1 } }, { $limit: 5 },
    ]),
    Order.find().populate('user', 'name').sort('-createdAt').limit(6),
    ActivityLog.find().sort('-createdAt').limit(6),
  ]);

  const map = Object.fromEntries(daily.map((d) => [d._id, d]));
  const series = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * day);
    const key = d.toISOString().slice(0, 10);
    // toISOString is UTC; rebuild a local key for matching
    const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const hit = map[local] || map[key] || {};
    return { date: local, orders: hit.orders || 0, revenue: +(hit.revenue || 0).toFixed(2) };
  });
  const last7 = series.slice(7), prev7 = series.slice(0, 7);
  const sum = (arr, k) => arr.reduce((a, b) => a + b[k], 0);

  res.json({
    totals: { orders, revenue: +(revenueAgg[0]?.sum || 0).toFixed(2), customers, products },
    week: { orders: sum(last7, 'orders'), prevOrders: sum(prev7, 'orders'), revenue: +sum(last7, 'revenue').toFixed(2), prevRevenue: +sum(prev7, 'revenue').toFixed(2) },
    series,
    byStatus: byStatus.map((s) => ({ status: s._id, count: s.count })),
    top: top.map((t) => ({ name: t._id, orders: t.orders, revenue: +t.revenue.toFixed(2) })),
    recentOrders, recentActivity,
  });
});

module.exports = router;
