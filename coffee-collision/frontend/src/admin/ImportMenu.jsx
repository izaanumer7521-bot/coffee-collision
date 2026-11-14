import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, Icon, PageHead, useToast } from './ui.jsx';

const EXAMPLE = `# Hot
flavours: Caramel +0.5, Vanilla +0.5, Hazelnut +0.5
sizes: Small, Medium +0.5, Large +1
Espresso | 3.5 | Black, with a golden crema
Americano - 3
Flat White | Small 4, Large 5 | desc: Smooth and milky

# Cold
Iced Latte | Small 4.5, Medium 5, Large 5.5 | flavours: Vanilla +0.5, Mocha +0.75 | Creamy, over big ice
Cold Brew | 12oz 4, 16oz 5
`;

const RULES = [
  ['# Hot', 'Starts a category. Start a new one any time.'],
  ['flavours: Caramel +0.5, Vanilla', 'Default flavours (with extra price) for every drink in the category.'],
  ['sizes: Small, Medium +0.5, Large +1', 'Default sizes. The +price is added to the drink’s single price.'],
  ['Espresso | 3.5 | Black with crema', 'Drink | price | description'],
  ['Latte | Small 4, Large 5 | flavours: Mocha +0.75', 'Own sizes and prices, own flavours.'],
  ['Americano - 3', 'Quick form: name - price.'],
];

export default function ImportMenu() {
  const { token } = useAuth();
  const toast = useToast();
  const fileRef = useRef(null);
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState('skip');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const [full, setFull] = useState(null);

  const run = async () => {
    setBusy('preview'); setError(''); setDone(null);
    try { setPreview(await api('/menu/preview', { method: 'POST', token, body: { text } })); }
    catch (e) { setError(e.message); setPreview(null); }
    setBusy('');
  };
  const doImport = async () => {
    setBusy('import'); setError('');
    try {
      const r = await api('/menu/import', { method: 'POST', token, body: { text, mode } });
      setDone(r); setPreview(null); toast('Menu imported');
    } catch (e) { setError(e.message); }
    setBusy('');
  };
  const loadFull = async () => {
    setBusy('full'); setError(''); setFull(null);
    try { setFull(await api('/menu/load-full', { method: 'POST', token, body: {} })); toast('Full menu loaded'); }
    catch (e) { setError(e.message); }
    setBusy('');
  };
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setText(await f.text()); setPreview(null); setDone(null);
  };

  return (
    <div className="a-stack">
      <PageHead title="Import menu" sub="Type or paste your whole menu once. Categories, flavours, sizes and prices are created for you." />

      <Card title="Evara full menu (English + Arabic)" sub="Adds every category and drink from the printed menu with Arabic names and SAR prices. Safe to press again: nothing is duplicated, and your pictures and edits are kept.">
        {error && busy === '' && !text && <p className="a-error">{error}</p>}
        <div className="a-actions">
          <button className="a-btn" disabled={busy === 'full'} onClick={loadFull}>{busy === 'full' ? 'Loading…' : 'Load the full menu'}</button>
        </div>
        {full && (
          <div className="a-result">
            <span><b>{full.created}</b> items added</span>
            <span><b>{full.kept}</b> already there</span>
            <span><b>{full.categories}</b> new categories</span>
            {full.noPrice?.length > 0 && <span>No price on the printed menu: <b>{full.noPrice.join(', ')}</b>. Set their price in Products.</span>}
          </div>
        )}
      </Card>

      <div className="a-grid-2 even">
        <Card title="Your menu" action={
          <div className="a-head-actions">
            <button className="a-btn ghost small" onClick={() => { setText(EXAMPLE); setPreview(null); setDone(null); }}>Use example</button>
            <button className="a-btn ghost small" onClick={() => fileRef.current.click()}><Icon name="upload" size={14} />Open .txt</button>
            <input ref={fileRef} type="file" accept=".txt,.md,.csv,text/plain" hidden onChange={onFile} />
          </div>
        }>
          <textarea className="a-input a-code" rows="16" spellCheck="false" value={text} placeholder={EXAMPLE}
            onChange={(e) => { setText(e.target.value); setPreview(null); }} />
          {error && <p className="a-error">{error}</p>}
          <div className="a-actions">
            {text && <button className="a-btn ghost" onClick={() => { setText(''); setPreview(null); setDone(null); }}>Clear</button>}
            <button className="a-btn" disabled={!text.trim() || busy} onClick={run}>{busy === 'preview' ? 'Checking…' : 'Preview'}</button>
          </div>
        </Card>

        <Card title="How to write it" sub="One drink per line. Prices are plain numbers.">
          <ul className="a-rules">
            {RULES.map(([code, what]) => <li key={code}><code>{code}</code><span>{what}</span></li>)}
          </ul>
          <p className="a-muted small-note">Lines starting with // are ignored. Nothing is saved until you press Import.</p>
        </Card>
      </div>

      {done && (
        <Card title="Import finished">
          <div className="a-result">
            <span><b>{done.created}</b> drinks added</span>
            <span><b>{done.updated}</b> updated</span>
            <span><b>{done.skipped}</b> skipped (already there)</span>
            <span><b>{done.categories}</b> new categories</span>
            <span><b>{done.flavours}</b> new flavours</span>
          </div>
          {done.warnings?.length > 0 && <ul className="a-warn">{done.warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
          <div className="a-actions"><Link className="a-btn" to="/admin/products">See products</Link></div>
        </Card>
      )}

      {preview && (
        <Card title="Preview" sub={`${preview.totals.products} drinks in ${preview.totals.categories} categories`} action={
          <div className="a-chips small">
            <button className={mode === 'skip' ? 'on' : ''} onClick={() => setMode('skip')}>Skip existing</button>
            <button className={mode === 'update' ? 'on' : ''} onClick={() => setMode('update')}>Update existing</button>
          </div>
        }>
          {preview.warnings.length > 0 && <ul className="a-warn">{preview.warnings.map((w) => <li key={w}>{w}</li>)}</ul>}
          {preview.categories.map((c) => (
            <section className="a-imp-cat" key={c.name || 'none'}>
              <h4>{c.name || 'No category'} {c.name && <span className={`a-pill ${c.exists ? 'hidden' : 'live'}`}>{c.exists ? 'Existing category' : 'New category'}</span>}</h4>
              <ul className="a-list big">
                {c.products.map((p) => (
                  <li key={p.name}>
                    <div className="grow">
                      <b>{p.name} <span className={`a-pill ${p.exists ? (mode === 'update' ? 'placed' : 'hidden') : 'live'}`}>{p.exists ? (mode === 'update' ? 'Will update' : 'Will skip') : 'New'}</span></b>
                      {p.description && <small>{p.description}</small>}
                      <div className="a-tags">
                        {p.sizes ? p.sizes.map((s) => <em key={s.name}>{s.name} {money(s.price)}</em>) : <em>{money(p.price)}</em>}
                      </div>
                      {p.flavours.length > 0 && (
                        <div className="a-tags flav">
                          {p.flavours.map((f) => <em key={f.name}>{f.name}{f.extraPrice ? ` +${money(f.extraPrice)}` : ''}{!f.exists && <u>new</u>}</em>)}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <div className="a-actions">
            <button className="a-btn" disabled={busy || !preview.totals.products} onClick={doImport}>{busy === 'import' ? 'Importing…' : `Import ${preview.totals.products} drinks`}</button>
          </div>
        </Card>
      )}
    </div>
  );
}
