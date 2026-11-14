import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../i18n/LangContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try { await register(form.name, form.email, form.password); nav('/'); }
    catch (err) { setError(err.message); }
  };
  return (
    <section className="page dark narrow">
      <h1>{t('createAccount')}</h1>
      <form className="form" onSubmit={submit}>
        <label>{t('name')}<input value={form.name} onChange={set('name')} required /></label>
        <label>{t('email')}<input type="email" value={form.email} onChange={set('email')} required /></label>
        <label>{t('password6')}<input type="password" minLength="6" value={form.password} onChange={set('password')} required /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn" type="submit">{t('createAccount')}</button>
        <p className="alt">{t('haveAccount')} <Link to="/login">{t('signIn')}</Link></p>
      </form>
    </section>
  );
}
