import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, PageHead, useToast } from './ui.jsx';

export default function Settings() {
  const { token, user, setUser } = useAuth();
  const toast = useToast();
  const [p, setP] = useState({ name: user?.name || '', email: user?.email || '', currentPassword: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pErr, setPErr] = useState('');
  const [wErr, setWErr] = useState('');
  const [busy, setBusy] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault(); setBusy('p'); setPErr('');
    try {
      const d = await api('/auth/me', { method: 'PUT', token, body: p });
      setUser(d.user); setP({ name: d.user.name, email: d.user.email, currentPassword: '' });
      toast(d.message || 'Profile updated');
    } catch (err) { setPErr(err.message); }
    setBusy('');
  };
  const savePassword = async (e) => {
    e.preventDefault(); setWErr('');
    if (pw.newPassword !== pw.confirm) return setWErr('The new passwords do not match.');
    setBusy('w');
    try {
      await api('/auth/password', { method: 'PUT', token, body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      toast('Password changed');
    } catch (err) { setWErr(err.message); }
    setBusy('');
  };

  return (
    <div className="a-stack">
      <PageHead title="Settings" sub="Change your admin email and password any time." />
      <div className="a-grid-eq">
        <Card title="Profile" sub="Your name and the email you sign in with.">
          <form className="a-form" onSubmit={saveProfile}>
            <label className="a-field"><span>Name</span><input className="a-input" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} required /></label>
            <label className="a-field"><span>Email</span><input className="a-input" type="email" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} required /></label>
            <label className="a-field"><span>Current password (to confirm)</span><input className="a-input" type="password" autoComplete="current-password" value={p.currentPassword} onChange={(e) => setP({ ...p, currentPassword: e.target.value })} required /></label>
            {pErr && <p className="a-error">{pErr}</p>}
            <div className="a-actions"><button className="a-btn" disabled={busy === 'p'}>{busy === 'p' ? 'Saving…' : 'Save profile'}</button></div>
          </form>
        </Card>
        <Card title="Password" sub="Use at least 6 characters.">
          <form className="a-form" onSubmit={savePassword}>
            <label className="a-field"><span>Current password</span><input className="a-input" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></label>
            <label className="a-field"><span>New password</span><input className="a-input" type="password" minLength="6" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></label>
            <label className="a-field"><span>Repeat new password</span><input className="a-input" type="password" minLength="6" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required /></label>
            {wErr && <p className="a-error">{wErr}</p>}
            <div className="a-actions"><button className="a-btn" disabled={busy === 'w'}>{busy === 'w' ? 'Saving…' : 'Change password'}</button></div>
          </form>
        </Card>
      </div>
    </div>
  );
}
