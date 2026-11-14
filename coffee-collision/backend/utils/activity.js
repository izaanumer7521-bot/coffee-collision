const ActivityLog = require('../models/ActivityLog');

// log(user, action, entity, entityName, details)
// action: created | updated | deleted | status | signed-in | registered | password | email
// entity: product | category | flavour | order | account | message
module.exports = async function log(user, action, entity, entityName = '', details = '') {
  try {
    await ActivityLog.create({
      actor: user?._id,
      actorName: user?.name || 'System',
      action, entity, entityName, details,
    });
  } catch (e) {
    console.error('activity log failed:', e.message);
  }
};
