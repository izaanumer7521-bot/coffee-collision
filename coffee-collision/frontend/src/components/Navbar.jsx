import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
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
        <NavLink to="/" end onClick={close}>Home</NavLink>
        <NavLink to="/menu" onClick={close}>Menu</NavLink>
        <NavLink to="/archives" onClick={close}>Archives</NavLink>
        <NavLink to="/contact" onClick={close}>Contact</NavLink>
        {user?.role === 'admin' && <NavLink to="/admin" onClick={close}>Admin</NavLink>}
      </nav>
      <div className="nav-right">
        {searching ? (
          <form onSubmit={submitSearch} className="search-form">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search drinks" aria-label="Search drinks" />
          </form>
        ) : (
          <button className="icon-btn" aria-label="Search" onClick={() => setSearching(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </button>
        )}
        {user ? (
          <button className="pill" onClick={() => { logout(); nav('/'); }}>Sign out</button>
        ) : (
          <Link className="pill" to="/login">Sign in</Link>
        )}
        <button className="icon-btn burger" aria-label="Menu" onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </div>
    </header>
  );
}
