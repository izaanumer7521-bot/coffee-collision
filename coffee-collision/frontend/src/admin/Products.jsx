import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, assetUrl, compressImage, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, ConfirmModal, Empty, Icon, Modal, PageHead, Toggle, useToast } from './ui.jsx';

function ProductForm({ product, categories, flavours, onSaved, onClose }) {
  const { token } = useAuth();
  const toast = useToast();
  const isUploaded = (product?.image || '').startsWith('/api/products/');
  const [f, setF] = useState({
    name: product?.name || '', price: product?.price ?? '', description: product?.description || '',
    category: product?.category?._id || '', flavours: (product?.flavours || []).map((x) => x._id),
    featured: !!product?.featured, available: product ? product.available : true,
  });
  const [preview, setPreview] = useState(product?.image ? assetUrl(product.image) : '');
  const [imgData, setImgData] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [link, setLink] = useState(product && !isUploaded ? product.image : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try { const d = await compressImage(file); setPreview(d); setImgData(d); setRemoved(false); setError(''); }
    catch (err) { setError(err.message); }
  };
  const toggleFlavour = (id) => setF((s) => ({ ...s, flavours: s.flavours.includes(id) ? s.flavours.filter((x) => x !== id) : [...s.flavours, id] }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const body = { ...f, price: Number(f.price), category: f.category || null };
      if (imgData) body.imageData = imgData;
      else if (removed) body.removeImage = true;
      else if (link && link !== product?.image) body.image = link;
      const saved = product
        ? await api(`/products/${product._id}`, { method: 'PUT', token, body })
        : await api('/products', { method: 'POST', token, body });
      toast(product ? 'Product updated' : 'Product added');
      onSaved(saved);
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <Modal title={product ? 'Edit product' : 'Add product'} onClose={onClose} wide>
      <form className="a-form" onSubmit={submit}>
        <div className="a-form-cols">
          <div className="a-upload">
            <div className={`a-drop ${preview ? 'has' : ''}`}>
              {preview ? <img src={preview} alt="Product preview" /> : <span><Icon name="image" size={32} />Product picture</span>}
            </div>
            <label className="a-btn ghost full">
              <Icon name="plus" size={16} />{preview ? 'Change picture' : 'Upload picture'}
              <input type="file" accept="image/*" onChange={pick} hidden />
            </label>
            {preview && <button type="button" className="a-btn ghost full" onClick={() => { setPreview(''); setImgData(null); setRemoved(true); setLink(''); }}>Remove picture</button>}
            {!imgData && !isUploaded && (
              <label className="a-field"><span>Or paste an image link</span>
                <input className="a-input" value={link} onChange={(e) => { setLink(e.target.value); setPreview(e.target.value); setRemoved(false); }} placeholder="https://…" />
              </label>
            )}
          </div>
          <div className="a-fields">
            <label className="a-field"><span>Name</span><input className="a-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required autoFocus /></label>
            <div className="a-two">
              <label className="a-field"><span>Price ($)</span><input className="a-input" type="number" step="0.01" min="0" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} required /></label>
              <label className="a-field"><span>Category</span>
                <select className="a-input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
                  <option value="">No category</option>
                  {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <label className="a-field"><span>Description</span><textarea className="a-input" rows="3" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
            <div className="a-field">
              <span>Flavours available for this drink</span>
              {flavours.length === 0 ? <small className="a-muted">Add flavours first in the Flavours page.</small> : (
                <div className="a-chips wrap">
                  {flavours.map((fl) => (
                    <button type="button" key={fl._id} className={f.flavours.includes(fl._id) ? 'on' : ''} onClick={() => toggleFlavour(fl._id)}>
                      <i className="dot" style={{ background: fl.color }} />{fl.name}
                    </button>
                  ))}
                </div>
              )}
              <small className="a-muted">Leave all unselected to offer every flavour.</small>
            </div>
            <div className="a-two">
              <Toggle checked={f.available} onChange={(v) => setF({ ...f, available: v })} label="Visible on the website" />
              <Toggle checked={f.featured} onChange={(v) => setF({ ...f, featured: v })} label="Featured" />
            </div>
          </div>
        </div>
        {error && <p className="a-error">{error}</p>}
        <div className="a-actions">
          <button type="button" className="a-btn ghost" onClick={onClose}>Cancel</button>
          <button className="a-btn" disabled={busy}>{busy ? 'Saving…' : product ? 'Save changes' : 'Add product'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Products() {
  const { token } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [flavours, setFlavours] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [editing, setEditing] = useState(null);   // null | {} (new) | product
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    Promise.all([api('/products?all=1'), api('/categories'), api('/flavours?all=1')])
      .then(([p, c, f]) => { setProducts(p); setCategories(c); setFlavours(f); })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const shown = useMemo(() => (products || []).filter((p) =>
    (cat === 'all' || (cat === 'none' ? !p.category : p.category?._id === cat)) &&
    (!q || `${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase()))), [products, q, cat]);

  const quick = async (p, patch) => {
    try { await api(`/products/${p._id}`, { method: 'PUT', token, body: patch }); load(); toast('Saved'); }
    catch (e) { toast(e.message, 'err'); }
  };
  const remove = async () => {
    try { await api(`/products/${deleting._id}`, { method: 'DELETE', token }); toast('Product deleted'); setDeleting(null); load(); }
    catch (e) { toast(e.message, 'err'); setDeleting(null); }
  };

  return (
    <div className="a-stack">
      <PageHead title="Products" sub="Add drinks, set prices, pictures, categories and flavours." action={
        <button className="a-btn" onClick={() => setEditing({})}><Icon name="plus" size={16} />Add product</button>
      } />
      <Card>
        <div className="a-toolbar">
          <label className="a-search"><Icon name="search" size={16} /><input placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <select className="a-input slim" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            <option value="none">No category</option>
          </select>
        </div>
        {error && <p className="a-error">{error}</p>}
        {!products ? <div className="a-skel tall" /> : shown.length === 0 ? (
          <Empty text={products.length ? 'No products match your search.' : 'No products yet. Add your first drink.'}>
            {!products.length && <button className="a-btn" onClick={() => setEditing({})}>Add product</button>}
          </Empty>
        ) : (
          <div className="a-products">
            {shown.map((p) => (
              <article key={p._id} className={`a-product ${p.available ? '' : 'off'}`}>
                <div className="a-thumb">
                  {p.image ? <img src={assetUrl(p.image)} alt="" loading="lazy" /> : <Icon name="image" size={28} />}
                  {p.featured && <span className="star"><Icon name="star" size={14} /></span>}
                  <span className={`a-pill ${p.available ? 'live' : 'hidden'}`}>{p.available ? 'Live' : 'Hidden'}</span>
                </div>
                <div className="a-product-body">
                  <b>{p.name}</b>
                  <small>{p.category?.name || 'No category'} · {money(p.price)}</small>
                  <div className="a-dots">{p.flavours?.map((fl) => <i key={fl._id} title={fl.name} style={{ background: fl.color }} />)}</div>
                </div>
                <div className="a-product-actions">
                  <Toggle checked={p.available} onChange={(v) => quick(p, { available: v })} label="Visible" />
                  <div>
                    <button className="a-icon" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}><Icon name="edit" /></button>
                    <button className="a-icon danger" aria-label={`Delete ${p.name}`} onClick={() => setDeleting(p)}><Icon name="trash" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      {editing && (
        <ProductForm
          product={editing._id ? editing : null}
          categories={categories} flavours={flavours}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
      {deleting && <ConfirmModal title="Delete product?" text={`“${deleting.name}” will be removed from the website. This cannot be undone.`} onConfirm={remove} onClose={() => setDeleting(null)} />}
    </div>
  );
}
