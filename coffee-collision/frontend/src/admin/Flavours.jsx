import { useCallback, useEffect, useState } from 'react';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, ConfirmModal, Empty, Icon, Modal, PageHead, Toggle, useToast } from './ui.jsx';

function FlavourForm({ flavour, onSaved, onClose }) {
  const { token } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({
    name: flavour?.name || '', description: flavour?.description || '',
    extraPrice: flavour?.extraPrice ?? 0, color: flavour?.color || '#b98a64', available: flavour ? flavour.available : true,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const body = { ...f, extraPrice: Number(f.extraPrice) };
      if (flavour) await api(`/flavours/${flavour._id}`, { method: 'PUT', token, body });
      else await api('/flavours', { method: 'POST', token, body });
      toast(flavour ? 'Flavour updated' : 'Flavour added'); onSaved();
    } catch (err) { setError(err.message); setBusy(false); }
  };
  return (
    <Modal title={flavour ? 'Edit flavour' : 'New flavour'} onClose={onClose}>
      <form className="a-form" onSubmit={submit}>
        <label className="a-field"><span>Name</span><input className="a-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Salted caramel" required autoFocus /></label>
        <div className="a-two">
          <label className="a-field"><span>Extra price ($)</span><input className="a-input" type="number" step="0.01" min="0" value={f.extraPrice} onChange={(e) => setF({ ...f, extraPrice: e.target.value })} /></label>
          <label className="a-field"><span>Colour</span><input className="a-input color" type="color" value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} /></label>
        </div>
        <label className="a-field"><span>Description (optional)</span><input className="a-input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <Toggle checked={f.available} onChange={(v) => setF({ ...f, available: v })} label="Available to customers" />
        {error && <p className="a-error">{error}</p>}
        <div className="a-actions">
          <button type="button" className="a-btn ghost" onClick={onClose}>Cancel</button>
          <button className="a-btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Flavours() {
  const { token } = useAuth();
  const toast = useToast();
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => { api('/flavours?all=1').then(setList).catch((e) => setError(e.message)); }, []);
  useEffect(load, [load]);

  const setAvail = async (f, available) => {
    try { await api(`/flavours/${f._id}`, { method: 'PUT', token, body: { available } }); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const remove = async () => {
    try { await api(`/flavours/${deleting._id}`, { method: 'DELETE', token }); toast('Flavour deleted'); }
    catch (e) { toast(e.message, 'err'); }
    setDeleting(null); load();
  };

  return (
    <div className="a-stack">
      <PageHead title="Flavours" sub="Syrups and add-ins customers can pick when they create their cup." action={
        <button className="a-btn" onClick={() => setEditing({})}><Icon name="plus" size={16} />New flavour</button>
      } />
      <Card>
        {error && <p className="a-error">{error}</p>}
        {!list ? <div className="a-skel tall" /> : list.length === 0 ? (
          <Empty icon="drop" text="No flavours yet."><button className="a-btn" onClick={() => setEditing({})}>Add a flavour</button></Empty>
        ) : (
          <ul className="a-list big">
            {list.map((f) => (
              <li key={f._id}>
                <span className="a-swatch" style={{ background: f.color }} />
                <div className="grow"><b>{f.name}</b><small>{f.description || (f.extraPrice > 0 ? `Adds ${money(f.extraPrice)}` : 'No extra charge')}</small></div>
                <span className="a-count">{f.extraPrice > 0 ? `+${money(f.extraPrice)}` : 'Free'}</span>
                <Toggle checked={f.available} onChange={(v) => setAvail(f, v)} label="Available" />
                <button className="a-icon" aria-label={`Edit ${f.name}`} onClick={() => setEditing(f)}><Icon name="edit" /></button>
                <button className="a-icon danger" aria-label={`Delete ${f.name}`} onClick={() => setDeleting(f)}><Icon name="trash" /></button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {editing && <FlavourForm flavour={editing._id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {deleting && <ConfirmModal title="Delete flavour?" text={`“${deleting.name}” will be removed from every drink.`} onConfirm={remove} onClose={() => setDeleting(null)} />}
    </div>
  );
}
