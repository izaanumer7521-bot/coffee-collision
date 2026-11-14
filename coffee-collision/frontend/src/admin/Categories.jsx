import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, ConfirmModal, Empty, Icon, Modal, PageHead, useToast } from './ui.jsx';

function CategoryForm({ category, onSaved, onClose }) {
  const { token } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(category?.name || '');
  const [nameAr, setNameAr] = useState(category?.nameAr || '');
  const [description, setDescription] = useState(category?.description || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const body = { name, nameAr, description };
      if (category) await api(`/categories/${category._id}`, { method: 'PUT', token, body });
      else await api('/categories', { method: 'POST', token, body });
      toast(category ? 'Category updated' : 'Category added'); onSaved();
    } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <Modal title={category ? 'Edit category' : 'New category'} onClose={onClose}>
      <form className="a-form" onSubmit={submit}>
        <label className="a-field"><span>Name</span><input className="a-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cold brew" required autoFocus /></label>
        <label className="a-field"><span>Arabic name (الاسم بالعربية)</span><input className="a-input" dir="rtl" lang="ar" value={nameAr} onChange={(e) => setNameAr(e.target.value)} /></label>
        <label className="a-field"><span>Description (optional)</span><input className="a-input" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        {error && <p className="a-error">{error}</p>}
        <div className="a-actions">
          <button type="button" className="a-btn ghost" onClick={onClose}>Cancel</button>
          <button className="a-btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Categories() {
  const { token } = useAuth();
  const toast = useToast();
  const [cats, setCats] = useState(null);
  const [counts, setCounts] = useState({});
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    Promise.all([api('/categories'), api('/products?all=1')]).then(([c, p]) => {
      const n = {};
      p.forEach((x) => { if (x.category) n[x.category._id] = (n[x.category._id] || 0) + 1; });
      setCats(c); setCounts(n);
    }).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const remove = async () => {
    try { await api(`/categories/${deleting._id}`, { method: 'DELETE', token }); toast('Category deleted'); }
    catch (e) { toast(e.message, 'err'); }
    setDeleting(null); load();
  };

  return (
    <div className="a-stack">
      <PageHead title="Categories" sub="Group your drinks. Customers can filter the menu by category." action={
        <button className="a-btn" onClick={() => setEditing({})}><Icon name="plus" size={16} />New category</button>
      } />
      <Card>
        {error && <p className="a-error">{error}</p>}
        {!cats ? <div className="a-skel tall" /> : cats.length === 0 ? (
          <Empty icon="tag" text="No categories yet."><button className="a-btn" onClick={() => setEditing({})}>Create the first one</button></Empty>
        ) : (
          <ul className="a-list big">
            {cats.map((c) => (
              <li key={c._id}>
                <span className="a-ev-ico"><Icon name="tag" size={18} /></span>
                <div className="grow"><b>{c.name}{c.nameAr ? <span lang="ar" dir="rtl" style={{ marginInlineStart: 8, opacity: 0.6, fontWeight: 400 }}>{c.nameAr}</span> : null}</b><small>{c.description || `${counts[c._id] || 0} products`}</small></div>
                <span className="a-count">{counts[c._id] || 0} products</span>
                <button className="a-icon" aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)}><Icon name="edit" /></button>
                <button className="a-icon danger" aria-label={`Delete ${c.name}`} onClick={() => setDeleting(c)}><Icon name="trash" /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {editing && <CategoryForm category={editing._id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {deleting && <ConfirmModal title="Delete category?" text={`“${deleting.name}” will be removed. Its products stay on the site without a category.`} onConfirm={remove} onClose={() => setDeleting(null)} />}
    </div>
  );
}
