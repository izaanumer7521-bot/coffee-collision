import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const SIZE_ADD = { small: 0, medium: 0.5, large: 1 };

export default function CreateCup() {
  const { token } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allFlavours, setAllFlavours] = useState([]);
  const [form, setForm] = useState({ productId: '', flavourId: '', size: 'medium', milk: 'whole', sweetness: 2, notes: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api('/products'), api('/flavours')]).then(([list, fl]) => {
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
  const total = product ? product.price + SIZE_ADD[form.size] + (flavour ? flavour.extraPrice : 0) : 0;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const pickDrink = (e) => setForm({ ...form, productId: e.target.value, flavourId: '' });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api('/orders', { method: 'POST', token, body: { ...form, flavourId: form.flavourId || undefined, sweetness: Number(form.sweetness) } });
      nav('/archives');
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <section className="page dark narrow">
      <h1>Create your cup</h1>
      <form className="form" onSubmit={submit}>
        <label>Drink
          <select value={form.productId} onChange={pickDrink}>
            {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </label>
        {flavours.length > 0 && (
          <label>Flavour
            <select value={form.flavourId} onChange={set('flavourId')}>
              <option value="">No flavour</option>
              {flavours.map((f) => <option key={f._id} value={f._id}>{f.name}{f.extraPrice > 0 ? ` (+${money(f.extraPrice)})` : ''}</option>)}
            </select>
          </label>
        )}
        <label>Size
          <select value={form.size} onChange={set('size')}>
            <option value="small">Small</option><option value="medium">Medium (+$0.50)</option><option value="large">Large (+$1.00)</option>
          </select>
        </label>
        <label>Milk
          <select value={form.milk} onChange={set('milk')}>
            <option value="whole">Whole</option><option value="oat">Oat</option><option value="almond">Almond</option><option value="none">No milk</option>
          </select>
        </label>
        <label>Sweetness: {form.sweetness}/5
          <input type="range" min="0" max="5" value={form.sweetness} onChange={set('sweetness')} />
        </label>
        <label>Notes<textarea rows="3" value={form.notes} onChange={set('notes')} placeholder="Extra shot, less ice…" /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn" type="submit" disabled={busy || !product}>{busy ? 'Placing…' : `Place order · ${money(total)}`}</button>
      </form>
    </section>
  );
}
