import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../i18n/LangContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    try { const u = await login(form.email, form.password); nav(u.role === 'admin' ? '/admin' : '/'); }
    catch (err) { setError(err.message); }
  };
  return (
    <section className="page dark narrow">
      <h1>{t('signIn')}</h1>
      <form className="form" onSubmit={submit}>
        <label>{t('email')}<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        <label>{t('password')}<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn" type="submit">{t('signIn')}</button>
        <p className="alt">{t('newHere')} <Link to="/register">{t('createAccount')}</Link></p>
      </form>
    </section>
  );
}
