import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const PATHS = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.8" /><rect x="14" y="3" width="7" height="7" rx="1.8" /><rect x="3" y="14" width="7" height="7" rx="1.8" /><rect x="14" y="14" width="7" height="7" rx="1.8" /></>,
  cup: <><path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z" /><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" /><path d="M8 3v2M12 3v2" /></>,
  tag: <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" />,
  drop: <path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3z" />,
  bag: <><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  pulse: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
  logout: <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  store: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-8 9" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  up: <path d="M7 15l5-5 5 5" />,
  down: <path d="M7 9l5 5 5-5" />,
  check: <path d="M5 12l5 5 9-10" />,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />,
};

export function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export function Card({ title, sub, action, className = '', children }) {
  return (
    <section className={`a-card ${className}`}>
      {(title || action) && (
        <header className="a-card-head">
          <div><h3>{title}</h3>{sub && <p>{sub}</p>}</div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHead({ title, sub, action }) {
  return (
    <div className="a-pagehead">
      <div><h2>{title}</h2>{sub && <p>{sub}</p>}</div>
      {action}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <div className="a-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`a-modal ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header><h3>{title}</h3><button className="a-icon" onClick={onClose} aria-label="Close"><Icon name="x" /></button></header>
        <div className="a-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ title, text, confirmLabel = 'Delete', onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={onClose}>
      <p className="a-muted">{text}</p>
      <div className="a-actions">
        <button className="a-btn ghost" onClick={onClose}>Cancel</button>
        <button className="a-btn danger" disabled={busy} onClick={async () => { setBusy(true); await onConfirm(); }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((text, type = 'ok') => {
    const id = Math.random().toString(36).slice(2);
    setItems((l) => [...l, { id, text, type }]);
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="a-toasts" aria-live="polite">
        {items.map((t) => <div key={t.id} className={`a-toast ${t.type}`}><Icon name={t.type === 'ok' ? 'check' : 'x'} size={16} />{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  );
}

export function Empty({ icon = 'cup', text, children }) {
  return <div className="a-empty"><Icon name={icon} size={30} /><p>{text}</p>{children}</div>;
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className={`a-switch ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}>
      <i /><span>{label}</span>
    </button>
  );
}
