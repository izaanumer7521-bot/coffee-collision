import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Icon, ToastProvider } from './ui.jsx';
import './admin.css';

const NAV = [
  ['/admin', 'Dashboard', 'grid', true],
  ['/admin/products', 'Products', 'cup'],
  ['/admin/categories', 'Categories', 'tag'],
  ['/admin/flavours', 'Flavours', 'drop'],
  ['/admin/orders', 'Orders', 'bag'],
  ['/admin/activity', 'Activity log', 'pulse'],
  ['/admin/messages', 'Messages', 'mail'],
  ['/admin/settings', 'Settings', 'gear'],
];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const nav = useNavigate();
  useEffect(() => setOpen(false), [pathname]);
  const current = NAV.find(([to]) => (to === '/admin' ? pathname === '/admin' : pathname.startsWith(to)));

  return (
    <ToastProvider>
      <div className="adm">
        <aside className={`adm-side ${open ? 'open' : ''}`}>
          <Link to="/admin" className="adm-brand">
            <img src="/logo.png" alt="Evara" width="44" height="44" />
            <div><b>Evara</b><small>Admin panel</small></div>
          </Link>
          <nav className="adm-nav">
            {NAV.map(([to, label, icon, end]) => (
              <NavLink key={to} to={to} end={end}><Icon name={icon} />{label}</NavLink>
            ))}
          </nav>
          <div className="adm-side-foot">
            <a href="/" target="_blank" rel="noreferrer" className="adm-store"><Icon name="store" />View store</a>
            <div className="adm-user">
              <span className="avatar">{(user?.name || 'A')[0].toUpperCase()}</span>
              <div><b>{user?.name}</b><small>{user?.email}</small></div>
              <button className="a-icon light" aria-label="Sign out" title="Sign out" onClick={() => { logout(); nav('/login'); }}><Icon name="logout" /></button>
            </div>
          </div>
        </aside>
        {open && <div className="adm-scrim" onClick={() => setOpen(false)} />}

        <div className="adm-main">
          <header className="adm-top">
            <button className="a-icon burger" aria-label="Open menu" onClick={() => setOpen(true)}><Icon name="menu" size={22} /></button>
            <div>
              <h1>{current ? current[1] : 'Admin'}</h1>
              <p>{greeting()}, {user?.name?.split(' ')[0] || 'there'}</p>
            </div>
          </header>
          <div className="adm-content"><Outlet /></div>
        </div>
      </div>
    </ToastProvider>
  );
}
