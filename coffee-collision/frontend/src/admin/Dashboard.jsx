import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money, timeAgo } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, Icon } from './ui.jsx';
import { AreaChart, Donut } from './charts.jsx';
import { describe, ENTITY_ICON } from './activityText.js';

export const STATUS_COLORS = { placed: '#c79a6f', brewing: '#7a1b35', ready: '#d4a23a', delivered: '#3f8a5a', cancelled: '#b8aaa0' };

function Delta({ cur, prev }) {
  if (prev === undefined) return null;
  if (prev === 0) return cur > 0 ? <span className="a-delta up"><Icon name="up" size={14} />new</span> : <span className="a-delta flat">—</span>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  return <span className={`a-delta ${pct >= 0 ? 'up' : 'down'}`}><Icon name={pct >= 0 ? 'up' : 'down'} size={14} />{Math.abs(pct)}%</span>;
}

function Stat({ icon, label, value, children }) {
  return (
    <div className="a-card a-stat">
      <span className="a-stat-ico"><Icon name={icon} size={20} /></span>
      <div><p>{label}</p><b>{value}</b>{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [s, setS] = useState(null);
  const [error, setError] = useState('');
  const [metric, setMetric] = useState('orders');

  useEffect(() => { api('/stats', { token }).then(setS).catch((e) => setError(e.message)); }, [token]);

  if (error) return <p className="a-error">{error}</p>;
  if (!s) return <div className="a-stats">{[0, 1, 2, 3].map((i) => <div key={i} className="a-card a-skel" />)}</div>;

  const segments = ['placed', 'brewing', 'ready', 'delivered', 'cancelled'].map((k) => ({
    label: k[0].toUpperCase() + k.slice(1), color: STATUS_COLORS[k],
    value: s.byStatus.find((x) => x.status === k)?.count || 0,
  }));
  const topMax = Math.max(1, ...s.top.map((t) => t.orders));

  return (
    <div className="a-stack">
      <div className="a-stats">
        <Stat icon="bag" label="Revenue" value={money(s.totals.revenue)}>
          <small>This week {money(s.week.revenue)} <Delta cur={s.week.revenue} prev={s.week.prevRevenue} /></small>
        </Stat>
        <Stat icon="cup" label="Orders" value={s.totals.orders}>
          <small>This week {s.week.orders} <Delta cur={s.week.orders} prev={s.week.prevOrders} /></small>
        </Stat>
        <Stat icon="user" label="Customers" value={s.totals.customers}><small>Registered accounts</small></Stat>
        <Stat icon="tag" label="Products" value={s.totals.products}><small><Link to="/admin/products">Manage products →</Link></small></Stat>
      </div>

      <div className="a-grid-2">
        <Card title="Sales overview" sub="Last 14 days" action={
          <div className="a-chips small">
            <button className={metric === 'orders' ? 'on' : ''} onClick={() => setMetric('orders')}>Orders</button>
            <button className={metric === 'revenue' ? 'on' : ''} onClick={() => setMetric('revenue')}>Revenue</button>
          </div>
        }>
          <AreaChart data={s.series} valueKey={metric} format={metric === 'revenue' ? money : (v) => `${v} orders`} />
        </Card>
        <Card title="Orders by status" sub="All time">
          <Donut segments={segments} label="Orders" />
        </Card>
      </div>

      <div className="a-grid-3">
        <Card title="Top drinks" sub="By number of orders">
          {s.top.length === 0 ? <p className="a-muted">No orders yet.</p> : (
            <ul className="a-bars">
              {s.top.map((t) => (
                <li key={t.name}>
                  <div><span>{t.name}</span><b>{t.orders}</b></div>
                  <i><u style={{ width: `${(t.orders / topMax) * 100}%` }} /></i>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Recent orders" action={<Link className="a-link" to="/admin/orders">View all</Link>}>
          {s.recentOrders.length === 0 ? <p className="a-muted">No orders yet.</p> : (
            <ul className="a-list">
              {s.recentOrders.map((o) => (
                <li key={o._id}>
                  <div><b>{o.productName}</b><small>{o.user?.name || 'Customer'} · {timeAgo(o.createdAt)}</small></div>
                  <div className="end"><b>{money(o.total)}</b><span className={`a-pill ${o.status}`}>{o.status}</span></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Latest activity" action={<Link className="a-link" to="/admin/activity">View all</Link>}>
          {s.recentActivity.length === 0 ? <p className="a-muted">Nothing yet.</p> : (
            <ul className="a-list compact">
              {s.recentActivity.map((a) => (
                <li key={a._id}>
                  <span className="a-ev-ico"><Icon name={ENTITY_ICON[a.entity] || 'pulse'} size={16} /></span>
                  <div><b>{describe(a)}</b><small>{timeAgo(a.createdAt)}</small></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
