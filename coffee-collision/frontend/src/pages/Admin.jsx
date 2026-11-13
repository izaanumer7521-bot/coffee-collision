import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const STATUSES = ['placed', 'brewing', 'ready', 'delivered', 'cancelled'];
const empty = { name: '', description: '', price: '', image: '' };

export default function Admin() {
  const { token } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');

  const load = () => {
    api('/orders', { token }).then(setOrders).catch((e) => setError(e.message));
    api('/products?all=1').then(setProducts).catch((e) => setError(e.message));
    api('/contact', { token }).then(setMessages).catch((e) => setError(e.message));
  };
  useEffect(load, [token]);

  const setStatus = async (id, status) => {
    try { await api(`/orders/${id}/status`, { method: 'PATCH', token, body: { status } }); load(); }
    catch (e) { setError(e.message); }
  };
  const addProduct = async (e) => {
    e.preventDefault(); setError('');
    try { await api('/products', { method: 'POST', token, body: { ...form, price: Number(form.price) } }); setForm(empty); load(); }
    catch (err) { setError(err.message); }
  };
  const toggle = async (p) => { await api(`/products/${p._id}`, { method: 'PUT', token, body: { available: !p.available } }); load(); };
  const remove = async (p) => { if (confirm(`Delete ${p.name}?`)) { await api(`/products/${p._id}`, { method: 'DELETE', token }); load(); } };

  return (
    <section className="page light">
      <h1>Admin</h1>
      <div className="tabs">
        {['orders', 'products', 'messages'].map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {error && <p className="form-error">{error}</p>}

      {tab === 'orders' && (
        <ul className="list">
          {orders.length === 0 && <li>No orders yet.</li>}
          {orders.map((o) => (
            <li key={o._id}>
              <div>
                <strong>{o.productName} · ${o.total.toFixed(2)}</strong>
                <span>{o.size}, {o.milk} milk, sweetness {o.sweetness}/5{o.notes ? ` — ${o.notes}` : ''}</span>
                <small>{o.user?.name} ({o.user?.email}) · {new Date(o.createdAt).toLocaleString()}</small>
              </div>
              <select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </li>
          ))}
        </ul>
      )}

      {tab === 'products' && (
        <>
          <form className="form inline" onSubmit={addProduct}>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input placeholder="Image path (e.g. /products/new.png)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button className="btn dark" type="submit">Add drink</button>
          </form>
          <ul className="list">
            {products.map((p) => (
              <li key={p._id}>
                <div><strong>{p.name} · ${p.price.toFixed(2)}</strong><span>{p.description}</span></div>
                <div className="right">
                  <button className="link" onClick={() => toggle(p)}>{p.available ? 'Hide' : 'Show'}</button>
                  <button className="link danger" onClick={() => remove(p)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {tab === 'messages' && (
        <ul className="list">
          {messages.length === 0 && <li>No messages yet.</li>}
          {messages.map((m) => (
            <li key={m._id}><div><strong>{m.name} · {m.email}</strong><span>{m.message}</span><small>{new Date(m.createdAt).toLocaleString()}</small></div></li>
          ))}
        </ul>
      )}
    </section>
  );
}
