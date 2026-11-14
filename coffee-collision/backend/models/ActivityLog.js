const mongoose = require('mongoose');
module.exports = mongoose.model('ActivityLog', new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String, default: 'System' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityName: { type: String, default: '' },
  details: { type: String, default: '' },
}, { timestamps: true }));
