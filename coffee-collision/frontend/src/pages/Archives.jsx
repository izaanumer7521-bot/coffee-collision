import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Archives() {
  const { token } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api('/orders/mine', { token }).then(setOrders).catch((e) => setError(e.message)); }, [token]);

  return (
    <section className="page light">
      <h1>Archives</h1>
      <p className="page-note">Every cup you have created.</p>
      {error && <p className="form-error">{error}</p>}
      {orders && orders.length === 0 && <p>No cups yet. <Link to="/create">Create your first cup →</Link></p>}
      <ul className="list">
        {orders?.map((o) => (
          <li key={o._id}>
            <div>
              <strong>{o.productName}</strong>
              <span>{o.size}, {o.milk} milk{o.flavour ? `, ${o.flavour}` : ''}, sweetness {o.sweetness}/5{o.notes ? ` — ${o.notes}` : ''}</span>
              <small>{new Date(o.createdAt).toLocaleString()}</small>
            </div>
            <div className="right"><b>${o.total.toFixed(2)}</b><em className={`status ${o.status}`}>{o.status}</em></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
