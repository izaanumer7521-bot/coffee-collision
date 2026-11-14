const mongoose = require('mongoose');
module.exports = mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: String,
  size: { type: String, default: '' },          // size name chosen by the customer
  sizePrice: { type: Number, default: 0 },
  quantity: { type: Number, min: 1, max: 20, default: 1 },
  milk: { type: String, default: '' },            // old 'create your cup' orders only
  flavour: { type: String, default: '' },
  flavourPrice: { type: Number, default: 0 },
  sweetness: { type: Number, min: 0, max: 5 },     // old 'create your cup' orders only
  notes: { type: String, default: '' },
  total: { type: Number, required: true },
  status: { type: String, enum: ['placed', 'brewing', 'ready', 'delivered', 'cancelled'], default: 'placed' },
}, { timestamps: true }));
