import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, money, timeAgo } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, Empty, Icon, PageHead, useToast } from './ui.jsx';

const STATUSES = ['placed', 'brewing', 'ready', 'delivered', 'cancelled'];

export default function Orders() {
  const { token } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(() => { api('/orders', { token }).then(setOrders).catch((e) => setError(e.message)); }, [token]);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);

  const counts = useMemo(() => {
    const c = { all: orders?.length || 0 };
    STATUSES.forEach((s) => { c[s] = (orders || []).filter((o) => o.status === s).length; });
    return c;
  }, [orders]);

  const shown = (orders || []).filter((o) =>
    (status === 'all' || o.status === status) &&
    (!q || `${o.productName} ${o.user?.name} ${o.user?.email} ${o.flavour}`.toLowerCase().includes(q.toLowerCase())));

  const change = async (o, next) => {
    try { await api(`/orders/${o._id}/status`, { method: 'PATCH', token, body: { status: next } }); toast(`Order marked ${next}`); load(); }
    catch (e) { toast(e.message, 'err'); }
  };

  return (
    <div className="a-stack">
      <PageHead title="Orders" sub="Update the status as each cup moves along. This list refreshes by itself." />
      <Card>
        <div className="a-toolbar">
          <label className="a-search"><Icon name="search" size={16} /><input placeholder="Search drink, customer or email" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        </div>
        <div className="a-chips wrap">
          {['all', ...STATUSES].map((s) => (
            <button key={s} className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>{s[0].toUpperCase() + s.slice(1)} <em>{counts[s]}</em></button>
          ))}
        </div>
        {error && <p className="a-error">{error}</p>}
        {!orders ? <div className="a-skel tall" /> : shown.length === 0 ? <Empty icon="bag" text="No orders here yet." /> : (
          <ul className="a-list big">
            {shown.map((o) => (
              <li key={o._id}>
                <div className="grow">
                  <b>{o.productName} <span className="a-muted">· {money(o.total)}</span></b>
                  <small>{o.quantity > 1 ? `${o.quantity} × ` : ''}{o.size}{o.milk ? `, ${o.milk} milk` : ''}{o.flavour ? `, ${o.flavour}` : ''}{o.sweetness != null ? `, sweetness ${o.sweetness}/5` : ''}</small>
                  {o.notes && <small style={{ display: 'block', marginTop: 4, color: '#b4541c', fontWeight: 600 }}>Request: {o.notes}</small>}
                  <small>{o.user?.name || 'Customer'} ({o.user?.email}) · {timeAgo(o.createdAt)}</small>
                </div>
                <select className={`a-input slim a-status ${o.status}`} value={o.status} onChange={(e) => change(o, e.target.value)} aria-label="Order status">
                  {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                </select>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
