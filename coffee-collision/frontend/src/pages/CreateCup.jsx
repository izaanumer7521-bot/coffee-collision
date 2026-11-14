import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { sizeOptions } from '../sizes.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../i18n/LangContext.jsx';

export default function CreateCup() {
  const { token } = useAuth();
  const { t, tr } = useLang();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allFlavours, setAllFlavours] = useState([]);
  const [form, setForm] = useState({ productId: '', flavourId: '', size: '', milk: 'whole', sweetness: 2, notes: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api('/products'), api('/flavours')]).then(([all, fl]) => {
      let list = all;
      list = list.filter((p) => p.price > 0);   // items without a price are not orderable online
      setProducts(list); setAllFlavours(fl);
      const wanted = list.find((p) => p.slug === params.get('drink')) || list[0];
      if (wanted) setForm((f) => ({ ...f, productId: wanted._id }));
    }).catch((e) => setError(e.message));
  }, [params]);

  const product = products.find((p) => p._id === form.productId);
  // a drink can limit its flavours in the admin panel; otherwise every available flavour is offered
  const ids = new Set((product?.flavours || []).map((f) => f._id));
  const flavours = allFlavours.filter((f) => ids.size === 0 || ids.has(f._id));
  const flavour = flavours.find((f) => f._id === form.flavourId);
  const sizes = product ? sizeOptions(product) : [];
  const chosen = sizes.find((s) => s.name === form.size) || sizes[Math.floor((sizes.length - 1) / 2)];
  const total = chosen ? chosen.price + (flavour ? flavour.extraPrice : 0) : 0;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const pickDrink = (e) => setForm({ ...form, productId: e.target.value, flavourId: '', size: '' });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api('/orders', { method: 'POST', token, body: { ...form, size: chosen?.name, flavourId: form.flavourId || undefined, sweetness: Number(form.sweetness) } });
      nav('/archives');
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <section className="page dark narrow">
      <h1>{t('createTitle')}</h1>
      <form className="form" onSubmit={submit}>
        <label>{t('drink')}
          <select value={form.productId} onChange={pickDrink}>
            {products.map((p) => <option key={p._id} value={p._id}>{tr(p)}</option>)}
          </select>
        </label>
        {flavours.length > 0 && (
          <label>{t('flavour')}
            <select value={form.flavourId} onChange={set('flavourId')}>
              <option value="">{t('noFlavour')}</option>
              {flavours.map((f) => <option key={f._id} value={f._id}>{tr(f)}{f.extraPrice > 0 ? ` (+${money(f.extraPrice)})` : ''}</option>)}
            </select>
          </label>
        )}
        <label>{t('size')}
          <select value={chosen?.name || ''} onChange={set('size')}>
            {sizes.map((s) => <option key={s.name} value={s.name}>{tr(s)} · {money(s.price)}</option>)}
          </select>
        </label>
        <label>{t('milk')}
          <select value={form.milk} onChange={set('milk')}>
            <option value="whole">{t('whole')}</option><option value="oat">{t('oat')}</option><option value="almond">{t('almond')}</option><option value="none">{t('none')}</option>
          </select>
        </label>
        <label>{t('sweetness')}: {form.sweetness}/5
          <input type="range" min="0" max="5" value={form.sweetness} onChange={set('sweetness')} />
        </label>
        <label>{t('notes')}<textarea rows="3" value={form.notes} onChange={set('notes')} placeholder={t('notesPh')} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn" type="submit" disabled={busy || !product}>{busy ? t('placing') : `${t('placeOrder')} · ${money(total)}`}</button>
      </form>
    </section>
  );
}
