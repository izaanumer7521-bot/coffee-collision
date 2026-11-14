import { useCallback, useEffect, useState } from 'react';
import { api, timeAgo } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, Empty, Icon, PageHead } from './ui.jsx';
import { describe, ENTITY_ICON } from './activityText.js';

const FILTERS = [['', 'All'], ['product', 'Products'], ['category', 'Categories'], ['flavour', 'Flavours'], ['order', 'Orders'], ['account', 'Accounts'], ['message', 'Messages']];

export default function Activity() {
  const { token } = useAuth();
  const [entity, setEntity] = useState('');
  const [items, setItems] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState('');

  const load = useCallback((p, reset) => {
    api(`/activity?page=${p}&limit=25${entity ? `&entity=${entity}` : ''}`, { token })
      .then((d) => { setItems((prev) => (reset || !prev ? d.items : [...prev, ...d.items])); setPage(d.page); setPages(d.pages); })
      .catch((e) => setError(e.message));
  }, [token, entity]);
  useEffect(() => { setItems(null); load(1, true); }, [load]);

  return (
    <div className="a-stack">
      <PageHead title="Activity log" sub="Everything that happens in your store: changes, orders and sign ins." />
      <Card>
        <div className="a-chips wrap">
          {FILTERS.map(([k, label]) => <button key={k} className={entity === k ? 'on' : ''} onClick={() => setEntity(k)}>{label}</button>)}
        </div>
        {error && <p className="a-error">{error}</p>}
        {!items ? <div className="a-skel tall" /> : items.length === 0 ? <Empty icon="pulse" text="No activity yet." /> : (
          <ol className="a-timeline">
            {items.map((a) => (
              <li key={a._id}>
                <span className={`a-ev-ico ${a.entity}`}><Icon name={ENTITY_ICON[a.entity] || 'pulse'} size={16} /></span>
                <div>
                  <b>{describe(a)}</b>
                  {a.details && <small>{a.details}</small>}
                  <small title={new Date(a.createdAt).toLocaleString()}>{timeAgo(a.createdAt)}</small>
                </div>
              </li>
            ))}
          </ol>
        )}
        {page < pages && <div className="a-center"><button className="a-btn ghost" onClick={() => load(page + 1, false)}>Load more</button></div>}
      </Card>
    </div>
  );
}
