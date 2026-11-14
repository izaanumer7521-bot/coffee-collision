import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, assetUrl, money } from '../api.js';
import { sizeOptions } from '../sizes.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../i18n/LangContext.jsx';

export default function Product() {
  const { slug } = useParams();
  const { token } = useAuth();
  const { t, tr } = useLang();
  const nav = useNavigate();
  const [product, setProduct] = useState(undefined);   // undefined = loading, null = not found
  const [sizeName, setSizeName] = useState('');
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setProduct(undefined);
    api('/products').then((all) => setProduct(all.find((p) => p.slug === slug) || null)).catch((e) => { setError(e.message); setProduct(null); });
  }, [slug]);

  if (product === undefined) return <section className="page light"><p className="page-note">{t('loadingPage')}</p></section>;
  if (!product) return <section className="page light"><p className="page-note">{error || t('notFoundItem')}</p><Link className="back-link" to="/menu">{t('backToMenu')}</Link></section>;

  const orderable = product.price > 0;
  const sizes = orderable ? sizeOptions(product) : [];
  const chosen = sizes.find((s) => s.name === sizeName) || sizes[Math.floor((sizes.length - 1) / 2)];
  const total = chosen ? chosen.price * qty : 0;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api('/orders', { method: 'POST', token, body: { productId: product._id, size: chosen?.name, quantity: qty, notes } });
      nav('/archives');
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <section className="page light product-page">
      <Link className="back-link" to="/menu">{t('backToMenu')}</Link>
      <div className={`product-layout ${product.image ? '' : 'no-photo'}`}>
        {product.image && <img className="product-photo" src={assetUrl(product.image)} alt={tr(product)} />}
        <div className="product-info">
          {product.category && <p className="product-cat">{tr(product.category)}</p>}
          <h1>{tr(product)}</h1>
          {tr(product, 'description') && <p className="product-desc">{tr(product, 'description')}</p>}
          <p className="product-price">{orderable ? money(chosen.price) : t('priceInStore')}</p>

          {!orderable ? <p className="page-note">{t('orderPriceNote')}</p> : (
            <form className="order-form" onSubmit={submit}>
              <div className="order-row">
                {sizes.length > 1 && (
                  <label>{t('size')}
                    <select value={chosen.name} onChange={(e) => setSizeName(e.target.value)}>
                      {sizes.map((s) => <option key={s.name} value={s.name}>{tr(s)} · {money(s.price)}</option>)}
                    </select>
                  </label>
                )}
                <label>{t('quantity')}
                  <div className="stepper">
                    <button type="button" aria-label="−" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                    <b>{qty}</b>
                    <button type="button" aria-label="+" onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
                  </div>
                </label>
              </div>

              <div className="order-note">
                <h2>{t('orderBoxTitle')}</h2>
                <p>{t('orderBoxLead')}</p>
                <textarea rows="4" maxLength="500" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('orderBoxPh')} aria-label={t('orderBoxTitle')} />
              </div>

              {error && <p className="form-error">{error}</p>}
              {token ? (
                <button className="btn dark order-btn" type="submit" disabled={busy}>{busy ? t('placing') : `${t('placeOrder')} · ${money(total)}`}</button>
              ) : (
                <Link className="btn dark order-btn" to="/login">{t('signInToOrder')}</Link>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
