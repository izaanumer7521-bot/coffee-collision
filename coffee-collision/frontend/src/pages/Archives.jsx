import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useLang } from '../i18n/LangContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Archives() {
  const { token } = useAuth();
  const { t, lang } = useLang();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api('/orders/mine', { token }).then(setOrders).catch((e) => setError(e.message)); }, [token]);

  return (
    <section className="page light">
      <h1>{t('archivesTitle')}</h1>
      <p className="page-note">{t('archivesNote')}</p>
      {error && <p className="form-error">{error}</p>}
      {orders && orders.length === 0 && <p>{t('noOrders')} <Link to="/menu">{t('startOrder')}</Link></p>}
      <ul className="list">
        {orders?.map((o) => (
          <li key={o._id}>
            <div>
              <strong>{o.productName}</strong>
              <span>{o.quantity > 1 ? `${o.quantity} × ` : ''}{o.size}</span>
              {o.notes && <span className="order-request"><b>{t('yourRequest')}:</b> {o.notes}</span>}
              <small>{new Date(o.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : undefined)}</small>
            </div>
            <div className="right"><b>{money(o.total)}</b><em className={`status ${o.status}`}>{t(o.status)}</em></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
