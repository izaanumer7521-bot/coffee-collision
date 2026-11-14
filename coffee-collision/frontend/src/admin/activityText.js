const VERB = { created: 'added', updated: 'edited', deleted: 'deleted' };
export const ENTITY_ICON = { product: 'cup', category: 'tag', flavour: 'drop', order: 'bag', account: 'user', message: 'mail' };

// one readable sentence for each activity entry
export function describe(a) {
  const who = a.actorName || 'System';
  if (a.action === 'import') return `${who} imported a menu`;
  const name = a.entityName ? `“${a.entityName}”` : '';
  if (a.entity === 'account') {
    if (a.action === 'signed-in') return `${who} signed in`;
    if (a.action === 'registered') return `${who} created an account`;
    if (a.action === 'password') return `${who} changed their password`;
    if (a.action === 'email') return `${who} changed their email`;
    return `${who} updated their profile`;
  }
  if (a.entity === 'order') {
    if (a.action === 'created') return `${who} placed an order for ${name}`;
    return `${who} updated the order ${name}`;
  }
  if (a.entity === 'message') {
    return a.action === 'created' ? `New contact message from ${a.entityName}` : `${who} deleted a message from ${a.entityName}`;
  }
  return `${who} ${VERB[a.action] || a.action} the ${a.entity} ${name}`;
}
