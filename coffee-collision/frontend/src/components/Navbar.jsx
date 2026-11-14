import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../i18n/LangContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, toggle } = useLang();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const close = () => setOpen(false);

  const submitSearch = (e) => {
    e.preventDefault();
    nav(`/menu?q=${encodeURIComponent(q)}`);
    setSearching(false); setQ(''); close();
  };

  return (
    <header className="nav">
      <Link to="/" className="logo" onClick={close} aria-label="Evara home"><img src="/logo.png" alt="Evara" width="48" height="48" /></Link>
      <nav className={`nav-links ${open ? 'open' : ''}`}>
        <NavLink to="/" end onClick={close}>{t('home')}</NavLink>
        <NavLink to="/menu" onClick={close}>{t('menu')}</NavLink>
        <NavLink to="/archives" onClick={close}>{t('archives')}</NavLink>
        <NavLink to="/contact" onClick={close}>{t('contact')}</NavLink>
        {user?.role === 'admin' && <NavLink to="/admin" onClick={close}>{t('admin')}</NavLink>}
      </nav>
      <div className="nav-right">
        {searching ? (
          <form onSubmit={submitSearch} className="search-form">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchDrinks')} aria-label={t('searchDrinks')} />
          </form>
        ) : (
          <button className="icon-btn" aria-label={t('search')} onClick={() => setSearching(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </button>
        )}
        <button className="pill lang-btn" onClick={toggle} aria-label={t('langSwitchLabel')} lang={t('langSwitch') === 'English' ? 'en' : 'ar'}>{t('langSwitch')}</button>
        {user ? (
          <button className="pill" onClick={() => { logout(); nav('/'); }}>{t('signOut')}</button>
        ) : (
          <Link className="pill" to="/login">{t('signIn')}</Link>
        )}
        <button className="icon-btn burger" aria-label="Menu" onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </div>
    </header>
  );
}
